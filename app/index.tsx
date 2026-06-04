import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { getStoredPersonUid } from '@/services/api';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

export default function OnboardingScreen() {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);

  useEffect(() => {
    let active = true;

    async function checkSavedProfile() {
      const uid = await getStoredPersonUid();
      if (!active) {
        return;
      }
      if (uid) {
        router.replace('/(tabs)/home');
      }
    }

    void checkSavedProfile();

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

    return () => {
      active = false;
    };
  }, [fadeAnim, slideAnim]);

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <IconSymbol name="brain.head.profile" size={80} color="#4A90E2" style={styles.icon} />
        <ThemedText type="title" style={styles.title}>AI Buddy</ThemedText>

        <ThemedText style={styles.description}>
          Your companion for connecting with people and discovering events around you
        </ThemedText>

        <ThemedView style={styles.buttonContainer}>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.secondaryButton}>
            <Link href="/login" asChild>
              <ThemedText style={styles.secondaryButtonText}>I already have an account</ThemedText>
            </Link>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
    color: '#000',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});
