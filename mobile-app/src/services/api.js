import axios from 'axios';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API Configuration
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getDevelopmentServerUrl } from '../utils/networkUtils';

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



// Get API base URL using the new utility
let API_BASE_URL;
try {
  API_BASE_URL = getDevelopmentServerUrl();
  console.log('🚀 API Base URL set to:', API_BASE_URL);
} catch (error) {
  console.error('❌ Error getting API URL:', error);
  API_BASE_URL = 'https://gate-pass-system-1.onrender.com/api'; // Safe fallback
  console.log('🔄 Using safe fallback URL:', API_BASE_URL);
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
  verifyToken: () => api.get('/auth/me'),
  testConnection: () => api.get('/health'),
};

// Gate Pass API endpoints
export const gatePassAPI = {
  // Student endpoints
  createGatePass: (gatePassData) => api.post('/gatepass/create', gatePassData),
  getMyGatePasses: () => api.get('/gatepass/my-passes'),
  updateReturnTime: (gatePassId, returnTime) => 
    api.put(`/gatepass/return/${gatePassId}`, { actualReturnTime: returnTime }),
  
  // HOD endpoints
  getPendingGatePasses: () => api.get('/gatepass/pending'),
  getDepartmentGatePasses: () => api.get('/gatepass/all'),
  getHodHistory: (params) => api.get('/gatepass/history', { params }),
  approveGatePass: (gatePassId) => api.put(`/gatepass/approve/${gatePassId}`),
  rejectGatePass: (gatePassId, reason) => 
    api.put(`/gatepass/reject/${gatePassId}`, { rejectionReason: reason }),
  
  // Common endpoints
  getGatePassById: (gatePassId) => api.get(`/gatepass/${gatePassId}`),
  markScannerUsed: (gatePassId) => api.put(`/gatepass/scanner-used/${gatePassId}`),
  getGatePassStats: () => api.get('/gatepass/stats'),
};

// Complaint API endpoints
export const complaintAPI = {
  // Student endpoints
  createComplaint: (complaintData) => api.post('/complaints/create', complaintData),
  getMyComplaints: () => api.get('/complaints/my-complaints'),
  
  // HOD endpoints
  getAllComplaints: () => api.get('/complaints/all'),
  getDeanComplaints: () => api.get('/complaints/dean'),
  getPendingComplaints: () => api.get('/complaints/pending'),
  updateComplaintStatus: (complaintId, statusData) => 
    api.put(`/complaints/update-status/${complaintId}`, statusData),
  
  // Common endpoints
  getComplaintById: (complaintId) => api.get(`/complaints/${complaintId}`),
  getComplaintStats: () => api.get('/complaints/stats/overview'),
};

// Voting API endpoints
export const votingAPI = {
  getVotingComplaints: () => api.get('/voting/complaints'),
  submitVote: (complaintId, voteData) => api.post(`/voting/complaints/${complaintId}/vote`, voteData),
  enableVoting: (complaintId, votingData) => api.post(`/voting/complaints/${complaintId}/enable-voting`, votingData),
  sendToDean: (complaintId) => api.post(`/voting/complaints/${complaintId}/send-to-dean`),
};

// Message API endpoints
export const messageAPI = {
  // Get messages for current user
  getMessages: () => api.get('/messages'),
  
  // Send message (HOD to department students)
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  
  // Mark message as read
  markAsRead: (messageId) => api.put(`/messages/read/${messageId}`),
  
  // Get unread message count
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// Notification API endpoints
export const notificationAPI = {
  // Get notifications for current user
  getNotifications: () => api.get('/notifications'),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/read/${notificationId}`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Get unread notification count
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Utility function to test API connection
export const testApiConnection = async () => {
  try {
    console.log('🔗 Testing API connection to:', API_BASE_URL);
    const response = await api.get('/health');
    console.log('✅ API connection successful!', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Export current API base URL for debugging
export const getCurrentApiUrl = () => API_BASE_URL;

export default api;