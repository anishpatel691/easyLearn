
// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const sendPasswordResetOTP = async (email) => {
  return await axios.post(`${API_URL}/auth/forgot-password`, { email });
};

export const verifyOTP = async (email, otp) => {
  return await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
};

export const resetPassword = async (email, token, password) => {
  return await axios.post(`${API_URL}/auth/reset-password`, { email, token, password });
};