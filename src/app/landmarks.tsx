import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { groupLandmarksByRegion, LANDMARKS, type Region } from '@/domain/landmarks';

export default function LandmarksScreen() {
  const router = useRouter();
  const groups = groupLandmarksByRegion(LANDMARKS);

  return (
    <>
      <Stack.Screen options={{ title: 'Log injury' }} />
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.list}>
          {groups.map((group) => (
            <ThemedView key={group.region} style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {regionLabel(group.region)}
              </ThemedText>
              {group.landmarks.map((landmark) => (
                <Pressable
                  key={landmark.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.replace({
                      pathname: '/injuries/new',
                      params: { landmarkId: landmark.id },
                    })
                  }
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <ThemedView type="backgroundElement" style={styles.rowInner}>
                    <ThemedText>
                      {landmark.name} · {landmark.side}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </ThemedView>
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
    padding: Spacing.three,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
  },
  rowInner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
