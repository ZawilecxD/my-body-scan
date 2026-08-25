import { Platform } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import type { Region, Side } from '@/domain/landmarks';
import {
  OVERVIEW_VIEWBOX,
  overviewMarkerPoints,
  overviewRegionPaths,
} from '@/domain/map-layout';

const OPEN_ACCENT = '#3c87f7';

const REGION_LABEL: Record<Region, string> = {
  head: 'Head',
  torso: 'Torso',
  arms: 'Arms',
  legs: 'Legs',
};

type BodyOverviewMapProps = {
  side: Side;
  openLandmarkIds: ReadonlySet<string>;
  onRegionPress: (region: Region) => void;
};

export function BodyOverviewMap({ side, openLandmarkIds, onRegionPress }: BodyOverviewMapProps) {
  const theme = useTheme();
  const pointerEvents = Platform.OS === 'android' ? 'box-none' : 'auto';
  const regions = overviewRegionPaths(side);
  const markers = overviewMarkerPoints(side).filter((point) =>
    openLandmarkIds.has(point.landmarkId),
  );

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${OVERVIEW_VIEWBOX.width} ${OVERVIEW_VIEWBOX.height}`}
      pointerEvents={pointerEvents}>
      {regions.map((regionPath) => (
        <Path
          key={regionPath.region}
          d={regionPath.d}
          fill={theme.backgroundElement}
          stroke={theme.textSecondary}
          strokeWidth={1.5}
          onPress={() => onRegionPress(regionPath.region)}
          pointerEvents={pointerEvents}
          accessibilityLabel={REGION_LABEL[regionPath.region]}
        />
      ))}
      {markers.map((marker) => (
        <Circle
          key={marker.landmarkId}
          cx={marker.cx}
          cy={marker.cy}
          r={5}
          fill={OPEN_ACCENT}
          pointerEvents="none"
        />
      ))}
    </Svg>
  );
}
