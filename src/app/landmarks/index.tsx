import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatLandmarkLabel,
  groupLandmarksByRegion,
  LANDMARKS,
  regionLabel,
} from '@/domain/landmarks';
import { useLocale } from '@/i18n/locale-context';

export default function LandmarksScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const groups = groupLandmarksByRegion(LANDMARKS);

  return (
    <>
      <Stack.Screen options={{ title: t('landmarks.title') }} />
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.list}>
          {groups.map((group) => (
            <ThemedView key={group.region} style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {regionLabel(group.region, t)}
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
                    <ThemedText>{formatLandmarkLabel(landmark, t)}</ThemedText>
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
