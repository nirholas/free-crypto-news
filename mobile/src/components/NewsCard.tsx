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
  Image,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Article } from '../api/client';
import Badge from './Badge';

interface NewsCardProps {
  article: Article;
  compact?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getCategoryFromArticle(article: Article): string | null {
  if (article.ticker) return article.ticker;
  const title = article.title.toLowerCase();
  if (title.includes('bitcoin') || title.includes('btc')) return 'BTC';
  if (title.includes('ethereum') || title.includes('eth')) return 'ETH';
  if (title.includes('solana') || title.includes('sol')) return 'SOL';
  if (title.includes('defi')) return 'DeFi';
  if (title.includes('nft')) return 'NFT';
  if (title.includes('regulation') || title.includes('sec')) return 'Regulation';
  return null;
}

export default function NewsCard({ article, compact = false }: NewsCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    navigation.navigate('Article', {
      url: article.link,
      title: article.title,
    });
  };

  const styles = createStyles(isDark, compact);
  const category = getCategoryFromArticle(article);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      {article.image && !compact && (
        <Image source={{ uri: article.image }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.sourceRow}>
            <Text style={styles.source}>{article.source}</Text>
            {category && <Badge label={category} />}
          </View>
          <Text style={styles.time}>{article.timeAgo}</Text>
        </View>
        <Text style={styles.title} numberOfLines={compact ? 2 : 3}>
          {article.title}
        </Text>
        {article.description && !compact && (
          <Text style={styles.description} numberOfLines={2}>
            {article.description}
          </Text>
        )}
        {article.ticker && (
          <View style={styles.tickerBadge}>
            <Text style={styles.tickerText}>${article.ticker}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 6,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: 180,
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
    },
    content: {
      padding: compact ? 12 : 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sourceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    source: {
      fontSize: 12,
      fontWeight: '600',
      color: '#f7931a',
      textTransform: 'uppercase',
    },
    time: {
      fontSize: 12,
      color: isDark ? '#888' : '#666',
      marginLeft: 8,
    },
    title: {
      fontSize: compact ? 14 : 16,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#000000',
      lineHeight: compact ? 20 : 22,
    },
    description: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
      marginTop: 8,
      lineHeight: 20,
    },
    tickerBadge: {
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    tickerText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#f7931a',
    },
  });
