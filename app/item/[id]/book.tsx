import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { useMutation, useQuery } from 'convex/react';
import { useItem } from '@/lib/mockHooks';
import { createBooking } from '@/lib/mockData';

export default function BookItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = useItem(id as string);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  if (!item) {
    return null;
  }

  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  const totalPrice = totalDays * item.pricePerDay;

  const handleConfirm = async () => {
    try {
      createBooking({
        itemId: item._id,
        renterId: "u_anon" as any, // TODO replace with auth user id
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupMethod: 'pickup',
      });
      Alert.alert('Request sent', 'Your rental request has been submitted.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateText}>{endDate.toDateString()}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Total ({totalDays} days)</Text>
        <Text style={styles.totalPrice}>${totalPrice}</Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Booking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FAFAFA' },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  dateText: {
    fontSize: 16,
    color: '#4CAF50',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  totalPrice: { fontSize: 20, fontWeight: '600', color: '#4CAF50' },
  confirmButton: {
    marginTop: 'auto',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
