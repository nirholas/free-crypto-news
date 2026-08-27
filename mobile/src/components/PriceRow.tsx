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
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketCoin } from '../api/client';

interface PriceRowProps {
  coin: MarketCoin;
  rank?: number;
  onPress?: () => void;
}

export default function PriceRow({ coin, rank, onPress }: PriceRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isPositive = coin.change24h >= 0;
  const styles = createStyles(isDark);

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {rank !== undefined && (
        <Text style={styles.rank}>{rank}</Text>
      )}
      <View style={styles.coinInfo}>
        {coin.image ? (
          <View style={styles.iconContainer}>
            <Text style={styles.iconFallback}>
              {coin.symbol.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={styles.iconContainer}>
            <Text style={styles.iconFallback}>
              {coin.symbol.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.nameContainer}>
          <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {coin.name}
          </Text>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(coin.price)}</Text>
        <Text style={styles.marketCap}>{formatMarketCap(coin.marketCap)}</Text>
      </View>
      <View
        style={[
          styles.changeBadge,
          isPositive ? styles.positive : styles.negative,
        ]}
      >
        <Ionicons
          name={isPositive ? 'caret-up' : 'caret-down'}
          size={10}
          color={isPositive ? '#22c55e' : '#ef4444'}
        />
        <Text
          style={[
            styles.changeText,
            { color: isPositive ? '#22c55e' : '#ef4444' },
          ]}
        >
          {Math.abs(coin.change24h).toFixed(2)}%
        </Text>
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? '#666' : '#999'}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0',
    },
    rank: {
      width: 24,
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#666' : '#999',
      textAlign: 'center',
    },
    coinInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    iconFallback: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#000000',
    },
    nameContainer: {
      flex: 1,
    },
    symbol: {
      fontSize: 15,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#000000',
    },
    name: {
      fontSize: 12,
      color: isDark ? '#888' : '#666',
      marginTop: 2,
    },
    priceContainer: {
      alignItems: 'flex-end',
      marginRight: 12,
    },
    price: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
    },
    marketCap: {
      fontSize: 11,
      color: isDark ? '#888' : '#666',
      marginTop: 2,
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
      minWidth: 72,
      justifyContent: 'center',
      gap: 3,
    },
    positive: {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
    },
    negative: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    changeText: {
      fontSize: 13,
      fontWeight: '600',
    },
    chevron: {
      marginLeft: 4,
    },
  });
