import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useItem } from '@/lib/mockHooks';
import { theme, getColor, getShadow } from '@/lib/theme';

const { width } = Dimensions.get('window');

export default function BookItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const item = useItem(id as string);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  const subtotal = totalDays * item.pricePerDay;
  const serviceFee = Math.round(subtotal * 0.1); // 10% service fee
  const deliveryFee = pickupMethod === 'delivery' ? 15 : 0;
  const totalPrice = subtotal + serviceFee + deliveryFee + item.depositAmount;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleConfirm = async () => {
    if (startDate >= endDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Booking Request Sent! 🎉',
        `Your rental request has been sent to the owner. You'll receive a notification once they respond.`,
        [
          {
            text: 'View Request',
            onPress: () => router.push('/(tabs)/messages'),
          },
          {
            text: 'Done',
            onPress: () => router.push('/(tabs)/'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (type: 'start' | 'end', date?: Date) => {
    if (!date) return;
    
    if (type === 'start') {
      setStartDate(date);
      if (date >= endDate) {
        setEndDate(new Date(date.getTime() + 86400000)); // Add 1 day
      }
    } else {
      setEndDate(date);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Item</Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Summary */}
        <View style={styles.itemSummary}>
          <View style={styles.itemImage}>
            <Ionicons name="image-outline" size={32} color="#CCCCCC" />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.itemPrice}>${item.pricePerDay}/day</Text>
            <View style={styles.itemMeta}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.itemRating}>{item.rating}</Text>
              <Text style={styles.itemLocation}>• San Francisco, CA</Text>
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 3</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <View style={styles.dateSelection}>
            <TouchableOpacity 
              style={styles.dateCard}
              onPress={() => setShowStartPicker(true)}
            >
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                <Text style={styles.dateLabel}>Start Date</Text>
              </View>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            
            <View style={styles.dateSeparator}>
              <Ionicons name="arrow-forward" size={20} color="#CCCCCC" />
            </View>
            
            <TouchableOpacity 
              style={styles.dateCard}
              onPress={() => setShowEndPicker(true)}
            >
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                <Text style={styles.dateLabel}>End Date</Text>
              </View>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.durationInfo}>
            <Text style={styles.durationText}>{totalDays} day{totalDays > 1 ? 's' : ''} rental</Text>
          </View>
        </View>

        {/* Pickup Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Method</Text>
          
          <View style={styles.pickupOptions}>
            <TouchableOpacity
              style={[styles.pickupOption, pickupMethod === 'pickup' && styles.pickupOptionSelected]}
              onPress={() => setPickupMethod('pickup')}
            >
              <View style={styles.pickupIcon}>
                <Ionicons name="car-outline" size={24} color={pickupMethod === 'pickup' ? '#4CAF50' : '#666666'} />
              </View>
              <View style={styles.pickupDetails}>
                <Text style={[styles.pickupTitle, pickupMethod === 'pickup' && styles.pickupTitleSelected]}>
                  Self Pickup
                </Text>
                <Text style={styles.pickupSubtitle}>Meet at agreed location</Text>
                <Text style={styles.pickupPrice}>Free</Text>
              </View>
              <View style={[styles.radioButton, pickupMethod === 'pickup' && styles.radioButtonSelected]}>
                {pickupMethod === 'pickup' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.pickupOption, pickupMethod === 'delivery' && styles.pickupOptionSelected]}
              onPress={() => setPickupMethod('delivery')}
            >
              <View style={styles.pickupIcon}>
                <Ionicons name="bicycle-outline" size={24} color={pickupMethod === 'delivery' ? '#4CAF50' : '#666666'} />
              </View>
              <View style={styles.pickupDetails}>
                <Text style={[styles.pickupTitle, pickupMethod === 'delivery' && styles.pickupTitleSelected]}>
                  Delivery
                </Text>
                <Text style={styles.pickupSubtitle}>Delivered to your address</Text>
                <Text style={styles.pickupPrice}>+$15</Text>
              </View>
              <View style={[styles.radioButton, pickupMethod === 'delivery' && styles.radioButtonSelected]}>
                {pickupMethod === 'delivery' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>${item.pricePerDay} × {totalDays} days</Text>
              <Text style={styles.priceValue}>${subtotal}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>${serviceFee}</Text>
            </View>
            
            {deliveryFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery fee</Text>
                <Text style={styles.priceValue}>${deliveryFee}</Text>
              </View>
            )}
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Security deposit</Text>
              <Text style={styles.priceValue}>${item.depositAmount}</Text>
            </View>
            
            <View style={styles.priceDivider} />
            
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${totalPrice}</Text>
            </View>
            
            <Text style={styles.depositNote}>
              * Security deposit will be refunded after return
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <View style={styles.termsContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666666" />
            <Text style={styles.termsText}>
              By booking, you agree to our rental terms and cancellation policy.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) handleDateChange('start', date);
          }}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date(startDate.getTime() + 86400000)}
          onChange={(_, date) => {
            setShowEndPicker(false);
            if (date) handleDateChange('end', date);
          }}
        />
      )}

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalInfo}>
          <Text style={styles.bottomTotal}>${totalPrice}</Text>
          <Text style={styles.bottomSubtext}>Total for {totalDays} day{totalDays > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, isLoading && styles.bookButtonDisabled]} 
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingButtonContent}>
              <Text style={styles.bookButtonText}>Sending...</Text>
              <View style={styles.loadingDot} />
            </View>
          ) : (
            <Text style={styles.bookButtonText}>Send Request</Text>
          )}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  itemSummary: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRating: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 2,
    marginRight: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  dateSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  dateSeparator: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationInfo: {
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pickupOptions: {
    gap: 12,
  },
  pickupOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickupOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  pickupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickupDetails: {
    flex: 1,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  pickupTitleSelected: {
    color: '#4CAF50',
  },
  pickupSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  pickupPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  priceBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  depositNote: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
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
  totalInfo: {
    flex: 1,
  },
  bottomTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  bookButton: {
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
  bookButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0.1,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    opacity: 0.8,
  },
});
