import os
import json
import asyncio
import streamlit as st
from dotenv import load_dotenv
from langchain.schema import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI

# --- 定数定義 ---
FAQ_FILE = "faq.json"
CONFIG_FILE = "config.json"
PROMPT_FILE = "prompt_template.txt"

# --- 設定・データ読み込み ---

@st.cache_resource
def load_configuration(config_file, prompt_file):
    """設定ファイルとプロンプトファイルを読み込む"""
    try:
        with open(config_file, "r", encoding="utf-8") as f:
            config = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        st.error(f"`{config_file}`の読み込みに失敗しました: {e}")
        return None

    try:
        with open(prompt_file, "r", encoding="utf-8") as f:
            config["prompt_template"] = f.read()
    except FileNotFoundError:
        st.error(f"`{prompt_file}`が見つかりません。")
        return None
    
    return config

@st.cache_resource
def load_faq_data(file_path):
    """FAQデータを読み込み、LangChainのDocument形式に変換する"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            faq_data = json.load(f)
        return [Document(page_content=item["answer"], metadata={"source": item["question"]}) for item in faq_data]
    except FileNotFoundError:
        st.error(f"`{file_path}`ファイルが見つかりません。")
        return []
    except json.JSONDecodeError:
        st.error(f"`{file_path}`の形式が正しくありません。")
        return []

# --- LangChainセットアップ ---

@st.cache_resource
def setup_langchain(_docs, _config, api_key):
    """LangChainのコンポーネントを初期化する"""
    if not _docs or not _config or not api_key:
        return None

    try:
        embedding_model = _config["embedding_model"]
        llm_model = _config["llm_model"]
        llm_params = _config.get("llm_params", {})
        prompt_template = _config["prompt_template"]

        # 1. Embeddingsモデルの初期化
        embeddings = GoogleGenerativeAIEmbeddings(model=embedding_model, google_api_key=api_key)

        # 2. VectorStoreの作成 (FAISS)
        vector_store = FAISS.from_documents(_docs, embeddings)
        retriever = vector_store.as_retriever()

        # 3. プロンプトの定義
        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

        # 4. LLMの初期化
        llm = ChatGoogleGenerativeAI(model=llm_model, google_api_key=api_key, **llm_params)

        # 5. RetrievalQAチェーンの作成
        return RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True
        )
    except Exception as e:
        st.error(f"LangChainの初期化中にエラーが発生しました: {e}")
        return None

# --- メインアプリケーション ---

def main():
    """Streamlitアプリケーションのメイン関数"""
    load_dotenv()
    st.set_page_config(page_title="FAQ Chatbot", page_icon="❓")
    st.title("❓ FAQ対応チャットボット")
    st.write("FAQデータに基づいて、AIがあなたの質問に回答します。")

    # 設定とデータの読み込み
    config = load_configuration(CONFIG_FILE, PROMPT_FILE)
    documents = load_faq_data(FAQ_FILE)
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        st.error("環境変数 `GEMINI_API_KEY` が設定されていません。")
        st.stop()

    # LangChainのチェーンをセットアップ
    chain = setup_langchain(documents, config, api_key)

    # --- チャット履歴の管理 ---
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # --- ユーザーの入力とAIの応答 ---
    if prompt := st.chat_input("質問を入力してください"):
        if not chain:
            st.warning("チャットボットが初期化されていません。設定を確認してください。")
            st.stop()

        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("AIが回答を生成中です..."):
                try:
                    result = chain({"query": prompt})
                    response = result["result"]
                except Exception as e:
                    response = f"エラーが発生しました: {e}"
            st.markdown(response)
        
        st.session_state.messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    # asyncioイベントループの取得・設定
    # Streamlitが非同期処理と共存するために必要
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    main()