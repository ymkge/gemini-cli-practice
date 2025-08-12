import streamlit as st
import jellyfish
import unicodedata
import gspread
from google.oauth2.service_account import Credentials
import pandas as pd

# Normalize text to NFKC
def normalize_text(text):
    return unicodedata.normalize('NFKC', text)

# Calculate Jaro-Winkler similarity
def calculate_similarity(text1, text2):
    normalized_text1 = normalize_text(text1)
    normalized_text2 = normalize_text(text2)
    return jellyfish.jaro_winkler_similarity(normalized_text1, normalized_text2)

# Function to connect to Google Sheets
def get_gsheet():
    creds = Credentials.from_service_account_info(
        st.secrets["gcp_service_account"],
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )
    client = gspread.authorize(creds)
    return client

# Main app
st.title("テキスト類似度計算アプリ")

text1 = st.text_area("テキスト1", "ここに1つ目のテキストを入力してください。")
text2 = st.text_area("テキスト2", "ここに2つ目のテキストを入力してください。")

if st.button("類似度を計算"):
    if text1 and text2:
        similarity = calculate_similarity(text1, text2)
        st.session_state.similarity = similarity
        st.session_state.text1 = text1
        st.session_state.text2 = text2
        st.write(f"テキスト間の類似度: {similarity:.4f}")
        st.progress(similarity)
    else:
        st.warning("両方のテキストエリアにテキストを入力してください。")

if "similarity" in st.session_state:
    if st.button("Googleスプレッドシートに保存"):
        try:
            client = get_gsheet()
            # Revert to using st.secrets["spreadsheet_id"]
            sheet = client.open_by_key(st.secrets["spreadsheet_id"]).sheet1
            data_to_save = [st.session_state.text1, st.session_state.text2, st.session_state.similarity]
            sheet.append_row(data_to_save)
            st.success("Googleスプレッドシートに保存しました。")
        except Exception as e:
            st.error(f"エラーが発生しました: {e}")
