import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.body}>Need assistance? Email us at support@rentmythreads.app or check the FAQ section on our website.</Text>
      <Text style={styles.body}>This is a placeholder screen for future help content.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#FAFAFA', padding:16 },
  title:{ fontSize:24, fontWeight:'700', marginBottom:12 },
  body:{ marginBottom:8, color:'#666' },
});
