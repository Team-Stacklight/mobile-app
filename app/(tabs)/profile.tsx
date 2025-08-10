import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';
import StandardHeader from '@/components/StandardHeader';

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  showArrow?: boolean;
  color?: string;
}

function ProfileHeader() {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('@/assets/images/avatar.png')}
          style={styles.profileAvatar}
        />
        <TouchableOpacity style={styles.editAvatarButton}>
          <Ionicons name="camera" size={16} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        <ThemedText style={[styles.profileName, { color: textColor }]}>Alex Johnson</ThemedText>
        <ThemedText style={[styles.profileEmail, { color: subtextColor }]}>alex.johnson@example.com</ThemedText>
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: textColor }]}>12</ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtextColor }]}>Courses</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: textColor }]}>85%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtextColor }]}>Progress</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: textColor }]}>47</ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtextColor }]}>Streak</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

function ProfileOption({ option, onPress }: { option: ProfileOption; onPress: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const cardBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');

  return (
    <TouchableOpacity 
      style={[styles.optionItem, { backgroundColor: cardBackgroundColor }]} 
      onPress={onPress}
    >
      <View style={[styles.optionIcon, { backgroundColor: option.color || '#007AFF' + '20' }]}>
        <Ionicons 
          name={option.icon} 
          size={20} 
          color={option.color || '#007AFF'} 
        />
      </View>
      <View style={styles.optionContent}>
        <ThemedText style={[styles.optionTitle, { color: textColor }]}>{option.title}</ThemedText>
        {option.subtitle && (
          <ThemedText style={[styles.optionSubtitle, { color: subtextColor }]}>{option.subtitle}</ThemedText>
        )}
      </View>
      {option.showArrow !== false && (
        <Ionicons name="chevron-forward" size={20} color={subtextColor} />
      )}
    </TouchableOpacity>
  );
}



export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  const accountOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      color: '#007AFF',
    },
    {
      id: '2',
      title: 'Learning Preferences',
      subtitle: 'Customize your learning experience',
      icon: 'school-outline',
      color: '#10B981',
    },
    {
      id: '3',
      title: 'Notifications',
      subtitle: 'Manage your notification settings',
      icon: 'notifications-outline',
      color: '#F59E0B',
    },
    {
      id: '4',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      icon: 'shield-checkmark-outline',
      color: '#8B5CF6',
    },
  ];

  const supportOptions: ProfileOption[] = [
    {
      id: '5',
      title: 'Help Center',
      subtitle: 'Get help and support',
      icon: 'help-circle-outline',
      color: '#06B6D4',
    },
    {
      id: '6',
      title: 'Contact Us',
      subtitle: 'Reach out to our support team',
      icon: 'mail-outline',
      color: '#84CC16',
    },
    {
      id: '7',
      title: 'Rate App',
      subtitle: 'Share your feedback',
      icon: 'star-outline',
      color: '#F59E0B',
    },
  ];

  const otherOptions: ProfileOption[] = [
    {
      id: '8',
      title: 'About',
      subtitle: 'Learn more about Questie',
      icon: 'information-circle-outline',
      color: '#6B7280',
    },
    {
      id: '9',
      title: 'Sign Out',
      icon: 'log-out-outline',
      color: '#EF4444',
      showArrow: false,
    },
  ];

  const handleOptionPress = (optionId: string) => {
    console.log('Option pressed:', optionId);
    // Handle navigation or action based on optionId
  };

  return (
    <AnimatedScreenWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right', 'top']}>
        <StandardHeader 
          title="Profile" 
          rightIcon="settings-outline" 
          onRightIconPress={() => {
            // Settings functionality can be added here
            console.log('Settings pressed');
          }} 
        />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />

          {/* Account Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>
            <View style={styles.optionsList}>
              {accountOptions.map((option) => (
                <ProfileOption 
                  key={option.id} 
                  option={option} 
                  onPress={() => handleOptionPress(option.id)} 
                />
              ))}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Support</ThemedText>
            <View style={styles.optionsList}>
              {supportOptions.map((option) => (
                <ProfileOption 
                  key={option.id} 
                  option={option} 
                  onPress={() => handleOptionPress(option.id)} 
                />
              ))}
            </View>
          </View>

          {/* Other Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Other</ThemedText>
            <View style={styles.optionsList}>
              {otherOptions.map((option) => (
                <ProfileOption 
                  key={option.id} 
                  option={option} 
                  onPress={() => handleOptionPress(option.id)} 
                />
              ))}
            </View>
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <ThemedText style={styles.versionText}>Questie v1.0.0</ThemedText>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
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
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
