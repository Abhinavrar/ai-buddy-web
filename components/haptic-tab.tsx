import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

export function HapticTab({ onPressIn, style, ...rest }: any) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed }) : style,
        pressed && { opacity: 0.8 },
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}
