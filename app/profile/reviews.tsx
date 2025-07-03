import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReviews } from '@/lib/mockHooks';

export default function ReviewsScreen() {
  const reviews = useReviews();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="person-circle" size={32} color="#666" />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.reviewer}>{item.reviewerName}</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <Ionicons
                key={i}
                name={i <= item.rating ? 'star' : 'star-outline'}
                size={14}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(r) => r._id}
        renderItem={renderItem}
        contentContainerStyle={reviews.length === 0 && styles.center}
        ListEmptyComponent={<Text style={styles.empty}>No reviews yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#FAFAFA', padding:16 },
  center:{ flex:1, justifyContent:'center', alignItems:'center' },
  card:{ backgroundColor:'#FFF', borderRadius:8, padding:12, marginBottom:12, elevation:2 },
  headerRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  reviewer:{ fontSize:16, fontWeight:'600' },
  ratingRow:{ flexDirection:'row' },
  comment:{ marginTop:4, fontSize:14 },
  date:{ marginTop:4, fontSize:12, color:'#666' },
  empty:{ color:'#666' }
});
