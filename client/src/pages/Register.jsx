// client/src/pages/Register.jsx

import { FaComments } from 'react-icons/fa';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 💡 Import useNavigate
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
    const [isLoading, setIsLoading] = useState(false); // 💡 Added loading state
    
    const navigate = useNavigate(); // 💡 Initialize useNavigate hook

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError(null);
        setIsLoading(true); // Start loading

        try {
            const response = await authService.register(formData);
            
            setMessage(`Registration successful for ${response.username}! Redirecting to login...`);
            setFormData({ username: '', email: '', password: '' }); // Clear form

            // 💡 FIX: Redirect to login after a short delay
            setTimeout(() => navigate('/login'), 1500);

        } catch (err) {
            const errorMessage = 
                err.response?.data?.message || 'Registration failed due to a server error.';
            setError(errorMessage);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        // 💡 WRAPPER 1: Main Auth Container for background and centering
        <div className="auth-page-container register-page"> 
            
            {/* 💡 WRAPPER 2: The beautiful, translucent form box */}
            <div className="form-container">
                
                {/* Logo/Icon */}
                {/* Ensure you installed react-icons for this, otherwise comment out */}
                {FaComments && <FaComments className="logo-icon" />}
                
                <h2>{"PINSTAGRAM"}</h2> 
                <p>Join the community and chat instantly</p>

                {/* 💡 Tab-Style Button Group */}
                <div className="button-group"> 
                    <Link to="/login" style={{ flex: 1 }}>
                        {/* Login button (unactive) links to the login page */}
                        <button type="button">Sign In</button>
                    </Link>
                    {/* Register button (active) is disabled to hold the style */}
                    <button type="button" disabled style={{ flex: 1 }}>Register</button>
                </div>

                {/* --- Form --- */}
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
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                {/* --- Messages and Errors --- */}
                {message && <p style={{ color: '#4cc9f0', marginTop: '20px' }}>{message}</p>}
                {error && <p style={{ color: '#ff4d4f', marginTop: '10px' }}>{error}</p>}
                
                {/* The redundant 'Already have an account' paragraph is now removed */}
            </div>
        </div>
    );
};

export default Register;