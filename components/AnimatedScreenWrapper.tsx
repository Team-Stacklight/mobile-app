import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export default function AnimatedScreenWrapper({ children, style }: AnimatedScreenWrapperProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useFocusEffect(
    React.useCallback(() => {
      // Animate in when screen comes into focus
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });

      return () => {
        // Animate out when screen loses focus
        opacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
        });
        translateY.value = withTiming(-10, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
        });
      };
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
