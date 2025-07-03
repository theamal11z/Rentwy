import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEarnings } from '@/lib/mockHooks';

export default function EarningsScreen() {
  const earnings = useEarnings();
  if (!earnings) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="wallet-outline" size={32} color="#4CAF50" />
        <Text style={styles.total}>${earnings.total.toFixed(2)}</Text>
        <Text style={styles.label}>Total Earnings</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallValue}>${earnings.thisMonth.toFixed(2)}</Text>
          <Text style={styles.smallLabel}>This Month</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.smallValue}>${earnings.pending.toFixed(2)}</Text>
          <Text style={styles.smallLabel}>Pending</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#FAFAFA', alignItems:'center', paddingTop:40 },
  card:{ alignItems:'center', backgroundColor:'#FFF', padding:24, borderRadius:12, elevation:3 },
  total:{ fontSize:32, fontWeight:'700', marginTop:8 },
  label:{ color:'#666' },
  row:{ flexDirection:'row', marginTop:24, gap:16 },
  smallCard:{ backgroundColor:'#FFF', padding:16, borderRadius:8, alignItems:'center', elevation:2, width:120 },
  smallValue:{ fontSize:20, fontWeight:'600' },
  smallLabel:{ color:'#666' },
});
