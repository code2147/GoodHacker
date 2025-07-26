import { Text, View, SafeAreaView, TextInput, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [hasStoredPassword, setHasStoredPassword] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    checkStoredPassword();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);

      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        let supported = [];
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          supported.push('Face Recognition');
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          supported.push('Fingerprint');
        }
        if (supported.length === 0) supported.push('Biometrics');
        setBiometricTypes(supported);
      }
      console.log('Biometric support:', compatible && enrolled, 'Types:', biometricTypes);
    } catch (error) {
      console.log('Error checking biometric support:', error);
    }
  };

  const checkStoredPassword = async () => {
    try {
      const stored = await SecureStore.getItemAsync('goodhackers_master_password');
      setHasStoredPassword(!!stored);
      setIsSignUp(!stored);
      console.log('Has stored master password:', !!stored);
    } catch (error) {
      console.log('Error checking stored password:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Good Hackers',
        fallbackLabel: 'Use Master Password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        console.log('Biometric authentication successful');
        router.replace('/passwords');
      } else {
        console.log('Biometric authentication failed or canceled');
        Alert.alert('Authentication Failed', 'Biometric authentication failed or was canceled.');
      }
    } catch (error) {
      console.log('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const handlePasswordAuth = async () => {
    if (!masterPassword.trim()) {
      Alert.alert('Error', 'Please enter your master password');
      return;
    }

    try {
      if (isSignUp) {
        if (masterPassword !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }

        if (masterPassword.length < 8) {
          Alert.alert('Error', 'Master password must be at least 8 characters long');
          return;
        }

        await SecureStore.setItemAsync('goodhackers_master_password', masterPassword);
        console.log('Master password set for Good Hackers');

        setMasterPassword('');
        setConfirmPassword('');

        Alert.alert('Success', 'Master password created successfully!', [
          { text: 'OK', onPress: () => router.replace('/passwords') },
        ]);
      } else {
        const storedPassword = await SecureStore.getItemAsync('goodhackers_master_password');
        if (storedPassword === masterPassword) {
          console.log('Master password authentication successful');
          setMasterPassword('');
          router.replace('/passwords');
        } else {
          Alert.alert('Error', 'Incorrect master password');
        }
      }
    } catch (error) {
      console.log('Password authentication error:', error);
      Alert.alert('Error', 'Authentication failed');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMasterPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        <View style={{ alignItems: 'center', marginBottom: 50 }}>
          <View
            style={{
              backgroundColor: colors.primary + '20',
              padding: 25,
              borderRadius: 40,
              marginBottom: 20,
            }}
          >
            <Icon name="shield-checkmark" size={50} style={{ color: colors.primary }} />
          </View>

          <Text style={[commonStyles.title, { fontSize: 28, marginBottom: 8 }]}>Good Hackers</Text>

          <Text
            style={[
              commonStyles.text,
              {
                textAlign: 'center',
                opacity: 0.8,
                fontSize: 16,
              },
            ]}
          >
            {isSignUp ? 'Create your master password' : 'Welcome back, hacker!'}
          </Text>
        </View>

        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          {biometricSupported && hasStoredPassword && !isSignUp && (
            <View style={{ marginBottom: 30 }}>
              <Button
                text={`Use Biometric Authentication (${biometricTypes.join(', ')})`}
                onPress={handleBiometricAuth}
                style={[
                  buttonStyles.primary,
                  {
                    backgroundColor: colors.accent,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 20,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text
                  style={[
                    commonStyles.text,
                    {
                      marginHorizontal: 15,
                      fontSize: 14,
                      opacity: 0.6,
                    },
                  ]}
                >
                  or
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
            </View>
          )}

          <View style={{ marginBottom: 20 }}>
            <Text
              style={[
                commonStyles.text,
                {
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: '600',
                },
              ]}
            >
              Master Password
            </Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your master password"
              placeholderTextColor={colors.textSecondary}
              value={masterPassword}
              onChangeText={setMasterPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
            />
          </View>

          {isSignUp && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={[
                  commonStyles.text,
                  {
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: '600',
                  },
                ]}
              >
                Confirm Master Password
              </Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Confirm your master password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
              />
            </View>
          )}

          {isSignUp && (
            <View
              style={{
                backgroundColor: colors.backgroundAlt,
                padding: 15,
                borderRadius: 8,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={[
                  commonStyles.text,
                  {
                    fontSize: 12,
                    opacity: 0.8,
                    lineHeight: 16,
                  },
                ]}
              >
                💡 Your master password is the key to all your data. Make it strong and
                memorable - you cannot recover it if forgotten.
              </Text>
            </View>
          )}

          <Button
            text={isSignUp ? 'Create Master Password' : 'Unlock Good Hackers'}
            onPress={handlePasswordAuth}
            style={[buttonStyles.primary, { opacity: masterPassword.trim() ? 1 : 0.6 }]}
            disabled={!masterPassword.trim()}
          />

          {hasStoredPassword && (
            <Button
              text={isSignUp ? 'Already have an account? Sign In' : 'Need to reset? Create New'}
              onPress={toggleMode}
              style={[buttonStyles.secondary, { marginTop: 15 }]}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}