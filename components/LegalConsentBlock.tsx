import { View, Text, TouchableOpacity } from 'react-native';
import ExpoCheckbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { LEGAL_ENTITY } from '../constants/legalEntity';
import type { RouteHref } from '../lib/types';

type Props = {
  acceptedCgu: boolean;
  acceptedPrivacy: boolean;
  acceptedAge: boolean;
  onCguChange: (v: boolean) => void;
  onPrivacyChange: (v: boolean) => void;
  onAgeChange: (v: boolean) => void;
};

export default function LegalConsentBlock({
  acceptedCgu,
  acceptedPrivacy,
  acceptedAge,
  onCguChange,
  onPrivacyChange,
  onAgeChange,
}: Props) {
  const { primaryColor, classes, typeStyles, colors } = useAppTheme();
  const router = useRouter();

  const row = (checked: boolean, onChange: (v: boolean) => void, label: React.ReactNode) => (
    <View className='mb-3 flex-row items-start'>
      <ExpoCheckbox
        value={checked}
        onValueChange={onChange}
        color={checked ? primaryColor : undefined}
        style={{ marginTop: 2, marginRight: 10 }}
      />
      <Text className={`flex-1 text-xs leading-5`} style={{ color: colors.textBody }}>
        {label}
      </Text>
    </View>
  );

  const link = (text: string, href: string) => (
    <Text
      onPress={() => router.push(href as RouteHref)}
      className='font-bold underline'
      style={{ color: primaryColor }}>
      {text}
    </Text>
  );

  return (
    <View
      className='mt-2 rounded-2xl border p-4'
      style={{ borderColor: colors.border, backgroundColor: colors.card }}>
      <Text className={`mb-3 text-xs font-bold tracking-wide uppercase ${classes.meta}`} style={typeStyles.meta}>
        Consentements obligatoires
      </Text>
      {row(
        acceptedCgu,
        onCguChange,
        <>J&apos;ai lu et j&apos;accepte les {link("conditions d'utilisation", '/legal/cgu')}.</>
      )}
      {row(
        acceptedPrivacy,
        onPrivacyChange,
        <>
          J&apos;accepte la {link('politique de confidentialité', '/legal/privacy')} et le
          traitement de mes données conformément au RGPD.
        </>
      )}
      {row(
        acceptedAge,
        onAgeChange,
        <>
          Je certifie avoir au moins {LEGAL_ENTITY.minimumAge} ans (aucune autorisation parentale
          n&apos;est requise à partir de {LEGAL_ENTITY.minimumAge} ans pour utiliser ce service).
        </>
      )}
      <TouchableOpacity onPress={() => router.push('/legal')} className='mt-1'>
        <Text className={`text-xs`} style={{ color: colors.textSecondary }}>
          Voir tous les documents légaux →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
