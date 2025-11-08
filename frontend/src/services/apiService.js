// src/services/apiService.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
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
    console.log('🔐 Login attempt with credentials:', credentials);
    console.log('🔐 API Base URL:', this.api.defaults.baseURL);
    console.log('🔐 Request headers:', this.api.defaults.headers);
    
    return this.api.post("/api/auth/login", credentials)
      .then(response => {
        console.log('✅ Login successful:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Login failed:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error config:', error.config);
        throw error;
      });
  }

  register(userData) {
    console.log("in apiservice \n") ;
    return this.api.post("/api/auth/register", userData);
  }

  // Complaint endpoints
  submitComplaint(complaintData) {
    const formData = new FormData();

    Object.keys(complaintData).forEach((key) => {
      if (key !== "files" && complaintData[key])
        formData.append(key, complaintData[key]);
    });

    if (complaintData.files?.length) {
      complaintData.files.forEach((file) => formData.append("media", file));
    }

    return this.api.post("/api/complaints", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  getComplaintHistory() {
    return this.api.get("/api/complaints/history");
  }

  getStaffComplaints() {
    return this.api.get("/api/complaints/staff");
  }

  updateComplaintStatus(complaintId, status) {
    return this.api.put(`/api/complaints/${complaintId}/status`, { status });
  }

  submitFeedback(complaintId, feedbackData) {
    return this.api.post(
      `/api/complaints/${complaintId}/feedback`,
      feedbackData
    );
  }

  getHeatmapData() {
    return this.api.get("/api/complaints/heatmap");
  }

  // Admin endpoints
  createStaffUser(userData) {
    console.log('🚀 Creating staff user with data:', userData);
    console.log('🚀 API Base URL:', this.api.defaults.baseURL);
    console.log('🚀 Request headers:', this.api.defaults.headers);
    console.log('🚀 Token from localStorage:', localStorage.getItem('token'));
    
    // Make the request and handle errors properly
    return this.api.post("/api/admin/users", userData)
      .then(response => {
        console.log('✅ Staff creation successful:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Staff creation failed:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error config:', error.config);
        throw error;
      });
  }

  getVerificationCode() {
    console.log('🔑 Generating verification code');
    return this.api.post("/api/admin/verification-code")
      .then(response => {
        console.log('✅ Verification code generated:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Verification code generation failed:', error);
        throw error;
      });
  }

  // Gamification endpoints
  getLeaderboard(limit = 10) {
    const url = `/api/admin/leaderboard?limit=${limit}`;
    console.log('🔗 Leaderboard URL:', url);
    console.log('🌐 Base URL:', this.api.defaults.baseURL);
    console.log('🎯 Full URL:', this.api.defaults.baseURL + url);
    return this.api.get(url);
  }

  getGamificationStats() {
    const url = "/api/admin/gamification-stats";
    console.log('🔗 Stats URL:', url);
    console.log('🌐 Base URL:', this.api.defaults.baseURL);
    console.log('🎯 Full URL:', this.api.defaults.baseURL + url);
    return this.api.get(url);
  }

  getUserGamificationStats(userId) {
    const url = `/api/admin/user-gamification-stats/${userId}`;
    console.log('👤 User Stats URL:', url);
    console.log('🌐 Base URL:', this.api.defaults.baseURL);
    console.log('🎯 Full URL:', this.api.defaults.baseURL + url);
    return this.api.get(url);
  }

  // Statistics endpoints
  getStatistics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.api.get(`/api/admin/statistics${queryString ? `?${queryString}` : ''}`);
  }

  exportStatistics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.api.get(`/api/admin/statistics/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    });
  }

  // SLA endpoints
  getSLAStats() {
    return this.api.get('/api/complaints/sla/stats');
  }

  getOverdueComplaints() {
    return this.api.get('/api/complaints/sla/overdue');
  }

  processSLAUpdates() {
    return this.api.post('/api/complaints/sla/process');
  }

  // Generic methods for direct API calls (backward compatibility)
  get(url) {
    return this.api.get(url);
  }

  post(url, data) {
    return this.api.post(url, data);
  }

  put(url, data) {
    return this.api.put(url, data);
  }

  delete(url) {
    return this.api.delete(url);
  }
}

export const apiService = new ApiService();
