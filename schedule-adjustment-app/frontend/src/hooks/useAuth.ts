import { useState, useEffect } from 'react';
import api from '../api'; // apiインスタンスをインポート
import { User } from '../types/user'; // User型をインポート

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  // コンポーネントのマウント時にログイン状態を確認
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error('Error checking login status:', error);
        setUser(null);
      }
    };
    checkLoginStatus();
  }, []);

  // ログイン処理
  const handleLogin = () => {
    window.open(`${api.defaults.baseURL}/auth/google`, '_self');
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return { user, handleLogin, handleLogout, setUser };
};
