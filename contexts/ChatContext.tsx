import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSimpleAuth } from './SimpleAuthContext';

// Mock chat interfaces for hackathon demo
interface ChatUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface ChatMessage {
  _id: string;
  content: string;
  sender: ChatUser;
  chatRoom: string;
  messageType: 'text' | 'image' | 'file';
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ChatRoom {
  _id: string;
  name?: string;
  description?: string;
  isGroup: boolean;
  participants: ChatUser[];
  admins: ChatUser[];
  lastMessage?: ChatMessage;
  createdBy: ChatUser;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  loading: boolean;
  createChatRoom: (participants: string[], isGroup?: boolean, name?: string) => Promise<ChatRoom>;
  getChatRooms: () => Promise<void>;
  getChatMessages: (chatRoomId: string) => Promise<ChatMessage[]>;
  sendMessage: (chatRoomId: string, content: string) => Promise<void>;
  searchUsers: (query: string) => Promise<ChatUser[]>;
  joinRoom: (chatRoomId: string) => void;
  leaveRoom: (chatRoomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock chat data for hackathon demo
const MOCK_CHAT_USERS: ChatUser[] = [
  {
    _id: '1',
    username: 'Alice Johnson',
    email: 'alice@questie.com',
    avatar: '👩‍💻',
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  {
    _id: '2',
    username: 'Bob Smith',
    email: 'bob@questie.com',
    avatar: '👨‍🎓',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: '3',
    username: 'Carol Davis',
    email: 'carol@questie.com',
    avatar: '👩‍🏫',
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  {
    _id: 'questie-bot',
    username: 'Collective Minds',
    email: 'bot@collectiveminds.com',
    avatar: '🤖',
    isOnline: true,
    lastSeen: new Date().toISOString()
  }
];

const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    _id: 'questie-chat',
    name: 'Collective Minds',
    description: 'Chat with your AI learning assistant',
    isGroup: false,
    participants: [MOCK_CHAT_USERS[0], MOCK_CHAT_USERS[3]],
    admins: [MOCK_CHAT_USERS[3]],
    lastMessage: {
      _id: 'msg1',
      content: 'Hello! How can I help you with your learning today?',
      sender: MOCK_CHAT_USERS[3],
      chatRoom: 'questie-chat',
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString()
    },
    createdBy: MOCK_CHAT_USERS[3],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString()
  }
];

const MOCK_MESSAGES: { [chatRoomId: string]: ChatMessage[] } = {
  'questie-chat': [
    {
      _id: 'msg1',
      content: 'Hello! How can I help you with your learning today?',
      sender: MOCK_CHAT_USERS[3],
      chatRoom: 'questie-chat',
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      _id: 'msg2',
      content: 'I\'m working on my math homework and could use some help!',
      sender: MOCK_CHAT_USERS[0],
      chatRoom: 'questie-chat',
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 240000).toISOString(),
      updatedAt: new Date(Date.now() - 240000).toISOString()
    },
    {
      _id: 'msg3',
      content: 'Great! I\'d be happy to help with your math homework. What specific topic are you working on?',
      sender: MOCK_CHAT_USERS[3],
      chatRoom: 'questie-chat',
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 180000).toISOString(),
      updatedAt: new Date(Date.now() - 180000).toISOString()
    }
  ]
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSimpleAuth();

  // Load mock chat rooms on mount
  useEffect(() => {
    if (user) {
      getChatRooms();
    }
  }, [user]);

  const createChatRoom = async (participants: string[], isGroup = false, name = ''): Promise<ChatRoom> => {
    try {
      console.log('🎭 Mock: Creating chat room with participants:', participants);
      
      // For hackathon: Create a mock chat room
      const newRoomId = `room_${Date.now()}`;
      const participantUsers = MOCK_CHAT_USERS.filter(u => participants.includes(u._id));
      
      const newRoom: ChatRoom = {
        _id: newRoomId,
        name: name || (isGroup ? 'New Group Chat' : participantUsers[0]?.username || 'New Chat'),
        description: isGroup ? 'Group chat' : 'Direct message',
        isGroup,
        participants: participantUsers,
        admins: participantUsers.slice(0, 1),
        createdBy: participantUsers[0] || MOCK_CHAT_USERS[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local state
      setChatRooms(prev => [newRoom, ...prev]);
      
      return newRoom;
    } catch (error) {
      console.error('❌ Mock error creating chat room:', error);
      throw error;
    }
  };

  const getChatRooms = async () => {
    try {
      console.log('🎭 Mock: Loading chat rooms...');
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChatRooms(MOCK_CHAT_ROOMS);
      console.log('✅ Mock: Chat rooms loaded');
    } catch (error) {
      console.error('❌ Mock error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChatMessages = async (chatRoomId: string): Promise<ChatMessage[]> => {
    try {
      console.log('🎭 Mock: Loading messages for room:', chatRoomId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const messages = MOCK_MESSAGES[chatRoomId] || [];
      console.log('✅ Mock: Messages loaded:', messages.length);
      return messages;
    } catch (error) {
      console.error('❌ Mock error fetching messages:', error);
      throw error;
    }
  };

  const sendMessage = async (chatRoomId: string, content: string) => {
    try {
      console.log('🎭 Mock: Sending message to room:', chatRoomId, 'content:', content);
      
      // Create new message
      const newMessage: ChatMessage = {
        _id: `msg_${Date.now()}`,
        content,
        sender: MOCK_CHAT_USERS.find(u => u._id === user?.id.toString()) || MOCK_CHAT_USERS[0],
        chatRoom: chatRoomId,
        messageType: 'text',
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock messages
      if (!MOCK_MESSAGES[chatRoomId]) {
        MOCK_MESSAGES[chatRoomId] = [];
      }
      MOCK_MESSAGES[chatRoomId].push(newMessage);
      
      // Update chat room's last message
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          room._id === chatRoomId 
            ? { ...room, lastMessage: newMessage, updatedAt: new Date().toISOString() }
            : room
        )
      );
      
      // Simulate bot response for Collective Minds chat
      if (chatRoomId === 'questie-chat') {
        setTimeout(() => {
          const botResponse: ChatMessage = {
            _id: `msg_${Date.now() + 1}`,
            content: `Thanks for your message! I'm here to help with your learning. ${content.includes('?') ? "That's a great question!" : "Feel free to ask me anything about your studies."}`,
            sender: MOCK_CHAT_USERS[3], // Collective Minds bot
            chatRoom: chatRoomId,
            messageType: 'text',
            readBy: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          MOCK_MESSAGES[chatRoomId].push(botResponse);
          
          setChatRooms(prevRooms => 
            prevRooms.map(room => 
              room._id === chatRoomId 
                ? { ...room, lastMessage: botResponse, updatedAt: new Date().toISOString() }
                : room
            )
          );
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      }
      
      console.log('✅ Mock: Message sent');
    } catch (error) {
      console.error('❌ Mock error sending message:', error);
      throw error;
    }
  };

  const searchUsers = async (query: string): Promise<ChatUser[]> => {
    try {
      console.log('🎭 Mock: Searching users with query:', query);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const results = MOCK_CHAT_USERS.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log('✅ Mock: User search results:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Mock error searching users:', error);
      throw error;
    }
  };

  const joinRoom = (chatRoomId: string) => {
    console.log('🎭 Mock: Joining room:', chatRoomId);
  };

  const leaveRoom = (chatRoomId: string) => {
    console.log('🎭 Mock: Leaving room:', chatRoomId);
  };

  const value = {
    chatRooms,
    loading,
    createChatRoom,
    getChatRooms,
    getChatMessages,
    sendMessage,
    searchUsers,
    joinRoom,
    leaveRoom,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
