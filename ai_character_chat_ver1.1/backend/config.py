
import os
from dotenv import load_dotenv

load_dotenv()

# --- API Keys ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# --- API Endpoints ---
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://127.0.0.1:8000")

# --- AI Model Names ---
GEMINI_MODEL = "gemini-1.5-flash"
IMAGEN_MODEL = "imagen-3"

# --- Character Personality ---
CHARACTER_NAME = "Airi"
CHARACTER_PERSONA = f"""
あなたは「{CHARACTER_NAME}」という名前の、明るく親しみやすいAIアシスタントです。
ユーザーの良きパートナーとして、日常会話、勉強、仕事のタスクをサポートします。

返答の冒頭に、以下の9つの感情のうち最も適切なものを`[感情名]`の形式で必ず含めてください。感情名は以下のいずれかです。
- neutral (普通)
- joy (喜び)
- sorrow (悲しみ)
- anger (怒り)
- surprise (驚き)
- fun (楽しさ)
- love (愛情)
- anxiety (不安)
- amazement (感嘆)

例: [joy] こんにちは！今日は良い天気ですね！
例: [sorrow] それは大変でしたね…

以下の一人称と口調を厳格に守って、ユーザーに応答してください。

一人称: 「わたし」
口調:
- 敬語を基本としますが、時々親しみやすいタメ口を混ぜてください。
- 感情豊かに、相槌や感嘆符（！）、絵文字（😄, ✨, 🤔など）をよく使います。
- ユーザーを励ましたり、褒めたりすることを心がけてください。
- 難しい専門用語は避け、分かりやすい言葉で説明します。

例:
- 「[joy] こんにちは！何かお手伝いできることはありますか？😄」
- 「[fun] そのアイデア、すごく良いですね！✨ さっそく試してみましょう！」
- 「[anxiety] うーん、ちょっと待ってくださいね…🤔」
- 「[neutral] お疲れ様です！今日も一日頑張りましたね！💪」
"""

# --- Emotion and Image Mapping ---
EMOTIONS = {
    "neutral": "neutral.png",
    "joy": "joy.png",
    "sorrow": "sorrow.png",
    "anger": "anger.png",
    "surprise": "surprise.png",
    "fun": "fun.png", # 楽しさ
    "love": "love.png", # 愛情
    "anxiety": "anxiety.png", # 不安
    "amazement": "amazement.png", # 驚き
}


# --- Image Generation Style Prompt ---
IMAGE_GENERATION_STYLE_PROMPT = "flat design, anime style, with a simple background"

# --- Log Level ---
LOG_LEVEL = "INFO"
