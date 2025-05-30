import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// const baseURL = 'http://localhost:3000/api';
const baseURL = 'https://housing-online-shop.vercel.app/api';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to add the token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token', error);
  }
  return config;
});

// API functions for authentication
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },
  googleLogin: async (token: string) => {
    const response = await api.post('/users/google-login', { token });
    return response.data;
  },
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    roomNumber?: string;
    floor?: number;
  }) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData: {
    name?: string;
    phone?: string;
    roomNumber?: string;
    floor?: number;
    password?: string;
  }) => {
    const response = await api.patch('/users/profile', userData);
    return response.data;
  },
};

// API functions for categories
export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  update: async (
    id: string,
    data: { name: string; description?: string; imageUrl?: string }
  ) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// API functions for products
export const productApi = {
  getAll: async (params?: {
    categoryId?: string;
    q?: string;
    page?: number;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    inStock?: boolean;
  }) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  update: async (
    id: string,
    data: {
      name: string;
      description?: string;
      price: number;
      categoryId: string;
      imageUrl?: string;
      inStock?: boolean;
    }
  ) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// API functions for orders
export const orderApi = {
  getAll: async (params?: { status?: string; page?: number }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  create: async (data: {
    items: { productId: string; quantity: number }[];
    notes?: string;
    confirmationDeadlineMinutes?: number;
  }) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  updateStatus: async (
    id: string,
    data: {
      status: string;
      deliveryDeadlineMinutes?: number;
    }
  ) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },
};
export const requestApi = {
  // Fetch all requests with optional pagination parameters
  getAll: async (params?: { limit?: number; page?: number }) => {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  // Fetch a single request by ID
  getById: async (id: string) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Create a new request
  create: async (data: { title: string; description: string }) => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  // Update an existing request by ID
  update: async (
    id: string,
    data: { title?: string; description?: string; adminReply?: string }
  ) => {
    const response = await api.patch(`/requests/${id}`, data);
    return response.data;
  },

  // Delete a request by ID
  delete: async (id: string) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },
};

// API functions for notifications
export const notificationApi = {
  getAll: async (params?: {
    unreadOnly?: boolean;
    limit?: number;
    page?: number;
  }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}`, { isRead: true });
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },
};

export default api;
