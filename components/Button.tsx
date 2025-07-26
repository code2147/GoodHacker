import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,    // Button background color
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',                // **Fixed: Force white text for visibility**
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default function Button({
  text,
  onPress,
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}