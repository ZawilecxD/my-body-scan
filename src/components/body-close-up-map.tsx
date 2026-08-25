import { Platform } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import type { Region, Side } from '@/domain/landmarks';
import { CLOSE_UP_VIEWBOX, closeUpTargets } from '@/domain/map-layout';

const OPEN_ACCENT = '#3c87f7';

type BodyCloseUpMapProps = {
  region: Region;
  side: Side;
  openLandmarkIds: ReadonlySet<string>;
  onLandmarkPress: (landmarkId: string) => void;
};

export function BodyCloseUpMap({
  region,
  side,
  openLandmarkIds,
  onLandmarkPress,
}: BodyCloseUpMapProps) {
  const theme = useTheme();
  const pointerEvents = Platform.OS === 'android' ? 'box-none' : 'auto';
  const targets = closeUpTargets(region, side);

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${CLOSE_UP_VIEWBOX.width} ${CLOSE_UP_VIEWBOX.height}`}
      pointerEvents={pointerEvents}>
      {targets.map((target) => {
        const isOpen = openLandmarkIds.has(target.landmarkId);
        return (
          <G
            key={target.landmarkId}
            onPress={() => onLandmarkPress(target.landmarkId)}
            pointerEvents={pointerEvents}
            accessibilityLabel={`${target.label} · ${side}`}>
            <Circle
              cx={target.cx}
              cy={target.cy}
              r={target.r}
              fill={isOpen ? theme.backgroundSelected : theme.backgroundElement}
              stroke={isOpen ? OPEN_ACCENT : theme.textSecondary}
              strokeWidth={isOpen ? 2.5 : 1.5}
              pointerEvents={pointerEvents}
            />
            <SvgText
              x={target.cx}
              y={target.cy + 4}
              fill={theme.text}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
              pointerEvents="none">
              {target.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
