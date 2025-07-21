from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import asyncio
import json
import os
import google.generativeai as genai

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Character Settings Loading ---
def load_character_settings():
    try:
        with open("character_settings.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"system_prompt": "あなたは親切なアシスタントです。"}

character_settings = load_character_settings()
SYSTEM_PROMPT = character_settings.get("system_prompt", "")

# --- Gemini API Configuration ---
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# --- Static Files and Templates ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- Gemini Model Initialization ---
model = genai.GenerativeModel(
    'gemini-2.5-flash',
    system_instruction=SYSTEM_PROMPT
)

# --- AI Response Generator ---
async def generate_ai_response_stream(message: str):
    """Generator that streams the response from Gemini."""
    try:
        response_stream = await model.generate_content_async(message, stream=True)
        async for chunk in response_stream:
            if chunk.text:
                yield json.dumps({"token": chunk.text}) + '\n'
                await asyncio.sleep(0.05)
    except Exception as e:
        print(f"Error generating response: {e}")
        yield json.dumps({"error": "AIからの応答の生成中にエラーが発生しました。"}) + '\n'
    finally:
        yield json.dumps({"token": "[END]"}) + '\n'

# --- API Endpoints ---
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    message = data.get("message", "")
    if not message:
        return {"error": "Message is required"}
    return StreamingResponse(generate_ai_response_stream(message), media_type="application/x-ndjson")
