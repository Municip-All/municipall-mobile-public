import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';
import { resolveAvatarForUser } from '../utils/avatarImage';

function userForStorage(user: User): User {
  const { avatar_url: _avatar, ...rest } = user;
  return rest;
}
export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string;
  avatar_url?: string;
  cityId?: string;
  neighborhood?: string;
  points?: number;
}

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (token: string, userData: User) => {
    const resolved = await resolveAvatarForUser(userData);
    await AsyncStorage.setItem('user_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userForStorage(resolved)));
    setUser(resolved);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((currentUser) => {
      if (currentUser) {
        const newUser = { ...currentUser, ...userData };
        AsyncStorage.setItem('user_data', JSON.stringify(userForStorage(newUser)));
        return newUser;
      }
      return currentUser;
    });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const storedUser = await AsyncStorage.getItem('user_data');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verify token and refresh user data from server in background
          try {
            const response = await apiClient.get('auth/me');
            if (response.data) {
              const freshUser = await resolveAvatarForUser(response.data as User);
              setUser(freshUser);
              await AsyncStorage.setItem('user_data', JSON.stringify(userForStorage(freshUser)));
            }
          } catch (e) {
            console.warn('Failed to refresh user profile from server', e);
            // If token is expired (401), we should log out
            if ((e as any)?.response?.status === 401) {
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      updateUser,
    }),
    [isAuthenticated, isLoading, user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
