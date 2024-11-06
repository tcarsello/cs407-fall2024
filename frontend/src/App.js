import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './css/general.css'
import { Box, ThemeProvider, createTheme } from '@mui/material';
import { useAuthContext } from './hooks/UseAuthContext';

import Navbar from './components/Navbar';
import Login from './pages/Login'
import Home from './pages/Home'
import UserSettings from './pages/UserSettings'
import Course from './pages/Course';
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword';
import OneTimeCode from './pages/OneTimeCode';
import Game from './pages/Game';
import Round from './pages/Round'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3', // primary color
    },
    secondary: {
      main: '#673AB7', // secondary color
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff',
    },
  },
});

function App() {

  const { user } = useAuthContext()

  if (user === undefined) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.default'
          }}
        >
          Loading...
        </Box>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              pt: '84px',
              px: 3,
              bgcolor: 'background.default'
            }}
          >
            <Routes>
            <Route
              path='/'
              element={user ? <Home /> : <Navigate to='/login' />}
            />
            <Route
              path='/login'
              element={user ? <Navigate to='/' /> : <Login />}
            />
            <Route
              path='settings'
              element={user ? <UserSettings /> : <Navigate to='/login' />}
            />
            <Route
              path='/course/:courseId'
              element={user ? <Course /> : <Navigate to='/login' />}
            />
            <Route
              path='forgot-password'
              element={user ? <Navigate to='/' /> : <ForgotPassword />}
            />
            <Route
              path='one-time-code'
              element={user ? <Navigate to='/' /> : <OneTimeCode />}
            />
            <Route
              path='/game/:gameId'
              element={user ? <Game /> : <Navigate to='/' />}
            />
            <Route
              path='/game/:gameId/round/:roundId'
              element={user ? <Round /> : <Navigate to='/' />}
            />
            <Route
              path='*'
              element={<NotFound />}
            />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;