import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './css/general.css'

import { useAuthContext } from './hooks/UseAuthContext';

import Navbar from './components/Navbar';
import Login from './pages/Login'
import Home from './pages/Home'
import UserSettings from './pages/UserSettings'
import Course from './pages/Course';

function App() {

  const { user } = useAuthContext()

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className='page-container'>
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
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
