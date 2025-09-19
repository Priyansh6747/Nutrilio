import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {JSX, useEffect } from 'react';
import 'react-native-reanimated';
import { Text, View, StyleSheet } from "react-native";

import { useColorScheme } from '@/components/useColorScheme';
import { UserProvider, useUser } from '@/hooks/authContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent(): JSX.Element {
  const {
    isLoading,
    canAccessTabs,
    canAccessOnboarding,
    canAccessVerifyEmail,
    shouldShowSignin
  } = useUser();

  const colorScheme = useColorScheme();

  if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
  }

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={canAccessTabs}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
          <Stack.Protected guard={canAccessOnboarding}>
            <Stack.Screen name="Onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={canAccessVerifyEmail}>
            <Stack.Screen name="verifyemail" />
          </Stack.Protected>
          <Stack.Protected guard={shouldShowSignin}>
            <Stack.Screen name="Signin" />
          </Stack.Protected>
          {/* Optional: Add modal screen if needed */}
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
  );
}

export default function RootLayout(): JSX.Element | null {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <UserProvider>
        <RootLayoutContent />
      </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
});