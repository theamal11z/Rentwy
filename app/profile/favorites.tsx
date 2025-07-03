import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';
import { useFavorites } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding each side + 16px gap

type SortType = 'recent' | 'price_low' | 'price_high' | 'alphabetical';

export default function FavoritesScreen() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const favorites = useFavorites();

  const sortFavorites = (items: any[], sortType: SortType) => {
    if (!items) return [];
    
    const sorted = [...items];
    
    switch (sortType) {
      case 'price_low':
        return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
      case 'price_high':
        return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
      default:
        return sorted; // Assuming already sorted by recent
    }
  };

  const renderSortButton = (sort: SortType, label: string) => (
    <TouchableOpacity
      key={sort}
      style={[
        styles.sortButton,
        sortBy === sort && styles.activeSortButton,
      ]}
      onPress={() => setSortBy(sort)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === sort && styles.activeSortButtonText,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <View style={styles.cardImageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="shirt-outline" size={32} color={getColor('neutral.400')} />
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart" size={20} color={getColor('error.500')} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemBrand}>By {item.owner || 'Fashion Store'}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={getColor('warning.500')} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.pricePerDay}</Text>
          <Text style={styles.priceUnit}>/day</Text>
        </View>
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Size M</Text>
          </View>
          <View style={[styles.tag, styles.availableTag]}>
            <Text style={[styles.tagText, styles.availableTagText]}>Available</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const sortedFavorites = sortFavorites(favorites, sortBy);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites?.length || 0} {favorites?.length === 1 ? 'item' : 'items'} saved
        </Text>
      </View>

      {/* Sort Options */}
      {favorites && favorites.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
          contentContainerStyle={styles.sortContent}
        >
          {renderSortButton('recent', 'Recently Added')}
          {renderSortButton('price_low', 'Price: Low to High')}
          {renderSortButton('price_high', 'Price: High to Low')}
          {renderSortButton('alphabetical', 'A-Z')}
        </ScrollView>
      )}

      {/* Favorites Grid */}
      <FlatList
        data={sortedFavorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContainer,
          sortedFavorites.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={getColor('neutral.300')} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Browse items and tap the heart icon to save your favorites here
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.exploreButtonText}>Explore Items</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('neutral.50'),
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: getColor('neutral.600'),
  },
  sortContainer: {
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  sortContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: getColor('neutral.100'),
  },
  activeSortButton: {
    backgroundColor: getColor('primary.500'),
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.600'),
  },
  activeSortButtonText: {
    color: getColor('neutral.0'),
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  favoriteCard: {
    width: CARD_WIDTH,
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    marginBottom: 16,
    ...getShadow('base'),
  },
  cardImageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    backgroundColor: getColor('neutral.100'),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: getColor('neutral.0'),
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('sm'),
  },
  cardContent: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 6,
    lineHeight: 18,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemBrand: {
    fontSize: 12,
    color: getColor('neutral.500'),
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: getColor('neutral.600'),
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: getColor('neutral.900'),
  },
  priceUnit: {
    fontSize: 12,
    color: getColor('neutral.500'),
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: getColor('neutral.100'),
    marginRight: 6,
    marginBottom: 4,
  },
  availableTag: {
    backgroundColor: getColor('success.50'),
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: getColor('neutral.600'),
  },
  availableTagText: {
    color: getColor('success.600'),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: getColor('neutral.700'),
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: getColor('neutral.500'),
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  exploreButton: {
    backgroundColor: getColor('primary.500'),
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.0'),
  },
});
