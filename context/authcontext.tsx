import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { resolveAvatarForUser } from '../utils/avatarImage';
import { onSessionExpired } from '../services/sessionEvents';

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
    let cancelled = false;
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const storedUser = await AsyncStorage.getItem('user_data');

        if (token && storedUser) {
          if (!cancelled) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }

          try {
            const freshUser = await authService.me();
            const resolved = await resolveAvatarForUser(freshUser);
            if (!cancelled) {
              setUser(resolved);
              await AsyncStorage.setItem('user_data', JSON.stringify(userForStorage(resolved)));
            }
          } catch (e: unknown) {
            if (!cancelled) {
              console.warn('Failed to refresh user profile from server', e);
              if (e && typeof e === 'object' && 'response' in e && (e as { response?: { status?: number } }).response?.status === 401) {
                await logout();
              }
            }
          }
        }
      } catch (error: unknown) {
        if (!cancelled) {
          console.error('Auth initialization error', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    return () => { cancelled = true; };
  }, [logout]);

  useEffect(() => {
    const unsubscribe = onSessionExpired(logout);
    return unsubscribe;
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
