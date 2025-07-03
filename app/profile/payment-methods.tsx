import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getShadow } from '@/lib/theme';

interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
}

interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal' | 'stripe';
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'cards' | 'payouts'>('cards');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);

  // Mock data
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      holderName: 'John Doe',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2026,
      holderName: 'John Doe',
      isDefault: false,
    },
  ]);

  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([
    {
      id: '1',
      type: 'bank',
      accountName: 'John Doe',
      accountNumber: '****1234',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      accountName: 'john.doe@email.com',
      accountNumber: 'j***@email.com',
      isDefault: false,
    },
  ]);

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const getPayoutIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return 'business-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'stripe':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  const handleSetDefaultCard = (cardId: string) => {
    setPaymentCards(prev => 
      prev.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
  };

  const handleSetDefaultPayout = (payoutId: string) => {
    setPayoutMethods(prev => 
      prev.map(payout => ({
        ...payout,
        isDefault: payout.id === payoutId
      }))
    );
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentCards(prev => prev.filter(card => card.id !== cardId));
          },
        },
      ]
    );
  };

  const handleDeletePayout = (payoutId: string) => {
    Alert.alert(
      'Delete Payout Method',
      'Are you sure you want to remove this payout method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPayoutMethods(prev => prev.filter(payout => payout.id !== payoutId));
          },
        },
      ]
    );
  };

  const renderPaymentCard = (card: PaymentCard) => (
    <View key={card.id} style={styles.cardItem}>
      <View style={styles.cardLeft}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardEmoji}>{getCardIcon(card.type)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
            {card.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
          <Text style={styles.cardExpiry}>
            Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
          </Text>
          <Text style={styles.cardHolder}>{card.holderName}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        {!card.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefaultCard(card.id)}
          >
            <Ionicons name="star-outline" size={20} color={getColor('primary.500')} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCard(card.id)}
        >
          <Ionicons name="trash-outline" size={20} color={getColor('error.500')} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPayoutMethod = (payout: PayoutMethod) => (
    <View key={payout.id} style={styles.cardItem}>
      <View style={styles.cardLeft}>
        <View style={styles.cardIcon}>
          <Ionicons 
            name={getPayoutIcon(payout.type) as any} 
            size={24} 
            color={getColor('primary.500')} 
          />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardType}>{payout.type.toUpperCase()}</Text>
            {payout.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardNumber}>{payout.accountNumber}</Text>
          <Text style={styles.cardHolder}>{payout.accountName}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        {!payout.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefaultPayout(payout.id)}
          >
            <Ionicons name="star-outline" size={20} color={getColor('primary.500')} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePayout(payout.id)}
        >
          <Ionicons name="trash-outline" size={20} color={getColor('error.500')} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const AddCardModal = () => (
    <Modal
      visible={showAddCardModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Payment Card</Text>
          <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.textInput}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="John Doe"
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color={getColor('success.500')} />
            <Text style={styles.securityText}>
              Your payment information is encrypted and securely stored
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const AddPayoutModal = () => (
    <Modal
      visible={showAddPayoutModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddPayoutModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Payout Method</Text>
          <TouchableOpacity onPress={() => setShowAddPayoutModal(false)}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.payoutTypes}>
            <TouchableOpacity style={styles.payoutType}>
              <Ionicons name="business-outline" size={24} color={getColor('primary.500')} />
              <Text style={styles.payoutTypeText}>Bank Account</Text>
              <Ionicons name="chevron-forward" size={20} color={getColor('neutral.400')} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.payoutType}>
              <Ionicons name="logo-paypal" size={24} color={getColor('primary.500')} />
              <Text style={styles.payoutTypeText}>PayPal</Text>
              <Ionicons name="chevron-forward" size={20} color={getColor('neutral.400')} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color={getColor('success.500')} />
            <Text style={styles.securityText}>
              All payout methods are verified and secured with bank-level encryption
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={getColor('neutral.0')} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('neutral.900')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cards' && styles.activeTab]}
          onPress={() => setSelectedTab('cards')}
        >
          <Ionicons 
            name="card-outline" 
            size={20} 
            color={selectedTab === 'cards' ? getColor('primary.500') : getColor('neutral.500')} 
          />
          <Text style={[
            styles.tabText, 
            selectedTab === 'cards' && styles.activeTabText
          ]}>
            Payment Cards
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'payouts' && styles.activeTab]}
          onPress={() => setSelectedTab('payouts')}
        >
          <Ionicons 
            name="wallet-outline" 
            size={20} 
            color={selectedTab === 'payouts' ? getColor('primary.500') : getColor('neutral.500')} 
          />
          <Text style={[
            styles.tabText, 
            selectedTab === 'payouts' && styles.activeTabText
          ]}>
            Payout Methods
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'cards' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Cards</Text>
              <Text style={styles.sectionSubtitle}>
                Manage cards for booking rentals
              </Text>
            </View>
            
            {paymentCards.map(renderPaymentCard)}
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddCardModal(true)}
            >
              <Ionicons name="add" size={24} color={getColor('primary.500')} />
              <Text style={styles.addButtonText}>Add New Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payout Methods</Text>
              <Text style={styles.sectionSubtitle}>
                How you receive payments from rentals
              </Text>
            </View>
            
            {payoutMethods.map(renderPayoutMethod)}
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddPayoutModal(true)}
            >
              <Ionicons name="add" size={24} color={getColor('primary.500')} />
              <Text style={styles.addButtonText}>Add Payout Method</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Information */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color={getColor('success.500')} />
            <Text style={styles.securityTitle}>Secure & Protected</Text>
          </View>
          <Text style={styles.securityDescription}>
            All payment information is encrypted with bank-level security. We never store your full card details on our servers.
          </Text>
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
              <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
              <Text style={styles.securityFeatureText}>PCI DSS compliant</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="checkmark-circle" size={16} color={getColor('success.500')} />
              <Text style={styles.securityFeatureText}>Fraud monitoring</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <AddCardModal />
      <AddPayoutModal />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: getColor('neutral.0'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: getColor('primary.500'),
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: getColor('neutral.500'),
  },
  activeTabText: {
    color: getColor('primary.500'),
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: getColor('neutral.900'),
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: getColor('neutral.500'),
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...getShadow('sm'),
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: getColor('primary.500'),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: getColor('neutral.0'),
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: getColor('neutral.900'),
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 14,
    color: getColor('neutral.500'),
    marginBottom: 2,
  },
  cardHolder: {
    fontSize: 14,
    color: getColor('neutral.500'),
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: getColor('neutral.100'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: getColor('primary.500'),
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('primary.500'),
    marginLeft: 8,
  },
  securitySection: {
    margin: 20,
    backgroundColor: getColor('neutral.0'),
    borderRadius: 16,
    padding: 20,
    ...getShadow('sm'),
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: getColor('neutral.900'),
    marginLeft: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: getColor('neutral.600'),
    lineHeight: 20,
    marginBottom: 16,
  },
  securityFeatures: {
    gap: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityFeatureText: {
    fontSize: 14,
    color: getColor('neutral.600'),
    marginLeft: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: getColor('neutral.0'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: getColor('neutral.200'),
  },
  modalCancel: {
    fontSize: 16,
    color: getColor('neutral.500'),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: getColor('neutral.900'),
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: getColor('primary.500'),
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: getColor('neutral.900'),
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: getColor('neutral.300'),
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: getColor('neutral.900'),
    backgroundColor: getColor('neutral.0'),
  },
  inputRow: {
    flexDirection: 'row',
  },
  payoutTypes: {
    gap: 12,
    marginBottom: 24,
  },
  payoutType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('neutral.50'),
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: getColor('neutral.200'),
  },
  payoutTypeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: getColor('neutral.900'),
    marginLeft: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: getColor('success.50'),
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: getColor('success.600'),
    marginLeft: 8,
    lineHeight: 20,
  },
});
