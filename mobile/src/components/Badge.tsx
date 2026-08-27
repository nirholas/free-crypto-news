/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'small' | 'medium';
}

const CATEGORY_COLORS: Record<string, string> = {
  bitcoin: '#f7931a',
  btc: '#f7931a',
  ethereum: '#627eea',
  eth: '#627eea',
  defi: '#8b5cf6',
  nft: '#ec4899',
  solana: '#14f195',
  sol: '#14f195',
  regulation: '#ef4444',
  breaking: '#ef4444',
  trending: '#f59e0b',
  altcoin: '#3b82f6',
  market: '#22c55e',
  default: '#6b7280',
};

function getCategoryColor(label: string): string {
  const key = label.toLowerCase().replace(/\s+/g, '');
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default;
}

export default function Badge({ label, color, size = 'small' }: BadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const badgeColor = color || getCategoryColor(label);
  const styles = createStyles(isDark, badgeColor, size);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const createStyles = (isDark: boolean, color: string, size: 'small' | 'medium') =>
  StyleSheet.create({
    badge: {
      backgroundColor: `${color}20`,
      borderWidth: 1,
      borderColor: `${color}40`,
      paddingHorizontal: size === 'small' ? 8 : 12,
      paddingVertical: size === 'small' ? 3 : 5,
      borderRadius: size === 'small' ? 4 : 6,
      alignSelf: 'flex-start',
    },
    text: {
      fontSize: size === 'small' ? 10 : 12,
      fontWeight: '700',
      color: color,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
