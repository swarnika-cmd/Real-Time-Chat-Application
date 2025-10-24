// client/src/services/authService.js

import axios from 'axios';
// 💡 Import the base URL from the new config file
import { API_BASE_URL } from '../config/api';

// Define the base URL using the imported constant
const API_URL = API_BASE_URL + '/api/users/';

// --- Registration Service ---
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  if (response.data) {
    return response.data;
  }
};

// --- Login Service ---
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
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