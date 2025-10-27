// Fallback for using MaterialIcons on Android and web.

import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof Ionicons>['name']>;
type IconSymbolName = string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home-outline',
  'house': 'home-outline',
  'book': 'book-outline',
  'person': 'person-outline',
  'paperplane.fill': 'paper-plane-outline',
  'chevron.left.forwardslash.chevron.right': 'code-outline',
  'chevron.right': 'chevron-forward',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 30,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || name; // Fallback to using the name directly if not in mapping
  return <Ionicons color={color} size={size} name={iconName as ComponentProps<typeof Ionicons>['name']} style={style} />;
}
