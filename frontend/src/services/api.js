import axios from 'axios';

const API_BASE_URL = 'https://ai-medical-diagnosis-assistant-1wvl.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Inauth router uses refresh-token with query parameter:
          // POST /refresh-token?refresh_token_in=xxx
          const response = await axios.post(
            `${API_BASE_URL}/refresh-token?refresh_token_in=${encodeURIComponent(refreshToken)}`
          );
          
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('access_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, clear storage and log out
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    // Backend uses OAuth2PasswordRequestForm (form-data: username & password)
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API_BASE_URL}/login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },
  
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.post('/profile/change-password', passwordData);
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },
  
  verifyOtp: async (email, otp, newPassword) => {
    const response = await api.post('/reset-password', { 
      email, 
      token: otp, 
      new_password: newPassword 
    });
    return response.data;
  }
};

export const predictionAPI = {
  predict: async (symptomText) => {
    const response = await api.post('/predict', { symptom_text: symptomText });
    return response.data;
  }
};

export const chatbotAPI = {
  chat: async (message, conversationId = null) => {
    const payload = { message };
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    const response = await api.post('/chat', payload);
    return response.data;
  }
};

export const historyAPI = {
  list: async (searchQuery = '', skip = 0, limit = 100) => {
    let url = '/history';
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    params.append('skip', skip);
    params.append('limit', limit);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  
  get: async (historyId) => {
    const response = await api.get(`/history/${historyId}`);
    return response.data;
  },
  
  delete: async (historyId) => {
    const response = await api.delete(`/history/${historyId}`);
    return response.data;
  }
};

export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }
};

export default api;
