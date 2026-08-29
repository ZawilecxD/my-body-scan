import { Fragment, useState } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import type { OverviewZoneId, Side } from '@/domain/landmarks';
import { overviewZoneLabel } from '@/domain/landmarks';
import {
  OVERVIEW_VIEWBOX,
  fitContain,
  overviewBadgePoint,
  overviewZonePaths,
} from '@/domain/map-layout';

const OPEN_ACCENT = '#3c87f7';

const FRONT_OVERVIEW = require('../../assets/body-map/front-overview.png') as number;
const BACK_OVERVIEW = require('../../assets/body-map/back-overview.png') as number;

/** Near-invisible fill so Android still hit-tests the region. */
const HIT_FILL = 'rgba(0,0,0,0.01)';

const BADGE_RADIUS = 36;

type Box = { width: number; height: number };

type BodyOverviewMapProps = {
  side: Side;
  openCounts: Readonly<Partial<Record<OverviewZoneId, number>>>;
  onZonePress: (zone: OverviewZoneId) => void;
};

export function BodyOverviewMap({ side, openCounts, onZonePress }: BodyOverviewMapProps) {
  const pointerEvents = Platform.OS === 'android' ? 'box-none' : 'auto';
  const [box, setBox] = useState<Box | null>(null);
  const fitted =
    box == null
      ? null
      : fitContain(box.width, box.height, OVERVIEW_VIEWBOX.width, OVERVIEW_VIEWBOX.height);
  const zones = overviewZonePaths(side);

  function onLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setBox((prev) =>
      prev != null && prev.width === width && prev.height === height ? prev : { width, height },
    );
  }

  return (
    <View style={styles.frame} onLayout={onLayout}>
      {fitted != null && fitted.width > 0 && fitted.height > 0 ? (
        <View style={{ width: fitted.width, height: fitted.height }}>
          <Image
            source={side === 'front' ? FRONT_OVERVIEW : BACK_OVERVIEW}
            style={{ width: fitted.width, height: fitted.height }}
            contentFit="contain"
            pointerEvents="none"
          />
          <Svg
            width={fitted.width}
            height={fitted.height}
            viewBox={`0 0 ${OVERVIEW_VIEWBOX.width} ${OVERVIEW_VIEWBOX.height}`}
            style={StyleSheet.absoluteFill}
            pointerEvents={pointerEvents}>
            {zones.map((zonePath) => (
              <Path
                key={zonePath.zone}
                d={zonePath.d}
                fill={HIT_FILL}
                stroke="none"
                onPress={() => onZonePress(zonePath.zone)}
                pointerEvents={pointerEvents}
                accessibilityLabel={overviewZoneLabel(zonePath.zone)}
              />
            ))}
            {zones.map((zonePath) => {
              const count = openCounts[zonePath.zone] ?? 0;
              if (count <= 0) {
                return null;
              }
              const point = overviewBadgePoint(side, zonePath.zone);
              const label = count > 99 ? '99+' : String(count);
              return (
                <Fragment key={`${zonePath.zone}-badge`}>
                  <Circle
                    cx={point.cx}
                    cy={point.cy}
                    r={BADGE_RADIUS}
                    fill={OPEN_ACCENT}
                    pointerEvents="none"
                  />
                  <SvgText
                    x={point.cx}
                    y={point.cy}
                    fill="#ffffff"
                    fontSize={28}
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="central"
                    pointerEvents="none">
                    {label}
                  </SvgText>
                </Fragment>
              );
            })}
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
