//This context will store the logged-in user's data and the token.


// client/src/context/AuthContext.jsx

import React, { createContext, useReducer, useEffect } from 'react';

// Define initial state: Check localStorage for existing user/token
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Create the context
export const AuthContext = createContext(initialState);

// Reducer function to handle state changes (Login, Logout)
const AuthReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      // Store token and user data in localStorage and update state
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      // Remove data from localStorage and reset state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return {
        ...initialState,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

// Provider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // Expose the state and the dispatch function globally
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};