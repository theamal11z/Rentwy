import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useItems } from '@/lib/mockHooks';

const { width } = Dimensions.get('window');

interface TrendingCategory {
  id: string;
  name: string;
  icon: string;
  trend: string;
  itemCount: number;
  description: string;
  color: string;
}

interface TrendingItem {
  id: string;
  title: string;
  category: string;
  pricePerDay: number;
  rating: number;
  totalBookings: number;
  trend: string;
  trendType: 'rising' | 'hot' | 'new' | 'popular';
}

export default function TrendingScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const items = useItems();

  const trendingCategories: TrendingCategory[] = [
    {
      id: 'dress',
      name: 'Dresses',
      icon: 'shirt-outline',
      trend: '+45%',
      itemCount: 234,
      description: 'Evening & cocktail dresses',
      color: '#E91E63'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: 'watch-outline',
      trend: '+38%',
      itemCount: 189,
      description: 'Jewelry, bags & watches',
      color: '#FF9800'
    },
    {
      id: 'top',
      name: 'Designer Tops',
      icon: 'shirt-outline',
      trend: '+32%',
      itemCount: 156,
      description: 'Luxury & designer pieces',
      color: '#2196F3'
    },
    {
      id: 'outerwear',
      name: 'Outerwear',
      icon: 'shirt-outline',
      trend: '+28%',
      itemCount: 98,
      description: 'Jackets & coats',
      color: '#9C27B0'
    }
  ];

  const trendingItems: TrendingItem[] = [
    {
      id: '1',
      title: 'Elegant Satin Evening Dress',
      category: 'Dresses',
      pricePerDay: 85,
      rating: 4.9,
      totalBookings: 47,
      trend: '+128%',
      trendType: 'rising'
    },
    {
      id: '2',
      title: 'Vintage Designer Leather Jacket',
      category: 'Outerwear',
      pricePerDay: 65,
      rating: 4.8,
      totalBookings: 35,
      trend: '+89%',
      trendType: 'hot'
    },
    {
      id: '3',
      title: 'Luxury Diamond Necklace',
      category: 'Jewelry',
      pricePerDay: 120,
      rating: 5.0,
      totalBookings: 28,
      trend: '+76%',
      trendType: 'new'
    },
    {
      id: '4',
      title: 'Designer Cocktail Dress',
      category: 'Dresses',
      pricePerDay: 95,
      rating: 4.7,
      totalBookings: 52,
      trend: '+45%',
      trendType: 'popular'
    }
  ];

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'rising':
        return 'trending-up';
      case 'hot':
        return 'flame';
      case 'new':
        return 'sparkles';
      case 'popular':
        return 'heart';
      default:
        return 'trending-up';
    }
  };

  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'rising':
        return '#4CAF50';
      case 'hot':
        return '#FF5722';
      case 'new':
        return '#2196F3';
      case 'popular':
        return '#E91E63';
      default:
        return '#4CAF50';
    }
  };

  const renderCategoryCard = ({ item }: { item: TrendingCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(tabs)/explore?category=${item.id}`)}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.trendBadge}>
          <Ionicons name="trending-up" size={12} color="#4CAF50" />
          <Text style={styles.trendText}>{item.trend}</Text>
        </View>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryDescription}>{item.description}</Text>
      <Text style={styles.categoryCount}>{item.itemCount} items available</Text>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }: { item: TrendingItem }) => (
    <TouchableOpacity
      style={styles.trendingItemCard}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={styles.itemImageContainer}>
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={32} color="#CCCCCC" />
        </View>
        <View style={[styles.trendTypeBadge, { backgroundColor: getTrendColor(item.trendType) }]}>
          <Ionicons name={getTrendIcon(item.trendType) as any} size={12} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <View style={styles.itemStats}>
          <Text style={styles.itemPrice}>${item.pricePerDay}/day</Text>
          <View style={styles.itemRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.trendStats}>
          <Text style={styles.bookingCount}>{item.totalBookings} bookings</Text>
          <Text style={[styles.trendPercentage, { color: getTrendColor(item.trendType) }]}>
            {item.trend}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trending Now</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🔥</Text>
        </View>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* Period Filter */}
            <View style={styles.periodFilter}>
              <Text style={styles.filterLabel}>Trending period:</Text>
              <View style={styles.filterButtons}>
                {(['week', 'month', 'all'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.filterButton,
                      selectedPeriod === period && styles.activeFilterButton
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedPeriod === period && styles.activeFilterButtonText
                      ]}
                    >
                      {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary Stats */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>📊 Trending Overview</Text>
              <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={styles.summaryNumber}>+42%</Text>
                  <Text style={styles.summaryLabel}>Overall Growth</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="eye" size={24} color="#2196F3" />
                  <Text style={styles.summaryNumber}>2.3k</Text>
                  <Text style={styles.summaryLabel}>Views Today</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="calendar" size={24} color="#FF9800" />
                  <Text style={styles.summaryNumber}>156</Text>
                  <Text style={styles.summaryLabel}>New Bookings</Text>
                </View>
              </View>
            </View>

            {/* Trending Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Hot Categories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              >
                {trendingCategories.map((item) => (
                  <View key={item.id}>
                    {renderCategoryCard({ item })}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Trending Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Most Trending Items</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.trendingItemsGrid}>
                {trendingItems.map((item, index) => (
                  <View key={item.id} style={styles.trendingItemWrapper}>
                    {renderTrendingItem({ item })}
                  </View>
                ))}
              </View>
            </View>

            {/* Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Trending Insights</Text>
              <View style={styles.insightsContainer}>
                <View style={styles.insightCard}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="time" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Peak Rental Time</Text>
                    <Text style={styles.insightText}>Friday evenings are 40% more popular</Text>
                  </View>
                </View>
                
                <View style={styles.insightCard}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="location" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Popular Location</Text>
                    <Text style={styles.insightText}>Downtown area leads with 45% bookings</Text>
                  </View>
                </View>
                
                <View style={styles.insightCard}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="cash" size={20} color="#FF9800" />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Price Sweet Spot</Text>
                    <Text style={styles.insightText}>$60-$90/day items book most frequently</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 20,
  },
  periodFilter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  categoriesList: {
    paddingTop: 8,
  },
  categoryCard: {
    width: 160,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 11,
    color: '#999999',
  },
  trendingItemsList: {
    paddingTop: 8,
  },
  itemRow: {
    justifyContent: 'space-between',
  },
  trendingItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  trendingItemWrapper: {
    width: (width - 56) / 2,
    marginBottom: 16,
  },
  trendingItemCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    position: 'relative',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 2,
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingCount: {
    fontSize: 11,
    color: '#666666',
  },
  trendPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
});
