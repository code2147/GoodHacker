import { Text, View, SafeAreaView } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      console.log('Good Hackers app loaded successfully');
    }
  }, [fontsLoaded]);

  const handleGetStarted = async () => {
    console.log('User starting Good Hackers setup');
    try {
      await SecureStore.setItemAsync('onboardingComplete', 'true');
    } catch (e) {
      console.log('Failed to save onboarding status:', e);
    }
    router.push('/login');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        <View style={{ alignItems: 'center', marginBottom: 60 }}>
          <View
            style={{
              backgroundColor: colors.primary + '33',
              padding: 36,
              borderRadius: 60,
              marginBottom: 30,
              borderWidth: 2,
              borderColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Icon name="shield-checkmark" size={68} style={{ color: colors.primary }} />
          </View>

          <Text style={[commonStyles.title, { fontSize: 34, marginBottom: 10, fontFamily: 'Roboto_700Bold', letterSpacing: 1 }]}>
            Good Hackers
          </Text>

          <Text
            style={[
              commonStyles.text,
              {
                textAlign: 'center',
                fontSize: 16,
                lineHeight: 24,
                opacity: 0.8,
                marginBottom: 40,
              },
            ]}
          >
            Your secure, encrypted password manager.{'\n'}
            Keep all your accounts safe in one place.
          </Text>
        </View>

        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: colors.backgroundAlt,
              padding: 22,
              borderRadius: 14,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: colors.primary,
              shadowOpacity: 0.09,
              shadowRadius: 7,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Icon name="lock-closed" size={22} style={{ color: colors.success, marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Military-grade encryption</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Icon name="phone-portrait" size={22} style={{ color: colors.success, marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Stored locally on your device</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Icon name="key" size={22} style={{ color: colors.success, marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Advanced password generator</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="finger-print" size={22} style={{ color: colors.success, marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Biometric authentication</Text>
            </View>
          </View>

          <Button text="Get Started" onPress={handleGetStarted} style={[buttonStyles.primary, { marginBottom: 22 }]} />

          <Text
            style={[
              commonStyles.text,
              {
                textAlign: 'center',
                fontSize: 12,
                opacity: 0.6,
                marginTop: 8,
              },
            ]}
          >
            Your passwords never leave your device.{'\n'}
            Good Hackers respects your privacy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}