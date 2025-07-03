import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// export const baseURL = 'http://localhost:3000/api';
// const baseURL = 'https://housing-online-shop.vercel.app/api';
export const baseURL = 'https://housing-online-shop-gray.vercel.app/api';

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
    address?: string;
    latitude?: number;
    longitude?: number;
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
    address?: string;
    latitude?: number;
    longitude?: number;
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
  getBestSelling: async () => {
    const response = await api.get('/products/best');
    return response.data;
  },
  getFeatured: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },
  getNew: async () => {
    const response = await api.get('/products/new');
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
    couponCode?: string; // Add this new field
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

// API functions for events
export const eventApi = {
  getActive: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get('/events/active', { params });
    return response.data;
  },
  getAll: async (params?: { limit?: number; page?: number }) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  create: async (data: {
    title: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) => {
    const response = await api.post('/events', data);
    return response.data;
  },
  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      isActive?: boolean;
    }
  ) => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// API functions for coupons
export const couponApi = {
  getUserCoupons: async (params?: {
    isUsed?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/coupons/user', { params });
    return response.data;
  },
  combineCoupons: async (couponIds: string[]) => {
    const response = await api.post('/coupons/combine', { couponIds });
    return response.data;
  },
  // Add these new admin functions
  getAllCoupons: async (params?: {
    isUsed?: boolean;
    userId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/coupons', { params });
    return response.data;
  },
  createCoupon: async (data: {
    code: string;
    secretCode: string;
    amount: number;
    isUsed?: boolean;
    userId?: string;
  }) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },
};

// API functions for admin analytics
export const adminApi = {
  getAnalytics: async (filter?: {
    filterType: 'all' | 'date' | 'month';
    filterValue?: string;
  }) => {
    const params: Record<string, string> = {};

    if (filter) {
      params.filterType = filter.filterType;
      if (filter.filterValue) {
        params.filterValue = filter.filterValue;
      }
    }

    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },
};

export default api;
