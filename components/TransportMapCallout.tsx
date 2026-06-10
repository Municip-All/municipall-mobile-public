import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TransportStopMarker } from '../services/transportService';

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
  if (!visible || !stop) return null;

  const disrupted = stop.status === 'disrupted';
  const statusColor = disrupted ? '#FF9500' : '#34C759';

  return (
    <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(bottomInset, 16) + 12 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: `${statusColor}22` }]}>
            <Ionicons name='bus' size={22} color={statusColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>
              {stop.name}
            </Text>
            {stop.modes.length > 0 ? (
              <Text style={styles.subtitle}>{stop.modes.join(' · ')}</Text>
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
              <Text key={`${stop.stopId}-msg-${i}`} style={styles.message}>
                {msg}
              </Text>
            ))
          ) : (
            <Text style={styles.messageMuted}>
              Aucune perturbation signalée sur cet arrêt pour le moment.
            </Text>
          )}
        </ScrollView>

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Fermer</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4D4D8',
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
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181B',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
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
    color: '#3F3F46',
    marginBottom: 8,
  },
  messageMuted: {
    fontSize: 14,
    lineHeight: 20,
    color: '#71717A',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B0080',
  },
});
