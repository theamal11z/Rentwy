import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOwnerItems } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

const { width } = Dimensions.get('window');

export default function MyListingsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // TODO: replace with authenticated user's id
  const ownerId = 'u_anon' as any;
  const items = useOwnerItems(ownerId);

  const filters = [
    { id: 'all', label: 'All Items', count: items?.length || 0 },
    { id: 'active', label: 'Active', count: items?.filter(i => i.status === 'active').length || 0 },
    { id: 'rented', label: 'Rented', count: items?.filter(i => i.status === 'rented').length || 0 },
    { id: 'inactive', label: 'Inactive', count: items?.filter(i => i.status === 'inactive').length || 0 },
  ];

  const filteredItems = items?.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.status === selectedFilter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'rented': return '#FF9800';
      case 'inactive': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Available';
      case 'rented': return 'Rented';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const handleMenuPress = (item: any) => {
    Alert.alert(
      'Item Options',
      `What would you like to do with "${item.title}"?`,
      [
        { text: 'View Details', onPress: () => router.push(`/item/${item._id}`) },
        { text: 'Edit Listing', onPress: () => {} },
        { text: 'Mark as Inactive', style: 'destructive', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderFilterTab = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterTab,
        selectedFilter === filter.id && styles.filterTabActive
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterLabel,
        selectedFilter === filter.id && styles.filterLabelActive
      ]}>
        {filter.label}
      </Text>
      <View style={[
        styles.filterBadge,
        selectedFilter === filter.id && styles.filterBadgeActive
      ]}>
        <Text style={[
          styles.filterCount,
          selectedFilter === filter.id && styles.filterCountActive
        ]}>
          {filter.count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listingCard} 
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#CCCCCC" />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'active') }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status || 'active')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => handleMenuPress(item)}
        >
          <Ionicons name="ellipsis-vertical" size={16} color="#666666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemCategory}>{item.category} • Size {item.size}</Text>
        
        <View style={styles.itemStats}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Daily Rate</Text>
            <Text style={styles.priceAmount}>${item.pricePerDay}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.totalReviews})</Text>
          </View>
        </View>
        
        <View style={styles.itemFooter}>
          <Text style={styles.lastUpdated}>Updated 2 days ago</Text>
          <Text style={styles.views}>👁 24 views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="shirt-outline" size={64} color="#CCCCCC" />
      </View>
      <Text style={styles.emptyTitle}>No listings yet</Text>
      <Text style={styles.emptySubtitle}>
        Start sharing your wardrobe and earn money from items you're not using
      </Text>
      <TouchableOpacity 
        style={styles.addFirstItemButton}
        onPress={() => router.push('/(tabs)/add-listing')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addFirstItemText}>Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );

  if (!items) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="hourglass" size={32} color="#CCCCCC" />
        <Text style={styles.loadingText}>Loading your listings...</Text>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/add-listing')}
        >
          <Ionicons name="add" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(renderFilterTab)}
      </ScrollView>

      {/* Listings */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.listContainer, filteredItems.length === 0 && styles.emptyListContainer]}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 48) / 2;

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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginRight: 8,
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
  },
  filterCountActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listingCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
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
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: '#999999',
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: '#999999',
    marginLeft: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#999999',
  },
  views: {
    fontSize: 10,
    color: '#999999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  addFirstItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFirstItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
