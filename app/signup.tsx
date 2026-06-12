import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

import { createPerson, saveAccount, saveAppVariant, saveIdentity, uiPersonalityToApi } from '@/services/api';
import { showAlert } from '@/utils/alert';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  async function onCreateAccount() {
    if (!username.trim()) {
      showAlert('Username required', 'Please enter a username to continue.');
      return;
    }

    if (!password) {
      showAlert('Password required', 'Please enter a password to continue.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'Please make sure both password fields match.');
      return;
    }

    setSubmitting(true);
    try {
      const displayName = username.trim();
      const personality = uiPersonalityToApi('friendly');
      console.log('Creating person with displayName:', displayName);
      const person = await createPerson(displayName, personality);
      console.log('Person created:', person);

      await saveIdentity(person.person_uid, person.display_name);
      await saveAppVariant(person.app_variant);
      console.log('Identity saved, variant:', person.app_variant);
      
      const accountToSave = {
        username: displayName,
        password,
        personUid: person.person_uid,
        displayName: person.display_name,
      };
      console.log('Saving account:', accountToSave);
      await saveAccount(accountToSave);
      console.log('Account saved successfully');
      
      router.replace('/(tabs)/home');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showAlert(
        'Could not reach server',
        `Please check your internet connection and try again in a moment.\n\nDetails: ${msg}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <IconSymbol name="brain.head.profile" size={60} color="#4A90E2" style={styles.icon} />
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>

          <ThemedText style={styles.instruction}>
            Sign up to get started with AI Buddy
          </ThemedText>

          <ThemedView style={styles.formContainer}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!submitting}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter a strong password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                editable={!submitting}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!submitting}
              />
            </ThemedView>

            <TouchableOpacity
              style={[styles.createButton, submitting && styles.createButtonDisabled]}
              onPress={onCreateAccount}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.createButtonText}>Create Account</ThemedText>
              )}
            </TouchableOpacity>

            <ThemedView style={styles.footerContainer}>
              <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
              <Link href="/" asChild>
                <TouchableOpacity disabled={submitting}>
                  <ThemedText style={styles.linkText}>Sign In</ThemedText>
                </TouchableOpacity>
              </Link>
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  passwordHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});
