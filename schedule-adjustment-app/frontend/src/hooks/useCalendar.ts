import { useState } from 'react';
import api from '../api'; // apiインスタンスをインポート

export const useCalendar = () => {
  const [freeBusyData, setFreeBusyData] = useState<any>(null); // TODO: 型定義を強化
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 空き時間取得処理
  const handleFetchFreeBusy = async () => {
    setLoading(true);
    setError('');
    setFreeBusyData(null);
    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7日後

      const { data } = await api.post('/api/calendar/freebusy', {
        timeMin,
        timeMax,
      });
      setFreeBusyData(data);
    } catch (err) {
      console.error('Error fetching free-busy data:', err);
      setError('Failed to fetch calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { freeBusyData, loading, error, handleFetchFreeBusy, setFreeBusyData };
};
