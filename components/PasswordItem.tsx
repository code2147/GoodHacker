import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Icon from './Icon'; // Your icon component or substitute

export default function PasswordItem({ password, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);

  async function copyToClipboard(value, label) {
    try {
      await Clipboard.setStringAsync(value);
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch (e) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.account}>{password.account}</Text>
        <Text style={styles.category}>{password.category}</Text>
      </View>

      {password.username ? (
        <View style={styles.row}>
          <Text style={styles.label}>Username/email:</Text>
          <Text style={styles.value}>{password.username}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(password.username, 'Username')}>
            <Icon name="copy-outline" size={20} style={styles.icon} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.label}>Password:</Text>
        <Text style={[styles.value, { flex: 1 }]}>
          {showPassword ? password.password : '••••••••'}
        </Text>
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => copyToClipboard(password.password, 'Password')}>
          <Icon name="copy-outline" size={20} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {password.website ? (
        <View style={styles.row}>
          <Text style={styles.label}>Website:</Text>
          <Text style={styles.value}>{password.website}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(password.website, 'Website')}>
            <Icon name="copy-outline" size={20} style={styles.icon} />
          </TouchableOpacity>
        </View>
      ) : null}

      {password.notes ? (
        <View style={[styles.row, { marginTop: 4 }]}>
          <Text style={styles.label}>Notes:</Text>
          <Text style={[styles.value, { flex: 1 }]}>{password.notes}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: '#5A5FFF' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#232636',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  account: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  category: {
    fontSize: 14,
    color: '#aaa',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#bbb',
    fontWeight: '600',
    width: 100,
  },
  value: {
    color: '#eee',
  },
  icon: {
    color: '#bbb',
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionBtn: {
    marginLeft: 25,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});