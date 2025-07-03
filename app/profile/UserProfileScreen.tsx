import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('about');

  // Mock data for demonstration - in real app, fetch based on userId from params
  const userProfile = {
    id: '123',
    name: 'Emma Wilson',
    location: 'San Francisco, CA',
    rating: 4.8,
    totalReviews: 47,
    memberSince: 'March 2023',
    profileImage: null,
    bio: '✨ Fashion enthusiast and sustainable style advocate. Love sharing my curated wardrobe with fellow fashion lovers! Always open to style exchanges and fashion chats 💫',
    isVerified: true,
    responseRate: 95,
    completedRentals: 83,
    averageResponseTime: '2 hours',
    totalListings: 24,
    badges: ['Verified User', 'Quick Responder', 'Sustainable Fashion'],
    joinedDate: '2023-03-15',
    lastActive: '2 hours ago',
  };

  const recentReviews = [
    {
      id: '1',
      reviewerName: 'Sarah M.',
      rating: 5,
      comment: 'Amazing quality dress! Emma was super responsive and the item was exactly as described. Highly recommend!',
      date: '2024-01-15',
      itemName: 'Designer Evening Dress',
    },
    {
      id: '2',
      reviewerName: 'Lisa K.',
      rating: 5,
      comment: 'Perfect transaction! The jacket was in pristine condition and Emma was very accommodating with pickup.',
      date: '2024-01-10',
      itemName: 'Vintage Leather Jacket',
    },
    {
      id: '3',
      reviewerName: 'Michelle R.',
      rating: 4,
      comment: 'Great experience overall. The bag was beautiful and Emma was very professional.',
      date: '2024-01-05',
      itemName: 'Designer Handbag',
    },
  ];

  const userListings = [
    {
      id: '1',
      title: 'Elegant Evening Gown',
      price: 45,
      image: null,
      category: 'Dresses',
      isAvailable: true,
    },
    {
      id: '2',
      title: 'Designer Blazer',
      price: 35,
      image: null,
      category: 'Outerwear',
      isAvailable: false,
    },
    {
      id: '3',
      title: 'Luxury Handbag',
      price: 55,
      image: null,
      category: 'Accessories',
      isAvailable: true,
    },
  ];

  const handleContactUser = () => {
    Alert.alert('Contact User', 'Would you like to send a message to ' + userProfile.name + '?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send Message', onPress: () => console.log('Open chat') },
    ]);
  };

  const handleReportUser = () => {
    Alert.alert('Report User', 'What would you like to report?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Inappropriate Content', onPress: () => console.log('Report inappropriate') },
      { text: 'Suspicious Activity', onPress: () => console.log('Report suspicious') },
    ]);
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.reviewerName}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons
                key={star}
                name={star <= item.rating ? 'star' : 'star-outline'}
                size={12}
                color={getColor('warning.500')}
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.reviewItem}>for "{item.itemName}"</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderListingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.listingCard}>
      <View style={styles.listingImage}>
        <Ionicons name="image-outline" size={24} color={getColor('neutral.400')} />
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.listingCategory}>{item.category}</Text>
        <Text style={styles.listingPrice}>${item.price}/day</Text>
      </View>
      <View style={[styles.availabilityBadge, { backgroundColor: item.isAvailable ? getColor('success.100') : getColor('neutral.200') }]}>
        <Text style={[styles.availabilityText, { color: item.isAvailable ? getColor('success.700') : getColor('neutral.600') }]}>
          {item.isAvailable ? 'Available' : 'Rented'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View>
            {/* Trust Indicators */}
            <View style={styles.trustSection}>
              <Text style={styles.sectionTitle}>Trust & Safety</Text>
              <View style={styles.trustGrid}>
                <View style={styles.trustCard}>
                  <Ionicons name="shield-checkmark" size={24} color={getColor('success.500')} />
                  <Text style={styles.trustLabel}>Verified Identity</Text>
                  <Text style={styles.trustValue}>{userProfile.isVerified ? 'Verified' : 'Pending'}</Text>
                </View>
                <View style={styles.trustCard}>
                  <Ionicons name="time-outline" size={24} color={getColor('info.500')} />
                  <Text style={styles.trustLabel}>Response Time</Text>
                  <Text style={styles.trustValue}>{userProfile.averageResponseTime}</Text>
                </View>
                <View style={styles.trustCard}>
                  <Ionicons name="checkmark-circle" size={24} color={getColor('primary.500')} />
                  <Text style={styles.trustLabel}>Response Rate</Text>
                  <Text style={styles.trustValue}>{userProfile.responseRate}%</Text>
                </View>
                <View style={styles.trustCard}>
                  <Ionicons name="bag-check" size={24} color={getColor('warning.500')} />
                  <Text style={styles.trustLabel}>Completed</Text>
                  <Text style={styles.trustValue}>{userProfile.completedRentals}</Text>
                </View>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgesSection}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <View style={styles.badgesContainer}>
                {userProfile.badges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Activity Info */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <View style={styles.activityItem}>
                <Ionicons name="calendar-outline" size={16} color={getColor('neutral.600')} />
                <Text style={styles.activityText}>Joined {new Date(userProfile.joinedDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.activityItem}>
                <Ionicons name="pulse-outline" size={16} color={getColor('neutral.600')} />
                <Text style={styles.activityText}>Last active {userProfile.lastActive}</Text>
              </View>
              <View style={styles.activityItem}>
                <Ionicons name="shirt-outline" size={16} color={getColor('neutral.600')} />
                <Text style={styles.activityText}>{userProfile.totalListings} items listed</Text>
              </View>
            </View>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews ({userProfile.totalReviews})</Text>
            <FlatList
              data={recentReviews}
              renderItem={renderReviewItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      case 'listings':
        return (
          <View style={styles.listingsSection}>
            <Text style={styles.sectionTitle}>Listings ({userListings.length})</Text>
            <FlatList
              data={userListings}
              renderItem={renderListingItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.moreButton} onPress={handleReportUser}>
          <Ionicons name="ellipsis-vertical" size={20} color={getColor('neutral.600')} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {userProfile.profileImage ? (
                  <Image source={{ uri: userProfile.profileImage }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person-outline" size={40} color={getColor('neutral.500')} />
                )}
              </View>
              {userProfile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color={getColor('neutral.0')} />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={getColor('neutral.500')} />
                <Text style={styles.userLocation}>{userProfile.location}</Text>
              </View>
              <Text style={styles.memberSince}>Member since {userProfile.memberSince}</Text>
            </View>
          </View>

          {/* Rating Display */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingDisplay}>
              <Ionicons name="star" size={20} color={getColor('warning.500')} />
              <Text style={styles.ratingText}>{userProfile.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>({userProfile.totalReviews} reviews)</Text>
          </View>

          {/* Bio */}
          {userProfile.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactUser}>
              <Ionicons name="chatbubble-outline" size={18} color={getColor('neutral.0')} />
              <Text style={styles.contactButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followButton}>
              <Ionicons name="heart-outline" size={18} color={getColor('primary.500')} />
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[{ key: 'about', label: 'About' }, { key: 'reviews', label: 'Reviews' }, { key: 'listings', label: 'Listings' }].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('neutral.50'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: getColor('neutral.0'),
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: getColor('success.500'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: getColor('neutral.0'),
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: getColor('neutral.600'),
    marginLeft: 4,
  },
  memberSince: {
    fontSize: 12,
    color: getColor('neutral.500'),
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: getColor('neutral.600'),
  },
  bio: {
    fontSize: 14,
    color: getColor('neutral.700'),
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: getColor('primary.500'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.0'),
    marginLeft: 8,
  },
  followButton: {
    flex: 1,
    backgroundColor: getColor('neutral.0'),
    borderWidth: 1,
    borderColor: getColor('primary.500'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('primary.500'),
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: getColor('neutral.0'),
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    ...getShadow('sm'),
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: getColor('primary.500'),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.600'),
  },
  activeTabText: {
    color: getColor('neutral.0'),
  },
  tabContent: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 16,
  },
  trustSection: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...getShadow('sm'),
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trustCard: {
    width: '48%',
    backgroundColor: getColor('neutral.50'),
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  trustLabel: {
    fontSize: 12,
    color: getColor('neutral.600'),
    marginTop: 8,
    textAlign: 'center',
  },
  trustValue: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginTop: 4,
    textAlign: 'center',
  },
  badgesSection: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...getShadow('sm'),
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: getColor('primary.100'),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: getColor('primary.700'),
  },
  activitySection: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    color: getColor('neutral.700'),
    marginLeft: 8,
  },
  reviewsSection: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  reviewCard: {
    backgroundColor: getColor('neutral.50'),
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
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: getColor('neutral.500'),
  },
  reviewItem: {
    fontSize: 12,
    color: getColor('neutral.600'),
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: getColor('neutral.700'),
    lineHeight: 20,
  },
  listingsSection: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: getColor('neutral.50'),
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: getColor('neutral.200'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  listingCategory: {
    fontSize: 12,
    color: getColor('neutral.600'),
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('primary.500'),
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

