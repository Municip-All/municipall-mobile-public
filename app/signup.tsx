import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { getPartnerCitiesCached } from '../services/partnerCitiesCache';
import { cityDisplayName } from '../lib/cityDisplay';
import ConvinceMayorModal from '@components/ConvinceMayorModal';
import CityNotListedChip from '@components/CityNotListedChip';
import { openReferCityEmail } from '../lib/referCity';
import BottomBar from '@components/BottomBar';
import BrandedLogo from '@components/BrandedLogo';
import LegalConsentBlock from '@components/LegalConsentBlock';
import LegalFooterLinks from '@components/LegalFooterLinks';
import AuthField from '@components/AuthField';
import { recordLegalConsent } from '../services/legalConsent';

const SCROLL_PADDING_X = 28;

export default function SignupScreen() {
  const { dark, primaryColor, classes, colors, brand, layoutStyles, typeStyles } = useAppTheme();
  const { config } = useCity();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [availableCities, setAvailableCities] = useState<
    { id: string; name: string; officialName?: string }[]
  >([]);
  const [citiesError, setCitiesError] = useState(false);
  const [showConvinceModal, setShowConvinceModal] = useState(false);
  const [residenceNotListed, setResidenceNotListed] = useState(false);

  const appName = brand.appName;
  const communeName = config ? cityDisplayName(config) : appName;

  const { login: authLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);

  const canSubmit = acceptedCgu && acceptedPrivacy && acceptedAge && !isSubmitting;

  useEffect(() => {
    let cancelled = false;
    const loadCities = async () => {
      try {
        const cities = await getPartnerCitiesCached();
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
    if (!email.trim() || !password || !username.trim() || !phone.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!residenceNotListed && !selectedCity) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre ville de résidence.');
      return;
    }

    if (!acceptedCgu || !acceptedPrivacy || !acceptedAge) {
      Alert.alert(
        'Consentements requis',
        'Vous devez accepter les CGU, la politique de confidentialité et certifier avoir au moins 16 ans.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { access_token, user } = await authService.signup({
        name: username.trim(),
        surname: '',
        email: email.trim(),
        password,
        phone: phone.trim(),
        ...(residenceNotListed ? {} : { cityId: selectedCity! }),
      });
      await recordLegalConsent();
      await authLogin(access_token, user);

      Alert.alert(
        'Succès',
        residenceNotListed
          ? `Bienvenue ${user.name} ! Votre compte est créé. Les services municipaux seront disponibles lorsque votre commune rejoindra Municip'All.`
          : `Bienvenue ${user.name} ! Votre compte est créé.`
      );
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

  const bgTop = dark ? '#0F0F12' : '#F8FAFC';
  const bgBottom = dark ? colors.semantic.surface.dark : '#FFFFFF';

  return (
    <View style={layoutStyles.pageAuth}>
      <LinearGradient
        colors={[bgTop, bgBottom]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {brand.useGradient && !dark ? (
        <View
          pointerEvents='none'
          className='absolute -left-24 -top-16 h-56 w-56 rounded-full opacity-25'
          style={{ backgroundColor: brand.secondaryColor }}
        />
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 120,
            paddingHorizontal: SCROLL_PADDING_X,
            maxWidth: 480,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View className='mb-8 items-center'>
            <View
              className={`mb-5 items-center justify-center rounded-3xl p-3 shadow-sm ${dark ? 'bg-zinc-900' : 'bg-white'}`}>
              <BrandedLogo
                size={72}
                radius={20}
                backgroundColor={dark ? '#18181B' : '#FFFFFF'}
                iconColor={primaryColor}
                mode='contain'
              />
            </View>
            <Text className={classes.eyebrow} style={typeStyles.eyebrow}>{communeName}</Text>
            <Text
              className='mt-2 text-center text-3xl font-black tracking-tight'
              style={{ color: colors.textPrimary }}>
              Créer un compte
            </Text>
            <Text
              className='mt-2 px-4 text-center text-base leading-6'
              style={{ color: colors.textSecondary }}>
              Rejoignez {appName}
            </Text>
          </View>

          {/* Formulaire */}
          <View className={`px-7 py-8 ${classes.cardRoundedLg}`} style={layoutStyles.cardRoundedLg}>
            <AuthField
              label='Identifiant'
              icon='person-outline'
              value={username}
              onChangeText={setUsername}
              placeholder='Votre identifiant'
              dark={dark}
              colors={colors}
              classes={classes}
              typeStyles={typeStyles}
            />

            <AuthField
              label='E-mail'
              icon='mail-outline'
              value={email}
              onChangeText={setEmail}
              placeholder='votre@email.fr'
              keyboardType='email-address'
              dark={dark}
              colors={colors}
              classes={classes}
              typeStyles={typeStyles}
            />

            <AuthField
              label='Mot de passe'
              icon='lock-closed-outline'
              value={password}
              onChangeText={setPassword}
              placeholder='Votre mot de passe'
              secureTextEntry={!showPassword}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              dark={dark}
              colors={colors}
              classes={classes}
              typeStyles={typeStyles}
            />

            <AuthField
              label='Téléphone'
              icon='call-outline'
              value={phone}
              onChangeText={setPhone}
              placeholder='06 12 34 56 78'
              keyboardType='phone-pad'
              dark={dark}
              colors={colors}
              classes={classes}
              typeStyles={typeStyles}
            />

            <View className='mb-6'>
              <Text className={classes.formLabel} style={typeStyles.formLabel}>Ma ville de résidence</Text>
              {citiesError ? (
                <View className='items-center py-2'>
                  <Text className='text-sm' style={{ color: colors.textSecondary }}>
                    Impossible de charger les villes.
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const cities = await getPartnerCitiesCached();
                        setAvailableCities(cities);
                        if (cities.length > 0) setSelectedCity(cities[0].id);
                        setCitiesError(false);
                      } catch {
                        setCitiesError(true);
                      }
                    }}
                    className='mt-2 py-1'
                    accessibilityRole='button'
                    accessibilityLabel='Réessayer le chargement des villes'>
                    <Text className='font-bold' style={{ color: primaryColor }}>Réessayer</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className='flex-row flex-wrap gap-2'>
                  {availableCities.map((city) => {
                    const selected = !residenceNotListed && selectedCity === city.id;
                    return (
                      <TouchableOpacity
                        key={city.id}
                        onPress={() => {
                          setResidenceNotListed(false);
                          setSelectedCity(city.id);
                        }}
                        activeOpacity={0.7}
                        accessibilityRole='button'
                        accessibilityLabel={cityDisplayName(city)}
                        className='rounded-2xl px-4 py-2.5'
                        style={{
                          backgroundColor: selected
                            ? primaryColor
                            : dark
                              ? '#27272A'
                              : '#F4F4F5',
                          borderWidth: 1,
                          borderColor: selected
                            ? primaryColor
                            : dark
                              ? '#3F3F46'
                              : '#E4E4E7',
                        }}>
                        <Text
                          className='text-sm font-bold'
                          style={{
                            color: selected ? brand.onPrimary : dark ? '#A1A1AA' : '#52525B',
                          }}>
                          {cityDisplayName(city)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <CityNotListedChip
                    dark={dark}
                    selected={residenceNotListed}
                    primaryColor={primaryColor}
                    onPress={() => setShowConvinceModal(true)}
                  />
                </View>
              )}
              {residenceNotListed ? (
                <Text className='mt-3 text-xs leading-5' style={{ color: colors.textSecondary }}>
                  Vous pourrez utiliser Municip&apos;All dès que votre commune sera partenaire. En
                  attendant, invitez votre mairie ou choisissez votre commune si elle apparaît dans
                  la liste.
                </Text>
              ) : null}
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
              disabled={!canSubmit}
              activeOpacity={0.85}
              accessibilityRole='button'
              accessibilityLabel='Créer mon compte'
              className='mt-6 flex-row items-center justify-center rounded-2xl py-4'
              style={{
                backgroundColor: primaryColor,
                opacity: canSubmit ? 1 : 0.5,
              }}>
              {isSubmitting ? (
                <ActivityIndicator color={brand.onPrimary} />
              ) : (
                <Text className='text-base font-bold' style={{ color: brand.onPrimary }}>
                  Créer mon compte
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            className='mt-6 items-center py-3'
            accessibilityRole='button'
            accessibilityLabel='Se connecter'>
            <Text className='text-sm' style={{ color: colors.textSecondary }}>
              Vous avez déjà un compte ?{' '}
              <Text className='font-bold' style={{ color: primaryColor }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>

          <View className='mt-4'>
            <LegalFooterLinks />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConvinceMayorModal
        visible={showConvinceModal}
        onClose={() => setShowConvinceModal(false)}
        onSendEmail={openReferCityEmail}
        onContinueWithoutCity={() => {
          setResidenceNotListed(true);
          setSelectedCity(null);
        }}
        dark={dark}
        primaryColor={primaryColor}
        bottomInset={insets.bottom}
      />

      <BottomBar />
    </View>
  );
}
