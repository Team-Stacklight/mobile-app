import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChat } from '@/contexts/ChatContext';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

interface ChatUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

function UserAvatar({ username }: { username: string }) {
  const initials = username.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  return (
    <View style={styles.userAvatar}>
      <ThemedText style={styles.userAvatarText}>{initials}</ThemedText>
    </View>
  );
}

function UserItem({ user, onPress }: { user: ChatUser; onPress: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  return (
    <TouchableOpacity style={styles.userItem} onPress={onPress}>
      <UserAvatar username={user.username} />
      <View style={styles.userContent}>
        <ThemedText style={[styles.userName, { color: textColor }]}>
          {user.username}
        </ThemedText>
        <ThemedText style={[styles.userEmail, { color: subtextColor }]}>
          {user.email}
        </ThemedText>
      </View>
      <View style={[styles.onlineIndicator, { 
        backgroundColor: user.isOnline ? '#10B981' : '#6B7280' 
      }]} />
    </TouchableOpacity>
  );
}

export default function NewChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'text');
  const inputBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  
  const { searchUsers, createChatRoom } = useChat();
  const { user: currentUser } = useSimpleAuth();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const users = await searchUsers(query.trim());
      // Filter out current user from results
      const filteredUsers = users.filter(user => user._id !== currentUser?._id);
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (user: ChatUser) => {
    try {
      setLoading(true);
      
      // Create a new chat room with the selected user
      const chatRoom = await createChatRoom([user._id], false);
      
      // Navigate to the chat conversation
      router.push({
        pathname: '/chat-conversation',
        params: { 
          chatRoomId: chatRoom._id,
          chatName: user.username 
        },
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right', 'top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          New Chat
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { 
          backgroundColor: inputBackgroundColor,
          borderColor: borderColor 
        }]}>
          <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search users by username or email..."
            placeholderTextColor={useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text')}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {loading && (
            <Ionicons name="refresh" size={20} color={textColor} style={styles.loadingIcon} />
          )}
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {searchQuery.length > 0 && searchResults.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={48} color={useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text')} />
            <ThemedText style={[styles.emptyStateText, { 
              color: useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text') 
            }]}>
              No users found
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtext, { 
              color: useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text') 
            }]}>
              Try searching with a different username or email
            </ThemedText>
          </View>
        )}

        {searchQuery.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text')} />
            <ThemedText style={[styles.emptyStateText, { 
              color: useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text') 
            }]}>
              Start a new conversation
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtext, { 
              color: useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text') 
            }]}>
              Search for users to start chatting
            </ThemedText>
          </View>
        )}

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              onPress={() => startChat(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  headerSpacer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
