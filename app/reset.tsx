import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import {
  SEC_Q1_KEY, SEC_Q1_ANSWER_KEY,
  SEC_Q2_KEY, SEC_Q2_ANSWER_KEY,
  sha256, MASTER_KEY,
} from '../lib/security';
import { Ionicons } from '@expo/vector-icons';

const MIN_PASSWORD_LENGTH = 6;
const MIN_ANSWER_LENGTH = 4;

export default function ResetScreen() {
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const q1 = await SecureStore.getItemAsync(SEC_Q1_KEY);
      const q2 = await SecureStore.getItemAsync(SEC_Q2_KEY);
      if (!q1 || !q2) {
        Alert.alert('Error', 'Security questions not found. Please set up master password first.');
        router.replace('/setup');
        return;
      }
      setQuestion1(q1);
      setQuestion2(q2);
    })();
  }, []);

  const verifyAnswers = async () => {
    if (answer1.trim().length < MIN_ANSWER_LENGTH || answer2.trim().length < MIN_ANSWER_LENGTH) {
      Alert.alert('Error', `Please answer both questions with at least ${MIN_ANSWER_LENGTH} characters.`);
      return;
    }

    const storedHash1 = await SecureStore.getItemAsync(SEC_Q1_ANSWER_KEY);
    const storedHash2 = await SecureStore.getItemAsync(SEC_Q2_ANSWER_KEY);

    const answer1Hash = await sha256(answer1.trim().toLowerCase());
    const answer2Hash = await sha256(answer2.trim().toLowerCase());

    if (answer1Hash === storedHash1 && answer2Hash === storedHash2) {
      setVerified(true);
      Alert.alert('Verified', 'You may now reset your master password.');
    } else {
      Alert.alert('Error', 'Answers do not match. Cannot reset password.');
    }
  };

  const handleReset = async () => {
    if (!verified) {
      Alert.alert('Error', 'Please verify answers to security questions first.');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Error', `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      await SecureStore.deleteItemAsync(MASTER_KEY);
      await SecureStore.deleteItemAsync(SEC_Q1_KEY);
      await SecureStore.deleteItemAsync(SEC_Q1_ANSWER_KEY);
      await SecureStore.deleteItemAsync(SEC_Q2_KEY);
      await SecureStore.deleteItemAsync(SEC_Q2_ANSWER_KEY);

      const hashedNewPassword = await sha256(newPassword);
      await SecureStore.setItemAsync(MASTER_KEY, hashedNewPassword);

      Alert.alert('Success', 'Master password has been reset. Please set new security questions.');
      router.replace('/setup');
    } catch (err) {
      console.error('Reset error:', err);
      Alert.alert('Error', 'Failed to reset master password.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={60} color="white" />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {!verified ? 'Answer your security questions' : 'Create new master password'}
        </Text>

        {!verified ? (
          <>
            <Text style={styles.questionLabel}>{question1}</Text>
            <TextInput
              placeholder="Your answer"
              placeholderTextColor="#888888"
              secureTextEntry
              style={styles.input}
              onChangeText={setAnswer1}
              value={answer1}
              autoCapitalize="none"
            />

            <Text style={styles.questionLabel}>{question2}</Text>
            <TextInput
              placeholder="Your answer"
              placeholderTextColor="#888888"
              secureTextEntry
              style={styles.input}
              onChangeText={setAnswer2}
              value={answer2}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={verifyAnswers}>
              <Text style={styles.buttonText}>Verify Answers</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>New Master Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter new master password"
                placeholderTextColor="#888888"
                secureTextEntry={!showPassword}
                style={styles.input}
                onChangeText={setNewPassword}
                value={newPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#888888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              placeholder="Confirm new master password"
              placeholderTextColor="#888888"
              secureTextEntry
              style={styles.input}
              onChangeText={setConfirmNewPassword}
              value={confirmNewPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.backText}>Back to Login</Text>
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
    textAlign: 'center',
  },
  questionLabel: {
    fontSize: 16,
    color: '#ffffff',
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: '100%',
    fontWeight: '500',
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
  backText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});