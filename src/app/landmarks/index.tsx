import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { groupLandmarksByRegion, LANDMARKS, type Region } from '@/domain/landmarks';

export default function LandmarksScreen() {
  const router = useRouter();
  const navigating = useRef(false);
  const groups = groupLandmarksByRegion(LANDMARKS);

  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
    }, []),
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Log injury' }} />
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.list}>
          {groups.map((group) => (
            <View key={group.region} style={styles.section}>
              <ThemedText type="labelMd" themeColor="textSecondary">
                {regionLabel(group.region)}
              </ThemedText>
              {group.landmarks.map((landmark) => (
                <Pressable
                  key={landmark.id}
                  accessibilityRole="button"
                  onPress={() => {
                    if (navigating.current) {
                      return;
                    }
                    navigating.current = true;
                    router.push({
                      pathname: '/injuries/new',
                      params: { landmarkId: landmark.id },
                    });
                  }}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <Card style={styles.rowCard}>
                    <ThemedText type="titleMd">{landmark.name}</ThemedText>
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {landmark.side === 'front' ? 'Front' : 'Back'}
                    </ThemedText>
                  </Card>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    </>
  );
}

function regionLabel(region: Region): string {
  return region.charAt(0).toUpperCase() + region.slice(1);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.spaceMd,
  },
  list: {
    gap: Spacing.spaceMd,
    paddingBottom: Spacing.spaceXl,
  },
  section: {
    gap: Spacing.spaceXs,
  },
  rowCard: {
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
