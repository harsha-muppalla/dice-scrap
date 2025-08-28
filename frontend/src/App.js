import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { JobsPage } from './JobsPage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate(); 

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login'); 
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!token ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/jobs" />} 
      />

      <Route 
        path="/jobs" 
        element={token ? <JobsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />

      <Route 
        path="*" 
        element={<Navigate to={token ? "/jobs" : "/login"} />} 
      />
    </Routes>
  );
}

export default App;