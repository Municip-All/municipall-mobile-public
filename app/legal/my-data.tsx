import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { useCityLegalContext } from '@hooks/useCityLegalContext';

type Action = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
};

export default function LegalMyDataScreen() {
  const { dark, classes, primaryColor, colors } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cityLegal = useCityLegalContext();

  if (!isAuthenticated || !user) {
    router.replace('/login');
    return null;
  }

  const mailto = (subject: string, body: string) => {
    const url = `mailto:${LEGAL_ENTITY.privacyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('E-mail', `Écrivez à ${LEGAL_ENTITY.privacyEmail}`);
    });
  };

  const actions: Action[] = [
    {
      title: 'Accéder et rectifier mes données',
      description: 'Modifier nom, e-mail, quartier et ville de résidence.',
      icon: 'create-outline',
      color: '#007AFF',
      onPress: () => router.push('/profile-personal-info'),
    },
    {
      title: 'Exporter mes données',
      description: 'Demande de copie de vos données (réponse sous 1 mois).',
      icon: 'download-outline',
      color: '#34C759',
      onPress: () =>
        mailto(
          "Demande d'accès / portabilité RGPD — Municip'All",
          `Bonjour,\n\nJe souhaite recevoir une copie de mes données personnelles associées au compte : ${user.email} (ID ${user.id}).\n\nCordialement,\n${user.name} ${user.surname}`,
        ),
    },
    {
      title: 'Supprimer mon compte',
      description: 'Demande d\'effacement définitif de votre compte et données associées.',
      icon: 'trash-outline',
      color: '#FF3B30',
      onPress: () => {
        Alert.alert(
          'Suppression du compte',
          `La suppression est traitée par notre équipe sous 30 jours maximum. Un e-mail de confirmation vous sera envoyé à ${user.email}.`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Envoyer la demande',
              style: 'destructive',
              onPress: () => {
                mailto(
                  "Demande de suppression de compte — Municip'All",
                  `Bonjour,\n\nJe demande la suppression définitive de mon compte et de mes données personnelles.\n\nCompte : ${user.email} (ID ${user.id})\n\nCordialement,\n${user.name} ${user.surname}`,
                );
              },
            },
            {
              text: 'Demander et se déconnecter',
              style: 'destructive',
              onPress: async () => {
                mailto(
                  "Demande de suppression de compte — Municip'All",
                  `Bonjour,\n\nJe demande la suppression définitive de mon compte.\n\nCompte : ${user.email} (ID ${user.id})\n\nCordialement,\n${user.name} ${user.surname}`,
                );
                await logout();
                router.replace('/login');
              },
            },
          ],
        );
      },
    },
    {
      title: 'Opposition / limitation',
      description: 'Notifications, prospection ou traitement spécifique.',
      icon: 'hand-left-outline',
      color: '#FF9500',
      onPress: () =>
        mailto(
          'Demande RGPD (opposition / limitation)',
          `Bonjour,\n\nJe souhaite exercer mon droit d'opposition ou de limitation concernant le compte ${user.email}.\n\nPrécision de ma demande :\n\n`,
        ),
    },
    {
      title: 'Réclamation CNIL',
      description: 'Autorité de contrôle française des données personnelles.',
      icon: 'flag-outline',
      color: '#5856D6',
      onPress: () => Linking.openURL(LEGAL_ENTITY.cnilComplaintUrl),
    },
  ];

  return (
    <View className={`flex-1 ${classes.page}`}>
      <ProfileScreenHeader title='Mes données personnelles' />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 8,
        }}>
        <Text className={`mb-4 ${classes.body}`}>
          Conformément au RGPD, vous contrôlez vos données. Les actions ci-dessous vous permettent
          d&apos;exercer vos droits. Contact DPO : {LEGAL_ENTITY.dpoEmail}
        </Text>

        <View className={`mb-6 rounded-2xl p-4 ${classes.listGroup}`}>
          <Text className={classes.meta}>Données associées à votre compte</Text>
          <Text className={`mt-2 text-sm ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
            {user.name} {user.surname} — {user.email}
          </Text>
          {cityLegal.cityName ? (
            <Text className={`mt-1 text-xs ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Commune : {cityLegal.cityName}
            </Text>
          ) : null}
          {cityLegal.dataRetentionPolicy ? (
            <Text className={`mt-3 text-xs leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Durées contractuelles : {cityLegal.dataRetentionPolicy}
            </Text>
          ) : null}
        </View>

        <View className={`overflow-hidden rounded-[24px] ${classes.listGroup}`}>
          {actions.map((action, i) => (
            <TouchableOpacity
              key={action.title}
              onPress={action.onPress}
              className={`flex-row items-center p-4 ${i < actions.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View
                className='mr-3 h-9 w-9 items-center justify-center rounded-lg'
                style={{ backgroundColor: `${action.color}15` }}>
                <Ionicons name={action.icon} size={20} color={action.color} />
              </View>
              <View className='flex-1'>
                <Text className={`text-sm font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {action.title}
                </Text>
                <Text className={`mt-0.5 text-xs ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {action.description}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/legal/privacy')}
          className='mt-6 items-center py-3'>
          <Text style={{ color: primaryColor }} className='text-sm font-bold'>
            Lire la politique de confidentialité complète
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
