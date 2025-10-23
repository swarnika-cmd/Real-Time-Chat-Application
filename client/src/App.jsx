// client/src/App.jsx (Updated with Routing Structure)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; 
import Login from './pages/Login';
import Register from './pages/Register';
// 💡 We need a main Chat page now
import Chat from './pages/Chat'; 

// -----------------------------------------------------------
// 💡 The Protected Route Component checks for authentication
// -----------------------------------------------------------
const ProtectedRoute = ({ children }) => {
  // Get authentication state from context
  const { isAuthenticated, loading } = React.useContext(AuthContext); 
  
  // If still loading state from local storage, render nothing
  if (loading) {
    return <div>Loading...</div>; 
  }

  // If NOT authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (the requested page)
  return children;
};
// -----------------------------------------------------------


function App() {
  return (
    // 💡 BrowserRouter is required for routing
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          {/* Route 1: Default path redirects to Chat if logged in, otherwise ProtectedRoute handles it */}
          <Route path="/" element={<Navigate to="/chat" replace />} /> 
          
          {/* Route 2: The main protected chat application */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;