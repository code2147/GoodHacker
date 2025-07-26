import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GetStartedScreen({ onGetStarted }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Good Hackers!</Text>
      <TouchableOpacity style={styles.button} onPress={onGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  title: { fontSize: 24, color: '#fff', marginBottom: 25 },
  button: {
    backgroundColor: '#5A5FFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 9,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});