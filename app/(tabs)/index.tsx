import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import SimpleAuthWrapper from '@/components/SimpleAuthWrapper';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

export default function DashboardScreen() {
  const { user, logout } = useSimpleAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <SimpleAuthWrapper>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeText}>
              Welcome back, {user?.username || 'User'}!
            </ThemedText>
            <ThemedText style={styles.subtitleText}>
              Ready to continue your learning journey?
            </ThemedText>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="book-outline" size={32} color="#1976D2" />
              <ThemedText style={styles.statNumber}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Courses</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#388E3C" />
              <ThemedText style={styles.statNumber}>8</ThemedText>
              <ThemedText style={styles.statLabel}>Completed</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="time-outline" size={32} color="#F57C00" />
              <ThemedText style={styles.statNumber}>24h</ThemedText>
              <ThemedText style={styles.statLabel}>Study Time</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="trophy-outline" size={32} color="#C2185B" />
              <ThemedText style={styles.statNumber}>5</ThemedText>
              <ThemedText style={styles.statLabel}>Achievements</ThemedText>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Completed React Basics</ThemedText>
                  <ThemedText style={styles.activityTime}>2 hours ago</ThemedText>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="play" size={16} color="white" />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>Started JavaScript Advanced</ThemedText>
                  <ThemedText style={styles.activityTime}>1 day ago</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SimpleAuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    opacity: 0.6,
  },
});
