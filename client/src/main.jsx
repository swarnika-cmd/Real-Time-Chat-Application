import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 1. Import the AuthProvider
import { AuthProvider } from './context/AuthContext.jsx'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Wrap the App component with the AuthProvider */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </StrictMode>,
)
