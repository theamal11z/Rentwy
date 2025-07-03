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
import { useOwnerItems } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';

export default function MyListingsScreen() {
  const router = useRouter();

  // TODO: replace with authenticated user's id
  const ownerId = 'u_anon' as any;
  const items = useOwnerItems(ownerId);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/item/${item._id}`)}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={40} color="#CCC" />
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>${item.pricePerDay}/day</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
        <Text style={styles.metaText}> • {item.totalReviews} reviews</Text>
      </View>
    </TouchableOpacity>
  );

  if (!items) {
    return (
      <SafeAreaView style={styles.center}><Text>Loading…</Text></SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        numColumns={2}
        ListEmptyComponent={<Text style={styles.empty}>No listings yet.</Text>}
      />
    </SafeAreaView>
  );
}

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 12 },
  center: { flex:1,justifyContent:'center',alignItems:'center'},
  list: { gap: 12 },
  card: {
    width: CARD_WIDTH,
    margin: 6,
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: { padding: 8 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 13, color: '#4CAF50' },
  metaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8 },
  metaText: { fontSize: 12, color: '#666', marginLeft: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
});
