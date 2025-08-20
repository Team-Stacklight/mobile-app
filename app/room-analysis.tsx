import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';
import { ChatApiService } from '@/services/chatApi';

interface AnalysisData {
  room_id: string;
  analysis: {
    knowledge: number;
    understanding: number;
    engagement: number;
    participation: number;
    contribution: number;
    help_needed: number;
  };
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  
  const percentage = (value / 10) * 100;
  
  return (
    <View style={[styles.metricCard, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconContainer}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.metricScore}>
          <ThemedText style={[styles.metricValue, { color: textColor }]}>{value}</ThemedText>
          <ThemedText style={[styles.metricMaxValue, { color: subtextColor }]}>/10</ThemedText>
        </View>
      </View>
      
      <ThemedText style={[styles.metricTitle, { color: textColor }]}>{title}</ThemedText>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { backgroundColor: subtextColor + '20' }]}>
          <View 
            style={[
              styles.progressFill, 
              { backgroundColor: color, width: `${percentage}%` }
            ]} 
          />
        </View>
        <ThemedText style={[styles.progressText, { color: subtextColor }]}>
          {percentage.toFixed(0)}%
        </ThemedText>
      </View>
    </View>
  );
}

function OverallScore({ analysis }: { analysis: AnalysisData['analysis'] }) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  
  const totalScore = Object.values(analysis).reduce((sum, value) => sum + value, 0);
  const averageScore = totalScore / Object.keys(analysis).length;
  const overallPercentage = (averageScore / 10) * 100;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981'; // Green
    if (score >= 6) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };
  
  return (
    <View style={[styles.overallCard, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.overallHeader}>
        <Ionicons name="analytics" size={24} color="#007AFF" />
        <ThemedText style={[styles.overallTitle, { color: textColor }]}>Overall Score</ThemedText>
      </View>
      
      <View style={styles.overallScoreContainer}>
        <ThemedText style={[styles.overallScore, { color: getScoreColor(averageScore) }]}>
          {averageScore.toFixed(1)}
        </ThemedText>
        <ThemedText style={[styles.overallMaxScore, { color: subtextColor }]}>/10</ThemedText>
      </View>
      
      <View style={styles.overallProgressContainer}>
        <View style={[styles.overallProgressBackground, { backgroundColor: subtextColor + '20' }]}>
          <View 
            style={[
              styles.overallProgressFill, 
              { backgroundColor: getScoreColor(averageScore), width: `${overallPercentage}%` }
            ]} 
          />
        </View>
      </View>
      
      <ThemedText style={[styles.overallDescription, { color: subtextColor }]}>
        Based on {Object.keys(analysis).length} metrics
      </ThemedText>
    </View>
  );
}

export default function RoomAnalysisScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string; roomName: string }>();
  
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await ChatApiService.getRoomAnalysis(roomId);
      
      if (result.success) {
        setAnalysisData(result.data);
      } else {
        setError(result.message || 'Failed to fetch analysis');
      }
    } catch (err) {
      console.error('Error fetching room analysis:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [roomId]);

  const handleRetry = () => {
    fetchAnalysis();
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={[styles.loadingText, { color: subtextColor }]}>
            Analyzing room data...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            Analysis Failed
          </ThemedText>
          <ThemedText style={[styles.errorMessage, { color: subtextColor }]}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <ThemedText style={styles.retryButtonText}>Retry Analysis</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analysisData) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="document-outline" size={48} color="#9CA3AF" />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            No Analysis Data
          </ThemedText>
          <ThemedText style={[styles.errorMessage, { color: subtextColor }]}>
            The analysis returned no data for this room.
          </ThemedText>
        </View>
      );
    }

    const metricConfigs = [
      { key: 'knowledge', title: 'Knowledge', icon: 'school', color: '#3B82F6' },
      { key: 'understanding', title: 'Understanding', icon: 'bulb', color: '#8B5CF6' },
      { key: 'engagement', title: 'Engagement', icon: 'heart', color: '#EF4444' },
      { key: 'participation', title: 'Participation', icon: 'chatbubbles', color: '#10B981' },
      { key: 'contribution', title: 'Contribution', icon: 'add-circle', color: '#F59E0B' },
      { key: 'help_needed', title: 'Help Needed', icon: 'help-circle', color: '#6B7280' },
    ];

    return (
      <View style={styles.analysisContainer}>
        <OverallScore analysis={analysisData.analysis} />
        
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Detailed Metrics
        </ThemedText>
        
        <View style={styles.metricsGrid}>
          {metricConfigs.map((config) => (
            <MetricCard
              key={config.key}
              title={config.title}
              value={analysisData.analysis[config.key as keyof typeof analysisData.analysis]}
              icon={config.icon}
              color={config.color}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <AnimatedScreenWrapper>
      <Stack.Screen 
        options={{
          headerBackTitle: "Back",
          headerTitle: "Room Analysis"
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right']}>
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  refreshButton: {
    padding: 4,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorMessage: {
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
  analysisContainer: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Overall Score Card Styles
  overallCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    minHeight: 160,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 60,
  },
  overallScore: {
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 50,
  },
  overallMaxScore: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 4,
    lineHeight: 24,
  },
  overallProgressContainer: {
    marginBottom: 12,
  },
  overallProgressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overallDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Metric Card Styles
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricMaxValue: {
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 2,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
});
