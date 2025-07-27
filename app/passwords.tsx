import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, FlatList, 
  Modal, TextInput, Alert, ScrollView, Dimensions, 
  Clipboard, AppState
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { isBiometricSupported, BIOMETRIC_ENABLED_KEY } from '../lib/security';

const { width } = Dimensions.get('window');

const categories = ['All', 'General', 'Social Media', 'Banking', 'Work'];

export default function PasswordsScreen() {
  const [passwords, setPasswords] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    notes: '',
    category: 'General'
  });

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  // Auto-lock functionality with biometric support
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        router.replace('/login');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    try {
      const stored = await SecureStore.getItemAsync('goodhackers_passwords');
      if (stored) {
        setPasswords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading passwords:', error);
    }
  };

  const savePasswords = async (passwordList) => {
    try {
      await SecureStore.setItemAsync('goodhackers_passwords', JSON.stringify(passwordList));
      setPasswords(passwordList);
    } catch (error) {
      console.error('Error saving passwords:', error);
      Alert.alert('Error', 'Failed to save password');
    }
  };

  const generatePassword = () => {
    let chars = '';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (chars === '') {
      Alert.alert('Error', 'Please select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const copyToClipboard = (text, type = 'Password') => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${type} copied to clipboard`);
  };

  const togglePasswordVisibility = (passwordId) => {
    const newVisiblePasswords = new Set(visiblePasswords);
    if (newVisiblePasswords.has(passwordId)) {
      newVisiblePasswords.delete(passwordId);
    } else {
      newVisiblePasswords.add(passwordId);
    }
    setVisiblePasswords(newVisiblePasswords);
  };

  const handleSavePassword = () => {
    if (!newPassword.title || !newPassword.password) {
      Alert.alert('Error', 'Please fill in at least title and password');
      return;
    }

    const passwordEntry = {
      id: editingPassword ? editingPassword.id : Date.now().toString(),
      ...newPassword,
      createdAt: editingPassword ? editingPassword.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedPasswords;
    if (editingPassword) {
      updatedPasswords = passwords.map(p => p.id === editingPassword.id ? passwordEntry : p);
    } else {
      updatedPasswords = [...passwords, passwordEntry];
    }

    savePasswords(updatedPasswords);
    resetForm();
    setShowAddModal(false);
  };

  const handleDeletePassword = (id) => {
    Alert.alert(
      'Delete Password',
      'Are you sure you want to delete this password?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedPasswords = passwords.filter(p => p.id !== id);
            savePasswords(updatedPasswords);
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNewPassword({
      title: '',
      username: '',
      password: '',
      website: '',
      notes: '',
      category: 'General'
    });
    setEditingPassword(null);
  };

  // Enhanced filtering with search
  const filteredPasswords = passwords.filter(p => {
    // Filter by category
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const PasswordItem = ({ item }) => {
    const isPasswordVisible = visiblePasswords.has(item.id);
    
    return (
      <View style={styles.passwordItem}>
        <View style={styles.passwordHeader}>
          <Text style={styles.passwordTitle}>{item.title}</Text>
          <View style={styles.passwordActions}>
            <TouchableOpacity 
              onPress={() => {
                setNewPassword(item);
                setEditingPassword(item);
                setShowAddModal(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={16} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeletePassword(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={16} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.passwordRow}>
          <Text style={styles.passwordDetail}>Username/email: {item.username}</Text>
          {item.username && (
            <TouchableOpacity 
              onPress={() => copyToClipboard(item.username, 'Username')}
              style={styles.copyButton}
            >
              <Ionicons name="copy-outline" size={16} color="#4A90E2" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.passwordRow}>
          <Text style={styles.passwordDetail}>
            Password: {isPasswordVisible ? item.password : '••••••••'}
          </Text>
          <View style={styles.passwordControls}>
            <TouchableOpacity 
              onPress={() => togglePasswordVisibility(item.id)}
              style={styles.eyeButton}
            >
              <Ionicons 
                name={isPasswordVisible ? "eye-off" : "eye"} 
                size={16} 
                color="#4A90E2" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => copyToClipboard(item.password)}
              style={styles.copyButton}
            >
              <Ionicons name="copy-outline" size={16} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

        {item.website && (
          <View style={styles.passwordRow}>
            <Text style={styles.passwordDetail}>Website: {item.website}</Text>
            <TouchableOpacity 
              onPress={() => copyToClipboard(item.website, 'Website')}
              style={styles.copyButton}
            >
              <Ionicons name="copy-outline" size={16} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        )}

        {item.notes && <Text style={styles.passwordDetail}>Notes: {item.notes}</Text>}
        <Text style={styles.categoryTag}>{item.category}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Good Hackers</Text>
      <Text style={styles.subtitle}>{passwords.length} passwords stored securely</Text>

      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search passwords..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.activeCategoryTab
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPasswords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PasswordItem item={item} />}
        style={styles.passwordList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed" size={64} color="#666" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No passwords found' : 'No passwords yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Tap the + button to add your first password'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setShowAddModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Good Hackers Password Manager</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
        <Text style={styles.footerDescription}>
          Secure, offline password storage. Made for privacy & tech lovers.
        </Text>
        <Text style={styles.footerContact}>About us: codename21 (kalinux444@gmail.com)</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Password Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPassword ? 'Edit Password' : 'Add Password'}
            </Text>
            <TouchableOpacity onPress={handleSavePassword}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              placeholder="Title"
              placeholderTextColor="#888"
              style={styles.modalInput}
              value={newPassword.title}
              onChangeText={(text) => setNewPassword({...newPassword, title: text})}
            />

            <TextInput
              placeholder="Username/Email"
              placeholderTextColor="#888"
              style={styles.modalInput}
              value={newPassword.username}
              onChangeText={(text) => setNewPassword({...newPassword, username: text})}
            />

            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#888"
                style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                value={newPassword.password}
                onChangeText={(text) => setNewPassword({...newPassword, password: text})}
                secureTextEntry
              />
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={() => setShowPasswordGenerator(true)}
              >
                <MaterialIcons name="vpn-key" size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Website"
              placeholderTextColor="#888"
              style={styles.modalInput}
              value={newPassword.website}
              onChangeText={(text) => setNewPassword({...newPassword, website: text})}
            />

            <TextInput
              placeholder="Notes"
              placeholderTextColor="#888"
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              value={newPassword.notes}
              onChangeText={(text) => setNewPassword({...newPassword, notes: text})}
              multiline
            />

            <Text style={styles.categoryLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryChips}>
                {categories.filter(c => c !== 'All').map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      newPassword.category === category && styles.selectedCategoryChip
                    ]}
                    onPress={() => setNewPassword({...newPassword, category})}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      newPassword.category === category && styles.selectedCategoryChipText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>

      {/* Password Generator Modal */}
      <Modal
        visible={showPasswordGenerator}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordGenerator(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Password Generator</Text>
            <TouchableOpacity 
              onPress={() => {
                if (generatedPassword) {
                  setNewPassword({...newPassword, password: generatedPassword});
                  setShowPasswordGenerator(false);
                }
              }}
            >
              <Text style={styles.saveButton}>Use Password</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.generatedPasswordContainer}>
              <Text style={styles.generatedPasswordLabel}>Generated Password</Text>
              <View style={styles.passwordDisplayContainer}>
                <Text style={styles.generatedPassword}>
                  {showGeneratedPassword ? generatedPassword || 'Generate a password' : '••••••••••••'}
                </Text>
                <View style={styles.passwordActions}>
                  <TouchableOpacity 
                    style={styles.passwordActionButton}
                    onPress={() => setShowGeneratedPassword(!showGeneratedPassword)}
                  >
                    <Ionicons 
                      name={showGeneratedPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.passwordActionButton}
                    onPress={() => copyToClipboard(generatedPassword || 'Generate a password first')}
                  >
                    <Ionicons name="copy" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* CUSTOM SLIDER WITH + - BUTTONS */}
            <View style={styles.optionContainer}>
              <Text style={styles.optionLabel}>Length: {passwordLength}</Text>
              
              <View style={styles.customSliderContainer}>
                <TouchableOpacity 
                  style={[styles.sliderButton, passwordLength <= 8 && styles.disabledButton]}
                  onPress={() => setPasswordLength(Math.max(8, passwordLength - 1))}
                  disabled={passwordLength <= 8}
                >
                  <Ionicons name="remove" size={20} color={passwordLength <= 8 ? "#666" : "#ffffff"} />
                </TouchableOpacity>
                
                <View style={styles.sliderTrackContainer}>
                  <View style={styles.sliderTrack}>
                    <View 
                      style={[
                        styles.sliderProgress, 
                        { width: `${((passwordLength - 8) / (24 - 8)) * 100}%` }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.sliderThumb, 
                        { left: `${((passwordLength - 8) / (24 - 8)) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.sliderButton, passwordLength >= 24 && styles.disabledButton]}
                  onPress={() => setPasswordLength(Math.min(24, passwordLength + 1))}
                  disabled={passwordLength >= 24}
                >
                  <Ionicons name="add" size={20} color={passwordLength >= 24 ? "#666" : "#ffffff"} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>8</Text>
                <Text style={styles.sliderLabel}>16</Text>
                <Text style={styles.sliderLabel}>24</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeUppercase(!includeUppercase)}
            >
              <Text style={styles.optionText}>Include Uppercase</Text>
              <View style={[styles.toggle, includeUppercase && styles.toggleActive]}>
                {includeUppercase && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeLowercase(!includeLowercase)}
            >
              <Text style={styles.optionText}>Include Lowercase</Text>
              <View style={[styles.toggle, includeLowercase && styles.toggleActive]}>
                {includeLowercase && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeNumbers(!includeNumbers)}
            >
              <Text style={styles.optionText}>Include Numbers</Text>
              <View style={[styles.toggle, includeNumbers && styles.toggleActive]}>
                {includeNumbers && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeSymbols(!includeSymbols)}
            >
              <Text style={styles.optionText}>Include Symbols</Text>
              <View style={[styles.toggle, includeSymbols && styles.toggleActive]}>
                {includeSymbols && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.generatePasswordButton} onPress={generatePassword}>
              <Text style={styles.generatePasswordButtonText}>Generate</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#b0b0b0',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Search container styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  categoryScrollView: {
    maxHeight: 50,
    marginBottom: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#2d2d2d',
  },
  activeCategoryTab: {
    backgroundColor: '#4A90E2',
  },
  categoryText: {
    color: '#b0b0b0',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  passwordList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  passwordItem: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  passwordActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  passwordDetail: {
    fontSize: 14,
    color: '#b0b0b0',
    flex: 1,
    fontFamily: 'monospace',
  },
  passwordControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    marginRight: 8,
    padding: 4,
  },
  copyButton: {
    padding: 4,
  },
  categoryTag: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
  },
  footerTitle: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerVersion: {
    color: '#888888',
    fontSize: 10,
    marginBottom: 8,
  },
  footerDescription: {
    color: '#888888',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerContact: {
    color: '#888888',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cancelButton: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  saveButton: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInput: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  categoryLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '500',
  },
  categoryChips: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  selectedCategoryChip: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryChipText: {
    color: '#b0b0b0',
    fontSize: 14,
  },
  selectedCategoryChipText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  
  // Password Generator Styles
  generatedPasswordContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#404040',
  },
  generatedPasswordLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '500',
  },
  passwordDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generatedPassword: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
    flex: 1,
  },
  passwordActions: {
    flexDirection: 'row',
  },
  passwordActionButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },

  // CUSTOM SLIDER STYLES
  optionContainer: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '500',
  },
  customSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#404040',
  },
  sliderTrackContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  sliderTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#404040',
    borderRadius: 3,
    position: 'relative',
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -7,
    width: 20,
    height: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    marginLeft: -10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 56,
  },
  sliderLabel: {
    color: '#888',
    fontSize: 12,
  },

  // Toggle Switch Styles
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#404040',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4A90E2',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  generatePasswordButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  generatePasswordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});