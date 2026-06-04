import React, { useState } from 'react';
import { Alert, StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { appThemeOptions, useAppTheme } from '@/components/theme-context';
import { clearStoredIdentity } from '@/services/api';

const settingsOptions = [
  { label: 'Notifications', icon: 'bell.fill' as const },
  { label: 'Privacy', icon: 'hand.raised.fill' as const },
  { label: 'Help & Support', icon: 'questionmark.circle.fill' as const },
  { label: 'About', icon: 'info.circle.fill' as const },
];

const sectionDetails: Record<string, { title: string; body: string; items?: string[] }> = {
  Notifications: {
    title: 'General notifications',
    body: 'Stay in the loop with helpful updates that support your study flow without being distracting. AI Buddy can surface chat reminders, event alerts, and personality highlights so you always have context when you return.',
    items: [
      'Chat reply summaries and quick prompts',
      'Upcoming event reminders and calendar highlights',
      'New personality updates and feature tips',
    ],
  },
  Privacy: {
    title: 'Privacy & data',
    body: 'AI Buddy is designed as a private companion. Your conversations and preferences stay local to the app while we keep the experience smooth and personal for your learning and reflection.',
  },
  'Help & Support': {
    title: 'Help & Support',
    body: 'Need help? AI Buddy is here to assist you. Visit our support center to find answers to common questions, troubleshoot issues, and get in touch with our team if you need further assistance.',
  },
  About: {
    title: 'About AI Buddy',
    body: 'AI Buddy is a smart study and conversational partner built to help you stay focused, explore ideas, and keep your campus life organized. It blends personality-driven chat, event discovery, and a calm interface so you can learn, reflect, and connect with confidence.',
  },
};

export default function SettingsScreen() {
  const { themeName, setThemeName, colors } = useAppTheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await clearStoredIdentity();
      router.replace('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      Alert.alert('Sign out failed', String(err));
      setIsSigningOut(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Settings</ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Brightness & theme</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Choose a look that feels right for your study, social, or after-hours mood.
        </ThemedText>

        <View style={styles.themeBar}>
          {Object.values(appThemeOptions).map((option) => {
            const selected = themeName === option.label;

            return (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.themeOption,
                  { backgroundColor: option.colors.surface, borderColor: selected ? option.colors.tint : colors.border },
                  selected && styles.themeOptionActive,
                ]}
                onPress={() => setThemeName(option.label)}
              >
                <View style={[styles.themePreview, { backgroundColor: option.colors.tint }]} />
                <ThemedText style={[styles.themeOptionText, selected && { color: option.colors.text }]}>
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {settingsOptions.map((option) => {
          const isActive = activeSection === option.label;
          return (
            <TouchableOpacity
              key={option.label}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => setActiveSection(option.label)}
            >
              <IconSymbol name={option.icon} size={24} color={colors.icon} />
              <ThemedText style={styles.optionText}>{option.label}</ThemedText>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]} onPress={handleSignOut} disabled={isSigningOut}>
          <ThemedText style={styles.signOutText}>{isSigningOut ? 'Signing out...' : 'Sign Out'}</ThemedText>
        </TouchableOpacity>

        {activeSection ? (
          <ThemedView style={styles.detailCard}>
            <ThemedText type="subtitle" style={styles.detailTitle}>
              {sectionDetails[activeSection]?.title ?? activeSection}
            </ThemedText>
            <ThemedText style={styles.detailText}>{sectionDetails[activeSection]?.body ?? ''}</ThemedText>
            {sectionDetails[activeSection]?.items?.map((item) => (
              <View key={item} style={styles.detailItem}>
                <View style={[styles.bullet, { backgroundColor: colors.tint }]} />
                <ThemedText style={styles.detailText}>{item}</ThemedText>
              </View>
            ))}
          </ThemedView>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    color: '#64748B',
    lineHeight: 22,
  },
  optionActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  detailCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  detailTitle: {
    marginBottom: 10,
  },
  detailText: {
    color: '#475569',
    lineHeight: 22,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  themeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  themeOption: {
    width: '48%',
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  themeOptionActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeOptionText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    marginTop: 40,
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  disclaimerText: {
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
  },
});