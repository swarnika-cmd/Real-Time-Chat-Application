// client/src/App.jsx (Updated with Clean Routing Structure)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat'; 

// -----------------------------------------------------------
// Protected Route Component checks for authentication
// -----------------------------------------------------------
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext); 
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    ); 
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// -----------------------------------------------------------
function App() {
  React.useEffect(() => {
    document.title = "PINSTAGRAM - Real-Time Chat";
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/chat" replace />} /> 
        
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;