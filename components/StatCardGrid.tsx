import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatCard, { StatCardProps } from '@/components/StatCard';

export interface StatCardGridProps {
  cards: StatCardProps[];
  columns?: 2 | 3 | 4;
  spacing?: number;
}

export default function StatCardGrid({ 
  cards, 
  columns = 2, 
  spacing = 12 
}: StatCardGridProps) {
  const renderRow = (rowCards: StatCardProps[], rowIndex: number) => (
    <View key={rowIndex} style={styles.row}>
      {rowCards.map((card, cardIndex) => (
        <View 
          key={`${rowIndex}-${cardIndex}`}
          style={[
            styles.cardContainer,
            { 
              flex: 1,
              marginRight: cardIndex < rowCards.length - 1 ? spacing : 0 
            }
          ]}
        >
          <StatCard {...card} />
        </View>
      ))}
      {/* Fill remaining space if row is not complete */}
      {rowCards.length < columns && 
        Array.from({ length: columns - rowCards.length }).map((_, index) => (
          <View 
            key={`empty-${rowIndex}-${index}`} 
            style={[
              styles.cardContainer,
              { 
                flex: 1,
                marginRight: index < columns - rowCards.length - 1 ? spacing : 0 
              }
            ]} 
          />
        ))
      }
    </View>
  );

  const rows = [];
  for (let i = 0; i < cards.length; i += columns) {
    const rowCards = cards.slice(i, i + columns);
    rows.push(renderRow(rowCards, i / columns));
  }

  return (
    <View style={[styles.container, { gap: spacing }]}>
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  cardContainer: {
    // Container for individual cards to ensure proper flex distribution
  },
});
