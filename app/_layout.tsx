import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView, ActivityIndicator, View } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import * as SecureStore from 'expo-secure-store';
import GetStartedScreen from '../components/GetStartedScreen';

const STORAGE_KEY = 'emulated_device';
const ONBOARDING_KEY = 'onboardingComplete';

export default function RootLayoutWrapper() {
  return (
    <SafeAreaProvider>
      <RootLayout />
    </SafeAreaProvider>
  );
}

function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    setupErrorLogging();

    (async () => {
      if (Platform.OS !== 'web') {
        const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
        setIsOnboardingDone(value === 'true');
      } else {
        // On web, assume onboarding done
        setIsOnboardingDone(true);
      }
    })();

    if (Platform.OS === 'web') {
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
  }, [emulate]);

  // Called after onboarding completes
  const finishOnboarding = async () => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      }
    } catch (e) {
      console.error('Failed to mark onboarding complete:', e);
    }
    setIsOnboardingDone(true);
  };

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    };
    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate
      ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets
      : actualInsets;
  }

  if (isOnboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#5A5FFF" />
      </View>
    );
  }

  if (!isOnboardingDone) {
    return (
      <SafeAreaView
        style={[
          commonStyles.wrapper,
          {
            paddingTop: insetsToUse.top,
            paddingBottom: insetsToUse.bottom,
            paddingLeft: insetsToUse.left,
            paddingRight: insetsToUse.right,
          },
        ]}
      >
        <StatusBar style="light" backgroundColor="#121212" />
        <GetStartedScreen onGetStarted={finishOnboarding} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        commonStyles.wrapper,
        {
          paddingTop: insetsToUse.top,
          paddingBottom: insetsToUse.bottom,
          paddingLeft: insetsToUse.left,
          paddingRight: insetsToUse.right,
        },
      ]}
    >
      <StatusBar style="light" backgroundColor="#121212" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      />
    </SafeAreaView>
  );
}