import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ConvinceMayorModalProps = {
  visible: boolean;
  onClose: () => void;
  onSendEmail: () => void;
  dark: boolean;
  primaryColor: string;
  bottomInset?: number;
};

/** Overlay plein écran — évite RN Modal (instable avec certains builds Expo/RN). */
export default function ConvinceMayorModal({
  visible,
  onClose,
  onSendEmail,
  dark,
  primaryColor,
  bottomInset = 0,
}: ConvinceMayorModalProps) {
  if (!visible) return null;

  const handleSend = () => {
    onClose();
    onSendEmail();
  };

  return (
    <View style={styles.root} pointerEvents='box-none'>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel='Fermer' />
      <Pressable
        style={[
          styles.sheet,
          {
            marginBottom: bottomInset + 16,
            backgroundColor: dark ? '#18181b' : '#ffffff',
            borderColor: dark ? '#3f3f46' : '#e4e4e7',
          },
        ]}
        onPress={(e) => e.stopPropagation()}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: dark ? 'rgba(99,102,241,0.15)' : '#eef2ff' },
          ]}>
          <Ionicons name='megaphone' size={28} color='#6366F1' />
        </View>

        <Text style={[styles.title, { color: dark ? '#fafafa' : '#18181b' }]}>
          Votre commune n&apos;est pas listée ?
        </Text>

        <Text style={[styles.body, { color: dark ? '#a1a1aa' : '#52525b' }]}>
          Municip&apos;All est déployé commune par commune. Si la vôtre n&apos;apparaît pas encore
          dans la liste, vous pouvez suggérer la solution à votre maire — un email type est prêt à
          envoyer.
        </Text>

        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.85}
          style={[styles.primaryBtn, { backgroundColor: primaryColor }]}>
          <Ionicons name='mail-outline' size={18} color='#fff' style={styles.primaryBtnIcon} />
          <Text style={styles.primaryBtnText}>Envoyer un email à ma mairie</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.secondaryBtn} activeOpacity={0.7}>
          <Text style={[styles.secondaryBtnText, { color: dark ? '#a1a1aa' : '#71717a' }]}>
            Plus tard
          </Text>
        </TouchableOpacity>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  primaryBtnIcon: {
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
