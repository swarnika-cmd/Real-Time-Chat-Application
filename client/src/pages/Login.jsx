
import { FaComments } from 'react-icons/fa';
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext'; 
// import { useNavigate } from 'react-router-dom'; // For routing later

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Get the dispatch function from the AuthContext to update global state
  const { dispatch } = useContext(AuthContext); 
  
  const { email, password } = formData;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Call the backend login service
      const response = await authService.login({ email, password });
      
      // 2. Dispatch success action to update global state
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response, token: response.token } 
      });
      
      // 3. Redirect to the chat page (We'll implement routing later)
      navigate('/chat'); 
      console.log("Login successful! Token saved. Next step: Redirect to chat.");

    } catch (err) {
      // Handle 401 Unauthorized or other server errors
      const errorMessage = 
        err.response?.data?.message || 'Login failed. Invalid credentials or server error.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
    {/* ✅ FIX: Wrap the text in quotes to treat it as a static string */}
    <h2>{"PINSTAGRAM"}</h2> 
    <p>Welcome Back! Connect in real-time</p>
      <form onSubmit={onSubmit}>
        <input 
          type="email" 
          name="email" 
          value={email} 
          onChange={onChange} 
          placeholder="Email" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          value={password} 
          onChange={onChange} 
          placeholder="Password" 
          required 
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Don't have an account? 
        {/* 💡 Use Link for client-side navigation */}
        <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;