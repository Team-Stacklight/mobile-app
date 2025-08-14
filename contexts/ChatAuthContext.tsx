import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chat backend user interface
interface ChatUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: ChatUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetAuth: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chat backend API configuration
const API_BASE_URL = 'http://192.168.68.134:3000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state from storage - ONLY RUN ONCE
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      console.log('🔄 Starting authentication initialization (ONCE)...');
      
      try {
        // Clean up any old Firebase authentication data first
        console.log('🧹 Cleaning up old Firebase data...');
        await cleanupOldAuthData();
        
        const storedToken = await AsyncStorage.getItem('auth_token');
        console.log('🔑 Stored token exists:', !!storedToken);
        
        if (mounted && storedToken) {
          setToken(storedToken);
          console.log('✅ Token set, verifying with backend...');
          // Verify token and get user profile
          await getProfile(storedToken);
          console.log('✅ Profile loaded successfully');
        } else if (mounted) {
          console.log('ℹ️ No stored token found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          // Clear invalid token and any other auth data
          await clearAllAuthData();
        }
      } finally {
        if (mounted) {
          console.log('✅ Authentication initialization complete - setting loading to false');
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run only once



  // Clean up old Firebase authentication data
  const cleanupOldAuthData = async () => {
    try {
      // Remove any Firebase-related keys that might be stored
      const keysToRemove = [
        'firebase:authUser:AIzaSyC8K9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X:[DEFAULT]',
        'firebase:host:auth-localhost',
        '@firebase/auth:user',
        '@firebase/auth:token',
        'userToken',
        'user',
        'firebaseUser',
        'authUser'
      ];
      
      await Promise.all(keysToRemove.map(key => 
        AsyncStorage.removeItem(key).catch(() => {
          // Ignore errors for keys that don't exist
        })
      ));
    } catch (error) {
      console.error('Error cleaning up old auth data:', error);
    }
  };

  // Clear all authentication-related data
  const clearAllAuthData = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await cleanupOldAuthData();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const getProfile = async (authToken: string) => {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        // Token is invalid
        throw new Error(`Invalid token: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting profile:', error);
      // Clear invalid token and all auth data
      await clearAllAuthData();
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        await AsyncStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        await AsyncStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Call backend logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend call fails
    } finally {
      // Clear local storage and state
      await clearAllAuthData();
    }
  };

  // Manual reset function to clear all authentication data
  const resetAuth = async () => {
    console.log('Manually resetting authentication...');
    await clearAllAuthData();
    setLoading(false);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetAuth,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
