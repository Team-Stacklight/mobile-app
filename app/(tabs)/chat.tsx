import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';
import StandardHeader from '@/components/StandardHeader';
import { useChat } from '@/contexts/ChatContext';

interface ChatRoom {
  _id: string;
  name?: string;
  isGroup: boolean;
  participants: Array<{
    _id: string;
    username: string;
    email: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: {
      username: string;
    };
  };
  createdAt: string;
}

function ChatAvatar({ name }: { name: string }) {
  if (name === 'Collective Minds') {
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

function ChatItem({ chatRoom, onPress }: { chatRoom: ChatRoom; onPress: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  
  // Get chat display name
  const getChatName = () => {
    if (chatRoom.isGroup && chatRoom.name) {
      return chatRoom.name;
    }
    // For 1:1 chats, use the other participant's name
    return chatRoom.participants[0]?.username || 'Unknown User';
  };
  
  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <ChatAvatar name={getChatName()} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <ThemedText style={[styles.chatName, { color: textColor }]}>{getChatName()}</ThemedText>
          <ThemedText style={[styles.chatTime, { color: subtextColor }]}>
            {chatRoom.lastMessage 
              ? formatTimestamp(chatRoom.lastMessage.createdAt)
              : formatTimestamp(chatRoom.createdAt)
            }
          </ThemedText>
        </View>
        <View style={styles.chatFooter}>
          <ThemedText style={[styles.lastMessage, { color: subtextColor }]} numberOfLines={1}>
            {chatRoom.lastMessage?.content || 'No messages yet'}
          </ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={subtextColor} />
    </TouchableOpacity>
  );
}



export default function ChatListScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const { chatRooms, loading, getChatRooms } = useChat();

  // Refresh chat rooms on mount
  useEffect(() => {
    getChatRooms();
  }, []);

  const openChat = (chatRoom: ChatRoom) => {
    const chatName = chatRoom.isGroup && chatRoom.name 
      ? chatRoom.name 
      : chatRoom.participants[0]?.username || 'Unknown User';
      
    router.push({
      pathname: '/chat-conversation',
      params: { 
        chatRoomId: chatRoom._id,
        chatName: chatName 
      },
    });
  };

  const handleNewChat = () => {
    router.push('/new-chat');
  };

  return (
    <AnimatedScreenWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right']}>
        <View style={[styles.header, { borderBottomColor: useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'text') }]}>
          <ThemedText style={styles.headerTitle}>Chats</ThemedText>
          <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
            <Ionicons name="add" size={24} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={getChatRooms}
            />
          }
        >
          {chatRooms.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <ThemedText style={styles.emptyStateText}>No chats yet</ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Tap the + button to start a new conversation
              </ThemedText>
            </View>
          ) : (
            chatRooms.map((chatRoom) => (
              <ChatItem
                key={chatRoom._id}
                chatRoom={chatRoom}
                onPress={() => openChat(chatRoom)}
              />
            ))
          )}
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
    flex: 1,
  },
  newChatButton: {
    padding: 4,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#6B7280',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: '#9CA3AF',
  },
});
