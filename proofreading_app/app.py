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
    model_name = st.selectbox("使用するモデルを選択してください:", ("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.5-pro"))

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
                    st.table(df)
                else:
                    st.success("コンプライアンスの問題は見つかりませんでした！")

        except Exception as e:
            st.error(f"エラーが発生しました: {e}")