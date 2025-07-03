import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const success = await signup(name, email, password);
    if (!success) Alert.alert('Signup Failed', 'Email already in use');
    else router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btn} onPress={handleSignup}>
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', alignItems:'center', padding:16 },
  title:{ fontSize:28, fontWeight:'700', marginBottom:24 },
  input:{ width:'100%', borderWidth:1, borderColor:'#CCC', borderRadius:8, padding:12, marginBottom:12 },
  btn:{ backgroundColor:'#4CAF50', padding:14, borderRadius:8, width:'100%', alignItems:'center', marginTop:8 },
  btnText:{ color:'#FFF', fontWeight:'600' },
  link:{ marginTop:16, color:'#4CAF50' },
});
