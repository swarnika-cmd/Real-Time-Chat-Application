// client/src/services/authService.js (Corrected)

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// 💡 The most common source of error is an accidental double slash or misdefined path.
// The API_BASE_URL is 'http://localhost:5000'. We need to add the backend route prefix '/api/users'.
const API_URL = API_BASE_URL + '/api/users'; // Removed trailing slash for cleaner concatenation

// --- Registration Service ---
const register = async (userData) => {
  // 💡 Ensure the endpoint string is clean: /api/users/register
  const response = await axios.post(API_URL + '/register', userData);
  if (response.data) {
    return response.data;
  }
};

// --- Login Service ---
const login = async (userData) => {
  // 💡 Ensure the endpoint string is clean: /api/users/login
  const response = await axios.post(API_URL + '/login', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    // Check if response.data.token is being read correctly
    if (!response.data.token) {
        console.error("Login response is missing JWT token.");
        throw new Error("Login token missing.");
    }
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// --- Logout Service ---
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  register,
  logout,
  login,
};

export default authService;