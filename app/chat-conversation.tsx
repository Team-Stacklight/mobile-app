import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChat } from '@/contexts/ChatContext';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

interface ChatMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  chatRoom: string;
  messageType: 'text' | 'image' | 'file';
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

function BotAvatar() {
  return (
    <View style={styles.botAvatar}>
      <Image
        source={require('@/assets/images/avatar.png')}
        style={styles.botAvatarImage}
      />
    </View>
  );
}

function UserAvatar() {
  return (
    <View style={styles.userAvatar}>
      <Ionicons name="person" size={16} color="white" />
    </View>
  );
}

function MessageBubble({ message, currentUserId }: { message: ChatMessage; currentUserId: string }) {
  // Check both _id and username for current user identification
  const isCurrentUserById = message.sender._id === currentUserId;
  const isCurrentUserByUsername = message.sender.username === 'Dhruv';
  const isCurrentUser = isCurrentUserById || isCurrentUserByUsername;
  
  const bubbleBackgroundColor = isCurrentUser ? '#007AFF' : '#F3F4F6';
  const textColor = isCurrentUser ? '#FFF' : '#000';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.messageContainer, isCurrentUser ? styles.userMessage : styles.otherMessage]}>
      {!isCurrentUser && (
        <View style={styles.senderAvatar}>
          <ThemedText style={styles.senderAvatarText}>
            {message.sender.username.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      )}
      <View style={[styles.messageContent, isCurrentUser && styles.userMessageContent]}>
        {!isCurrentUser && (
          <ThemedText style={styles.senderName}>{message.sender.username}</ThemedText>
        )}
        <View style={[styles.messageBubble, { backgroundColor: bubbleBackgroundColor }, isCurrentUser && styles.userMessageBubble]}>
          <ThemedText style={[styles.messageText, { color: textColor }]}>{message.content}</ThemedText>
        </View>
        <ThemedText style={[styles.messageTime, isCurrentUser && styles.userMessageTime]}>{formatTime(message.createdAt)}</ThemedText>
      </View>
      {isCurrentUser && <UserAvatar />}
    </View>
  );
}

function Header({ chatName }: { chatName: string }) {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={textColor} />
        <ThemedText style={[styles.backText, { color: textColor }]}>Back</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>{chatName}</ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export default function ChatConversationScreen() {
  const { chatName = 'Chat', chatRoomId } = useLocalSearchParams<{ 
    chatName: string; 
    chatRoomId: string; 
  }>();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2D31' }, 'background');
  const textColor = useThemeColor({}, 'text');
  
  const { getChatMessages, sendMessage: sendChatMessage, connectToRoom, disconnectFromRoom, messages: contextMessages, isConnected } = useChat();
  const { user } = useSimpleAuth();

  // Load messages on mount and connect to room
  useEffect(() => {
    if (chatRoomId && user) {
      loadMessages();
      connectToRoom(chatRoomId);
      
      return () => {
        disconnectFromRoom();
      };
    }
  }, [chatRoomId, user]);

  // Update messages when context messages change
  useEffect(() => {
    console.log('🔄 Chat conversation: Context messages changed');
    console.log('🔄 Current chatRoomId:', chatRoomId);
    console.log('🔄 Context messages for room:', contextMessages[chatRoomId]?.length || 0);
    
    if (chatRoomId && contextMessages[chatRoomId]) {
      const newMessages = contextMessages[chatRoomId];
      console.log('🔄 Setting messages:', newMessages.length);
      setMessages(newMessages);
      
      // Auto scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [contextMessages, chatRoomId]);
  
  // Debug: Log when messages state changes
  useEffect(() => {
    console.log('🔄 Local messages state changed:', messages.length);
  }, [messages]);

  // Real-time updates are handled by WebSocket in ChatContext

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await getChatMessages(chatRoomId);
      setMessages(chatMessages);
      // Auto scroll to bottom after loading
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() && chatRoomId) {
      const messageContent = inputText.trim();
      setInputText('');
      
      try {
        await sendChatMessage(chatRoomId, messageContent);
        // Message will be added via WebSocket listener or fallback
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
        // Restore input text on error
        setInputText(messageContent);
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
        <Header chatName={`${chatName}${isConnected ? ' 🟢' : ' 🔴'}`} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Start the conversation!</ThemedText>
            </View>
          ) : (
            messages.map((message) => (
              <MessageBubble 
                key={message._id} 
                message={message} 
                currentUserId={user?._id || ''}
              />
            ))
          )}
        </ScrollView>
        
        {/* INPUT AREA */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message ${chatName}...`}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  botAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  botAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 44,
    backgroundColor: '#F9F9F9',
    color: '#000000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  senderAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  userMessageTime: {
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
