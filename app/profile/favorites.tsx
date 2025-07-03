import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '@/lib/mockHooks';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavorites();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={40} color="#CCC" />
      </View>
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.price}>${item.pricePerDay}/day</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={favorites.length === 0 && styles.center}
        ListEmptyComponent={<Text style={styles.empty}>No favorites yet.</Text>}
      />
    </SafeAreaView>
  );
}

const CARD_W = 160;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 12 },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  card:{ width: CARD_W, margin:6, backgroundColor:'#FFF', borderRadius:8, padding:8, alignItems:'center', elevation:2 },
  imagePlaceholder:{ width:'100%', height:CARD_W, backgroundColor:'#EEE', justifyContent:'center', alignItems:'center', marginBottom:6 },
  title:{ fontSize:14, fontWeight:'600', marginBottom:4 },
  price:{ fontSize:13, color:'#4CAF50' },
  empty:{ color:'#666' }
});
