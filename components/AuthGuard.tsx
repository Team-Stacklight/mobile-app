import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/ChatAuthContext';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [forceLogin, setForceLogin] = React.useState(false);

  // EMERGENCY: Force redirect to login after 1 second to break any loops
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        console.log('🚨 FORCING REDIRECT TO LOGIN');
        setForceLogin(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  // Force redirect to login
  React.useEffect(() => {
    if (forceLogin || (!loading && !user)) {
      console.log('🔄 Redirecting to login');
      router.replace('/auth/login');
    }
  }, [forceLogin, loading, user]);

  // Show loading for max 1 second
  if (loading && !forceLogin) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  // If we have a user, show the app
  if (user && !forceLogin) {
    return <>{children}</>;
  }

  // Otherwise, don't render anything (redirect will happen)
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
