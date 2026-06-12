import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

import { ensureChatSession, getSavedAccount, getStoredDisplayName, getStoredPersonUid, refreshAppVariant, saveIdentity } from '@/services/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [savedDisplayName, setSavedDisplayName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
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

  useEffect(() => {
    let active = true;

    async function checkProfile() {
      const [displayName, savedAccount, uid] = await Promise.all([
        getStoredDisplayName(),
        getSavedAccount(),
        getStoredPersonUid(),
      ]);

      console.log('Login checkProfile:', { displayName, savedAccount, uid });

      if (!active) {
        return;
      }

      if (uid && savedAccount && savedAccount.username && savedAccount.password) {
        console.log('Auto-redirecting to home');
        router.replace('/(tabs)/home');
        return;
      }

      setSavedDisplayName(displayName ?? savedAccount?.displayName ?? null);
      if (savedAccount?.username) {
        setUsername(savedAccount.username);
      }
      setLoadingProfile(false);
    }

    void checkProfile();
    return () => {
      active = false;
    };
  }, []);

  async function onSignIn() {
    if (!username.trim()) {
      Alert.alert('Invalid user', 'Please enter your username.');
      return;
    }

    if (!password) {
      Alert.alert('Invalid user', 'Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      console.log('Logging in with:', { username: username.trim() });
      const savedAccount = await getSavedAccount();

      console.log('Retrieved saved account:', { savedAccount });

      // The saved account itself carries the personUid, so signing out
      // (which clears the active identity) must not block logging back in.
      if (!savedAccount?.personUid) {
        const msg = 'No saved profile - No account exists on this device. Please sign up first.';
        console.log(msg);
        Alert.alert('No saved profile', 'No account exists on this device. Please sign up first.');
        return;
      }

      console.log('Comparing credentials:', { 
        inputUsername: username.trim(), 
        savedUsername: savedAccount.username,
        match: username.trim() === savedAccount.username,
        passwordMatch: password === savedAccount.password 
      });

      if (username.trim() !== savedAccount.username || password !== savedAccount.password) {
        console.log('Credentials do not match');
        Alert.alert('Invalid user', 'The username or password is incorrect.');
        return;
      }

      console.log('Credentials match, restoring identity and opening home');
      await saveIdentity(savedAccount.personUid, savedAccount.displayName);
      await refreshAppVariant(savedAccount.personUid);
      await ensureChatSession(true);
      router.replace('/(tabs)/home');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Login error', msg);
    } finally {
      setBusy(false);
    }
  }

  const buttonLabel = savedDisplayName ? `Continue as ${savedDisplayName}` : 'Sign In';

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
          <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>

          <ThemedText style={styles.instruction}>
            Sign in to your AI Buddy account
          </ThemedText>

          <ThemedView style={styles.formContainer}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!busy}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                editable={!busy}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <TouchableOpacity
              style={[styles.loginButton, (busy || loadingProfile) && styles.loginButtonDisabled]}
              onPress={() => {
                onSignIn().catch(err => {
                  console.error('Unhandled login error:', err);
                  Alert.alert('Error', 'An unexpected error occurred');
                });
              }}
              disabled={busy || loadingProfile}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.loginButtonText}>{buttonLabel}</ThemedText>
              )}
            </TouchableOpacity>

            <ThemedView style={styles.footerContainer}>
              <ThemedText style={styles.footerText}>Don&apos;t have an account? </ThemedText>
              <Link href="/signup" asChild>
                <TouchableOpacity disabled={busy}>
                  <ThemedText style={styles.linkText}>Sign Up</ThemedText>
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
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
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
