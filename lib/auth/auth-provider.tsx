import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { authApi } from '@/lib/api';
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    roomNumber?: string;
    floor?: number;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  // Initialize auth state
  useEffect(() => {
    async function loadUser() {
      try {
        const token = await SecureStore.getItemAsync('auth-token');

        if (token) {
          const userData = await authApi.getProfile();
          setUser(userData);
          router.replace('/(app)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Failed to load user', error);
        router.replace('/(auth)/login');
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      await SecureStore.setItemAsync('auth-token', token);
      setUser(user);
      router.replace('/(app)');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authApi.googleLogin(accessToken);
      await SecureStore.setItemAsync('auth-token', token);
      setUser(user);
      router.replace('/(app)');
    } catch (error) {
      console.error('Google login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: {
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
    setIsLoading(true);
    try {
      const newUser = await authApi.register(userData);
      // Auto login after successful registration
      await login(userData.email, userData.password);
      return newUser;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('auth-token');
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        googleLogin,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
