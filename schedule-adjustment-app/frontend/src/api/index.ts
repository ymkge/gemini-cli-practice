import axios from 'axios';

// バックエンドサーバーのURL (Vite環境変数から取得)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// axiosのインスタンスを作成し、クレデンシャル情報を含める設定を行う
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // クッキーなどのクレデンシャル情報をリクエストに含める
});

export default api;
