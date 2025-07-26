import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PasswordItem from '../components/PasswordItem';
import PasswordGenerator from '../components/PasswordGenerator';
import Icon from '../components/Icon';

const categories = [
  'All',
  'General',
  'Social Media',
  'Banking',
  'Work',
  'Shopping',
  'Entertainment',
  'Email',
  'Gaming',
];

export default function PasswordsScreen() {
  const insets = useSafeAreaInsets();
  const [passwords, setPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('General');
  const [generatorVisible, setGeneratorVisible] = useState(false);

  useEffect(() => {
    loadPasswords();
  }, []);

  async function loadPasswords() {
    try {
      const stored = await SecureStore.getItemAsync('goodhackers_passwords');
      if (stored) setPasswords(JSON.parse(stored));
    } catch {
      Alert.alert('Error', 'Failed to load passwords');
    }
  }

  async function savePasswords(updated) {
    await SecureStore.setItemAsync('goodhackers_passwords', JSON.stringify(updated));
    setPasswords(updated);
  }

  function resetForm() {
    setEditingPassword(null);
    setAccount('');
    setUsername('');
    setPassword('');
    setWebsite('');
    setNotes('');
    setCategory('General');
  }

  function openAddModal() {
    resetForm();
    setModalVisible(true);
  }

  function openEditModal(pwd) {
    setEditingPassword(pwd);
    setAccount(pwd.account);
    setUsername(pwd.username);
    setPassword(pwd.password);
    setWebsite(pwd.website || '');
    setNotes(pwd.notes || '');
    setCategory(pwd.category || 'General');
    setModalVisible(true);
  }

  async function onSave() {
    if (!account.trim() || !password.trim()) {
      Alert.alert('Please enter Account and Password');
      return;
    }
    const now = new Date().toISOString();
    if (editingPassword) {
      const updated = passwords.map(p =>
        p.id === editingPassword.id
          ? { ...p, account, username, password, website, notes, category, updatedAt: now }
          : p,
      );
      await savePasswords(updated);
    } else {
      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${account}${username}${now}`,
      );
      const newPassword = {
        id,
        account,
        username,
        password,
        website,
        notes,
        category,
        createdAt: now,
        updatedAt: now,
      };
      await savePasswords([...passwords, newPassword]);
    }
    setModalVisible(false);
    resetForm();
  }

  async function onDelete(id) {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const filtered = passwords.filter(p => p.id !== id);
          await savePasswords(filtered);
        },
      },
    ]);
  }

  const filteredPasswords = passwords.filter(p => {
    const searchText = searchQuery.toLowerCase();
    const matchesSearch =
      p.account.toLowerCase().includes(searchText) ||
      p.username.toLowerCase().includes(searchText) ||
      (p.website?.toLowerCase().includes(searchText) ?? false);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePasswordGenerated = (generatedPwd) => {
    setPassword(generatedPwd);
    setGeneratorVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <Text style={styles.title}>Good Hackers</Text>
        <Text style={styles.subtitle}>{passwords.length} passwords stored securely</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.tab, selectedCategory === cat && styles.tabSelected]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedCategory === cat && styles.tabTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.searchInput}
          placeholder="Search passwords..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 180 }}>
          {filteredPasswords.length === 0 ? (
            <Text style={styles.noPasswords}>
              {searchQuery || selectedCategory !== 'All'
                ? 'No passwords found.'
                : 'No passwords stored yet. Tap + to add.'}
            </Text>
          ) : (
            filteredPasswords.map(pwd => (
              <PasswordItem
                key={pwd.id}
                password={pwd}
                onEdit={() => openEditModal(pwd)}
                onDelete={() => onDelete(pwd.id)}
              />
            ))
          )}

          {/* About Section moved inside ScrollView */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutText}>Good Hackers Password Manager</Text>
            <Text style={styles.aboutText}>Version 1.0.0</Text>
            <Text style={styles.aboutText}>
              Secure, offline password storage. Made for privacy & tech enthusiasts.
            </Text>
            <Text style={styles.aboutText}>
              About us: codename21 (kalinux444@gmail.com)
            </Text>
          </View>
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[styles.addButton, { bottom: insets.bottom + 28 }]}
          activeOpacity={0.8}
          onPress={openAddModal}
        >
          <Icon name="add" size={36} color="#fff" />
        </TouchableOpacity>

        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingPassword ? 'Edit Password' : 'Add Password'}</Text>

              <TextInput
                placeholder="Account"
                placeholderTextColor="#666"
                style={styles.input}
                value={account}
                onChangeText={setAccount}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                placeholder="Username / Email"
                placeholderTextColor="#666"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Password input with generator button */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setGeneratorVisible(true)}
                  style={{ marginLeft: 8, backgroundColor: 'green', padding: 10, borderRadius: 8 }}
                >
                  <Icon name="key-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Website (optional)"
                placeholderTextColor="#666"
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                placeholder="Notes (optional)"
                placeholderTextColor="#666"
                style={[styles.input, { height: 60 }]}
                multiline
                value={notes}
                onChangeText={setNotes}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Category Selector */}
              <ScrollView horizontal style={{ marginBottom: 10 }}>
                {categories.filter(c => c !== 'All').map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#888' }]}
                  onPress={() => { setModalVisible(false); resetForm(); }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#5A5FFF' }]} onPress={onSave}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Password Generator Modal */}
        <PasswordGenerator
          visible={generatorVisible}
          onClose={() => setGeneratorVisible(false)}
          onPasswordGenerated={handlePasswordGenerated}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121216', paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 20, textAlign: 'center' },
  subtitle: { color: '#bbb', marginBottom: 12, textAlign: 'center' },
  tabs: { marginBottom: 10 },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  tabSelected: { backgroundColor: '#5A5FFF', borderColor: '#5A5FFF' },
  tabText: { color: '#aaa', fontWeight: '600' },
  tabTextSelected: { color: '#fff' },
  searchInput: {
    backgroundColor: '#1B1B24',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#fff',
  },
  noPasswords: { textAlign: 'center', marginTop: 40, color: '#777', fontSize: 16 },
  addButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#5A5FFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  },
  aboutSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
    opacity: 0.7,
  },
  aboutText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1B1B24',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: {
    backgroundColor: '#121216',
    color: '#fff',
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginRight: 10,
  },
  categoryChipSelected: { backgroundColor: '#5A5FFF', borderColor: '#5A5FFF' },
  categoryChipText: { color: '#aaa' },
  categoryChipTextSelected: { color: '#fff' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginLeft: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
});