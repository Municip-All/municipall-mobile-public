import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Marker, type MapMarkerProps } from 'react-native-maps';
import { palette } from '@constants/design';
import type { ReportStatusDot } from '../lib/reportMapTypes';

export const MAP_PINS = {
  composte: require('../assets/map/ping_composte.png'),
  toilet: require('../assets/map/ping_toilet.png'),
  report: require('../assets/map/ping_reports.png'),
  transport: require('../assets/map/ping_transports.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export type MapPinKind = keyof typeof MAP_PINS;
export type { ReportStatusDot };

const STATUS_DOT_COLORS: Record<ReportStatusDot, string> = {
  orange: palette.amber400,
  blue: palette.info400,
  green: palette.matcha700,
  gray: palette.muted,
};

type MapPinMarkerProps = Omit<MapMarkerProps, 'image'> & {
  kind: MapPinKind;
  statusDot?: ReportStatusDot;
  badgeCount?: number;
  size?: number;
};

export default function MapPinMarker({
  kind,
  statusDot,
  badgeCount,
  size = 40,
  children,
  ...props
}: MapPinMarkerProps) {
  const showBadge = kind === 'report' && badgeCount != null && badgeCount > 1;

  return (
    <Marker {...props} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
      <View style={[styles.wrap, { width: size, height: size }]}>
        {showBadge ? (
          <View
            style={[
              styles.countBadge,
              {
                minWidth: size * 0.36,
                height: size * 0.36,
                borderRadius: size * 0.18,
                top: -size * 0.06,
                right: -size * 0.04,
              },
            ]}>
            <Text style={[styles.countBadgeText, { fontSize: size * 0.2 }]}>{badgeCount}</Text>
          </View>
        ) : null}
        {statusDot ? (
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: STATUS_DOT_COLORS[statusDot],
                top: size * 0.02,
                right: size * 0.08,
                width: size * 0.28,
                height: size * 0.28,
                borderRadius: size * 0.14,
              },
            ]}
          />
        ) : null}
        <Image
          source={MAP_PINS[kind]}
          style={{ width: size, height: size }}
          resizeMode='contain'
          accessible={false}
          accessibilityElementsHidden
        />
      </View>
      {children}
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusDot: {
    position: 'absolute',
    zIndex: 2,
    borderWidth: 2,
    borderColor: palette.cream50,
  },
  countBadge: {
    position: 'absolute',
    zIndex: 3,
    backgroundColor: palette.matcha700,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: palette.cream50,
  },
  countBadgeText: {
    color: palette.cream50,
    fontWeight: '800',
  },
});
