import streamlit as st
import google.generativeai as genai
import json
import pandas as pd

# Set page config
st.set_page_config(layout="wide", page_title="Compliance Check App", page_icon="✅")

# Custom CSS for a modern look
st.markdown("""
    <style>
    .stApp {
        background: #f0f2f6;
    }
    .stButton>button {
        background-color: #4CAF50;
        color: white;
    }
    .stTextInput>div>div>input {
        background-color: #ffffff;
        color: black;
    }
    .stTextArea>div>div>textarea {
        background-color: #ffffff;
        color: black;
    }
    </style>
    """, unsafe_allow_html=True)

# App title
st.title("📝 Compliance Proofreading App")
st.markdown("This application checks for inappropriate expressions in your text using the Gemini API.")

# --- UI Elements ---
col1, col2 = st.columns(2)

with col1:
    st.subheader("Input Text")
    input_text = st.text_area("Enter the text you want to check (up to 10000 characters):", height=300, max_chars=10000)

with col2:
    st.subheader("Configuration")
    api_key = st.text_input("Enter your Gemini API Key:", type="password")
    model_name = st.selectbox("Select the model to use:", ("gemini-1.5-flash", "gemini-1.5-pro"))

# --- Main Logic ---
if st.button("Check Compliance"):
    if not api_key:
        st.error("Please enter your Gemini API Key.")
    elif not input_text:
        st.error("Please enter some text to check.")
    else:
        try:
            with st.spinner("Checking for compliance issues..."):
                # Read the prompt from the file
                with open("prompt.txt", "r") as f:
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
                    st.error("Failed to parse the response from the model. The response may not be in the expected JSON format.")
                    st.text("Model Response:")
                    st.code(response.text)
                    results = []


                if results:
                    st.subheader("Compliance Check Results")
                    df = pd.DataFrame(results)
                    df.index = df.index + 1
                    df.rename(columns={
                        "inappropriate_sentence": "Inappropriate Sentence",
                        "reason": "Reason for Inappropriate",
                        "correction": "Suggested Correction"
                    }, inplace=True)
                    st.table(df)
                else:
                    st.success("No compliance issues found!")

        except Exception as e:
            st.error(f"An error occurred: {e}")
