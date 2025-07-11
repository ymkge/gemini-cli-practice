
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure the Gemini API key
# IMPORTANT: Set your API key as an environment variable
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    language = data.get('language', 'Japanese')

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"You are a friendly character. Please respond to the following message in {language}: {user_message}"
        response = model.generate_content(prompt)

        # Check for safety feedback and empty parts
        if not response.parts:
            print("Warning: Response was blocked or empty.")
            apology = "ごめんなさい、その内容にはお答えできません。" if language == "Japanese" else "I'm sorry, I can't respond to that."
            return jsonify({'reply': apology})

        return jsonify({'reply': response.text})

    except Exception as e:
        print(f"Error generating content: {e}")
        # Return the specific error for easier debugging
        error_message = f"エラーが発生しました: {e}" if language == "Japanese" else f"An error occurred: {e}"
        return jsonify({'reply': error_message}), 500

@app.route('/shutdown', methods=['POST'])
def shutdown():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    return 'Server shutting down...'

if __name__ == '__main__':
    app.run(debug=True, port=5001)
