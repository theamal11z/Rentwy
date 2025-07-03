import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    location: 'San Francisco, CA',
    memberSince: 'March 2024',
    rating: 4.8,
    totalReviews: 24,
    totalListings: 12,
    totalRentals: 18,
    isVerified: true,
  };

  const menuItems = [
    {
      id: 'listings',
      title: 'My Listings',
      subtitle: `${user.totalListings} active items`,
      icon: 'shirt-outline',
      color: '#4CAF50',
    },
    {
      id: 'rentals',
      title: 'My Rentals',
      subtitle: `${user.totalRentals} completed rentals`,
      icon: 'bag-outline',
      color: '#2196F3',
    },
    {
      id: 'favorites',
      title: 'Favorites',
      subtitle: 'Saved items',
      icon: 'heart-outline',
      color: '#FF4444',
    },
    {
      id: 'reviews',
      title: 'Reviews',
      subtitle: `${user.totalReviews} reviews received`,
      icon: 'star-outline',
      color: '#FFD700',
    },
    {
      id: 'earnings',
      title: 'Earnings',
      subtitle: 'View your earnings',
      icon: 'wallet-outline',
      color: '#4CAF50',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Account & preferences',
      icon: 'settings-outline',
      color: '#666666',
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help or contact us',
      icon: 'help-circle-outline',
      color: '#666666',
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

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.id)}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.conversationCard} onPress={() => router.push(`/messages/${item.id}`)}>
            <Ionicons name="create-outline" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={40} color="#666666" />
            </View>
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666666" />
              <Text style={styles.userLocation}>{user.location}</Text>
            </View>
            <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(user.rating) ? "star" : "star-outline"}
                  size={12}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.totalListings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive' }
            ])}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  editButton: {
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#999999',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  menuContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginLeft: 8,
  },
});