import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useItems, useCategories } from '@/lib/hooks/useMockData';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { items, loading: itemsLoading, error: itemsError } = useItems({
    categoryId: selectedCategory || undefined,
    searchQuery: searchQuery || undefined,
    limit: 50
  });
  
  const { categories: dbCategories, loading: categoriesLoading } = useCategories();

  // Update selected category when query parameter changes
  React.useEffect(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Combine "All" category with real categories from database
  const categories = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    ...(dbCategories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || 'shirt-outline'
    })) || [])
  ];

  // Items are already filtered by the backend hook based on searchQuery
  const filteredItems = items || [];

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/item/${item.id}`)}>
      <View style={styles.itemImageContainer}>
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={32} color="#CCCCCC" />
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.price_per_day}/day</Text>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={16} color="#666666" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemSize}>Size {item.size || 'N/A'}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
          <Text style={styles.itemDistance}>{item.location || '2.1 km'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/item/${item.id}`)}>
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
          <Text style={styles.listItemPrice}>${item.price_per_day}/day</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#666666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        (selectedCategory === item.id || (item.id === 'all' && !selectedCategory)) && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={16}
        color={(selectedCategory === item.id || (item.id === 'all' && !selectedCategory)) ? '#FFFFFF' : '#4CAF50'}
      />
      <Text
        style={[
          styles.categoryChipText,
          (selectedCategory === item.id || (item.id === 'all' && !selectedCategory)) && styles.categoryChipTextActive
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter-outline" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="map-outline" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <Text style={styles.resultsCount}>
          {filteredItems.length} items found
        </Text>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={20} color={viewMode === 'grid' ? '#FFFFFF' : '#666666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={20} color={viewMode === 'list' ? '#FFFFFF' : '#666666'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.itemsContainer}>
        {items === undefined ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Be the first to list an item!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
          />
        )}
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    color: '#666666',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
  itemsContainer: {
    flex: 1,
  },
  itemsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 4,
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
});