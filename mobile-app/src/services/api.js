import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API Configuration
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the local IP address for development
const getApiUrl = () => {
  // For production, use your production URL
  if (__DEV__) {
    // For local development - use static URL to avoid URL protocol errors
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    }
    // For mobile development, use static IP to avoid Constants.expoConfig issues
    return 'http://192.168.1.100:5000/api';
  }
  // Production URL
  return 'https://your-backend-domain.com/api';
};

let API_BASE_URL;
try {
  API_BASE_URL = getApiUrl();
} catch (error) {
  console.error('Error getting API URL:', error);
  API_BASE_URL = 'http://localhost:5000/api'; // Safe fallback
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
};

// Gate Pass API endpoints
export const gatePassAPI = {
  // Student endpoints
  createGatePass: (gatePassData) => api.post('/gatepass/create', gatePassData),
  getMyGatePasses: () => api.get('/gatepass/my-passes'),
  updateReturnTime: (gatePassId, returnTime) => 
    api.patch(`/gatepass/${gatePassId}/return`, { actualReturnTime: returnTime }),
  
  // HOD endpoints
  getPendingGatePasses: () => api.get('/gatepass/pending'),
  getDepartmentGatePasses: () => api.get('/gatepass/department'),
  approveGatePass: (gatePassId) => api.patch(`/gatepass/${gatePassId}/approve`),
  rejectGatePass: (gatePassId, reason) => 
    api.patch(`/gatepass/${gatePassId}/reject`, { rejectionReason: reason }),
  
  // Common endpoints
  getGatePassById: (gatePassId) => api.get(`/gatepass/${gatePassId}`),
  getGatePassStats: () => api.get('/gatepass/stats'),
};

export default api;