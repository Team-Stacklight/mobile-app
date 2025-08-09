import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';

interface Module {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

function ProgressBar({ progress }: { progress: number }) {
  const progressColor = '#007AFF';
  const backgroundColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'background');

  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarBackground, { backgroundColor }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { backgroundColor: progressColor, width: `${progress}%` }
          ]} 
        />
      </View>
    </View>
  );
}

function StreakCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  return (
    <View style={[styles.streakCard, { backgroundColor: cardBackgroundColor }]}>
      <Ionicons name={icon as any} size={24} color="#007AFF" style={styles.streakIcon} />
      <ThemedText style={[styles.streakValue, { color: textColor }]}>{value}</ThemedText>
      <ThemedText style={[styles.streakTitle, { color: subtextColor }]}>{title}</ThemedText>
    </View>
  );
}

function ModuleCard({ module }: { module: Module }) {
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  return (
    <View style={[styles.moduleCard, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.moduleHeader}>
        <Ionicons 
          name={module.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={20} 
          color={module.completed ? "#10B981" : "#9CA3AF"} 
        />
      </View>
      <View style={styles.moduleContent}>
        <ThemedText style={[styles.moduleTitle, { color: textColor }]}>{module.title}</ThemedText>
        <ThemedText style={[styles.moduleSubtitle, { color: subtextColor }]}>{module.subtitle}</ThemedText>
      </View>
    </View>
  );
}

function Header() {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <ThemedText style={[styles.headerTitle, { color: textColor }]}>Progress</ThemedText>
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={24} color={textColor} />
      </TouchableOpacity>
    </View>
  );
}

export default function ProgressScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  const modules: Module[] = [
    {
      id: '1',
      title: 'Module 1:',
      subtitle: 'Introduction to AI',
      completed: true,
    },
    {
      id: '2',
      title: 'Module 2:',
      subtitle: 'Data Analysis Basics',
      completed: true,
    },
    {
      id: '3',
      title: 'Module 3:',
      subtitle: 'Machine Learning Fundamentals',
      completed: true,
    },
    {
      id: '4',
      title: 'Module 4:',
      subtitle: 'Advanced AI Techniques',
      completed: true,
    },
    {
      id: '5',
      title: 'Module 5:',
      subtitle: 'AI Ethics and Bias',
      completed: true,
    },
    {
      id: '6',
      title: 'Module 6:',
      subtitle: 'AI in Business',
      completed: true,
    },
  ];

  return (
    <AnimatedScreenWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right', 'top']}>
        <Header />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Progress Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Overall Progress</ThemedText>
            <ProgressBar progress={75} />
            <ThemedText style={[styles.progressText, { color: subtextColor }]}>75% complete</ThemedText>
          </View>

          {/* Learning Streaks Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Learning Streaks</ThemedText>
            <View style={styles.streaksContainer}>
              <StreakCard title="Current Streak" value="5 days" icon="flame" />
              <StreakCard title="Longest Streak" value="12 days" icon="trophy" />
            </View>
          </View>

          {/* Completed Modules Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Completed Modules</ThemedText>
            <View style={styles.modulesGrid}>
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    marginTop: 4,
  },
  streaksContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  streakCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  streakIcon: {
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleHeader: {
    marginBottom: 12,
  },
  moduleContent: {
    gap: 4,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  moduleSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
