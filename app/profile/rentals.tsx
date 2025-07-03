import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';
import { useBookingsByRenter } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';

type TabType = 'all' | 'active' | 'completed' | 'cancelled';

export default function MyRentalsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const renterId = 'u_anon' as any; // TODO: replace with auth context later
  const bookings = useBookingsByRenter(renterId);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return { color: getColor('success.500'), bg: getColor('success.50') };
      case 'completed':
        return { color: getColor('info.500'), bg: getColor('info.50') };
      case 'cancelled':
        return { color: getColor('error.500'), bg: getColor('error.50') };
      case 'pending':
        return { color: getColor('warning.500'), bg: getColor('warning.50') };
      default:
        return { color: getColor('neutral.500'), bg: getColor('neutral.50') };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'pending':
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const filterBookings = (bookings: any[], tab: TabType) => {
    if (tab === 'all') return bookings;
    return bookings.filter(booking => {
      const status = booking.status.toLowerCase();
      switch (tab) {
        case 'active':
          return status === 'confirmed' || status === 'active' || status === 'pending';
        case 'completed':
          return status === 'completed';
        case 'cancelled':
          return status === 'cancelled';
        default:
          return true;
      }
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }
    
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const renderTabButton = (tab: TabType, label: string, count?: number) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTab,
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.tabText,
        selectedTab === tab && styles.activeTabText,
      ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[
          styles.tabBadge,
          selectedTab === tab && styles.activeTabBadge,
        ]}>
          <Text style={[
            styles.tabBadgeText,
            selectedTab === tab && styles.activeTabBadgeText,
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRentalItem = ({ item }: { item: any }) => {
    const statusColors = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.rentalCard} 
        onPress={() => router.push(`/item/${item.itemId}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.itemInfo}>
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="shirt-outline" size={24} color={getColor('neutral.400')} />
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                Rental Item #{item._id.slice(-6).toUpperCase()}
              </Text>
              <Text style={styles.rentalId}>Order ID: {item._id.slice(-8)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Ionicons name={statusIcon as any} size={14} color={statusColors.color} />
            <Text style={[styles.statusText, { color: statusColors.color }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={getColor('neutral.500')} />
            <Text style={styles.dateText}>
              {formatDateRange(item.startDate, item.endDate)}
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>${item.totalPrice}</Text>
            <Text style={styles.priceLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color={getColor('primary.500')} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={16} color={getColor('neutral.600')} />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
          
          {item.status.toLowerCase() === 'completed' && (
            <TouchableOpacity style={[styles.actionButton, styles.reviewButton]}>
              <Ionicons name="star-outline" size={16} color={getColor('warning.500')} />
              <Text style={[styles.actionButtonText, { color: getColor('warning.500') }]}>Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredBookings = bookings ? filterBookings(bookings, selectedTab) : [];
  const activeCount = bookings ? filterBookings(bookings, 'active').length : 0;
  const completedCount = bookings ? filterBookings(bookings, 'completed').length : 0;
  const cancelledCount = bookings ? filterBookings(bookings, 'cancelled').length : 0;

  if (!bookings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="shirt-outline" size={48} color={getColor('neutral.300')} />
          <Text style={styles.loadingText}>Loading your rentals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.50')} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rentals</Text>
        <Text style={styles.headerSubtitle}>Track all your rental activities</Text>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {renderTabButton('all', 'All', bookings.length)}
        {renderTabButton('active', 'Active', activeCount)}
        {renderTabButton('completed', 'Completed', completedCount)}
        {renderTabButton('cancelled', 'Cancelled', cancelledCount)}
      </ScrollView>

      {/* Content */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        renderItem={renderRentalItem}
        contentContainerStyle={[
          styles.listContainer,
          filteredBookings.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={64} color={getColor('neutral.300')} />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'all' ? 'No rentals yet' : `No ${selectedTab} rentals`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'all' 
                ? 'Start exploring and rent your first item!' 
                : `You don't have any ${selectedTab} rentals at the moment.`
              }
            </Text>
            {selectedTab === 'all' && (
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.exploreButtonText}>Explore Items</Text>
              </TouchableOpacity>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: getColor('neutral.500'),
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
  tabsContainer: {
    backgroundColor: getColor('neutral.0'),
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: getColor('neutral.100'),
  },
  activeTab: {
    backgroundColor: getColor('primary.500'),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('neutral.600'),
  },
  activeTabText: {
    color: getColor('neutral.0'),
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: getColor('neutral.200'),
  },
  activeTabBadge: {
    backgroundColor: getColor('primary.300'),
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: getColor('neutral.700'),
  },
  activeTabBadgeText: {
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
  rentalCard: {
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...getShadow('base'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  rentalId: {
    fontSize: 12,
    color: getColor('neutral.500'),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: getColor('neutral.100'),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: getColor('neutral.600'),
    marginLeft: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: getColor('neutral.900'),
  },
  priceLabel: {
    fontSize: 12,
    color: getColor('neutral.500'),
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: getColor('neutral.50'),
  },
  reviewButton: {
    backgroundColor: getColor('warning.50'),
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
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
