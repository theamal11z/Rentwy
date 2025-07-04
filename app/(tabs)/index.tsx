import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
  ImageBackground,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFeaturedItems } from '@/lib/mockHooks';
import { theme, getColor, getShadow } from '@/lib/theme';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const featuredItems = useFeaturedItems();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentUser] = useState({ name: 'Sarah', profileComplete: false });

  const categories = [
    { id: 'dress', name: 'Dresses', icon: 'shirt-outline', color: '#E91E63' },
    { id: 'top', name: 'Tops', icon: 'shirt-outline', color: '#2196F3' },
    { id: 'accessories', name: 'Accessories', icon: 'watch-outline', color: '#FF9800' },
    { id: 'shoes', name: 'Shoes', icon: 'footsteps-outline', color: '#9C27B0' },
    { id: 'bags', name: 'Bags', icon: 'bag-outline', color: '#795548' },
    { id: 'jewelry', name: 'Jewelry', icon: 'diamond-outline', color: '#FFC107' },
  ];

  const trendingItems = [
    { id: '1', title: 'Most Rented', subtitle: 'Designer dress', trend: '+45%' },
    { id: '2', title: 'Rising Star', subtitle: 'Vintage jacket', trend: '+128%' },
    { id: '3', title: 'Popular', subtitle: 'Evening wear', trend: '+32%' },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <View style={styles.featuredImageContainer}>
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={40} color="#CCCCCC" />
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.pricePerDay}/day</Text>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.featuredLocation} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color="#666666" />
          {' '}{item.location?.address ?? 'Unknown'}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.totalReviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => router.push(`/(tabs)/explore?category=${item.id}`)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={24} color="#4CAF50" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.subtitle}>Find your perfect outfit</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#333333" />
            {/* Add notification badge if there are unread notifications */}
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search-outline" size={20} color="#666666" />
          <Text style={styles.searchPlaceholder}>Search for clothes, accessories...</Text>
          <View style={styles.searchFilter}>
            <Ionicons name="options-outline" size={18} color="#4CAF50" />
          </View>
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Share Your Style,{"\n"}Earn Money</Text>
                <Text style={styles.heroSubtitle}>
                  List your unused clothes and start earning from your wardrobe today
                </Text>
                <TouchableOpacity 
                  style={styles.heroButton}
                  onPress={() => router.push('/(tabs)/add-listing')}
                >
                  <Text style={styles.heroButtonText}>Start Listing</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.heroIllustration}>
                <View style={styles.illustrationCircle}>
                  <Ionicons name="shirt" size={32} color="#4CAF50" />
                </View>
                <View style={styles.illustrationAccent}>
                  <Text style={styles.accentText}>💰</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.trendingBadge}>
              <Text style={styles.trendingText}>🔥 Hot</Text>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
          >
            {trendingItems.map((trend) => (
              <TouchableOpacity 
                key={trend.id} 
                style={styles.trendingCard}
                onPress={() => router.push('/trending')}
              >
                <View style={styles.trendingIcon}>
                  <Ionicons name="trending-up" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.trendingTitle}>{trend.title}</Text>
                <Text style={styles.trendingSubtitle}>{trend.subtitle}</Text>
                <View style={styles.trendingStats}>
                  <Text style={styles.trendingPercent}>{trend.trend}</Text>
                  <Ionicons name="arrow-up" size={12} color="#4CAF50" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {featuredItems.length === 0 /* no need loading since sync */ ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading featured items...</Text>
            </View>
          ) : featuredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="shirt-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to list an item!</Text>
            </View>
          ) : (
            <FlatList
              data={featuredItems}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/add-listing')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.actionTitle}>List an Item</Text>
              <Text style={styles.actionSubtitle}>Start earning from your wardrobe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="location-outline" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.actionTitle}>Browse Nearby</Text>
              <Text style={styles.actionSubtitle}>Find items in your area</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  categoriesList: {
    paddingTop: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  featuredList: {
    paddingTop: 16,
  },
  featuredCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredInfo: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  featuredLocation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchFilter: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  heroCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  heroText: {
    flex: 1,
    paddingRight: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  heroIllustration: {
    position: 'relative',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationAccent: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  accentText: {
    fontSize: 18,
  },
  trendingBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trendingList: {
    paddingTop: 16,
  },
  trendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  trendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  trendingSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    marginRight: 2,
  },
});
