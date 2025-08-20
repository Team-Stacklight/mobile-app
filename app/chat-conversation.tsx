import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChat, ChatMessage } from '@/contexts/ChatContext';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
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

function Header({ chatName, onDocsPress }: { chatName: string; onDocsPress: () => void }) {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={textColor} />
        <ThemedText style={[styles.backText, { color: textColor }]}>Back</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>{chatName}</ThemedText>
      <TouchableOpacity style={styles.docsButton} onPress={onDocsPress}>
        <Ionicons name="document-text" size={24} color={textColor} />
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
  const [markdownContent, setMarkdownContent] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2D31' }, 'background');
  const textColor = useThemeColor({}, 'text');
  
  const { getChatMessages, sendMessage: sendChatMessage, connectToRoom, disconnectFromRoom, messages: contextMessages, isConnected } = useChat();
  const { user } = useSimpleAuth();

  // Load markdown content
  useEffect(() => {
    const loadMarkdownContent = async () => {
      try {
        // Use static markdown string since require doesn't work with .md files in React Native
        const content = `# Becoming a Good Team Lead

This guide provides practical advice, key skills, and actionable steps to help you grow into an effective and respected team lead.

---

## 1. Understanding the Role of a Team Lead

A team lead bridges the gap between management and the team. Your responsibilities go beyond completing tasks — you are responsible for **guiding, supporting, and enabling your team** to succeed.

Key responsibilities:
- Setting clear goals and expectations.
- Facilitating communication within the team and with stakeholders.
- Providing feedback and coaching.
- Managing conflicts and promoting collaboration.
- Ensuring delivery of quality work on time.
- Advocating for the team's needs.

---

## 2. Core Skills to Develop

### 2.1 Communication
- **Active listening**: Understand concerns before responding.
- **Clarity**: Break down complex goals into clear instructions.
- **Transparency**: Share context and decisions openly.

### 2.2 Emotional Intelligence
- Recognize and manage your own emotions.
- Show empathy toward team members.
- Adapt your communication style to different personalities.

### 2.3 Decision-Making
- Gather input from the team when appropriate.
- Make timely decisions, even with incomplete information.
- Take ownership of outcomes.

---

## 3. Building Trust and Relationships

### 3.1 Be Consistent
- Follow through on commitments.
- Maintain consistent standards and expectations.
- Be reliable in your communication and availability.

### 3.2 Show Vulnerability
- Admit when you don't know something.
- Ask for help when needed.
- Share your own learning experiences.

### 3.3 Invest in Your Team
- Learn about each team member's goals and motivations.
- Provide opportunities for growth and development.
- Celebrate individual and team achievements.

---

## 4. Effective Delegation

### 4.1 Match Tasks to Skills
- Understand each team member's strengths and interests.
- Assign tasks that challenge but don't overwhelm.
- Provide context for why the task matters.

### 4.2 Set Clear Expectations
- Define what success looks like.
- Establish deadlines and check-in points.
- Clarify the level of autonomy expected.

### 4.3 Support Without Micromanaging
- Be available for questions and guidance.
- Trust your team to find their own solutions.
- Focus on outcomes, not methods.

---

## 5. Managing Conflicts and Difficult Conversations

### 5.1 Address Issues Early
- Don't let small problems become big ones.
- Create a safe space for open dialogue.
- Focus on behaviors and outcomes, not personalities.

### 5.2 Mediate Fairly
- Listen to all perspectives before making decisions.
- Remain neutral and objective.
- Focus on finding solutions, not assigning blame.

### 5.3 Follow Up
- Check that agreements are being honored.
- Provide ongoing support as needed.
- Learn from each conflict to prevent future issues.

---

## 6. Leading by Example

### 6.1 Work Ethic
- Demonstrate the standards you expect from others.
- Show commitment to quality and deadlines.
- Maintain a positive attitude, especially during challenges.

### 6.2 Continuous Learning
- Stay updated with industry trends and best practices.
- Seek feedback on your own performance.
- Share your learning with the team.

### 6.3 Collaboration
- Work well with other teams and stakeholders.
- Show respect for different viewpoints.
- Model the collaborative behavior you want to see.

---

## 7. Common Mistakes to Avoid

- **Trying to be everyone's friend**: Maintain professional boundaries while being approachable.
- **Avoiding difficult conversations**: Address issues promptly and directly.
- **Taking on too much yourself**: Trust your team and delegate effectively.
- **Not providing enough feedback**: Regular feedback helps team members grow.
- **Ignoring team dynamics**: Pay attention to how team members interact and address issues.
- **Failing to advocate for your team**: Stand up for your team's needs and interests.

---

## 8. Recommended Resources

- **Books**:
  - *Leaders Eat Last* by Simon Sinek
  - *Radical Candor* by Kim Scott
  - *The Five Dysfunctions of a Team* by Patrick Lencioni

- **Podcasts**:
  - *Manager Tools*
  - *Coaching for Leaders*

- **Online Courses**:
  - Coursera: *Leading People and Teams*
  - LinkedIn Learning: *Becoming a Manager*

---

## 9. Final Thoughts

Becoming a good team lead is less about authority and more about **service, empathy, and guidance**. Your success is measured not by your individual contributions, but by how well your team thrives under your leadership.

> "A leader is best when people barely know he exists.  
> When his work is done, his aim fulfilled,  
> they will say: we did it ourselves." — Lao Tzu`;
        setMarkdownContent(content);
      } catch (error) {
        console.error('Error loading markdown content:', error);
        setMarkdownContent('# Documentation\n\nUnable to load documentation content.');
      }
    };
    
    loadMarkdownContent();
  }, []);

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
        <Header 
          chatName={`${chatName}${isConnected ? ' 🟢' : ' 🔴'}`} 
          onDocsPress={() => setShowDocsModal(true)}
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
            {markdownContent ? (
              <Markdown style={markdownStyles}>
                {markdownContent}
              </Markdown>
            ) : (
              <ThemedText style={styles.modalText}>
                Loading documentation...
              </ThemedText>
            )}
          </ScrollView>
        </SafeAreaView>
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
  docsButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
});
