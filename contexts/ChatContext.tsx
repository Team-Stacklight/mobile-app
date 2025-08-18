import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSimpleAuth } from './SimpleAuthContext';
import { ChatApiService, HistoryMessage } from '../services/chatApi';
import { WebSocketService, WebSocketMessage } from '../services/websocketService';

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
  messages: { [chatRoomId: string]: ChatMessage[] };
  isConnected: boolean;
  createChatRoom: (participants: string[], isGroup?: boolean, name?: string) => Promise<ChatRoom>;
  getChatRooms: () => Promise<void>;
  getChatMessages: (chatRoomId: string) => Promise<ChatMessage[]>;
  sendMessage: (chatRoomId: string, content: string) => Promise<void>;
  searchUsers: (query: string) => Promise<ChatUser[]>;
  joinRoom: (chatRoomId: string) => Promise<boolean>;
  leaveRoom: (chatRoomId: string) => void;
  connectToRoom: (chatRoomId: string) => Promise<boolean>;
  disconnectFromRoom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Available chat room - using the provided room ID
const AVAILABLE_ROOM_ID = 'a36c864f-3db2-473b-9122-216324c1563a';

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
    _id: AVAILABLE_ROOM_ID,
    name: 'Ethics Discussion',
    description: 'Room 1 - Ethics topic discussion',
    isGroup: true,
    participants: [MOCK_CHAT_USERS[0], MOCK_CHAT_USERS[1]],
    admins: [MOCK_CHAT_USERS[0]],
    lastMessage: {
      _id: 'msg1',
      content: 'Welcome to the Ethics discussion room!',
      sender: MOCK_CHAT_USERS[0],
      chatRoom: AVAILABLE_ROOM_ID,
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString()
    },
    createdBy: MOCK_CHAT_USERS[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    _id: 'deb2ff93-2671-45ac-87c8-4bdca03cdaa2',
    name: 'Project Management Session',
    description: 'Room 2 - Project management discussion',
    isGroup: true,
    participants: [MOCK_CHAT_USERS[0], MOCK_CHAT_USERS[2]],
    admins: [MOCK_CHAT_USERS[0]],
    lastMessage: {
      _id: 'msg2',
      content: 'Welcome to the Project Management session!',
      sender: MOCK_CHAT_USERS[0],
      chatRoom: 'deb2ff93-2671-45ac-87c8-4bdca03cdaa2',
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 200000).toISOString(),
      updatedAt: new Date(Date.now() - 200000).toISOString()
    },
    createdBy: MOCK_CHAT_USERS[0],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 200000).toISOString()
  }
];

