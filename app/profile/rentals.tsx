import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import { useQuery } from 'convex/react';
import { useBookingsByRenter } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';

export default function MyRentalsScreen() {
  const router = useRouter();
  const renterId = 'u_anon' as any; // TODO auth
  const bookings = useBookingsByRenter(renterId);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/item/${item.itemId}`)}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>Booking #{item._id.slice(-5)}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.subtitle}>{new Date(item.startDate).toDateString()} → {new Date(item.endDate).toDateString()}</Text>
      <Text style={styles.price}>${item.totalPrice}</Text>
    </TouchableOpacity>
  );

  if (!bookings) return <SafeAreaView style={styles.center}><Text>Loading…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={b => b._id}
        renderItem={renderItem}
        contentContainerStyle={bookings.length === 0 && { flex:1,justifyContent:'center', alignItems:'center' }}
        ListEmptyComponent={<Text style={styles.empty}>No rentals yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 16 },
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  status: { fontSize: 14, color: '#4CAF50', textTransform: 'capitalize' },
  subtitle: { marginTop: 4, color: '#666' },
  price: { marginTop: 8, fontWeight: '600', color: '#4CAF50' },
  empty:{ color:'#666'}
});
