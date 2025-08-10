import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  backgroundImage?: ImageSourcePropType;
  overlayOpacity?: number;
  overlayColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  subtitle,
  trend,
  trendValue,
  onPress,
  variant = 'default',
  backgroundImage,
  overlayOpacity = 0.6,
  overlayColor = 'rgba(0, 0, 0, 0.4)'
}: StatCardProps) {
  const cardBackgroundColor = useThemeColor({ light: '#F3F4F6', dark: '#2A2D31' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({ light: '#687076', dark: '#9CA3AF' }, 'text');
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#79DC96';
      case 'down': return '#ef4444';
      default: return subtitleColor;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const cardStyle = [
    styles.statCard,
    ...(variant === 'compact' ? [styles.compactCard] : []),
    ...(variant === 'featured' ? [styles.featuredCard] : []),
    ...(backgroundImage ? [styles.statCardWithBackground] : []),
    ...(backgroundImage && variant === 'compact' ? [styles.compactCardWithBackground] : []),
    ...(backgroundImage && variant === 'featured' ? [styles.featuredCardWithBackground] : []),
    ...(!backgroundImage ? [{ backgroundColor: cardBackgroundColor }] : [])
  ];

  const CardContent = () => (
    <View style={styles.cardContent}>
      {/* Overlay for background image */}
      {backgroundImage && (
        <View style={[
          styles.overlay, 
          { 
            backgroundColor: overlayColor,
            opacity: overlayOpacity 
          }
        ]} />
      )}
      
      {/* Header with title and optional icon */}
      <View style={styles.cardHeader}>
        <ThemedText style={[
          styles.statTitle, 
          { color: backgroundImage ? 'white' : subtitleColor }
        ]}>
          {title}
        </ThemedText>
      </View>

      {/* Main value */}
      <ThemedText style={[
        styles.statValue,
        variant === 'compact' && styles.compactValue,
        variant === 'featured' && styles.featuredValue,
        { color: backgroundImage ? 'white' : textColor }
      ]}>
        {String(value)}
      </ThemedText>

      {/* Optional subtitle and trend */}
      {(subtitle || trend) && (
        <View style={styles.cardFooter}>
          {subtitle && (
            <ThemedText style={[
              styles.subtitle, 
              { color: backgroundImage ? 'rgba(255, 255, 255, 0.9)' : subtitleColor }
            ]}>
              {subtitle}
            </ThemedText>
          )}
          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon()} 
                size={12} 
                color={getTrendColor()} 
              />
              <ThemedText style={[styles.trendText, { color: getTrendColor() }]}>
                {trendValue}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (backgroundImage) {
    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};
    
    return (
      <Container style={cardStyle} {...containerProps}>
        <ImageBackground 
          source={backgroundImage} 
          style={[
            styles.backgroundImage,
            variant === 'compact' && styles.compactBackgroundImage,
            variant === 'featured' && styles.featuredBackgroundImage
          ]}
          imageStyle={[
            styles.backgroundImageStyle,
            variant === 'featured' && { borderRadius: 16 }
          ]}
        >
          <CardContent />
        </ImageBackground>
      </Container>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    flex: 1,
  },
  statCardWithBackground: {
    padding: 0,
  },
  compactCard: {
    padding: 16,
    minHeight: 90,
  },
  compactCardWithBackground: {
    padding: 0,
  },
  featuredCard: {
    padding: 24,
    minHeight: 140,
    borderRadius: 16,
  },
  featuredCardWithBackground: {
    padding: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    includeFontPadding: false,
  },
  compactValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  featuredValue: {
    fontSize: 42,
    lineHeight: 48,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    paddingHorizontal: 4,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  backgroundImage: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  compactBackgroundImage: {
    minHeight: 90,
  },
  featuredBackgroundImage: {
    minHeight: 140,
    borderRadius: 16,
  },
  backgroundImageStyle: {
    borderRadius: 12,
  },
});
