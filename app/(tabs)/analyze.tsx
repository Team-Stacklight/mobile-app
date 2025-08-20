import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';
import StandardHeader from '@/components/StandardHeader';
import { ChatApiService, ApiRoom } from '@/services/chatApi';

interface RoomCardProps {
  room: ApiRoom;
  onPress: () => void;
}

function RoomCard({ room, onPress }: RoomCardProps) {
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  return (
    <TouchableOpacity 
      style={[styles.roomCard, { backgroundColor: cardBackgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.roomHeader}>
        <Ionicons name="chatbubbles" size={20} color="#007AFF" />
        <ThemedText style={[styles.roomId, { color: subtextColor }]}>
          ID: {room.id.substring(0, 8)}...
        </ThemedText>
      </View>
      <View style={styles.roomContent}>
        <ThemedText style={[styles.roomName, { color: textColor }]}>{room.name}</ThemedText>
        <ThemedText style={[styles.roomTopic, { color: subtextColor }]}>{room.topic}</ThemedText>
        <ThemedText style={[styles.roomCreator, { color: subtextColor }]}>
          Created by: {room.created_by}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function LoadingCard() {
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  
  return (
    <View style={[styles.roomCard, styles.loadingCard, { backgroundColor: cardBackgroundColor }]}>
      <ActivityIndicator size="small" color="#007AFF" />
      <ThemedText style={styles.loadingText}>Loading rooms...</ThemedText>
    </View>
  );
}

function EmptyState() {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  
  return (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
      <ThemedText style={[styles.emptyTitle, { color: textColor }]}>No Chat Rooms</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: subtextColor }]}>
        No chat rooms are currently available. Pull down to refresh.
      </ThemedText>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  
  return (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <ThemedText style={[styles.emptyTitle, { color: textColor }]}>Error Loading Rooms</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: subtextColor }]}>
        Failed to fetch chat rooms. Check your connection and try again.
      </ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function AnalyzeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const fetchedRooms = await ChatApiService.getRooms();
      setRooms(fetchedRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomPress = (room: ApiRoom) => {
    router.push({
      pathname: '/room-analysis',
      params: {
        roomId: room.id,
        roomName: room.name,
      },
    });
  };

  const onRefresh = () => {
    fetchRooms(true);
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </View>
      );
    }

    if (error) {
      return <ErrorState onRetry={() => fetchRooms()} />;
    }

    if (rooms.length === 0) {
      return <EmptyState />;
    }

    return (
      <View style={styles.roomsContainer}>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onPress={() => handleRoomPress(room)}
          />
        ))}
      </View>
    );
  };

  return (
    <AnimatedScreenWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right']}>
        <StandardHeader 
          title="Analyze" 
          rightIcon="refresh-outline" 
          onRightIconPress={() => fetchRooms()} 
        />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
        >
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Available Chat Rooms</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Tap on a room to view details
            </ThemedText>
          </View>

          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  roomsContainer: {
    gap: 12,
  },
  loadingContainer: {
    gap: 12,
  },
  roomCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  roomContent: {
    gap: 6,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
  },
  roomTopic: {
    fontSize: 14,
    lineHeight: 20,
  },
  roomCreator: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
