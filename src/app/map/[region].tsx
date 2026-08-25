import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { REGION_ORDER, type Region, type Side } from '@/domain/landmarks';

function parseRegion(value: string | undefined): Region | null {
  if (value == null) {
    return null;
  }
  return REGION_ORDER.includes(value as Region) ? (value as Region) : null;
}

function parseSide(value: string | undefined): Side | null {
  if (value === 'front' || value === 'back') {
    return value;
  }
  return null;
}

function regionLabel(region: Region): string {
  return region.charAt(0).toUpperCase() + region.slice(1);
}

export default function MapRegionScreen() {
  const { region: regionParam, side: sideParam } = useLocalSearchParams<{
    region?: string | string[];
    side?: string | string[];
  }>();
  const regionValue = Array.isArray(regionParam) ? regionParam[0] : regionParam;
  const sideValue = Array.isArray(sideParam) ? sideParam[0] : sideParam;
  const region = parseRegion(regionValue);
  const side = parseSide(sideValue);

  if (region == null || side == null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Close-up' }} />
        <ThemedView style={styles.screen}>
          <ThemedText>
            Cannot open close-up: region or side is missing or unknown
            {regionValue == null ? '' : ` (region=${regionValue})`}
            {sideValue == null ? '' : ` (side=${sideValue})`}.
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${regionLabel(region)} · ${side}` }} />
      <ThemedView style={styles.screen}>
        <ThemedText themeColor="textSecondary">
          Close-up for {regionLabel(region)} · {side} will land in the next step.
        </ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
