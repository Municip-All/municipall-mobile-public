import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import BottomBar from '@components/BottomBar';
import BrandedLogo from '@components/BrandedLogo';
import LegalFooterLinks from '@components/LegalFooterLinks';
import { authService } from '../services/authService';

const LoginScreen: React.FC = () => {
  const { dark, primaryColor, classes, colors, brand, layoutStyles } = useAppTheme();
  const router = useRouter();
  const { login } = useAuth();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const secondaryColor = brand.secondaryColor;
  const useGradient = brand.useGradient;
  const appName = brand.appName;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez entrer votre e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { access_token, user } = await authService.login(email, password);
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

  return (
    <View style={layoutStyles.pageAuth} className='px-6'>
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
            className='absolute rounded-full opacity-40 blur-3xl'
            style={{
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              backgroundColor: secondaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 50,
            }}
          />
          <View
            className='absolute rounded-full opacity-20 blur-3xl'
            style={{
              bottom: -50,
              left: -50,
              width: 200,
              height: 200,
              backgroundColor: primaryColor,
            }}
          />
        </>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='relative flex-1 justify-center'
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className='mb-10 items-center justify-center'>
          <BrandedLogo
            size={80}
            radius={28}
            backgroundColor={primaryColor}
            iconColor={brand.onPrimary}
            style={{
              marginBottom: 24,
              ...colors.softShadow,
            }}
          />
          <Text className={`mb-2 ${classes.title}`}>Bienvenue.</Text>
          <Text className={classes.subtitle}>Connectez-vous à {appName}</Text>
        </View>

        <View className='w-full items-center'>
          <BlurView
            intensity={dark ? 20 : 60}
            tint={dark ? 'dark' : 'light'}
            className='border-cream-200 dark:border-night-border w-full overflow-hidden rounded-[20px] border p-6'>
            <View className='bg-cream-50/40 dark:bg-night-bg/20 pointer-events-none absolute inset-0' />

            <View className='mb-4'>
              <Text
                className={`mb-1.5 ml-1 text-xs font-semibold ${dark ? 'text-night-muted' : 'text-muted'}`}>
                IDENTIFIANT / EMAIL
              </Text>
              <View className={`flex-row items-center px-4 py-3 ${classes.input}`}>
                <Ionicons name='mail-outline' size={20} color={colors.iconMuted} className='mr-2' />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder='votre@email.fr'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor={colors.placeholder}
                  className={`ml-2 flex-1 text-base ${dark ? 'text-night-text' : 'text-matcha-900'}`}
                />
              </View>
            </View>

            <View className='mb-4'>
              <Text
                className={`mb-1.5 ml-1 text-xs font-semibold ${dark ? 'text-night-muted' : 'text-muted'}`}>
                MOT DE PASSE
              </Text>
              <View className={`flex-row items-center px-4 py-3 ${classes.input}`}>
                <Ionicons
                  name='lock-closed-outline'
                  size={20}
                  color={colors.iconMuted}
                  className='mr-2'
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='••••••••'
                  secureTextEntry
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor={colors.placeholder}
                  className={`ml-2 flex-1 px-0 text-base ${dark ? 'text-night-text' : 'text-matcha-900'}`}
                />
              </View>
            </View>

            <TouchableOpacity
              className='mt-1 mb-8 self-end pr-1'
              onPress={() =>
                Alert.alert(
                  'Mot de passe oublié',
                  'Contactez votre mairie pour réinitialiser votre mot de passe.',
                  [{ text: 'OK' }]
                )
              }>
              <Text className={`text-sm font-semibold`} style={{ color: primaryColor }}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessibilityRole='button'
              accessibilityLabel='Se connecter'
              className='shadow-soft w-full flex-row items-center justify-center rounded-xl py-4'
              style={{
                backgroundColor: primaryColor,
                ...colors.softShadow,
              }}>
              {isSubmitting ? (
                <ActivityIndicator color={brand.onPrimary} />
              ) : (
                <>
                  <Text className='mr-2 text-lg font-bold' style={{ color: brand.onPrimary }}>
                    Se connecter
                  </Text>
                  <Ionicons name='arrow-forward' size={20} color={brand.onPrimary} />
                </>
              )}
            </TouchableOpacity>
          </BlurView>
          <LegalFooterLinks />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/signup')}
          className={`absolute bottom-36 w-full flex-row justify-center py-4 ${dark ? 'bg-night-bg/80' : 'bg-cream-50/80'}`}
          accessibilityRole='button'
          accessibilityLabel='Créer un compte'>
          <Text className={`text-[15px] font-medium ${dark ? 'text-night-muted' : 'text-muted'}`}>
            Nouveau citoyen ?{' '}
            <Text className='font-bold' style={{ color: primaryColor }}>
              Créer un compte
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <BottomBar />
    </View>
  );
};

export default LoginScreen;
