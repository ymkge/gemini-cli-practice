from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Union # Unionを追加
import google.generativeai as genai
import os
import logging
from fastapi.middleware.cors import CORSMiddleware # この行を追加

# 新しく追加するPydanticモデル
class Part(BaseModel):
    text: str

class Content(BaseModel):
    role: str
    parts: List[Part]


from config import (
    GOOGLE_API_KEY,
    GEMINI_MODEL,
    IMAGEN_MODEL,
    CHARACTER_PERSONA,
    EMOTIONS,
    IMAGE_GENERATION_STYLE_PROMPT,
    LOG_LEVEL
)

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper()))
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS設定を追加 (ここから)
origins = [
    "http://localhost",
    "http://localhost:5173", # フロントエンドのURL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# CORS設定を追加 (ここまで)

# Configure Google Generative AI
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    logger.error("GOOGLE_API_KEY is not set in environment variables.")
    raise ValueError("GOOGLE_API_KEY is not set. Please set it in your .env file.")

class ChatRequest(BaseModel):
    message: str
    history: List[Content] = []

@app.post("/generate_character")
async def generate_character(image: UploadFile = File(...)):
    """
    画像ファイルを受け取り、imagen-3を呼び出してベースイラストと9つの感情イラストを生成・保存する。
    """
    try:
        logger.info(f"Received image: {image.filename}. Simulating image generation.")

        generation_prompt = f"Generate a character illustration based on the provided image. " \
                            f"Maintain the original character's facial features. " \
                            f"Style: {IMAGE_GENERATION_STYLE_PROMPT}. " \
                            f"Generate 9 variations for emotions: {', '.join(EMOTIONS.keys())}."
        logger.info(f"Image generation prompt: {generation_prompt}")

        generated_images = {emotion: f"/images/{emotion}.png" for emotion in EMOTIONS.keys()}

        return JSONResponse(content={
            "message": "Character images generated successfully (simulated).",
            "generated_images": generated_images
        })
    except Exception as e:
        logger.error(f"Error generating character: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    ユーザーのメッセージと会話履歴を受け取り、gemini-1.5-flashを呼び出して[感情]と返答テキストを返す。
    """
    try:
        model = genai.GenerativeModel(GEMINI_MODEL, system_instruction=CHARACTER_PERSONA)
        # PydanticのContentオブジェクトを辞書に変換
        formatted_history = []
        for item in request.history:
            formatted_history.append(item.dict()) # Pydantic v1 の場合

        chat_session = model.start_chat(history=formatted_history) # 変換した履歴を渡す

        full_message = request.message
        response = chat_session.send_message(full_message)
        
        # 感情を正規表現で抽出
        detected_emotion = "neutral"
        reply_text = response.text
        import re
        match = re.match(r"^\[(neutral|joy|sorrow|anger|surprise|fun|love|anxiety|amazement)\]\s*(.*)", reply_text, re.IGNORECASE)
        if match:
            detected_emotion = match.group(1).lower()
            reply_text = match.group(2).strip()

        return JSONResponse(content={
            "reply": reply_text,
            "emotion": detected_emotion
        })
    except Exception as e:
        logger.error(f"Error during chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}
