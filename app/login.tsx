import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomBar from '@components/BottomBar';
import BrandedLogo from '@components/BrandedLogo';
import LegalFooterLinks from '@components/LegalFooterLinks';
import AuthField from '@components/AuthField';
import { authService } from '../services/authService';
import { cityDisplayName } from '../lib/cityDisplay';

const SCROLL_PADDING_X = 28;

export default function LoginScreen() {
  const { dark, primaryColor, classes, colors, brand, layoutStyles } = useAppTheme();
  const { config } = useCity();
  const router = useRouter();
  const { login } = useAuth();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appName = brand.appName;
  const communeName = config ? cityDisplayName(config) : appName;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erreur', 'Veuillez entrer votre e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { access_token, user } = await authService.login(email.trim(), password);
      await login(access_token, user);

      if (redirectTo && typeof redirectTo === 'string') {
        router.replace(redirectTo);
      } else {
        router.replace('/home');
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Identifiants incorrects ou serveur indisponible.';
      Alert.alert('Échec de la connexion', msg, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réessayer', onPress: handleLogin },
      ]);
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
          className='absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30'
          style={{ backgroundColor: brand.secondaryColor }}
        />
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          className='flex-1'
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 120,
            paddingHorizontal: SCROLL_PADDING_X,
            maxWidth: 480,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}>
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
            <Text className={classes.eyebrow}>{communeName}</Text>
            <Text
              className={`mt-2 text-center text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-zinc-900'}`}>
              Bienvenue
            </Text>
            <Text
              className={`mt-2 px-4 text-center text-base leading-6 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Connectez-vous à {appName}
            </Text>
          </View>

          <View className={`px-7 py-8 ${classes.cardRoundedLg}`}>
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
            />

            <TouchableOpacity
              className='mb-6 self-end'
              onPress={() =>
                Alert.alert(
                  'Mot de passe oublié',
                  'Contactez votre mairie pour réinitialiser votre mot de passe.',
                  [{ text: 'OK' }]
                )
              }
              accessibilityRole='button'
              accessibilityLabel='Mot de passe oublié'>
              <Text className='text-sm font-semibold' style={{ color: primaryColor }}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
              accessibilityRole='button'
              accessibilityLabel='Se connecter'
              className='flex-row items-center justify-center rounded-2xl py-4'
              style={{
                backgroundColor: primaryColor,
                opacity: isSubmitting ? 0.7 : 1,
              }}>
              {isSubmitting ? (
                <ActivityIndicator color={brand.onPrimary} />
              ) : (
                <Text className='text-base font-bold' style={{ color: brand.onPrimary }}>
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
            className='mt-6 items-center py-3'
            accessibilityRole='button'
            accessibilityLabel='Créer un compte'>
            <Text className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Nouveau citoyen ?{' '}
              <Text className='font-bold' style={{ color: primaryColor }}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>

          <View className='mt-4'>
            <LegalFooterLinks />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomBar />
    </View>
  );
}
