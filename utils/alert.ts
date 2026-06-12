import { Alert, Platform } from 'react-native';

/**
 * react-native-web does not implement Alert.alert (it is a silent no-op),
 * so web builds must use window.alert for the message to be visible.
 */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
