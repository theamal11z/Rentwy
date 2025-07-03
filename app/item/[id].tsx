import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useItem } from '@/lib/mockHooks';

const { width } = Dimensions.get('window');

export default function ItemDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = useItem(id as string);

  if (!item) {
    // Still loading
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="hourglass" size={24} color="#666" />
      </SafeAreaView>
    );
  }

  if (item === null) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>Item not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Placeholder image */}
        <View style={styles.imageWrapper}>
          <Ionicons name="image-outline" size={64} color="#CCC" />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>${item.pricePerDay}/day</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="pricetag-outline" size={16} color="#666" />
          <Text style={styles.metaText}>{item.category}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="shirt-outline" size={16} color="#666" />
          <Text style={styles.metaText}>Size: {item.size}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
          <Text style={styles.metaText}>Condition: {item.condition}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.rentButton} onPress={() => router.push(`/item/${id}/book`)}>
          <Text style={styles.rentButtonText}>Request to Rent</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#666', fontSize: 16 },
  content: { padding: 16 },
  imageWrapper: {
    width: width - 32,
    height: width - 32,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '600', flex: 1, marginRight: 8 },
  price: { fontSize: 20, fontWeight: '500', color: '#4CAF50', marginVertical: 8 },
  description: { fontSize: 16, color: '#444', marginBottom: 16 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: { marginLeft: 6, color: '#666', fontSize: 14 },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  rentButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rentButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
