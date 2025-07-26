import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Icon from './Icon'; // Or your icon substitute

export default function PasswordGenerator({ visible, onClose, onPasswordGenerated }) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  function generatePassword() {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      Alert.alert('Select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++)
      password += charset.charAt(Math.floor(Math.random() * charset.length));

    setGeneratedPassword(password);
  }

  async function copyPassword() {
    if (generatedPassword) {
      await Clipboard.setStringAsync(generatedPassword);
      Alert.alert('Copied', 'Password copied to clipboard');
    }
  }

  function usePassword() {
    if (!generatedPassword) {
      Alert.alert('Generate a password first');
      return;
    }
    onPasswordGenerated(generatedPassword);
    onClose();
    setGeneratedPassword('');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Password Generator</Text>

          <View style={styles.lengthContainer}>
            <Text style={styles.label}>Length: {length}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setLength(l => Math.max(4, l - 1))}
              >
                <Text style={styles.adjustBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => setLength(l => Math.min(50, l + 1))}
              >
                <Text style={styles.adjustBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {[
            { label: 'Include Uppercase', val: includeUppercase, setter: setIncludeUppercase },
            { label: 'Include Lowercase', val: includeLowercase, setter: setIncludeLowercase },
            { label: 'Include Numbers', val: includeNumbers, setter: setIncludeNumbers },
            { label: 'Include Symbols', val: includeSymbols, setter: setIncludeSymbols },
          ].map(({ label, val, setter }) => (
            <View key={label} style={styles.switchRow}>
              <Text style={styles.label}>{label}</Text>
              <Switch value={val} onValueChange={setter} />
            </View>
          ))}

          <TouchableOpacity style={styles.generateBtn} onPress={generatePassword}>
            <Text style={styles.generateBtnText}>Generate</Text>
          </TouchableOpacity>

          {!!generatedPassword && (
            <TouchableOpacity style={styles.generatedContainer} onPress={copyPassword}>
              <Text style={styles.generatedPassword}>{generatedPassword}</Text>
              <Icon name="copy-outline" size={20} color="#5A5FFF" />
            </TouchableOpacity>
          )}

          <View style={styles.buttonsRow}>
            <TouchableOpacity onPress={() => { onClose(); setGeneratedPassword(''); }} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={usePassword} style={styles.useBtn}>
              <Text style={styles.useBtnText}>Use Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: {
    backgroundColor: '#222',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  lengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: { color: '#ddd', fontWeight: '600' },
  adjustBtn: {
    backgroundColor: '#444',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  adjustBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  generateBtn: {
    backgroundColor: '#5A5FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  generateBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  generatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  generatedPassword: { color: '#5A5FFF', fontWeight: 'bold', fontSize: 16 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelBtnText: { color: '#aaa', fontWeight: '600' },
  useBtn: { backgroundColor: '#5A5FFF', padding: 10, borderRadius: 6 },
  useBtnText: { color: '#fff', fontWeight: 'bold' },
});