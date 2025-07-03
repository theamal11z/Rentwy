import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme, getColor, getShadow } from '@/lib/theme';

export default function UserDemoScreen() {
  const router = useRouter();

  const sampleUsers = [
    {
      id: '1',
      name: 'Emma Wilson',
      location: 'San Francisco, CA',
      rating: 4.8,
      totalListings: 24,
      isVerified: true,
    },
    {
      id: '2',
      name: 'Sarah Chen',
      location: 'New York, NY',
      rating: 4.9,
      totalListings: 18,
      isVerified: true,
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      location: 'Los Angeles, CA',
      rating: 4.6,
      totalListings: 31,
      isVerified: false,
    },
  ];

  const renderUserCard = (user: any) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => router.push(`/profile/UserProfileScreen?userId=${user.id}`)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={24} color={getColor('neutral.500')} />
        </View>
        {user.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={10} color={getColor('neutral.0')} />
          </View>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={getColor('neutral.500')} />
          <Text style={styles.userLocation}>{user.location}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={getColor('warning.500')} />
            <Text style={styles.ratingText}>{user.rating}</Text>
          </View>
          <Text style={styles.listingsCount}>{user.totalListings} items</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={getColor('neutral.400')} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Users</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Featured Users</Text>
        <Text style={styles.sectionSubtitle}>
          Tap on any user to view their profile and build trust
        </Text>
        
        {sampleUsers.map(renderUserCard)}
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
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: getColor('neutral.900'),
    textAlign: 'center',
    marginLeft: -40,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: getColor('neutral.600'),
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...getShadow('sm'),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: getColor('success.500'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: getColor('neutral.0'),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    color: getColor('neutral.600'),
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: getColor('neutral.700'),
    marginLeft: 2,
  },
  listingsCount: {
    fontSize: 12,
    color: getColor('neutral.600'),
  },
});
