import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';
import StandardHeader from '@/components/StandardHeader';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import StatCard from '@/components/StatCard';
import StatCardGrid from '@/components/StatCardGrid';





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
        {/* Fixed Navigation Header */}
        <StandardHeader 
          title="Dashboard" 
          rightIcon="menu" 
          onRightIconPress={() => {
            // Menu functionality can be added here
            console.log('Menu pressed');
          }} 
        />
        
        {/* Scrollable Content */}
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <Image
              source={require('@/assets/images/header.png')}
              style={styles.reactLogo}
            />
          }
          overlayTitle="Welcome back!"
          overlaySubtitle="Ready to continue your learning journey?"
        >
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
        <StatCardGrid
          cards={[
            {
              title: "Courses Completed",
              value: "12",
              backgroundImage: require('@/assets/images/course.png'),
              overlayOpacity: 0.7,
              overlayColor: "rgba(0, 0, 0, 0.5)",
              icon: "school-outline",
              iconColor: "#22c55e",
              trend: "up",
              trendValue: "+2 this week"
            },
            {
              title: "Hours Studied",
              value: "47",
              backgroundImage: require('@/assets/images/clock.png'),
              overlayOpacity: 0.7,
              overlayColor: "rgba(0, 0, 0, 0.5)",
              icon: "time-outline",
              iconColor: "#3b82f6",
              subtitle: "This month"
            },
            {
              title: "Current Streak",
              value: "5 days",
              backgroundImage: require('@/assets/images/streak.png'),
              overlayOpacity: 0.7,
              overlayColor: "rgba(0, 0, 0, 0.5)",
              icon: "flame-outline",
              iconColor: "#f59e0b",
              trend: "up",
              trendValue: "Best: 12 days"
            },
            {
              title: "Points Earned",
              value: "2,340",
              backgroundImage: require('@/assets/images/points.png'),
              overlayOpacity: 0.7,
              overlayColor: "rgba(0, 0, 0, 0.5)",
              trend: "up",
              trendValue: "+180 today",
            }
          ]}
          columns={2}
          spacing={8}
        />

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
        </ParallaxScrollView>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: 'absolute',
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
  headerImageContainer: {
    height: 200,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 20,
    paddingTop: 0,
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
  settingsButton: {
    padding: 4,
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
