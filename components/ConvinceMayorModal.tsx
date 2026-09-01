import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';
import { palette } from '@constants/design';

type ConvinceMayorModalProps = {
  visible: boolean;
  onClose: () => void;
  onSendEmail: () => void;
  dark: boolean;
  primaryColor: string;
  bottomInset?: number;
};

export default function ConvinceMayorModal({
  visible,
  onClose,
  onSendEmail,
  dark,
  primaryColor,
  bottomInset = 0,
}: ConvinceMayorModalProps) {
  const { colors } = useAppTheme();

  if (!visible) return null;

  const handleSend = () => {
    onClose();
    onSendEmail();
  };

  return (
    <View style={styles.root} pointerEvents='box-none'>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel='Fermer'
        accessibilityRole='button'
      />
      <Pressable
        style={[
          styles.sheet,
          {
            marginBottom: bottomInset + 16,
            backgroundColor: colors.modalSheet,
            borderColor: colors.border,
          },
        ]}
        onPress={(e) => e.stopPropagation()}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: dark ? colors.primaryTint : palette.matcha100 },
          ]}>
          <Ionicons name='megaphone' size={28} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: dark ? palette.nightText : palette.matcha900 }]}>
          Votre commune n&apos;est pas listée ?
        </Text>

        <Text style={[styles.body, { color: dark ? palette.nightMuted : palette.muted }]}>
          Municip&apos;All est déployé commune par commune. Si la vôtre n&apos;apparaît pas encore
          dans la liste, vous pouvez suggérer la solution à votre maire — un email type est prêt à
          envoyer.
        </Text>

        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.85}
          accessibilityLabel='Envoyer un email à ma mairie'
          accessibilityRole='button'
          style={[styles.primaryBtn, { backgroundColor: primaryColor }]}>
          <Ionicons
            name='mail-outline'
            size={18}
            color={colors.onPrimary}
            style={styles.primaryBtnIcon}
          />
          <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>
            Envoyer un email à ma mairie
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          accessibilityLabel='Plus tard'
          accessibilityRole='button'>
          <Text
            style={[styles.secondaryBtnText, { color: dark ? palette.nightMuted : palette.muted }]}>
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
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 12,
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
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 8,
  },
  primaryBtnIcon: {
    marginRight: 8,
  },
  primaryBtnText: {
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
