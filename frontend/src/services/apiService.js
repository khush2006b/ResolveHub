import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.api.defaults.headers.Authorization;
  }

  // Auth endpoints
  login(credentials) {
    return this.api.post('/api/auth/login', credentials);
  }

  register(userData) {
    return this.api.post('/api/auth/register', userData);
  }

  // Complaint endpoints
  submitComplaint(complaintData) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(complaintData).forEach(key => {
      if (key !== 'files' && complaintData[key]) {
        formData.append(key, complaintData[key]);
      }
    });
    
    // Add files
    if (complaintData.files && complaintData.files.length > 0) {
      complaintData.files.forEach(file => {
        formData.append('media', file);
      });
    }
    
    return this.api.post('/api/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  getComplaintHistory() {
    return this.api.get('/api/complaints/history');
  }

  getStaffComplaints() {
    return this.api.get('/api/complaints/staff');
  }

  updateComplaintStatus(complaintId, status) {
    return this.api.put(`/api/complaints/${complaintId}/status`, { status });
  }

  submitFeedback(complaintId, feedbackData) {
    return this.api.post(`/api/complaints/${complaintId}/feedback`, feedbackData);
  }

  getHeatmapData() {
    return this.api.get('/api/complaints/heatmap');
  }

  // Admin endpoints
  createStaffUser(userData) {
    return this.api.post('/api/admin/users', userData);
  }
}

export const apiService = new ApiService();