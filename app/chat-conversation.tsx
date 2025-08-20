import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ChatMessage, useChat } from '@/contexts/ChatContext';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatApiService } from '@/services/chatApi';
import Markdown from 'react-native-markdown-display';


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


function MessageBubble({ message, currentUserId, currentUsername }: { message: ChatMessage; currentUserId: string; currentUsername?: string }) {
  // Check both _id and username for current user identification
  const isCurrentUserById = message.sender._id === currentUserId;
  const isCurrentUserByUsername = currentUsername && message.sender.username === currentUsername;
  const isCurrentUser = isCurrentUserById || isCurrentUserByUsername;

  // Check if message is from Questie AI agent
  const isQuestieAgent = message.sender.username === 'Questie';

  // Set background color based on message type
  let bubbleBackgroundColor = '#F3F4F6'; // Default gray for other users
  if (isCurrentUser) {
    bubbleBackgroundColor = '#007AFF'; // Blue for current user
  } else if (isQuestieAgent) {
    bubbleBackgroundColor = '#D1FAE5'; // Light green for Questie AI agent
  }

  const textColor = isCurrentUser ? '#FFF' : '#000';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.messageContainer, isCurrentUser ? styles.userMessage : styles.otherMessage]}>
      {!isCurrentUser && (
        <View style={styles.senderAvatar}>
          {isQuestieAgent ? (
            <Image
              source={require('@/assets/images/questie-avatar.png')}
              style={styles.questieAvatarImage}
            />
          ) : (
            <ThemedText style={styles.senderAvatarText}>
              {message.sender.username.charAt(0).toUpperCase()}
            </ThemedText>
          )}
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
    </View>
  );
}

function Header({ chatName, onMenuPress }: { chatName: string; onMenuPress: () => void }) {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={textColor} />
        <ThemedText style={[styles.backText, { color: textColor }]}>Back</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>{chatName}</ThemedText>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="ellipsis-vertical" size={24} color={textColor} />
      </TouchableOpacity>
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
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loadingDocumentation, setLoadingDocumentation] = useState(false);
  const [documentationError, setDocumentationError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2D31' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const { getChatMessages, sendMessage: sendChatMessage, connectToRoom, disconnectFromRoom, messages: contextMessages, isConnected } = useChat();
  const { user } = useSimpleAuth();

  // Load documentation content dynamically from API
  useEffect(() => {
    const loadDocumentation = async () => {
      if (!chatRoomId) return;
      
      setLoadingDocumentation(true);
      setDocumentationError(null);
      
      try {
        const result = await ChatApiService.getRoomDetails(chatRoomId);
        
        if (result.success && result.data?.documentation) {
          setMarkdownContent(result.data.documentation);
        } else {
          setDocumentationError(result.message || 'Failed to load documentation');
          setMarkdownContent('# Documentation\n\nUnable to load documentation content.');
        }
      } catch (error) {
        console.error('Error loading documentation:', error);
        setDocumentationError('Network error while loading documentation');
        setMarkdownContent('# Documentation\n\nUnable to load documentation content.');
      } finally {
        setLoadingDocumentation(false);
      }
    };

    loadDocumentation();
  }, [chatRoomId]);

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
    if (!inputText.trim() || !user) return;

    try {
      await sendChatMessage(chatRoomId!, inputText.trim());
      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const router = useRouter();

  const handleDeleteRoom = () => {
    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this chat room? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete room API call
              Alert.alert('Success', 'Room deleted successfully!');
              // Navigate back to chat list
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete room. Please try again.');
              console.error('Error deleting room:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
        <Header
          chatName={`${chatName}${isConnected ? ' 🟢' : ' 🔴'}`}
          onMenuPress={() => setShowMenuDrawer(true)}
        />

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
            {/* Info Message */}
            <View style={styles.infoMessageContainer}>
              <View style={styles.infoMessage}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <ThemedText style={styles.infoMessageText}>
                  Tap the ⋯ button above to access Help and Documentation
                </ThemedText>
              </View>
            </View>

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
                  currentUsername={user?.username}
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

        {/* Documentation Modal */}
        <Modal
          visible={showDocsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowDocsModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Learning Documentation</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDocsModal(false)}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {loadingDocumentation ? (
                <View style={styles.loadingContainer}>
                  <ThemedText style={styles.loadingText}>Loading documentation...</ThemedText>
                </View>
              ) : documentationError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={24} color="#EF4444" />
                  <ThemedText style={styles.errorText}>
                    Failed to load documentation
                  </ThemedText>
                  <ThemedText style={styles.errorSubtext}>
                    {documentationError}
                  </ThemedText>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      const loadDocumentation = async () => {
                        if (!chatRoomId) return;
                        
                        setLoadingDocumentation(true);
                        setDocumentationError(null);
                        
                        try {
                          const result = await ChatApiService.getRoomDetails(chatRoomId);
                          
                          if (result.success && result.data?.documentation) {
                            setMarkdownContent(result.data.documentation);
                          } else {
                            setDocumentationError(result.message || 'Failed to load documentation');
                            setMarkdownContent('# Documentation\n\nUnable to load documentation content.');
                          }
                        } catch (error) {
                          console.error('Error loading documentation:', error);
                          setDocumentationError('Network error while loading documentation');
                          setMarkdownContent('# Documentation\n\nUnable to load documentation content.');
                        } finally {
                          setLoadingDocumentation(false);
                        }
                      };
                      loadDocumentation();
                    }}
                  >
                    <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : markdownContent ? (
                <Markdown style={markdownStyles}>
                  {markdownContent}
                </Markdown>
              ) : (
                <ThemedText style={styles.modalText}>
                  No documentation available
                </ThemedText>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Help Modal */}
        <Modal
          visible={showHelpModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Help</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Markdown style={markdownStyles}>
                {`# Welcome!

To start the session supply the command "/start"

If you need a hint you can use the command "/hint"

Questie will listen in on your conversation and try to help you with your tasks and give you pointers.

If you need to end the session supply the command "/end"`}
              </Markdown>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Menu Drawer */}
        <Modal
          visible={showMenuDrawer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenuDrawer(false)}
        >
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setShowMenuDrawer(false)}
          >
            <View style={styles.drawerContainer}>
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setShowMenuDrawer(false);
                  setShowDocsModal(true);
                }}
              >
                <Ionicons name="document-text" size={20} color="#374151" />
                <ThemedText style={styles.drawerItemText}>Documentation</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setShowMenuDrawer(false);
                  setShowHelpModal(true);
                }}
              >
                <Ionicons name="help-circle" size={20} color="#374151" />
                <ThemedText style={styles.drawerItemText}>Help</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, styles.deleteItem]}
                onPress={() => {
                  setShowMenuDrawer(false);
                  handleDeleteRoom();
                }}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
                <ThemedText style={[styles.drawerItemText, styles.deleteItemText]}>Delete Room</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// First styles declaration removed - consolidated into single declaration below

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  heading1: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#111827',
    marginTop: 18,
    marginBottom: 10,
    lineHeight: 26,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#374151',
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  strong: {
    fontWeight: '600' as const,
    color: '#111827',
  },
  em: {
    fontStyle: 'italic' as const,
    color: '#4B5563',
  },
  list_item: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 6,
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  blockquote: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 16,
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    color: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  fence: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  hr: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 20,
  },
};

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
  menuButton: {
    padding: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
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
  questieAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 150,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  deleteItem: {
    backgroundColor: '#FEF2F2',
  },
  deleteItemText: {
    color: '#EF4444',
  },
  infoMessageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  infoMessageText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
