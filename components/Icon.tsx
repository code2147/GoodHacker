import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: object;
}

export default function Icon({ name, size = 40, style }: IconProps) {
  const iconColor = style?.color || colors.text;
  
  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name={name} size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});