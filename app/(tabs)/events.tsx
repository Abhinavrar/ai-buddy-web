/* eslint-disable react-hooks/set-state-in-effect */
import { useAppTheme } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EventItemOut, getApiBaseUrl, listEvents } from '@/services/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const tagColors = ['#6C5CE7', '#00B894', '#FD79A8', '#0984E3', '#FDCB6E', '#E17055'];

type EventCard = {
  id: string;
  title: string;
  dateKey: string;
  dateLabel: string;
  dayLabel: string;
  dayDate: string;
  time: string;
  location: string;
  tag: string;
  color: string;
  url?: string | null;
};

type EventSection = {
  title: string;
  description: string;
  events: EventCard[];
};

function parseEventDate(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeTime(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return 'Time TBA';
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : raw;
}

function eventDateKey(date: Date | null, fallback?: string | null) {
  if (!date) return String(fallback || 'unknown');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function eventDateLabel(date: Date | null, fallback?: string | null) {
  if (!date) return String(fallback || 'Date TBA');
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function eventDayLabel(date: Date | null) {
  return date ? date.toLocaleDateString(undefined, { weekday: 'short' }) : 'TBA';
}

function eventDayDate(date: Date | null) {
  return date ? String(date.getDate()) : '--';
}

function colorForTag(tag: string) {
  const seed = tag.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tagColors[seed % tagColors.length];
}

function toEventCard(event: EventItemOut, index: number): EventCard {
  const date = parseEventDate(event.starts_at || event.date);
  const tag = event.category || 'Event';
  return {
    id: event.event_instance_key || `${event.title || 'event'}-${index}`,
    title: event.title || 'Untitled event',
    dateKey: eventDateKey(date, event.date),
    dateLabel: eventDateLabel(date, event.date),
    dayLabel: eventDayLabel(date),
    dayDate: eventDayDate(date),
    time: normalizeTime(event.time),
    location: event.location || 'Location TBA',
    tag,
    color: colorForTag(tag),
    url: event.url,
  };
}

function dedupeEvents(events: EventCard[]) {
  const byWhenAndTitle = new Map<string, EventCard>();
  for (const event of events) {
    const key = `${event.title.toLowerCase()}|${event.dateKey}|${event.time}`;
    const current = byWhenAndTitle.get(key);
    if (!current) {
      byWhenAndTitle.set(key, event);
      continue;
    }
    const currentHasLocation = current.location !== 'Location TBA';
    const eventHasLocation = event.location !== 'Location TBA';
    if ((!currentHasLocation && eventHasLocation) || (!current.url && event.url)) {
      byWhenAndTitle.set(key, event);
    }
  }
  return Array.from(byWhenAndTitle.values());
}

function groupEvents(events: EventCard[]): EventSection[] {
  const groups = new Map<string, EventCard[]>();
  for (const event of events) {
    const key = event.tag || 'Events';
    groups.set(key, [...(groups.get(key) || []), event]);
  }
  return Array.from(groups.entries()).map(([title, items]) => ({
    title,
    description: `${items.length} upcoming ${items.length === 1 ? 'event' : 'events'} from Supabase.`,
    events: items,
  }));
}

export default function EventsScreen() {
  const { colors } = useAppTheme();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const headerAnim = useMemo(() => new Animated.Value(0), []);
  const cardAnimValues = useMemo(
    () => Array.from({ length: 100 }, () => new Animated.Value(0)),
    []
  );

  const loadSupabaseEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const items = await listEvents(80);
      const mapped = dedupeEvents(items.map(toEventCard))
        .sort((a, b) => `${a.dateKey} ${a.time} ${a.title}`.localeCompare(`${b.dateKey} ${b.time} ${b.title}`));
      setEvents(mapped);
      setSelectedDateKey((current) => current && mapped.some((event) => event.dateKey === current) ? current : mapped[0]?.dateKey ?? null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(`${message}\nAPI: ${getApiBaseUrl()}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSupabaseEvents();
  }, [loadSupabaseEvents]);

  const calendarDays = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((event) => {
        if (seen.has(event.dateKey)) return false;
        seen.add(event.dateKey);
        return true;
      })
      .slice(0, 7)
      .map((event) => ({ label: event.dayLabel, date: event.dayDate, key: event.dateKey }));
  }, [events]);

  const eventSections = useMemo(() => groupEvents(events), [events]);
  const dailyEvents = selectedDateKey ? events.filter((event) => event.dateKey === selectedDateKey) : events.slice(0, 5);

  useEffect(() => {
    headerAnim.setValue(0);
    cardAnimValues.forEach((anim) => anim.setValue(0));

    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.stagger(
        80,
        cardAnimValues.slice(0, Math.max(dailyEvents.length, events.length)).map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, [headerAnim, cardAnimValues, selectedDateKey, viewMode, dailyEvents.length, events.length]);

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const renderCardAnimation = (index: number) => ({
    opacity: cardAnimValues[index] ?? 1,
    transform: [
      {
        translateY: (cardAnimValues[index] ?? new Animated.Value(1)).interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  });

  const openEvent = (event: EventCard) => {
    if (event.url) {
      void Linking.openURL(event.url);
    }
  };

  const renderEventCard = (event: EventCard, index: number) => (
    <Animated.View key={event.id} style={[styles.eventCard, renderCardAnimation(index), { backgroundColor: colors.surface }]}>
      <View style={[styles.eventAccent, { backgroundColor: event.color }]} />
      <TouchableOpacity style={styles.eventBody} onPress={() => openEvent(event)} disabled={!event.url}>
        <ThemedText type="defaultSemiBold" style={styles.eventTitle}>{event.title}</ThemedText>
        <ThemedText style={[styles.eventMeta, { color: colors.muted }]}>{event.time} - {event.location}</ThemedText>
        <ThemedText style={[styles.eventMeta, { color: colors.muted }]}>{event.dateLabel}</ThemedText>
        <View style={[styles.eventTagContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.eventTag, { color: colors.text }]}>{event.tag}</ThemedText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <ThemedText type="title" style={styles.title}>Events</ThemedText>
          </View>
          <TouchableOpacity style={[styles.iconCircle, { backgroundColor: colors.tint }]} onPress={loadSupabaseEvents}>
            <IconSymbol name="calendar" size={24} color={colors.surface} />
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
          {['calendar', 'list'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.toggleButton,
                viewMode === mode && { backgroundColor: colors.tint },
              ]}
              onPress={() => setViewMode(mode as 'calendar' | 'list')}
            >
              <ThemedText
                style={[
                  styles.toggleText,
                  { color: colors.text },
                  viewMode === mode && { color: colors.surface },
                ]}
              >
                {mode === 'calendar' ? 'Calendar' : 'List'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.tint} />
            <ThemedText style={[styles.stateText, { color: colors.muted }]}>Loading Supabase events...</ThemedText>
          </View>
        ) : error ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText type="defaultSemiBold" style={styles.stateTitle}>Could not load events</ThemedText>
            <ThemedText style={[styles.stateText, { color: colors.muted }]}>{error}</ThemedText>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.tint }]} onPress={loadSupabaseEvents}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : events.length === 0 ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText type="defaultSemiBold" style={styles.stateTitle}>No upcoming events</ThemedText>
            <ThemedText style={[styles.stateText, { color: colors.muted }]}>Supabase did not return upcoming rows yet.</ThemedText>
          </View>
        ) : viewMode === 'calendar' ? (
          <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Upcoming dates</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
              {calendarDays.map((day) => {
                const selected = day.key === selectedDateKey;
                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayChip,
                      { backgroundColor: selected ? colors.tint : colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setSelectedDateKey(day.key)}
                  >
                    <ThemedText style={[styles.dayLabel, { color: colors.text }, selected && { color: colors.surface }]}>
                      {day.label}
                    </ThemedText>
                    <ThemedText style={[styles.dayDate, { color: colors.text }, selected && { color: colors.surface }]}>
                      {day.date}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {dailyEvents.length > 0 ? (
              dailyEvents.map(renderEventCard)
            ) : (
              <ThemedText style={styles.emptyText}>No events found for this date.</ThemedText>
            )}
          </View>
        ) : (
          <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {eventSections.map((section, sectionIndex) => (
              <View key={section.title} style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</ThemedText>
                  <ThemedText style={[styles.sectionDescription, { color: colors.muted }]}>{section.description}</ThemedText>
                </View>
                {section.events.map((event, index) => {
                  const cardIndex = sectionIndex * 8 + index;
                  return (
                    <TouchableOpacity key={event.id} onPress={() => openEvent(event)} disabled={!event.url}>
                      <Animated.View style={[styles.eventRow, renderCardAnimation(cardIndex), { borderColor: colors.border }]}>
                        <View style={[styles.rowDot, { backgroundColor: event.color }]} />
                        <View style={styles.rowContent}>
                          <ThemedText type="defaultSemiBold" style={styles.eventTitle}>{event.title}</ThemedText>
                          <ThemedText style={[styles.eventMeta, { color: colors.muted }]}>{event.dateLabel} - {event.time}</ThemedText>
                          <ThemedText style={[styles.eventMeta, { color: colors.muted }]}>{event.location}</ThemedText>
                        </View>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    maxWidth: '75%',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },
  toggleText: {
    fontWeight: '600',
  },
  calendarCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  dayRow: {
    marginBottom: 18,
  },
  dayChip: {
    width: 68,
    height: 78,
    marginRight: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventAccent: {
    width: 5,
  },
  eventBody: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    marginBottom: 8,
  },
  eventMeta: {
    marginBottom: 6,
  },
  eventTagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  eventTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
  },
  listContainer: {
    borderRadius: 24,
    padding: 20,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionDescription: {
    marginTop: 4,
    lineHeight: 20,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  stateCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  stateTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
