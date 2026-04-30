import React, { useState, useEffect } from 'react';
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
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import apiClient from '../services/apiClient';
import { cityService } from '../services/cityService';
import BottomBar from '@components/bottombar';

const SignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [availableCities, setAvailableCities] = useState<{ id: string; name: string }[]>([]);

  const primaryColor = config?.theme.primaryColor || '#1D4ED8';
  const secondaryColor = config?.theme.secondaryColor || '#3B82F6';
  const useGradient = config?.theme.useGradient ?? false;
  const appName = config?.name || "Municip'All";

  const { login: authLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await cityService.getAllCities();
        setAvailableCities(cities);
        if (cities.length > 0) setSelectedCity(cities[0].id);
      } catch (err) {
        console.error('Failed to load cities', err);
      }
    };
    loadCities();
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !username || !phone || !selectedCity) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer toutes les informations, y compris votre ville de résidence.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('auth/signup', {
        name: username,
        surname: '',
        email,
        password,
        phone,
        cityId: selectedCity, // Now passing the resident city
      });

      const { access_token, user } = response.data;
      await authLogin(access_token, user);

      Alert.alert('Succès', `Bienvenue ${user.name} ! Votre compte est créé.`);
      router.replace('/home');
    } catch (error: any) {
      console.error('Signup error', error);
      Alert.alert(
        "Échec de l'inscription",
        'Une erreur est survenue lors de la création du compte.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className='flex-1 bg-[#F8FAFC] dark:bg-zinc-950'>
      <LinearGradient
        colors={[
          dark ? '#000000' : useGradient ? '#E0E7FF' : '#F8FAFC',
          dark ? '#18181b' : '#F8FAFC',
        ]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Decorative Brand Circles */}
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
              className='mb-6 h-16 w-16 items-center justify-center rounded-[24px] shadow-xl'
              style={{
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
              }}>
              <Ionicons name='business' size={30} color='#FFFFFF' />
            </View>
            <Text
              className={`mb-2 text-center text-3xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              Rejoignez {appName}.
            </Text>
            <Text
              className={`text-center text-sm font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
              Créez votre compte citoyen
            </Text>
          </View>

          <View className='w-full items-center'>
            <BlurView
              intensity={dark ? 20 : 60}
              tint={dark ? 'dark' : 'light'}
              className='w-full overflow-hidden rounded-[32px] border border-white/20 p-6 dark:border-white/10'>
              <View className='pointer-events-none absolute inset-0 bg-white/40 dark:bg-black/20' />

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
                    className={`mb-1.5 ml-1 text-xs font-semibold ${dark ? 'text-gray-400' : 'text-slate-600'}`}>
                    {input.label}
                  </Text>
                  <View
                    className={`flex-row items-center rounded-2xl border px-4 py-3 ${dark ? 'border-white/10 bg-black/50' : 'border-blue-50 bg-white'}`}>
                    <Ionicons
                      name={input.icon as any}
                      size={20}
                      color={dark ? '#9CA3AF' : '#64748B'}
                      className='mr-2'
                    />
                    <TextInput
                      value={input.value}
                      onChangeText={input.setter}
                      placeholder={input.placeholder}
                      keyboardType={input.keyboardType as any}
                      secureTextEntry={input.secure}
                      autoCapitalize='none'
                      placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
                      className={`ml-2 flex-1 px-0 text-base ${dark ? 'text-white' : 'text-slate-900'}`}
                    />
                  </View>
                </View>
              ))}

              <View className='mt-2 mb-6'>
                <Text
                  className={`mb-3 ml-1 text-xs font-semibold ${dark ? 'text-gray-400' : 'text-slate-600'}`}>
                  MA VILLE DE RÉSIDENCE
                </Text>
                <View className='flex-row flex-wrap gap-2'>
                  {availableCities.map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      onPress={() => setSelectedCity(city.id)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor:
                          selectedCity === city.id ? primaryColor : dark ? '#27272a' : '#f1f5f9',
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderWidth: 1,
                        borderColor:
                          selectedCity === city.id ? primaryColor : dark ? '#3f3f46' : '#e2e8f0',
                      }}>
                      <Text
                        style={{
                          color:
                            selectedCity === city.id ? '#FFFFFF' : dark ? '#9CA3AF' : '#475569',
                          fontWeight: 'bold',
                          fontSize: 13,
                        }}>
                        {city.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className='mt-4 w-full flex-row items-center justify-center rounded-[20px] py-4 shadow-xl'
                style={{
                  backgroundColor: primaryColor,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                }}>
                {isSubmitting ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <>
                    <Text className='mr-2 text-lg font-bold text-white'>Créer mon compte</Text>
                    <Ionicons name='checkmark' size={20} color='#FFFFFF' />
                  </>
                )}
              </TouchableOpacity>
            </BlurView>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          className='absolute bottom-28 w-full flex-row justify-center bg-[#F8FAFC]/80 py-4 backdrop-blur-sm dark:bg-zinc-950/80'>
          <Text className={`text-[15px] font-medium ${dark ? 'text-gray-400' : 'text-slate-600'}`}>
            Vous avez déjà un compte ?{' '}
            <Text className='font-bold' style={{ color: primaryColor }}>
              Se connecter
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <BottomBar />
    </View>
  );
};

export default SignupScreen;
