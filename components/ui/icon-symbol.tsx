// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'message.fill': 'message',
  'face.smiling.fill': 'mood',
  'face.smiling': 'sentiment-satisfied',
  'person.fill': 'person',
  'exclamationmark.triangle.fill': 'warning',
  'flame.fill': 'local-fire-department',
  'chart.bar.fill': 'bar-chart',
  'gear': 'settings',
  'checkmark.circle.fill': 'check-circle',
  'figure.walk': 'directions-walk',
  'bell.fill': 'notifications',
  'hand.raised.fill': 'privacy-tip',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'brain.head.profile': 'psychology',
  'calendar': 'calendar-today',
  'cube': 'category',
  'square.and.arrow.up': 'share',
  'trash': 'delete',
  'ellipsis': 'more-vert',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
