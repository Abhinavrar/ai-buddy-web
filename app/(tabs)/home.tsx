import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const personalities = [
  {
    id: 'calm',
    name: 'Calm Companion',
    status: 'Available for mindful chats',
    initials: 'CC',
    color: '#5A72E8',
    lightColor: '#E7EEFF',
  },
  {
    id: 'sassy',
    name: 'Sassy Spirit',
    status: 'Feeling fabulous',
    initials: 'SS',
    color: '#D5458C',
    lightColor: '#F7D7EE',
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic Sage',
    status: 'Ready with sarcasm',
    initials: 'Sa',
    color: '#FF8F3F',
    lightColor: '#FFF1E3',
  },
  {
    id: 'motivational',
    name: 'Motivational Mentor',
    status: 'Fueling your fire',
    initials: 'MM',
    color: '#2EBE76',
    lightColor: '#E8F8EF',
  },
  {
    id: 'friendly',
    name: 'Friendly Companion',
    status: 'Always here for you',
    initials: 'FC',
    color: '#6C9AEB',
    lightColor: '#E5EDFF',
  },
];

export default function HomeScreen() {
  const animatedValues = useMemo(
    () =>
      personalities.map(() => ({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(50),
        scale: new Animated.Value(1),
      })),
    []
  );

  useEffect(() => {
    const animations = animatedValues.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(100, animations).start();
  }, [animatedValues]);

  const handlePressIn = (index: number) => {
    Animated.spring(animatedValues[index].scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(animatedValues[index].scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Chats</ThemedText>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="gear" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contactsContainer}>
          {personalities.map((personality, index) => {
            const animatedStyle = {
              opacity: animatedValues[index].opacity,
              transform: [
                { translateY: animatedValues[index].translateY },
                { scale: animatedValues[index].scale }
              ],
            };

            return (
              <Animated.View key={personality.id} style={[animatedStyle, styles.animatedItem]}>
                <Link
                  href={{
                    pathname: '/chat',
                    params: { personality: personality.id }
                  }}
                  asChild
                >
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPressIn={() => handlePressIn(index)}
                    onPressOut={() => handlePressOut(index)}
                  >
                    <View style={[styles.avatarContainer, { backgroundColor: personality.lightColor, borderColor: personality.color }]}> 
                      <View style={[styles.avatarInner, { backgroundColor: personality.color }]}> 
                        <ThemedText style={styles.avatarInitials}>{personality.initials}</ThemedText>
                      </View>
                    </View>

                    <View style={styles.contactInfo}>
                      <ThemedText style={styles.contactName}>{personality.name}</ThemedText>
                      <ThemedText style={styles.contactStatus}>{personality.status}</ThemedText>
                    </View>

                    <View style={styles.timeContainer}>
                      <ThemedText style={styles.timeText}>now</ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#075E54',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  actionButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contactsContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  animatedItem: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    flex: 1,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});