import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatApiService, ApiUser } from '../services/chatApi';

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
  selectUser: (userId: string) => Promise<void>;
  getUsers: () => Promise<SimpleUser[]>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://192.168.68.134:3000/api';

// Fallback users in case API fails
const FALLBACK_USERS: SimpleUser[] = [
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
  const [cachedUsers, setCachedUsers] = useState<SimpleUser[]>([]);

  const transformApiUserToSimpleUser = (apiUser: ApiUser, index: number): SimpleUser => {
    return {
      _id: apiUser.id,
      id: index + 1, // For backward compatibility with existing token system
      username: apiUser.name,
      email: `${apiUser.name.toLowerCase().replace(/\s+/g, '.')}@questie.com`,
      avatar: '👤',
      role: 'User'
    };
  };

  const getUsers = async (): Promise<SimpleUser[]> => {
    try {
      console.log('👥 Loading users from API...');
      const apiUsers = await ChatApiService.getUsers();
      const transformedUsers = apiUsers.map(transformApiUserToSimpleUser);
      setCachedUsers(transformedUsers);
      console.log('✅ Users loaded from API:', transformedUsers.length, 'users');
      return transformedUsers;
    } catch (error) {
      console.error('❌ Error fetching users from API, using fallback:', error);
      setCachedUsers(FALLBACK_USERS);
      return FALLBACK_USERS;
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 Checking auth with token:', !!token);
      
      if (!token) {
        console.log('ℹ️ No token found');
        setUser(null);
        setLoading(false);
        return;
      }

      // Parse token to get user ID
      if (token.startsWith('token_user_')) {
        const userId = token.replace('token_user_', '');
        
        // Try to get users from API first
        const users = cachedUsers.length > 0 ? cachedUsers : await getUsers();
        const foundUser = users.find(user => user._id === userId);
        
        if (foundUser) {
          console.log('✅ User authenticated:', foundUser.username);
          setUser(foundUser);
        } else {
          console.log('❌ Invalid token, clearing...');
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
      // Get users from API and find by email
      const users = await getUsers();
      const foundUser = users.find(user => user.email === email);
      
      if (foundUser) {
        const token = `token_user_${foundUser._id}`;
        await AsyncStorage.setItem('auth_token', token);
        setUser(foundUser);
        console.log('✅ Sign in successful:', foundUser.username);
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
      // For hackathon: Create a temporary user (not persisted to backend)
      const users = await getUsers();
      const newUserId = `temp_${Date.now()}`;
      const newUser = {
        _id: newUserId,
        id: users.length + 1,
        username,
        email,
        avatar: '👤',
        role: 'Student'
      };
      
      const token = `token_user_${newUserId}`;
      await AsyncStorage.setItem('auth_token', token);
      setUser(newUser);
      console.log('✅ Sign up successful:', newUser.username);
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
      if (token && token.startsWith('token_user_')) {
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  };

  const selectUser = async (userId: string): Promise<void> => {
    setLoading(true);
    try {
      const users = cachedUsers.length > 0 ? cachedUsers : await getUsers();
      const selectedUser = users.find(user => user._id === userId);
      if (selectedUser) {
        const token = `token_user_${userId}`;
        await AsyncStorage.setItem('auth_token', token);
        setUser(selectedUser);
        console.log('✅ User selected:', selectedUser.username);
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


  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    checkAuth,
    getToken,
    selectUser,
    getUsers,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}
