import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface StandardHeaderProps {
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export default function StandardHeader({ title, rightIcon, onRightIconPress }: StandardHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.headerTitle}>{title}</ThemedText>
      {rightIcon && onRightIconPress ? (
        <TouchableOpacity style={styles.rightButton} onPress={onRightIconPress}>
          <Ionicons name={rightIcon} size={24} color={textColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  rightButton: {
    padding: 8,
    borderRadius: 8,
  },
  rightSpacer: {
    width: 40, // Same width as button to maintain balance
  },
});
