import os
import json
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む（APIキーの管理に便利）
load_dotenv()

class Config:
    """アプリケーションの設定を管理するクラス"""
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEYが環境変数に設定されていません。")
        
        self.system_prompt = self._load_character_settings()

    def _load_character_settings(self):
        """キャラクター設定をJSONファイルから読み込む"""
        try:
            with open(os.path.join(os.path.dirname(__file__), "character_settings.json"), "r", encoding="utf-8") as f:
                settings = json.load(f)
                return settings.get("system_prompt", "あなたは親切なアシスタントです。")
        except FileNotFoundError:
            print("警告: character_settings.jsonが見つかりません。デフォルトのプロンプトを使用します。")
            return "あなたは親切なアシスタントです。"

# シングルトンとして設定オブジェクトを作成
config = Config()
