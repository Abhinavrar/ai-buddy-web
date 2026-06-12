/* eslint-disable react-hooks/set-state-in-effect */
import { ChatBubble } from '@/components/chat-bubble';
import { ChatInput } from '@/components/chat-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getPersonalityName, Message } from '@/constants/mock-data';
import {
    clearSessionId,
    ensureChatSession,
    getStoredChatHistory,
    getStoredPersonUid,
    patchPersonality,
    saveChatHistory,
    sendChatMessage,
    uiPersonalityToApi,
} from '@/services/api';
import { showAlert } from '@/utils/alert';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const personalities = ['Calm', 'Sassy', 'Sarcastic', 'Motivational', 'Friendly'];

function normalizePersonality(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalized = String(rawValue || 'friendly').toLowerCase();
  return personalities.some((item) => item.toLowerCase() === normalized) ? normalized : 'friendly';
}

export default function ChatScreen() {
  const { personality = 'friendly' } = useLocalSearchParams();
  const routePersonality = normalizePersonality(personality);
  const [selectedPersonality, setSelectedPersonality] = useState(routePersonality);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [personUid, setPersonUid] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const bootstrap = useCallback(async (personalityLabel: string) => {
    const uid = await getStoredPersonUid();
    if (!uid) {
      showAlert('Sign up required', 'Create an account so we can save your Person ID on this device.');
      setSessionReady(false);
      return;
    }
    setPersonUid(uid);
    const { personUid: p, sessionId: sid } = await ensureChatSession(true);
    setSessionId(sid);
    try {
      await patchPersonality(p, uiPersonalityToApi(personalityLabel));
    } catch {
      // Personality sync is cosmetic - never block the chat on it.
    }
    setSessionReady(true);
  }, []);

  useEffect(() => {
    setSelectedPersonality(routePersonality);
    setShowDropdown(false);
  }, [routePersonality]);

  useEffect(() => {
    let cancelled = false;

    const loadChatHistory = async () => {
      try {
        const uid = await getStoredPersonUid();
        if (!uid) {
          return;
        }
        const saved = await getStoredChatHistory(uid);
        if (saved && !cancelled && Array.isArray(saved)) {
          setMessages(saved as Message[]);
        }
      } catch {
        // ignore corrupted stored history
      }
    };

    (async () => {
      await loadChatHistory();
      setSessionReady(false);
      // Mobile browsers kill in-flight requests when the tab is backgrounded,
      // so the first attempt often fails right after returning to the app.
      // Retry silently behind the "Connecting..." indicator; only alert when
      // the connection is genuinely down.
      const delaysMs = [0, 2000, 5000, 10000];
      for (let attempt = 0; attempt < delaysMs.length && !cancelled; attempt++) {
        if (delaysMs[attempt]) {
          await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
        }
        try {
          await bootstrap(routePersonality);
          return;
        } catch (e) {
          if (attempt === delaysMs.length - 1 && !cancelled) {
            const msg = e instanceof Error ? e.message : String(e);
            showAlert('Cannot start chat', `Please check your internet connection and try again.\n\nDetails: ${msg}`);
            setSessionReady(false);
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrap, routePersonality]);

  const updatePersonalityOnServer = useCallback(
    async (label: string) => {
      const uid = personUid ?? (await getStoredPersonUid());
      if (!uid) {
        showAlert('Sign up required', 'Create an account so we can save your Person ID on this device.');
        return;
      }
      try {
        await patchPersonality(uid, uiPersonalityToApi(label));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        showAlert('Personality update failed', msg);
      }
    },
    [personUid]
  );

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    if (!personUid) {
      return;
    }
    saveChatHistory(personUid, messages).catch(() => null);
  }, [messages, personUid]);

  const handlePersonalityChange = (newPersonality: string) => {
    const label = newPersonality.toLowerCase();
    setSelectedPersonality(label);
    setShowDropdown(false);
    void updatePersonalityOnServer(label);
  };

  async function sendWithRecovery(text: string) {
    let uid = personUid;
    let sid = sessionId;
    if (uid == null || sid == null) {
      const ctx = await ensureChatSession(true);
      uid = ctx.personUid;
      sid = ctx.sessionId;
      setPersonUid(uid);
      setSessionId(sid);
    }
    return sendChatMessage(uid!, sid!, text, true);
  }

  const handleSendMessage = async (message: string) => {
    if (!sessionReady) {
      showAlert('Not ready', 'Connecting to the server… try again in a moment.');
      return;
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      message,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    try {
      const reply = await sendWithRecovery(message);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: reply.output,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (reply.session_should_end) {
        await clearSessionId();
        setSessionId(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Invalid session_id') || msg.includes('session has already ended')) {
        await clearSessionId();
        try {
          const ctx = await ensureChatSession(true);
          setSessionId(ctx.sessionId);
          const reply = await sendChatMessage(ctx.personUid, ctx.sessionId, message, true);
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            message: reply.output,
            isUser: false,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } catch (err2) {
          showAlert('Send failed', String(err2));
        }
      } else {
        showAlert('Send failed', `Your message could not be sent. Please try again.\n\nDetails: ${msg}`);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileContainer}>
            <ThemedText style={styles.profileEmoji}>🤖</ThemedText>
          </View>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>AI Buddy</ThemedText>
            <ThemedText style={styles.subtitle}>{getPersonalityName(selectedPersonality)}</ThemedText>
            {!sessionReady && (
              <ThemedText style={styles.connectingText}>Connecting…</ThemedText>
            )}
          </View>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <IconSymbol name="chevron.right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {showDropdown && (
          <View style={styles.dropdown}>
            <ScrollView>
              {personalities.map((pers) => (
                <TouchableOpacity
                  key={pers}
                  style={styles.dropdownItem}
                  onPress={() => handlePersonalityChange(pers)}
                >
                  <ThemedText style={styles.dropdownText}>{pers}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ThemedView>

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item.message} isUser={item.isUser} />
          )}
          contentContainerStyle={[styles.messagesContainer, messages.length > 0 && styles.messagesList]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={null}
        />
      </View>
      {sending ? (
        <View style={styles.sendingBar}>
          <ActivityIndicator size="small" color="#075E54" />
          <ThemedText style={styles.sendingText}> Waiting for Buddy…</ThemedText>
        </View>
      ) : null}
      <ChatInput onSendMessage={handleSendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#075E54',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileEmoji: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 2,
  },
  connectingText: {
    fontSize: 12,
    color: '#B2DFDB',
    marginTop: 4,
  },
  dropdownButton: {
    padding: 5,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#E5DDD5',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#E5DDD5',
  },
  sendingText: {
    color: '#444',
    fontSize: 14,
  },
});
