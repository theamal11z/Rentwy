import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Hide splash screen once we know the auth state
    SplashScreen.hideAsync().catch(() => {});

    // Navigate based on auth state
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/login');
    }
  }, [user, isLoading]);

  // Show blank screen while determining auth state
  return <View style={{ flex: 1, backgroundColor: '#FAFAFA' }} />;
}
