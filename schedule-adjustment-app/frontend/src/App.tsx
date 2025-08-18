import api from './api'; // Import the api instance
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

import { useEffect } from 'react'; // useEffect is still needed for the cleanup logic
import { useAuth } from './hooks/useAuth'; // Import useAuth hook
import { useCalendar } from './hooks/useCalendar'; // Import useCalendar hook

function App() {
  const { user, handleLogin, handleLogout, setUser } = useAuth();
  const { freeBusyData, loading, error, handleFetchFreeBusy, setFreeBusyData } = useCalendar();

  // When user logs out, clear calendar data
  // This useEffect is needed because useAuth and useCalendar are separate hooks
  useEffect(() => {
    if (!user) {
      setFreeBusyData(null);
    }
  }, [user, setFreeBusyData]);

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
