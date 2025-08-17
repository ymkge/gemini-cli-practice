import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';

// バックエンドサーバーのURL
const BACKEND_URL = 'http://localhost:3001';

// axiosのインスタンスを作成し、クレデンシャル情報を含める設定を行う
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // クッキーなどのクレデンシャル情報をリクエストに含める
});

function App() {
  const [user, setUser] = useState<any>(null);
  const [freeBusyData, setFreeBusyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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
    window.open(`${BACKEND_URL}/auth/google`, '_self');
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
      setFreeBusyData(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Schedule Adjustment App
          </Typography>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Login with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {user ? (
          <Card>
            <CardContent>
              <Typography variant="h5">Welcome, {user.displayName}!</Typography>
              <Typography color="text.secondary">Email: {user.emails[0].value}</Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={handleFetchFreeBusy} disabled={loading}>
                Fetch My Calendar (Next 7 Days)
              </Button>
            </CardActions>
          </Card>
        ) : (
          <Typography variant="h5" align="center">Please log in to continue.</Typography>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 4 }}>
            {error}
          </Typography>
        )}

        {freeBusyData && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6">Calendar Busy Times:</Typography>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 400, overflowY: 'auto', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                {JSON.stringify(freeBusyData, null, 2)}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

export default App;