const INITIAL_MESSAGES: { [chatRoomId: string]: ChatMessage[] } = {
  [AVAILABLE_ROOM_ID]: [
    {
      _id: 'msg1',
      content: 'Welcome to the Ethics discussion room!',
      sender: MOCK_CHAT_USERS[0],
      chatRoom: AVAILABLE_ROOM_ID,
      messageType: 'text',
      readBy: [],
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString()
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
  const [messages, setMessages] = useState<{ [chatRoomId: string]: ChatMessage[] }>({});
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useSimpleAuth();
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  // Load chat rooms and initialize messages on mount
  useEffect(() => {
    if (user) {
      getChatRooms();
      setMessages(INITIAL_MESSAGES);
    }
  }, [user]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

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
      console.log('📋 Loading chat rooms...');
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChatRooms(MOCK_CHAT_ROOMS);
      console.log('✅ Chat rooms loaded');
    } catch (error) {
      console.error('❌ Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChatMessages = async (chatRoomId: string): Promise<ChatMessage[]> => {
    try {
      console.log('📨 Loading messages for room:', chatRoomId);
      
      // Return messages from state
      const roomMessages = messages[chatRoomId] || [];
      console.log('✅ Messages loaded:', roomMessages.length);
      return roomMessages;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      throw error;
    }
  };

  const sendMessage = async (chatRoomId: string, content: string) => {
    try {
      console.log('📤 Sending message to room:', chatRoomId, 'content:', content);
      
      // Send via WebSocket if connected
      if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
        const success = wsServiceRef.current.sendMessage(content);
        if (!success) {
          throw new Error('Failed to send message via WebSocket');
        }
      } else {
        // Fallback: Add message locally if not connected
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
        
        setMessages(prev => ({
          ...prev,
          [chatRoomId]: [...(prev[chatRoomId] || []), newMessage]
        }));
        
        // Update chat room's last message
        setChatRooms(prevRooms => 
          prevRooms.map(room => 
            room._id === chatRoomId 
              ? { ...room, lastMessage: newMessage, updatedAt: new Date().toISOString() }
              : room
          )
        );
      }
      
      console.log('✅ Message sent');
    } catch (error) {
      console.error('❌ Error sending message:', error);
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

  const transformHistoryToMessages = (history: HistoryMessage[], chatRoomId: string): ChatMessage[] => {
    return history.map((historyMsg, index) => {
      let messageContent = historyMsg.content;
      
      // Handle double-encoded JSON content
      try {
        const parsedContent = JSON.parse(historyMsg.content);
        if (parsedContent.content) {
          messageContent = parsedContent.content;
        }
      } catch {
        // If parsing fails, use content as-is
      }
      
      return {
        _id: `history_${historyMsg.timestamp}_${index}`,
        content: messageContent,
        sender: {
          _id: historyMsg.sender.toLowerCase().replace(/\s+/g, '_'),
          username: historyMsg.sender,
          email: '',
          isOnline: true,
          lastSeen: historyMsg.timestamp
        },
        chatRoom: chatRoomId,
        messageType: 'text' as const,
        readBy: [],
        createdAt: historyMsg.timestamp,
        updatedAt: historyMsg.timestamp
      };
    });
  };

  const joinRoom = async (chatRoomId: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error('❌ No user found, cannot join room');
        return false;
      }

      console.log('🚪 Joining room:', chatRoomId, 'as user:', user.username);
      
      const result = await ChatApiService.joinRoom(chatRoomId, user.username);
      
      if (result.success) {
        console.log('✅ Successfully joined room:', chatRoomId);
        
        // Process history if available
        if (result.history && result.history.length > 0) {
          console.log('📚 Processing chat history:', result.history.length, 'messages');
          const historyMessages = transformHistoryToMessages(result.history, chatRoomId);
          
          setMessages(prev => ({
            ...prev,
            [chatRoomId]: historyMessages
          }));
          
          console.log('✅ Chat history loaded:', historyMessages.length, 'messages');
        }
        
        return true;
      } else {
        console.error('❌ Failed to join room:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error joining room:', error);
      return false;
    }
  };

  const leaveRoom = (chatRoomId: string) => {
    console.log('🚪 Leaving room:', chatRoomId);
    disconnectFromRoom();
  };

  const connectToRoom = async (chatRoomId: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error('❌ No user found, cannot connect to room');
        return false;
      }

      // Disconnect from current room if connected
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }

      // Try to join the room via API and load history
      const joinSuccess = await joinRoom(chatRoomId);
      if (joinSuccess) {
        console.log('✅ API join successful with history loaded, proceeding with WebSocket');
      } else {
        console.log('⚠️ API join failed, but proceeding with WebSocket connection anyway');
      }

      // Create WebSocket connection
      const wsUrl = ChatApiService.getWebSocketUrl(chatRoomId, user.username);
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      wsServiceRef.current = new WebSocketService(wsUrl, {
        onMessage: (wsMessage: any) => {
          console.log('📨 ChatContext received WebSocket message:', wsMessage);
          
          let messageContent = '';
          let senderName = '';
          let timestamp = new Date().toISOString();
          
          // Handle the nested message structure from the backend
          if (wsMessage.message && wsMessage.sender) {
            senderName = wsMessage.sender;
            
            // Check if message is double-encoded JSON
            try {
              const parsedMessage = JSON.parse(wsMessage.message);
              if (parsedMessage.content) {
                messageContent = parsedMessage.content;
                timestamp = parsedMessage.timestamp || timestamp;
              } else {
                messageContent = wsMessage.message;
              }
            } catch {
              // If parsing fails, use the message as-is
              messageContent = wsMessage.message;
            }
          } else if (wsMessage.content) {
            // Fallback to direct content field
            messageContent = wsMessage.content;
            senderName = wsMessage.username || wsMessage.sender || 'Unknown User';
          }
          
          console.log('📨 Extracted - Content:', messageContent, 'Sender:', senderName);
          
          if (messageContent) {
            console.log('📨 Processing message for room:', chatRoomId);
            
            const newMessage: ChatMessage = {
              _id: `ws_msg_${Date.now()}_${Math.random()}`,
              content: messageContent,
              sender: {
                _id: senderName.toLowerCase().replace(' ', '_'),
                username: senderName,
                email: '',
                isOnline: true,
                lastSeen: new Date().toISOString()
              },
              chatRoom: chatRoomId,
              messageType: 'text',
              readBy: [],
              createdAt: timestamp,
              updatedAt: timestamp
            };
            
            console.log('📨 Created new message object:', newMessage);
            console.log('📨 Current messages state before update:', messages[chatRoomId]?.length || 0);
            
            setMessages(prev => {
              const updated = {
                ...prev,
                [chatRoomId]: [...(prev[chatRoomId] || []), newMessage]
              };
              console.log('📨 Updated messages state:', updated[chatRoomId]?.length || 0);
              return updated;
            });
            
            // Update chat room's last message
            setChatRooms(prevRooms => 
              prevRooms.map(room => 
                room._id === chatRoomId 
                  ? { ...room, lastMessage: newMessage, updatedAt: new Date().toISOString() }
                  : room
              )
            );
            
            console.log('📨 Message processing complete');
          } else {
            console.log('📨 Ignoring message - no content found');
          }
        },
        onConnect: () => {
          console.log('✅ Connected to chat room:', chatRoomId);
          setIsConnected(true);
          currentRoomRef.current = chatRoomId;
        },
        onDisconnect: () => {
          console.log('🔌 Disconnected from chat room');
          setIsConnected(false);
          currentRoomRef.current = null;
        },
        onError: (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
        }
      });
      
      wsServiceRef.current.connect();
      return true;
    } catch (error) {
      console.error('❌ Error connecting to room:', error);
      return false;
    }
  };

  const disconnectFromRoom = () => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      wsServiceRef.current = null;
    }
    setIsConnected(false);
    currentRoomRef.current = null;
  };

  const value = {
    chatRooms,
    loading,
    messages,
    isConnected,
    createChatRoom,
    getChatRooms,
    getChatMessages,
    sendMessage,
    searchUsers,
    joinRoom,
    leaveRoom,
    connectToRoom,
    disconnectFromRoom,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
