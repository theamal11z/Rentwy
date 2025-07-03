import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEarnings } from '@/lib/mockHooks';
import { theme, getColor, getShadow } from '@/lib/theme';

const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const router = useRouter();
  const earnings = useEarnings();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock transaction data
  const transactions = [
    {
      id: '1',
      type: 'rental',
      itemName: 'Designer Black Dress',
      amount: 45.00,
      date: '2024-01-15',
      status: 'completed',
      renterName: 'Sarah M.',
    },
    {
      id: '2',
      type: 'rental',
      itemName: 'Vintage Leather Jacket',
      amount: 35.00,
      date: '2024-01-12',
      status: 'completed',
      renterName: 'Mike R.',
    },
    {
      id: '3',
      type: 'rental',
      itemName: 'Evening Gown',
      amount: 60.00,
      date: '2024-01-10',
      status: 'pending',
      renterName: 'Emma L.',
    },
    {
      id: '4',
      type: 'rental',
      itemName: 'Casual Summer Dress',
      amount: 25.00,
      date: '2024-01-08',
      status: 'completed',
      renterName: 'Lisa K.',
    },
  ];

  const periodOptions = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  if (!earnings) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="hourglass" size={32} color="#CCCCCC" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </SafeAreaView>
    );
  }

  const renderPeriodOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.periodTab,
        selectedPeriod === option.id && styles.periodTabActive
      ]}
      onPress={() => setSelectedPeriod(option.id)}
    >
      <Text style={[
        styles.periodLabel,
        selectedPeriod === option.id && styles.periodLabelActive
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: item.status === 'completed' ? '#E8F5E8' : '#FFF3E0' }]}>
          <Ionicons 
            name={item.status === 'completed' ? 'checkmark-circle' : 'time'} 
            size={20} 
            color={item.status === 'completed' ? '#4CAF50' : '#FF9800'} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1}>{item.itemName}</Text>
          <Text style={styles.transactionSubtitle}>Rented by {item.renterName}</Text>
          <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>+${item.amount.toFixed(2)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Earnings Card */}
        <View style={styles.mainCard}>
          <View style={styles.earningsHeader}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.totalEarnings}>${earnings.total.toFixed(2)}</Text>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
          </View>
          
          <View style={styles.earningsGrid}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsValue}>${earnings.thisMonth.toFixed(2)}</Text>
              <Text style={styles.earningsSubLabel}>This Month</Text>
              <View style={styles.changeIndicator}>
                <Ionicons name="trending-up" size={12} color="#4CAF50" />
                <Text style={styles.changeText}>+12%</Text>
              </View>
            </View>
            
            <View style={styles.earningsDivider} />
            
            <View style={styles.earningsItem}>
              <Text style={styles.earningsValue}>${earnings.pending.toFixed(2)}</Text>
              <Text style={styles.earningsSubLabel}>Pending</Text>
              <Text style={styles.pendingNote}>2 payments</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Total Rentals</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="repeat" size={24} color="#2196F3" />
            <Text style={styles.statValue}>65%</Text>
            <Text style={styles.statLabel}>Return Rate</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodTabs}
          >
            {periodOptions.map(renderPeriodOption)}
          </ScrollView>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Payout Button */}
        <View style={styles.payoutContainer}>
          <TouchableOpacity style={styles.payoutButton}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
          <Text style={styles.payoutNote}>Minimum payout amount: $20.00</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  earningsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  walletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalEarnings: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#666666',
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  earningsItem: {
    alignItems: 'center',
    flex: 1,
  },
  earningsDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  earningsSubLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 2,
  },
  pendingNote: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  periodContainer: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  periodTabs: {
    paddingHorizontal: 20,
  },
  periodTab: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  periodTabActive: {
    backgroundColor: '#4CAF50',
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  periodLabelActive: {
    color: '#FFFFFF',
  },
  transactionsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 10,
    color: '#999999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  payoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 8,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  payoutNote: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});
