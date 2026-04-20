import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import BottomBar from '@components/bottombar';
import apiClient from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const router = useRouter();
  const { login } = useAuth();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = config?.theme.primaryColor || '#1D4ED8';
  const secondaryColor = config?.theme.secondaryColor || '#3B82F6';
  const useGradient = config?.theme.useGradient ?? false;
  const appName = config?.name || "Municip'All";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez entrer votre e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/login', { 
        email, 
        password 
      });

      const { access_token, user } = response.data;
      await login(access_token, user); // Update context state and persist
      
      if (redirectTo && typeof redirectTo === 'string') {
        router.replace(redirectTo);
      } else {
        router.replace('/home');
      }
    } catch (error: any) {
      console.error('Login error', error);
      Alert.alert('Échec de la connexion', 'Identifiants incorrects ou serveur indisponible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] dark:bg-zinc-950 px-6">
      <LinearGradient
        colors={[
          dark ? '#000000' : (useGradient ? '#E0E7FF' : '#F8FAFC'),
          dark ? '#18181b' : '#F8FAFC'
        ]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Decorative Brand Circles representing White Label custom color */}
      {useGradient && (
        <>
          <View 
            className="absolute rounded-full opacity-40 blur-3xl"
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
            className="absolute rounded-full opacity-20 blur-3xl"
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
        className="flex-1 justify-center relative"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="mb-10 items-center justify-center">
          <View 
            className="w-20 h-20 rounded-[28px] items-center justify-center mb-6 shadow-xl"
            style={{ backgroundColor: primaryColor, shadowColor: primaryColor, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}
          >
            <Ionicons name="business" size={40} color="#FFFFFF" />
          </View>
          <Text className={`text-4xl font-extrabold tracking-tight mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Bienvenue.
          </Text>
          <Text className={`text-base font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
            Connectez-vous à {appName}
          </Text>
        </View>

        <View className="items-center w-full">
          {/* Glassmorphic Container for the form */}
          <BlurView 
            intensity={dark ? 20 : 60} 
            tint={dark ? 'dark' : 'light'} 
            className="w-full rounded-[32px] p-6 overflow-hidden border border-white/20 dark:border-white/10"
          >
            <View className="absolute inset-0 bg-white/40 dark:bg-black/20 pointer-events-none" />

            <View className="mb-4">
              <Text className={`text-xs ml-1 mb-1.5 font-semibold ${dark ? 'text-gray-400' : 'text-slate-600'}`}>IDENTIFIANT / EMAIL</Text>
              <View className={`flex-row items-center rounded-2xl px-4 py-3 border ${dark ? 'bg-black/50 border-white/10' : 'bg-white border-blue-50'}`}>
                <Ionicons name="mail-outline" size={20} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.fr"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
                  className={`flex-1 ml-2 text-base ${dark ? 'text-white' : 'text-slate-900'}`}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className={`text-xs ml-1 mb-1.5 font-semibold ${dark ? 'text-gray-400' : 'text-slate-600'}`}>MOT DE PASSE</Text>
              <View className={`flex-row items-center rounded-2xl px-4 py-3 border ${dark ? 'bg-black/50 border-white/10' : 'bg-white border-blue-50'}`}>
                <Ionicons name="lock-closed-outline" size={20} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
                  className={`flex-1 ml-2 text-base px-0 ${dark ? 'text-white' : 'text-slate-900'}`}
                />
              </View>
            </View>

            <TouchableOpacity className="self-end mb-8 mt-1 pr-1">
              <Text className={`text-sm font-semibold`} style={{ color: primaryColor }}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className="w-full flex-row items-center justify-center rounded-[20px] py-4 shadow-xl"
              style={{ 
                backgroundColor: primaryColor, 
                shadowColor: primaryColor, 
                shadowOffset: { width: 0, height: 8 }, 
                shadowOpacity: 0.3, 
                shadowRadius: 15 
              }}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text className="font-bold text-lg text-white mr-2">Se connecter</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </BlurView>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/signup')}
          className="absolute bottom-28 w-full flex-row justify-center py-4 bg-[#F8FAFC]/80 dark:bg-zinc-950/80 backdrop-blur-sm"
        >
          <Text className={`text-[15px] font-medium ${dark ? 'text-gray-400' : 'text-slate-600'}`}>
            Nouveau citoyen ? <Text className="font-bold" style={{ color: primaryColor }}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <BottomBar />
    </View>
  );
};

export default LoginScreen;
