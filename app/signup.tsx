import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { authService } from '../services/authService';
import { cityService } from '../services/cityService';
import { cityDisplayName } from '../lib/cityDisplay';
import ConvinceMayorModal from '@components/ConvinceMayorModal';
import CityNotListedChip from '@components/CityNotListedChip';
import { openReferCityEmail } from '../lib/referCity';
import BottomBar from '@components/BottomBar';
import LegalConsentBlock from '@components/LegalConsentBlock';
import LegalFooterLinks from '@components/LegalFooterLinks';
import { recordLegalConsent } from '../services/legalConsent';
import type { IconName, KeyboardType } from '../lib/types';

const SignupScreen: React.FC = () => {
  const { dark, primaryColor, colors, layoutStyles } = useAppTheme();
  const { config } = useCity();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [availableCities, setAvailableCities] = useState<
    { id: string; name: string; officialName?: string }[]
  >([]);
  const [citiesError, setCitiesError] = useState(false);
  const [showConvinceModal, setShowConvinceModal] = useState(false);

  const secondaryColor = config?.theme.secondaryColor || colors.info;
  const useGradient = config?.theme.useGradient ?? false;
  const appName = config?.name || "Municip'All";

  const { login: authLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadCities = async () => {
      try {
        const cities = await cityService.getAllCities();
        if (!cancelled) {
          setAvailableCities(cities);
          if (cities.length > 0) setSelectedCity(cities[0].id);
          setCitiesError(false);
        }
      } catch {
        if (!cancelled) setCitiesError(true);
      }
    };
    loadCities();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !username || !phone || !selectedCity) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer toutes les informations, y compris votre ville de résidence.'
      );
      return;
    }

    if (!acceptedCgu || !acceptedPrivacy || !acceptedAge) {
      Alert.alert(
        'Consentements requis',
        `Vous devez accepter les CGU, la politique de confidentialité et certifier avoir au moins 16 ans.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: username,
        surname: '',
        email,
        password,
        phone,
        cityId: selectedCity,
      };
      const { access_token, user } = await authService.signup(payload);
      await recordLegalConsent();
      await authLogin(access_token, user);

      Alert.alert('Succès', `Bienvenue ${user.name} ! Votre compte est créé.`);
      router.replace('/home');
    } catch {
      Alert.alert(
        "Échec de l'inscription",
        'Une erreur est survenue lors de la création du compte.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réessayer', onPress: handleRegister },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={layoutStyles.pageAuth}>
      <LinearGradient
        colors={[
          dark
            ? colors.semantic.surfaceAuth.dark
            : useGradient
              ? colors.palette.matcha100
              : colors.semantic.surfaceAuth.light,
          dark ? colors.card : colors.semantic.surfaceAuth.light,
        ]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {useGradient && (
        <>
          <View
            className='absolute rounded-full opacity-30 blur-3xl'
            style={{
              top: -50,
              left: -100,
              width: 300,
              height: 300,
              backgroundColor: secondaryColor,
            }}
          />
          <View
            className='absolute rounded-full opacity-20 blur-3xl'
            style={{
              bottom: -100,
              right: -50,
              width: 250,
              height: 250,
              backgroundColor: primaryColor,
            }}
          />
        </>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>
        <ScrollView
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 40),
            paddingBottom: Math.max(insets.bottom, 100),
            paddingHorizontal: 24,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View className='mt-10 mb-8 items-center justify-center'>
            <View
              className='mb-6 h-16 w-16 items-center justify-center rounded-[20px]'
              style={{
                backgroundColor: primaryColor,
                ...colors.softShadow,
              }}>
              <Ionicons name='business' size={30} color={colors.onPrimary} />
            </View>
            <Text
              className={`mb-2 text-center text-3xl font-extrabold tracking-tight ${dark ? 'text-night-text' : 'text-matcha-900'}`}>
              Rejoignez {appName}.
            </Text>
            <Text
              className={`text-center text-sm font-medium ${dark ? 'text-night-muted' : 'text-muted'}`}>
              Créez votre compte citoyen
            </Text>
          </View>

          <View className='w-full items-center'>
            <BlurView
              intensity={dark ? 20 : 60}
              tint={dark ? 'dark' : 'light'}
              className='border-cream-200 dark:border-night-border w-full overflow-hidden rounded-[20px] border p-6'>
              <View className='bg-cream-50/40 dark:bg-night-bg/20 pointer-events-none absolute inset-0' />

              {[
                {
                  placeholder: 'Identifiant',
                  value: username,
                  setter: setUsername,
                  icon: 'person-outline',
                  label: 'IDENTIFIANT',
                },
                {
                  placeholder: 'votre@email.fr',
                  value: email,
                  setter: setEmail,
                  icon: 'mail-outline',
                  keyboardType: 'email-address',
                  label: 'EMAIL',
                },
                {
                  placeholder: '••••••••',
                  value: password,
                  setter: setPassword,
                  icon: 'lock-closed-outline',
                  secure: true,
                  label: 'MOT DE PASSE',
                },
                {
                  placeholder: '06 12 34 56 78',
                  value: phone,
                  setter: setPhone,
                  icon: 'call-outline',
                  keyboardType: 'phone-pad',
                  label: 'TÉLÉPHONE',
                },
              ].map((input, index) => (
                <View key={index} className='mb-4'>
                  <Text
                    className={`mb-1.5 ml-1 text-xs font-semibold ${dark ? 'text-night-muted' : 'text-muted'}`}>
                    {input.label}
                  </Text>
                  <View
                    className={`flex-row items-center rounded-xl border px-4 py-3 ${dark ? 'border-night-border bg-night-surface' : 'border-cream-200 bg-cream-50'}`}>
                    <Ionicons
                      name={input.icon as IconName}
                      size={20}
                      color={colors.iconMuted}
                      className='mr-2'
                    />
                    <TextInput
                      value={input.value}
                      onChangeText={input.setter}
                      placeholder={input.placeholder}
                      keyboardType={input.keyboardType as KeyboardType}
                      secureTextEntry={input.secure}
                      autoCapitalize='none'
                      autoCorrect={false}
                      placeholderTextColor={colors.placeholder}
                      className={`ml-2 flex-1 px-0 text-base ${dark ? 'text-night-text' : 'text-matcha-900'}`}
                    />
                  </View>
                </View>
              ))}

              <View className='mt-2 mb-6'>
                <Text
                  className={`mb-3 ml-1 text-xs font-semibold ${dark ? 'text-night-muted' : 'text-muted'}`}>
                  MA VILLE DE RÉSIDENCE
                </Text>
                {citiesError ? (
                  <View className='items-center py-3'>
                    <Text className={`text-sm ${dark ? 'text-night-muted' : 'text-muted'}`}>
                      Impossible de charger les villes.
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          const cities = await cityService.getAllCities();
                          setAvailableCities(cities);
                          if (cities.length > 0) setSelectedCity(cities[0].id);
                          setCitiesError(false);
                        } catch {
                          setCitiesError(true);
                        }
                      }}
                      className='mt-2'>
                      <Text className='font-bold' style={{ color: primaryColor }}>
                        Réessayer
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className='flex-row flex-wrap gap-2'>
                    {availableCities.map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        onPress={() => setSelectedCity(city.id)}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor:
                            selectedCity === city.id
                              ? primaryColor
                              : dark
                                ? colors.palette.nightBorder
                                : colors.palette.cream200,
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderWidth: 1,
                          borderColor:
                            selectedCity === city.id
                              ? primaryColor
                              : dark
                                ? colors.palette.nightBorder
                                : colors.palette.cream200,
                        }}>
                        <Text
                          style={{
                            color: selectedCity === city.id ? colors.onPrimary : colors.iconMuted,
                            fontWeight: 'bold',
                            fontSize: 13,
                          }}>
                          {cityDisplayName(city)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <CityNotListedChip dark={dark} onPress={() => setShowConvinceModal(true)} />
                  </View>
                )}
              </View>

              <LegalConsentBlock
                acceptedCgu={acceptedCgu}
                acceptedPrivacy={acceptedPrivacy}
                acceptedAge={acceptedAge}
                onCguChange={setAcceptedCgu}
                onPrivacyChange={setAcceptedPrivacy}
                onAgeChange={setAcceptedAge}
              />

              <TouchableOpacity
                onPress={handleRegister}
                disabled={isSubmitting || !acceptedCgu || !acceptedPrivacy || !acceptedAge}
                activeOpacity={0.8}
                accessibilityRole='button'
                accessibilityLabel='Créer mon compte'
                className='shadow-soft mt-4 w-full flex-row items-center justify-center rounded-xl py-4'
                style={{
                  backgroundColor: primaryColor,
                  ...colors.softShadow,
                }}>
                {isSubmitting ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <Text className='mr-2 text-lg font-bold' style={{ color: colors.onPrimary }}>
                      Créer mon compte
                    </Text>
                    <Ionicons name='checkmark' size={20} color={colors.onPrimary} />
                  </>
                )}
              </TouchableOpacity>
            </BlurView>
            <LegalFooterLinks />
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          className={`absolute bottom-36 w-full flex-row justify-center py-4 ${dark ? 'bg-night-bg/80' : 'bg-cream-50/80'}`}
          accessibilityRole='button'
          accessibilityLabel='Se connecter'>
          <Text className={`text-[15px] font-medium ${dark ? 'text-night-muted' : 'text-muted'}`}>
            Vous avez déjà un compte ?{' '}
            <Text className='font-bold' style={{ color: primaryColor }}>
              Se connecter
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <ConvinceMayorModal
        visible={showConvinceModal}
        onClose={() => setShowConvinceModal(false)}
        onSendEmail={openReferCityEmail}
        dark={dark}
        primaryColor={primaryColor}
        bottomInset={insets.bottom}
      />

      <BottomBar />
    </View>
  );
};

export default SignupScreen;
