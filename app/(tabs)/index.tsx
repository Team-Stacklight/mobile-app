import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';

function Header() {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={24} color={textColor} />
      </TouchableOpacity>
      <ThemedText type="title" style={styles.headerTitle}>Dashboard</ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  const cardBackgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2D31' }, 'background');
  
  return (
    <View style={[styles.statCard, { backgroundColor: cardBackgroundColor }]}>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
      <ThemedText style={styles.statValue}>{String(value)}</ThemedText>
    </View>
  );
}

function ActivityItem({
  title,
  status,
  iconName,
}: {
  title: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  iconName: keyof typeof Ionicons.glyphMap;
}) {
  const statusColor =
    status === 'Completed' ? '#22c55e' : status === 'In Progress' ? '#f59e0b' : '#9BA1A6';
  const iconColor = useThemeColor({}, 'text');

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIconContainer, { backgroundColor: statusColor + '20' }]}>
        <Ionicons name={iconName} size={20} color={statusColor} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.activityTitle}>{title}</ThemedText>
        <ThemedText style={[styles.activityStatus, { color: statusColor }]}>{status}</ThemedText>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <AnimatedScreenWrapper>
      <ThemedView style={styles.screenContainer}>
        <Header />
        <ScrollView contentContainerStyle={styles.container}>
        {/* Today's Focus */}
        <ThemedText style={styles.sectionTitle}>Today's Focus</ThemedText>
        
        <ThemedView style={styles.focusCard}>
          <View style={styles.focusContent}>
            <ThemedText style={styles.eyebrow}>AI-Powered Learning</ThemedText>
            <ThemedText style={styles.focusTitle}>Mastering Prompt Engineering</ThemedText>
            <ThemedText style={styles.focusDescription}>
              Dive into the art of crafting effective prompts for AI models. Learn to structure your
              requests for optimal results.
            </ThemedText>
          </View>
          <View style={styles.focusImageCard}>
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.focusImage}
              contentFit="cover"
            />
          </View>
        </ThemedView>

        {/* Progress Overview */}
        <ThemedText style={styles.sectionTitle}>Progress Overview</ThemedText>
        <View style={styles.statsGrid}>
          <StatCard title="Courses Completed" value={5} />
          <StatCard title="Hours Spent Learning" value={12} />
        </View>
        <View style={styles.statsRow}>
          <StatCard title="Skills Developed" value={3} />
        </View>

        {/* Recent Activity */}
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <View style={styles.activityList}>
          <ActivityItem
            title="Introduction to Machine Learning"
            status="Completed"
            iconName="checkmark-circle"
          />
          <ActivityItem
            title="Data Visualization with Python"
            status="In Progress"
            iconName="time"
          />
          <ActivityItem
            title="Advanced Deep Learning Techniques"
            status="Not Started"
            iconName="ellipse-outline"
          />
        </View>

        {/* bottom spacing */}
        <View style={{ height: 100 }} />
        </ScrollView>
      </ThemedView>
    </AnimatedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Account for status bar
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 40, // Balance the menu button
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    padding: 16,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  focusCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  focusContent: {
    flex: 1,
  },
  eyebrow: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  focusDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#687076',
  },
  focusImageCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#D4A574',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusImage: {
    width: '100%',
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'flex-start',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  statTitle: {
    fontSize: 12,
    color: '#687076',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    includeFontPadding: false,
  },
  activityList: {
    gap: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});
