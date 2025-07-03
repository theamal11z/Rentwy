import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useConversation } from '@/lib/mockHooks';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const messages = useConversation(id as string);
  const [input, setInput] = useState('');

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMsg : styles.theirMsg]}>
      <Text style={styles.msgText}>{item.text}</Text>
      <Text style={styles.msgTime}>{item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding:16 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => setInput('')}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#FAFAFA' },
  messageBubble:{ maxWidth:'75%', padding:8, borderRadius:8, marginVertical:4 },
  myMsg:{ backgroundColor:'#DCF8C6', alignSelf:'flex-end' },
  theirMsg:{ backgroundColor:'#FFF', alignSelf:'flex-start' },
  msgText:{ fontSize:14 },
  msgTime:{ fontSize:10, color:'#666', alignSelf:'flex-end' },
  inputRow:{ flexDirection:'row', padding:8, backgroundColor:'#FFF', alignItems:'center' },
  input:{ flex:1, padding:8, backgroundColor:'#EEE', borderRadius:20, marginRight:8 },
  sendBtn:{ backgroundColor:'#4CAF50', padding:10, borderRadius:20 },
});
