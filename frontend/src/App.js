import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './css/general.css'

import Navbar from './components/Navbar';
import Login from './pages/Login'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className='page-container'>
          <Routes>
            <Route
              path='/login'
              element={ <Login /> }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
