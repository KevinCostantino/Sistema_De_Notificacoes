import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    
    // Ensure UTF-8 headers
    config.headers['Content-Type'] = 'application/json; charset=utf-8';
    config.headers['Accept'] = 'application/json; charset=utf-8';
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
      
      // You can handle specific status codes here
      switch (status) {
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('API request failed');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Notification API service
const notificationService = {
  // Create a new notification
  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Get notifications for a user with pagination
  getByUser: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = `/notifications/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single notification by ID
  getById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark notification as unread  
  markAsUnread: async (id) => {
    const response = await api.patch(`/notifications/${id}/unread`);
    return response.data;
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    const response = await api.patch(`/notifications/user/${userId}/mark-all-read`);
    return response.data;
  },

  // Update notification
  update: async (id, data) => {
    const response = await api.patch(`/notifications/${id}`, data);
    return response.data;
  },

  // Delete notification (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get notification statistics
  getStats: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}/stats`);
    return response.data;
  },
};

export default notificationService;