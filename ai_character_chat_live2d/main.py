from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# 内部モジュールからサービスと設定をインポート
from ai_service import ai_service

# --- FastAPIアプリケーションの初期化 ---
app = FastAPI()

# --- 静的ファイルとテンプレートの設定 ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- APIエンドポイントの定義 ---
@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    """アプリケーションのメインページを提供します。"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat_with_ai(request: Request):
    """チャットメッセージを受け取り、AIの応答をストリーミングで返します。"""
    data = await request.json()
    message = data.get("message", "")
    if not message:
        return {"error": "Message is required"}, 400 # エラーレスポンスを返す

    # AIサービスに応答生成を委譲
    return StreamingResponse(
        ai_service.generate_response_stream(message), 
        media_type="application/x-ndjson"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)