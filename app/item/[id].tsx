import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useItem } from '@/lib/mockHooks';
import { theme, getColor, getShadow } from '@/lib/theme';

const { width, height } = Dimensions.get('window');

export default function ItemDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const item = useItem(id as string);

  // Mock images for demonstration
  const images = [
    { id: 1, uri: null },
    { id: 2, uri: null },
    { id: 3, uri: null },
  ];

  const mockOwner = {
    name: 'Emma Wilson',
    rating: 4.9,
    totalReviews: 127,
    responseTime: '< 1 hour',
    memberSince: '2023',
  };

  const mockReviews = [
    {
      id: 1,
      userName: 'Sarah M.',
      rating: 5,
      comment: 'Perfect condition! Exactly as described. Emma was super responsive.',
      date: '2 weeks ago',
    },
    {
      id: 2,
      userName: 'Jessica L.',
      rating: 5,
      comment: 'Beautiful dress, great for my event. Highly recommend!',
      date: '1 month ago',
    },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing ${item?.title} for rent on Rent My Threads!`,
        title: item?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMessage = () => {
    Alert.alert(
      'Contact Owner',
      `Send a message to ${mockOwner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', onPress: () => console.log('Message sent') },
      ]
    );
  };

  const handleViewOwnerProfile = () => {
    router.push(`/profile/UserProfileScreen?userId=owner_${id}&userName=${mockOwner.name}`);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="hourglass" size={32} color="#CCCCCC" />
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (item === null) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF5722" />
          <Text style={styles.errorTitle}>Item Not Found</Text>
          <Text style={styles.errorSubtitle}>This item may have been removed or is no longer available.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setIsFavorited(!isFavorited)}
          >
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#FF4444" : "#333333"} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Floating Header Buttons */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.floatingButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={() => setIsFavorited(!isFavorited)}
          >
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#FF4444" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <View key={image.id} style={styles.imageContainer}>
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={64} color="#CCCCCC" />
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>

          {/* Availability Badge */}
          <View style={styles.availabilityBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.availabilityText}>Available</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Item Info */}
          <View style={styles.itemHeader}>
            <View style={styles.titleSection}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.priceAmount}>${item.pricePerDay}</Text>
              <Text style={styles.priceLabel}>per day</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.totalReviews} reviews)</Text>
            </View>
            <Text style={styles.location}>
              <Ionicons name="location" size={14} color="#666666" />
              {' '}{item.location?.address || 'San Francisco, CA'}
            </Text>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="resize-outline" size={20} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{item.size}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Condition</Text>
                <Text style={styles.infoValue}>{item.condition}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Deposit</Text>
                <Text style={styles.infoValue}>${item.depositAmount}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <TouchableOpacity style={styles.ownerCard} onPress={handleViewOwnerProfile}>
              <View style={styles.ownerAvatar}>
                <Ionicons name="person" size={24} color="#666666" />
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{mockOwner.name}</Text>
                <View style={styles.ownerStats}>
                  <View style={styles.ownerStat}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ownerStatText}>{mockOwner.rating} ({mockOwner.totalReviews})</Text>
                  </View>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.ownerStatText}>Member since {mockOwner.memberSince}</Text>
                </View>
                <Text style={styles.responseTime}>Responds in {mockOwner.responseTime}</Text>
              </View>
              <View style={styles.ownerActions}>
                <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                  <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews ({mockReviews.length})</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {mockReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={12}
                        color="#FFD700"
                      />
                    ))}
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.bottomPrice}>${item.pricePerDay}/day</Text>
          <Text style={styles.bottomPriceLabel}>+ ${item.depositAmount} deposit</Text>
        </View>
        <TouchableOpacity 
          style={styles.rentButton} 
          onPress={() => router.push(`/item/${id}/book`)}
        >
          <Text style={styles.rentButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    height: 400,
    position: 'relative',
  },
  imageContainer: {
    width: width,
    height: 400,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F0F8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'uppercase',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  location: {
    fontSize: 14,
    color: '#666666',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  ownerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  ownerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ownerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerStatText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 2,
  },
  separator: {
    fontSize: 12,
    color: '#666666',
    marginHorizontal: 6,
  },
  responseTime: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsHeader: {
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
  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceInfo: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#666666',
  },
  rentButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
