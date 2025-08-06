import axios from 'axios';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API Configuration
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// URL Polyfill for Hermes
if (!global.URL) {
  global.URL = class URL {
    constructor(url) {
      // Simple URL parsing for basic cases
      this.href = url;
      const match = url.match(/^(https?:)\/\/([^\/]+)(\/.*)?$/);
      if (match) {
        this.protocol = match[1];
        this.host = match[2];
        this.pathname = match[3] || '/';
      } else {
        this.protocol = '';
        this.host = '';
        this.pathname = url;
      }
    }
  };
}

if (!global.URLSearchParams) {
  global.URLSearchParams = class URLSearchParams {
    constructor(params) {
      this.params = new Map();
      if (typeof params === 'string') {
        const pairs = params.split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        });
      }
    }
    get(key) { return this.params.get(key); }
    set(key, value) { this.params.set(key, value); }
  };
}

// Get the local IP address for development
const getApiUrl = () => {
  // For production, use your production URL
  if (__DEV__) {
    // For local development - use static URL to avoid URL protocol errors
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    }
    
    // For mobile development, try multiple approaches to get host IP
    try {
      // Try to get host URI from different possible Constants locations
      let hostUri = null;
      
      // Try modern Expo SDK approach
      if (Constants.expoConfig?.hostUri) {
        hostUri = Constants.expoConfig.hostUri;
      }
      // Try legacy manifest approach
      else if (Constants.manifest?.debuggerHost) {
        hostUri = Constants.manifest.debuggerHost;
      }
      // Try legacy hostUri
      else if (Constants.manifest?.hostUri) {
        hostUri = Constants.manifest.hostUri;
      }
      
      if (hostUri && typeof hostUri === 'string') {
        const host = hostUri.split(':')[0];
        console.log('Using host from Constants:', host);
        return `http://${host}:5000/api`;
      }
    } catch (error) {
      console.warn('Could not get host URI from Constants:', error);
    }
    
    // Fallback to platform-specific defaults
    const fallbackUrl = Platform.OS === 'android' 
      ? 'http://192.168.43.211:5000/api'  // Android emulator localhost
      : 'http://192.168.43.211:5000/api'; // Default LAN IP (change this to your actual IP)
      
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
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