import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>This is a placeholder screen. Implement account, notification, and payment settings here.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#FAFAFA', padding:16 },
  title:{ fontSize:24, fontWeight:'700', marginBottom:12 },
  subtitle:{ color:'#666' },
});
