// client/src/pages/Register.jsx
import { FaComments } from 'react-icons/fa';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const { username, email, password } = formData;
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    try {
      const response = await authService.register(formData);
      setMessage(`Registration successful for ${response.username}! Please log in.`);
      setFormData({ username: '', email: '', password: '' }); // Clear form
    } catch (err) {
      // Axios puts server error messages in response.data.message
      const errorMessage = err.response?.data?.message || 'Registration failed due to a server error.';
      setError(errorMessage);
    }
  };

  return (
    <div className="form-container">
    {/* ✅ FIX: Wrap the text in quotes to treat it as a static string */}
    <h2>{"PINSTAGRAM"}</h2> 
    <p>Join the community and chat instantly</p>
      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          name="username" 
          value={username} 
          onChange={onChange} 
          placeholder="Username" 
          required 
        />
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
          placeholder="Password (min 6 chars)" 
          required 
        />
        <button type="submit">Register</button>
      </form>
      {message && <p style={{ marginTop: '20px', color: '#B0BACC' }}>
        Already have an account? <Link to="/login" style={{ color: '#4cc9f0', textDecoration: 'none', fontWeight: '500' }}>Sign In</Link>
    </p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Already have an account? 
        {/* 💡 Use Link for client-side navigation */}
        <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;