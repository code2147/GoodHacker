import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { MASTER_KEY, sha256, isBiometricSupported, authenticateWithBiometrics, BIOMETRIC_ENABLED_KEY } from '../lib/security';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [storedPasswordHash, setStoredPasswordHash] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedHash = await SecureStore.getItemAsync(MASTER_KEY);
      setStoredPasswordHash(savedHash);
      
      if (!savedHash) {
        router.replace('/');
        return;
      }

      const isSupported = await isBiometricSupported();
      setBiometricSupported(isSupported);

      const biometricEnabledSetting = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      const isEnabled = biometricEnabledSetting === 'true';
      setBiometricEnabled(isEnabled);

      if (isSupported && isEnabled) {
        handleBiometricAuth();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        router.replace('/passwords');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Authentication Error', 'Failed to authenticate with biometrics. Please use your master password.');
    }
  };

  const handleUnlock = async () => {
    if (!storedPasswordHash) return;

    const hashedInput = await sha256(password);
    if (hashedInput === storedPasswordHash) {
      setPassword('');
      router.replace('/passwords');
    } else {
      Alert.alert('Error', 'Wrong master password');
    }
  };

  const toggleBiometric = async () => {
    if (!biometricSupported) {
      Alert.alert('Not Supported', 'Biometric authentication is not available on this device.');
      return;
    }

    try {
      const newState = !biometricEnabled;
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, newState.toString());
      setBiometricEnabled(newState);
      
      Alert.alert(
        'Biometric Authentication', 
        newState ? 'Biometric authentication enabled' : 'Biometric authentication disabled'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={60} color="white" />
      </View>

      <Text style={styles.title}>Good Hackers</Text>
      <Text style={styles.subtitle}>Welcome back, hacker!</Text>

      <Text style={styles.label}>Master Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter your master password"
          placeholderTextColor="#888888"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#888888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
        <Text style={styles.unlockButtonText}>Unlock Good Hackers</Text>
      </TouchableOpacity>

      {biometricSupported && (
        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={handleBiometricAuth}
        >
          <Ionicons name="finger-print" size={24} color="#4A90E2" />
          <Text style={styles.biometricButtonText}>Use Fingerprint</Text>
        </TouchableOpacity>
      )}

      {biometricSupported && (
        <TouchableOpacity 
          style={styles.biometricToggle}
          onPress={toggleBiometric}
        >
          <Text style={styles.biometricToggleText}>
            Biometric Auth: {biometricEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.forgotButton}
        onPress={() => router.push('/reset')}
      >
        <Text style={styles.forgotText}>Need to reset? Create New</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    marginBottom: 48,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 56,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#404040',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  unlockButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  biometricButtonText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  biometricToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  biometricToggleText: {
    color: '#888888',
    fontSize: 14,
  },
  forgotButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  forgotText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});