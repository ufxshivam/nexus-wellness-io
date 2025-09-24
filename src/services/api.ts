import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  location: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface Location {
  id: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  status: string;
}

export interface Reading {
  id: string;
  location: string;
  ph: number;
  turbidity: number;
  temperature: number;
  timestamp: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  downloadUrl: string;
  type: string;
}

// API endpoints
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post('/api/login', credentials),
  
  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },
};

export const alertsAPI = {
  getAlerts: () => api.get<Alert[]>('/api/alerts'),
};

export const locationsAPI = {
  getLocations: () => api.get<Location[]>('/api/locations'),
};

export const readingsAPI = {
  getReadings: () => api.get<Reading[]>('/api/readings'),
};

export const reportsAPI = {
  getReports: () => api.get<Report[]>('/api/reports'),
  downloadReport: (reportId: string) => 
    api.get(`/api/reports/${reportId}/download`, { responseType: 'blob' }),
};

export default api;