import google.generativeai as genai
import asyncio
import json
from config import config

class AIService:
    """AIモデルとのやり取りを管理するクラス"""
    def __init__(self):
        genai.configure(api_key=config.gemini_api_key)
        self.model = genai.GenerativeModel(
            'gemini-2.5-flash',
            system_instruction=config.system_prompt
        )

    async def generate_response_stream(self, message: str):
        """ユーザーメッセージに基づき、AIからの応答をストリーミングで生成するジェネレータ"""
        try:
            response_stream = await self.model.generate_content_async(message, stream=True)
            async for chunk in response_stream:
                if chunk.text:
                    yield json.dumps({"token": chunk.text}) + '\n'
                    await asyncio.sleep(0.05) # ストリーミングを滑らかに見せるための小さな遅延

        except Exception as e:
            print(f"AIサービスでエラーが発生しました: {e}")
            yield json.dumps({"error": "AIからの応答の生成中に内部エラーが発生しました。"}) + '\n'
        finally:
            # ストリームの終了をクライアントに通知
            yield json.dumps({"token": "[END]"}) + '\n'

# シングルトンとしてAIサービスクラスのインスタンスを作成
ai_service = AIService()
