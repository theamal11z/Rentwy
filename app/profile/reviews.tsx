import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';
import { useReviews } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1';

export default function ReviewsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const reviews = useReviews();

  const filterReviews = (reviews: any[], filter: FilterType) => {
    if (!reviews) return [];
    if (filter === 'all') return reviews;
    
    const rating = parseInt(filter);
    return reviews.filter(review => Math.floor(review.rating) === rating);
  };

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = (reviews: any[]) => {
    if (!reviews) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const renderFilterButton = (filter: FilterType, label: string, count?: number) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText,
      ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[
          styles.filterBadge,
          selectedFilter === filter && styles.activeFilterBadge,
        ]}>
          <Text style={[
            styles.filterBadgeText,
            selectedFilter === filter && styles.activeFilterBadgeText,
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStarsRating = (rating: number, size: number = 14, spacing: number = 2) => {
    return (
      <View style={[styles.starsContainer, { gap: spacing }]}>
        {[1, 2, 3, 4, 5].map(i => (
          <Ionicons
            key={i}
            name={i <= rating ? 'star' : 'star-outline'}
            size={size}
            color={getColor('warning.500')}
          />
        ))}
      </View>
    );
  };

  const renderRatingBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <TouchableOpacity
        style={styles.ratingBarContainer}
        onPress={() => setSelectedFilter(stars.toString() as FilterType)}
      >
        <Text style={styles.ratingBarLabel}>{stars}</Text>
        <Ionicons name="star" size={12} color={getColor('warning.500')} />
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </TouchableOpacity>
    );
  };

  const renderReviewItem = ({ item }: { item: any }) => {
    const timeAgo = (date: string) => {
      const now = new Date();
      const reviewDate = new Date(date);
      const diffInMs = now.getTime() - reviewDate.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    };

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={40} color={getColor('neutral.400')} />
            </View>
            <View style={styles.reviewerDetails}>
              <Text style={styles.reviewerName}>{item.reviewerName}</Text>
              <Text style={styles.reviewDate}>{timeAgo(item.date)}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {renderStarsRating(item.rating, 16)}
            <Text style={styles.ratingValue}>{item.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.reviewComment}>{item.comment}</Text>
        
        {/* Optional: Add helpful/unhelpful buttons */}
        <View style={styles.reviewActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="thumbs-up-outline" size={16} color={getColor('neutral.500')} />
            <Text style={styles.actionButtonText}>Helpful</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="flag-outline" size={16} color={getColor('neutral.500')} />
            <Text style={styles.actionButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredReviews = filterReviews(reviews, selectedFilter);
  const averageRating = getAverageRating(reviews || []);
  const ratingDistribution = getRatingDistribution(reviews || []);
  const totalReviews = reviews?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reviews</Text>
        <Text style={styles.headerSubtitle}>
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} received
        </Text>
      </View>

      {/* Rating Summary */}
      {reviews && reviews.length > 0 && (
        <View style={styles.ratingSummary}>
          <View style={styles.averageRatingSection}>
            <Text style={styles.averageRatingText}>{averageRating}</Text>
            {renderStarsRating(parseFloat(averageRating), 20, 4)}
            <Text style={styles.totalReviewsText}>{totalReviews} reviews</Text>
          </View>
          
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map(stars => 
              <View key={stars}>
                {renderRatingBar(
                  stars,
                  ratingDistribution[stars as keyof typeof ratingDistribution],
                  totalReviews
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Filters */}
      {reviews && reviews.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterButton('all', 'All Reviews', totalReviews)}
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution];
            if (count > 0) {
              return renderFilterButton(
                rating.toString() as FilterType,
                `${rating} Stars`,
                count
              );
            }
            return null;
          })}
        </ScrollView>
      )}

      {/* Reviews List */}
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReviewItem}
        contentContainerStyle={[
          styles.listContainer,
          filteredReviews.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={getColor('neutral.300')} />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No reviews yet' : `No ${selectedFilter}-star reviews`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all'
                ? 'Your reviews from renters will appear here'
                : `You don't have any ${selectedFilter}-star reviews at the moment.`
              }
            </Text>
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
  ratingSummary: {
    backgroundColor: getColor('neutral.0'),
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  averageRatingSection: {
    alignItems: 'center',
    marginRight: 24,
    minWidth: 100,
  },
  averageRatingText: {
    fontSize: 36,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviewsText: {
    fontSize: 12,
    color: getColor('neutral.500'),
  },
  ratingDistribution: {
    flex: 1,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: getColor('neutral.600'),
    width: 8,
    marginRight: 4,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: getColor('neutral.200'),
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: getColor('warning.500'),
  },
  ratingBarCount: {
    fontSize: 12,
    color: getColor('neutral.500'),
    width: 20,
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: getColor('neutral.100'),
  },
  activeFilterButton: {
    backgroundColor: getColor('primary.500'),
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.600'),
  },
  activeFilterButtonText: {
    color: getColor('neutral.0'),
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: getColor('neutral.200'),
  },
  activeFilterBadge: {
    backgroundColor: getColor('primary.300'),
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: getColor('neutral.700'),
  },
  activeFilterBadgeText: {
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
  reviewCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...getShadow('base'),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: getColor('neutral.500'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.700'),
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: getColor('neutral.700'),
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.100'),
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
    borderRadius: 6,
    backgroundColor: getColor('neutral.50'),
  },
  actionButtonText: {
    fontSize: 12,
    color: getColor('neutral.600'),
    marginLeft: 4,
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
    paddingHorizontal: 40,
  },
});
