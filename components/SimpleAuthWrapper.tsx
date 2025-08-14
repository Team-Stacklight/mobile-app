import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SimpleAuthWrapperProps {
  children: React.ReactNode;
}

export default function SimpleAuthWrapper({ children }: SimpleAuthWrapperProps) {
  const { user, loading, checkAuth } = useSimpleAuth();
  const [hasChecked, setHasChecked] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!hasChecked) {
      console.log('🔍 SimpleAuthWrapper: Checking authentication...');
      checkAuth().finally(() => {
        setHasChecked(true);
      });
    }
  }, [hasChecked, checkAuth]);

  useEffect(() => {
    if (hasChecked && !loading && !user) {
      console.log('🔄 SimpleAuthWrapper: Redirecting to login');
      router.replace('/auth/login');
    }
  }, [hasChecked, loading, user]);

  // Show loading while checking authentication
  if (!hasChecked || loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // If no user after checking, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
