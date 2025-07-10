import os
import streamlit as st
import google.generativeai as genai
import json
import pandas as pd

# Set page config
st.set_page_config(layout="wide", page_title="コンプライアンスチェックアプリ", page_icon="✅")



# App title
st.title("📝 コンプライアンス校正アプリ")
st.markdown("このアプリケーションは、Gemini APIを使用して、テキスト内の不適切な表現をチェックします。")

# --- UI Elements ---
col1, col2 = st.columns(2)

with col1:
    st.subheader("入力テキスト")
    input_text = st.text_area("チェックしたいテキストを入力してください（最大10000文字）:", height=300, max_chars=10000)

with col2:
    st.subheader("設定")
    api_key = st.text_input("Gemini APIキーを入力してください:", type="password")
    model_name = st.selectbox("使用するモデルを選択してください:", ("gemini-2.5-flash", "gemini-2.5-pro"))

# --- Main Logic ---
if st.button("コンプライアンスをチェック"):
    if not api_key:
        st.error("Gemini APIキーを入力してください。")
    elif not input_text:
        st.error("チェックするテキストを入力してください。")
    else:
        try:
            with st.spinner("コンプライアンスの問題をチェックしています..."):
                # Read the prompt from the file
                prompt_file_path = os.path.join(os.path.dirname(__file__), "prompt.txt")
                with open(prompt_file_path, "r") as f:
                    prompt = f.read()

                # Configure the Gemini API
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(model_name)

                # Combine the prompt and the input text
                full_prompt = f"{prompt}\n\nText to check:\n\n{input_text}"

                # Send the request to the model
                response = model.generate_content(full_prompt)

                # Clean the response
                cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
                
                # Parse the JSON response
                try:
                    results = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    st.error("モデルからの応答の解析に失敗しました。応答が期待されるJSON形式でない可能性があります。")
                    st.text("モデルの応答:")
                    st.code(response.text)
                    results = []


                if results:
                    st.subheader("コンプライアンスチェック結果")
                    df = pd.DataFrame(results)
                    df.index = df.index + 1
                    df.rename(columns={
                        "inappropriate_sentence": "不適切な文",
                        "reason": "不適切な理由",
                        "correction": "修正案"
                    }, inplace=True)

                    # Manually create HTML table from DataFrame for better control
                    def dataframe_to_html_with_style(df):
                        import html as html_converter
                        # Start CSS style
                        html_output = """
                        <style>
                            .compliance-table {
                                width: 100%;
                                border-collapse: collapse;
                                table-layout: fixed;
                                border-radius: 8px; /* Add rounded corners to the table */
                                overflow: hidden; /* Hide overflow for rounded corners */
                                box-shadow: 0 4px 15px rgba(0,0,0,0.1); /* Add a subtle shadow */
                            }
                            .compliance-table th {
                                background: linear-gradient(to right, #434343 0%, black 100%);
                                color: white;
                                font-weight: bold;
                                padding: 16px 15px;
                                text-align: left;
                                border-bottom: none;
                            }
                            .compliance-table td {
                                padding: 12px 15px;
                                border-bottom: 1px solid #e0e0e0;
                                word-wrap: break-word;
                                vertical-align: top;
                                background-color: #ffffff;
                            }
                            .compliance-table tbody tr:last-child td {
                                border-bottom: none; /* Remove border for the last row */
                            }
                            .compliance-table th:nth-child(1) { width: 30%; }
                            .compliance-table th:nth-child(2) { width: 40%; }
                            .compliance-table th:nth-child(3) { width: 30%; }
                        </style>
                        """
                        # Start table
                        html_output += '<table class="compliance-table">'
                        
                        # Add header
                        html_output += '<thead><tr>'
                        for col in df.columns:
                            html_output += f'<th>{col}</th>'
                        html_output += '</tr></thead>'
                        
                        # Add body
                        html_output += '<tbody>'
                        for index, row in df.iterrows():
                            html_output += '<tr>'
                            for col in df.columns:
                                # Escape content and replace newlines with <br> for proper HTML rendering
                                cell_content = html_converter.escape(str(row[col])).replace("\n", "<br>")
                                html_output += f'<td>{cell_content}</td>'
                            html_output += '</tr>'
                        html_output += '</tbody>'
                        
                        # Close table
                        html_output += '</table>'
                        return html_output

                    table_html = dataframe_to_html_with_style(df)
                    st.markdown(table_html, unsafe_allow_html=True)
                else:
                    st.success("コンプライアンスの問題は見つかりませんでした！")

        except Exception as e:
            st.error(f"エラーが発生しました: {e}")