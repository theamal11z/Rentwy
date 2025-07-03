import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const inAuthGroup = segments[0] === 'auth';

  useEffect(() => {
    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    }
    if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, inAuthGroup]);

  if (!user && !inAuthGroup) return null; // render nothing while redirecting
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </AuthProvider>
  );
}
