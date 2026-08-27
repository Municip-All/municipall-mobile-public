import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TransportStopMarker } from '../services/transportService';
import { useTheme } from '@context/themecontext';
import { palette, softShadow } from '@constants/design';

type TransportMapCalloutProps = {
  visible: boolean;
  stop: TransportStopMarker | null;
  bottomInset?: number;
  onClose: () => void;
};

export default function TransportMapCallout({
  visible,
  stop,
  bottomInset = 0,
  onClose,
}: TransportMapCalloutProps) {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';

  if (!visible || !stop) return null;

  const disrupted = stop.status === 'disrupted';
  const statusColor = disrupted ? palette.amber400 : palette.matcha700;

  return (
    <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel='Fermer'
        accessibilityRole='button'
      />
      <View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(bottomInset, 16) + 12,
            backgroundColor: dark ? palette.nightSurface : palette.cream50,
          },
        ]}>
        <View
          style={[
            styles.handle,
            { backgroundColor: dark ? palette.nightBorder : palette.cream200 },
          ]}
        />
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: `${statusColor}22` }]}>
            <Ionicons name='bus' size={22} color={statusColor} />
          </View>
          <View style={styles.headerText}>
            <Text
              style={[styles.title, { color: dark ? palette.nightText : palette.matcha900 }]}
              numberOfLines={2}>
              {stop.name}
            </Text>
            {stop.modes.length > 0 ? (
              <Text style={[styles.subtitle, { color: dark ? palette.nightMuted : palette.muted }]}>
                {stop.modes.join(' · ')}
              </Text>
            ) : null}
          </View>
          <View style={[styles.pill, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.pillText, { color: statusColor }]}>
              {disrupted ? 'Perturbation' : 'Trafic normal'}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {stop.messages.length > 0 ? (
            stop.messages.map((msg, i) => (
              <Text
                key={`${stop.stopId}-msg-${i}`}
                style={[styles.message, { color: dark ? palette.nightText : palette.charcoal }]}>
                {msg}
              </Text>
            ))
          ) : (
            <Text
              style={[styles.messageMuted, { color: dark ? palette.nightMuted : palette.muted }]}>
              Aucune perturbation signalée sur cet arrêt pour le moment.
            </Text>
          )}
        </ScrollView>

        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityLabel='Fermer'
          accessibilityRole='button'>
          <Text
            style={[styles.closeBtnText, { color: dark ? palette.matcha300 : palette.matcha700 }]}>
            Fermer
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    maxHeight: '42%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...softShadow,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  body: {
    maxHeight: 160,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  messageMuted: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
