import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { MASTER_KEY } from '../lib/security';

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSetup();
  }, []);

  const checkExistingSetup = async () => {
    try {
      const existingPassword = await SecureStore.getItemAsync(MASTER_KEY);
      
      if (existingPassword) {
        router.replace('/login');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking setup:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Ionicons name="shield-checkmark" size={60} color="#4A90E2" />
        <Text style={styles.loadingText}>Good Hackers</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={80} color="white" />
      </View>

      <Text style={styles.title}>Good Hackers</Text>
      <Text style={styles.subtitle}>
        Your secure, encrypted password manager.{'\n'}
        Keep all your accounts safe in one place.
      </Text>

      <View style={styles.featureContainer}>
        <View style={styles.featureItem}>
          <MaterialIcons name="security" size={20} color="white" />
          <Text style={styles.featureText}>Military-grade encryption</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="phone-portrait" size={20} color="white" />
          <Text style={styles.featureText}>Stored locally on your device</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="vpn-key" size={20} color="white" />
          <Text style={styles.featureText}>Advanced password generator</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="finger-print" size={20} color="white" />
          <Text style={styles.featureText}>Biometric authentication</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/setup')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Your passwords never leave your device.{'\n'}
        Good Hackers respects your privacy.
      </Text>
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featureContainer: {
    width: '100%',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 24,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footerText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
});