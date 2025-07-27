import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import {
  sha256, MASTER_KEY,
  SEC_Q1_KEY, SEC_Q1_ANSWER_KEY,
  SEC_Q2_KEY, SEC_Q2_ANSWER_KEY,
  isBiometricSupported, BIOMETRIC_ENABLED_KEY
} from '../lib/security';
import { Ionicons } from '@expo/vector-icons';

const MIN_PASSWORD_LENGTH = 6;
const MIN_ANSWER_LENGTH = 4;

export default function SetupScreen() {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [question1, setQuestion1] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const isSupported = await isBiometricSupported();
    setBiometricSupported(isSupported);
    setEnableBiometric(isSupported); // Default to enabled if supported
  };

  const validateInput = (): boolean => {
    if (masterPassword.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Error', `Master password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return false;
    }
    if (masterPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    if (!question1.trim() || !question2.trim()) {
      Alert.alert('Error', 'Please fill in both security questions.');
      return false;
    }
    if (answer1.trim().length < MIN_ANSWER_LENGTH || answer2.trim().length < MIN_ANSWER_LENGTH) {
      Alert.alert('Error', `Security answers must be at least ${MIN_ANSWER_LENGTH} characters.`);
      return false;
    }
    if (question1.trim() === question2.trim()) {
      Alert.alert('Error', 'Security questions must be different.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInput()) return;

    try {
      const hashedPassword = await sha256(masterPassword);
      const hashedAnswer1 = await sha256(answer1.trim().toLowerCase());
      const hashedAnswer2 = await sha256(answer2.trim().toLowerCase());

      await SecureStore.setItemAsync(MASTER_KEY, hashedPassword);
      await SecureStore.setItemAsync(SEC_Q1_KEY, question1.trim());
      await SecureStore.setItemAsync(SEC_Q1_ANSWER_KEY, hashedAnswer1);
      await SecureStore.setItemAsync(SEC_Q2_KEY, question2.trim());
      await SecureStore.setItemAsync(SEC_Q2_ANSWER_KEY, hashedAnswer2);
      
      // Save biometric preference
      if (biometricSupported) {
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enableBiometric.toString());
      }

      Alert.alert('Success', 'Master password and security questions saved!');
      router.replace('/passwords');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save your data.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={60} color="white" />
        </View>

        <Text style={styles.title}>Good Hackers</Text>
        <Text style={styles.subtitle}>Create your master password</Text>

        <Text style={styles.label}>Master Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your master password"
            placeholderTextColor="#888888"
            secureTextEntry={!showPassword}
            style={styles.input}
            onChangeText={setMasterPassword}
            value={masterPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Master Password</Text>
        <TextInput
          placeholder="Confirm your master password"
          placeholderTextColor="#888888"
          secureTextEntry
          style={styles.input}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          autoCapitalize="none"
        />

        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={16} color="#FFA500" />
          <Text style={styles.warningText}>
            Your master password is the key to all your data. Make it{'\n'}
            strong and memorable - you cannot recover it if forgotten.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Security Questions</Text>
        <Text style={styles.sectionSubtitle}>These help you reset your password if forgotten</Text>

        <TextInput
          placeholder="Security question #1"
          placeholderTextColor="#888888"
          style={styles.input}
          onChangeText={setQuestion1}
          value={question1}
          autoCapitalize="sentences"
        />
        <TextInput
          placeholder="Answer #1"
          placeholderTextColor="#888888"
          secureTextEntry
          style={styles.input}
          onChangeText={setAnswer1}
          value={answer1}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Security question #2"
          placeholderTextColor="#888888"
          style={styles.input}
          onChangeText={setQuestion2}
          value={question2}
          autoCapitalize="sentences"
        />
        <TextInput
          placeholder="Answer #2"
          placeholderTextColor="#888888"
          secureTextEntry
          style={styles.input}
          onChangeText={setAnswer2}
          value={answer2}
          autoCapitalize="none"
        />

        {biometricSupported && (
          <>
            <Text style={styles.sectionTitle}>Biometric Authentication</Text>
            <TouchableOpacity 
              style={styles.biometricOption}
              onPress={() => setEnableBiometric(!enableBiometric)}
            >
              <View style={styles.biometricOptionContent}>
                <Ionicons name="finger-print" size={24} color="#4A90E2" />
                <View style={styles.biometricOptionText}>
                  <Text style={styles.biometricOptionTitle}>Enable Fingerprint Unlock</Text>
                  <Text style={styles.biometricOptionSubtitle}>
                    Use your fingerprint to unlock Good Hackers quickly
                  </Text>
                </View>
              </View>
              <Ionicons 
                name={enableBiometric ? "checkbox" : "square-outline"} 
                size={24} 
                color="#4A90E2" 
              />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Create Master Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1a1a1a',
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 40,
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
    marginBottom: 32,
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
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#404040',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    color: '#b0b0b0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#b0b0b0',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  biometricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#404040',
  },
  biometricOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  biometricOptionTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  biometricOptionSubtitle: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});