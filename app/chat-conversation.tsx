import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
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

function MessageBubble({ message }: { message: Message }) {
  const bubbleBackgroundColor = message.isBot ? '#F3F4F6' : '#007AFF';
  const textColor = message.isBot ? '#000' : '#FFF';

  return (
    <View style={[styles.messageContainer, message.isBot ? styles.botMessage : styles.userMessage]}>
      {message.isBot && <BotAvatar />}
      <View style={[styles.messageBubble, { backgroundColor: bubbleBackgroundColor }]}>
        <ThemedText style={[styles.messageText, { color: textColor }]}>{message.text}</ThemedText>
      </View>
      {!message.isBot && <UserAvatar />}
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
  const { chatName = 'Questie' } = useLocalSearchParams<{ chatName: string }>();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi there, I'm ${chatName}! I'm here to help you learn and grow in your role. What would you like to learn today?`,
      isBot: true,
      timestamp: new Date(),
    },
    {
      id: '2',
      text: `Hi ${chatName}, I'd like to learn more about project management.`,
      isBot: false,
      timestamp: new Date(),
    },
    {
      id: '3',
      text: "Great choice! Project management is a valuable skill. To get started, would you like to focus on the fundamentals, or a specific aspect like Agile methodologies?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2D31' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isBot: false,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! I'm processing your request and will help you learn more about that topic.",
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
        <Header chatName={chatName} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
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
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
