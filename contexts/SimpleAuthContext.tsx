import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal user interface
interface SimpleUser {
  _id: string;
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getToken: () => Promise<string | null>;
  selectUser: (userId: number) => Promise<void>;
  getMockUsers: () => SimpleUser[];
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://192.168.68.134:3000/api';

// Mock users for hackathon demo
const MOCK_USERS: SimpleUser[] = [
  {
    _id: '1',
    id: 1,
    username: 'Alice Johnson',
    email: 'alice@collectiveminds.com',
    avatar: '👩‍💻',
    role: 'Developer'
  },
  {
    _id: '2',
    id: 2,
    username: 'Bob Smith',
    email: 'bob@collectiveminds.com',
    avatar: '👨‍🎓',
    role: 'Project Lead'
  },
  {
    _id: '3',
    id: 3,
    username: 'Carol Davis',
    email: 'carol@collectiveminds.com',
    avatar: '👩‍🏫',
    role: 'Designer'
  },
  {
    _id: '4',
    id: 4,
    username: 'David Wilson',
    email: 'david@collectiveminds.com',
    avatar: '👨‍💼',
    role: 'Manager'
  },
  {
    _id: '5',
    id: 5,
    username: 'Emma Brown',
    email: 'emma@collectiveminds.com',
    avatar: '👩‍🔬',
    role: 'Student'
  }
];

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 Checking mock auth with token:', !!token);
      
      if (!token) {
        console.log('ℹ️ No token found');
        setUser(null);
        setLoading(false);
        return;
      }

      // For hackathon: Parse mock token to get user ID
      if (token.startsWith('mock_token_user_')) {
        const userId = parseInt(token.replace('mock_token_user_', ''));
        const mockUser = MOCK_USERS.find(user => user.id === userId);
        
        if (mockUser) {
          console.log('✅ Mock user authenticated:', mockUser.username);
          setUser(mockUser);
        } else {
          console.log('❌ Invalid mock token, clearing...');
          await AsyncStorage.removeItem('auth_token');
          setUser(null);
        }
      } else {
        console.log('❌ Invalid token format, clearing...');
        await AsyncStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // For hackathon: Mock sign in - find user by email
      const mockUser = MOCK_USERS.find(user => user.email === email);
      
      if (mockUser) {
        const mockToken = `mock_token_user_${mockUser.id}`;
        await AsyncStorage.setItem('auth_token', mockToken);
        setUser(mockUser);
        console.log('✅ Mock sign in successful:', mockUser.username);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // For hackathon: Mock sign up - create a temporary user
      const newUserId = MOCK_USERS.length + 1;
      const mockUser = {
        _id: `mock_${newUserId}`,
        id: newUserId,
        username,
        email,
        avatar: '👤',
        role: 'Student'
      };
      
      const mockToken = `mock_token_user_${newUserId}`;
      await AsyncStorage.setItem('auth_token', mockToken);
      setUser(mockUser);
      console.log('✅ Mock sign up successful:', mockUser.username);
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // For hackathon: Return mock token if it exists and is valid format
      if (token && token.startsWith('mock_token_user_')) {
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  };

  const selectUser = async (userId: number): Promise<void> => {
    setLoading(true);
    try {
      const selectedUser = MOCK_USERS.find(user => user.id === userId);
      if (selectedUser) {
        // Create a mock token for the selected user
        const mockToken = `mock_token_user_${userId}`;
        await AsyncStorage.setItem('auth_token', mockToken);
        setUser(selectedUser);
        console.log('✅ Mock user selected:', selectedUser.username);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('❌ Error selecting user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMockUsers = (): SimpleUser[] => {
    return MOCK_USERS;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    checkAuth,
    getToken,
    selectUser,
    getMockUsers,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}
