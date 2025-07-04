import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useItems } from '@/lib/mockHooks';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const items = useItems(id);

  const categories: Record<string, { name: string; icon: string; color: string }> = {
    dress: { name: 'Dresses', icon: 'shirt-outline', color: '#E91E63' },
    top: { name: 'Tops', icon: 'shirt-outline', color: '#2196F3' },
    bottom: { name: 'Bottoms', icon: 'shirt-outline', color: '#9C27B0' },
    outerwear: { name: 'Outerwear', icon: 'shirt-outline', color: '#FF5722' },
    shoes: { name: 'Shoes', icon: 'footsteps-outline', color: '#795548' },
    accessories: { name: 'Accessories', icon: 'watch-outline', color: '#FF9800' },
    jewelry: { name: 'Jewelry', icon: 'diamond-outline', color: '#FFC107' },
    bags: { name: 'Bags', icon: 'bag-outline', color: '#607D8B' },
  };

  const currentCategory = categories[id || ''] || { name: 'Category', icon: 'apps-outline', color: '#4CAF50' };

  const sortedItems = React.useMemo(() => {
    if (!items) return [];
    
    const sorted = [...items];
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
      case 'price_high':
        return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [items, sortBy]);

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.gridItem} 
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <View style={styles.itemImageContainer}>
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={32} color="#CCCCCC" />
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.pricePerDay}/day</Text>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={16} color="#666666" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemSize}>Size {item.size}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.itemDistance}>2.1 km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listItem} 
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <View style={styles.listImageContainer}>
        <View style={styles.listPlaceholderImage}>
          <Ionicons name="image-outline" size={24} color="#CCCCCC" />
        </View>
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.listItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.listItemFooter}>
          <Text style={styles.listItemPrice}>${item.pricePerDay}/day</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#666666" />
      </TouchableOpacity>
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
        <View style={styles.headerContent}>
          <View style={[styles.categoryIcon, { backgroundColor: `${currentCategory.color}20` }]}>
            <Ionicons name={currentCategory.icon as any} size={20} color={currentCategory.color} />
          </View>
          <Text style={styles.headerTitle}>{currentCategory.name}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.sortContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={16} color="#666666" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>
              Sort: {
                sortBy === 'newest' ? 'Newest' :
                sortBy === 'price_low' ? 'Price Low' :
                sortBy === 'price_high' ? 'Price High' :
                'Rating'
              }
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? '#FFFFFF' : '#666666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? '#FFFFFF' : '#666666'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'} found
        </Text>
      </View>

      {/* Items List */}
      {items === undefined ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading {currentCategory.name.toLowerCase()}...</Text>
        </View>
      ) : sortedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: `${currentCategory.color}20` }]}>
            <Ionicons name={currentCategory.icon as any} size={48} color={currentCategory.color} />
          </View>
          <Text style={styles.emptyTitle}>No {currentCategory.name.toLowerCase()} found</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to list {currentCategory.name.toLowerCase()} in this category!
          </Text>
          <TouchableOpacity 
            style={styles.addItemButton}
            onPress={() => router.push('/(tabs)/add-listing')}
          >
            <Text style={styles.addItemButtonText}>List Your Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemsList}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        />
      )}
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  sortText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
  },
  itemsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
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
    height: 140,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
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
  itemSize: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  itemDistance: {
    fontSize: 12,
    color: '#666666',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listImageContainer: {
    marginRight: 12,
  },
  listPlaceholderImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addItemButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addItemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
