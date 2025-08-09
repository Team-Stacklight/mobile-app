import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

function ChatAvatar({ name }: { name: string }) {
  if (name === 'Questie') {
    return (
      <View style={styles.chatAvatar}>
        <Image
          source={require('@/assets/images/avatar.png')}
          style={styles.avatarImage}
        />
      </View>
    );
  }
  
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
  return (
    <View style={styles.chatAvatar}>
      <ThemedText style={styles.chatAvatarText}>{initials}</ThemedText>
    </View>
  );
}

function ChatItem({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <ChatAvatar name={chat.name} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <ThemedText style={[styles.chatName, { color: textColor }]}>{chat.name}</ThemedText>
          <ThemedText style={[styles.chatTime, { color: subtextColor }]}>{chat.timestamp}</ThemedText>
        </View>
        <View style={styles.chatFooter}>
          <ThemedText style={[styles.lastMessage, { color: subtextColor }]} numberOfLines={1}>
            {chat.lastMessage}
          </ThemedText>
          {chat.unreadCount && chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>{chat.unreadCount}</ThemedText>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={subtextColor} />
    </TouchableOpacity>
  );
}

function Header() {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>Chats</ThemedText>
    </View>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const chats: Chat[] = [
    {
      id: '1',
      name: 'Questie',
      lastMessage: 'Hi there! I\'m here to help you learn and grow in your role.',
      timestamp: '2m ago',
      unreadCount: 2,
    },
  ];

  const openChat = (chat: Chat) => {
    router.push({
      pathname: '/chat-conversation',
      params: { chatName: chat.name },
    });
  };

  return (
    <AnimatedScreenWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right', "top"]}>
        <Header />

        <ScrollView
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
        >
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onPress={() => openChat(chat)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    fontWeight: '400',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
