import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [scrollY] = useState(new Animated.Value(0));
  
  // Mock user data with enhanced profile info
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    location: 'San Francisco, CA',
    memberSince: 'March 2024',
    rating: 4.8,
    totalReviews: 24,
    totalListings: 12,
    totalRentals: 18,
    totalEarnings: 2450,
    totalFavorites: 8,
    completionRate: 98,
    responseRate: 95,
    isVerified: true,
    profileImage: null, // Will use placeholder
    bio: '👕 Fashion enthusiast sharing my wardrobe! Love sustainable fashion and helping others look their best.',
  };

  const quickActions = [
    {
      id: 'rentals',
      title: 'My Rentals',
      subtitle: `${user.totalRentals} rentals`,
      icon: 'bag-outline',
      color: getColor('info.500'),
      bgColor: getColor('info.50'),
    },
    {
      id: 'favorites',
      title: 'Favorites',
      subtitle: `${user.totalFavorites} saved`,
      icon: 'heart-outline',
      color: '#FF6B6B',
      bgColor: '#FFF0F0',
    },
    {
      id: 'reviews',
      title: 'Reviews',
      subtitle: `${user.totalReviews} reviews`,
      icon: 'star-outline',
      color: '#FFD93D',
      bgColor: '#FFF9E6',
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      icon: 'help-circle-outline',
      color: getColor('neutral.600'),
      bgColor: getColor('neutral.100'),
    },
  ];

  const profileStats = [
    { label: 'Rating', value: user.rating.toString(), icon: 'star', color: '#FFD93D' },
    { label: 'Reviews', value: user.totalReviews.toString(), icon: 'chatbubble-outline', color: getColor('info.500') },
    { label: 'Response Rate', value: `${user.responseRate}%`, icon: 'time-outline', color: getColor('success.500') },
    { label: 'Completion', value: `${user.completionRate}%`, icon: 'checkmark-circle-outline', color: getColor('success.500') },
  ];

  const menuItems = [
    {
      id: 'listings',
      title: 'My Listings',
      subtitle: `Manage your ${user.totalListings} items`,
      icon: 'shirt-outline',
      color: getColor('primary.500'),
      hasNotification: false,
    },
    {
      id: 'earnings',
      title: 'Earnings',
      subtitle: `$${user.totalEarnings.toLocaleString()} total earned`,
      icon: 'wallet-outline',
      color: getColor('success.500'),
      hasNotification: true,
    },
    {
      id: 'settings',
      title: 'Account Settings',
      subtitle: 'Privacy, notifications, and more',
      icon: 'settings-outline',
      color: getColor('neutral.600'),
      hasNotification: false,
    },
  ];

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'listings':
        router.push('/profile/listings');
        break;
      case 'rentals':
        router.push('/profile/rentals');
        break;
      case 'favorites':
        router.push('/profile/favorites');
        break;
      case 'reviews':
        router.push('/profile/reviews');
        break;
      case 'earnings':
        router.push('/profile/earnings');
        break;
      case 'settings':
        router.push('/profile/settings');
        break;
      case 'help':
        router.push('/profile/help');
        break;
      default:
        break;
    }
  };

  const renderQuickAction = (item: any, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.quickActionCard, { backgroundColor: item.bgColor }]}
      onPress={() => handleMenuPress(item.id)}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
      <Text style={[styles.quickActionSubtitle, { color: item.color }]}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.id)}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
        {item.hasNotification && <View style={styles.notificationDot} />}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={getColor('neutral.400')} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
          onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create-outline" size={20} color={getColor('neutral.700')} />
          </TouchableOpacity>
        </View>

        {/* Enhanced Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person-outline" size={32} color={getColor('neutral.500')} />
                )}
              </View>
              {user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color={getColor('neutral.0')} />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={12} color={getColor('neutral.500')} />
                <Text style={styles.userLocation}>{user.location}</Text>
              </View>
              <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
            </View>
          </View>
          
          {/* Bio */}
          {user.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}
        </View>

        {/* Enhanced Stats Grid */}
        <View style={styles.statsGrid}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Main Menu */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.menuContainer}>
            {menuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => {
                // Add logout logic here
                console.log('User logged out');
              }}
            ])}
          >
            <Ionicons name="log-out-outline" size={18} color={getColor('error.500')} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: getColor('neutral.0'),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: getColor('neutral.900'),
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: getColor('neutral.0'),
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    ...getShadow('base'),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
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
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  locationContainer: {
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
  bioContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.100'),
  },
  bioText: {
    fontSize: 14,
    color: getColor('neutral.700'),
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...getShadow('sm'),
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: getColor('neutral.600'),
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...getShadow('sm'),
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...getShadow('sm'),
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: getColor('error.500'),
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: getColor('neutral.600'),
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: getColor('error.200'),
    ...getShadow('sm'),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('error.500'),
    marginLeft: 8,
  },
});
