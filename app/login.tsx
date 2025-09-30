import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Appearance,
  Image,
  ImageBackground,
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = theme === 'system' ? Appearance.getColorScheme() : theme;
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const logoSource =
    currentTheme === 'dark'
      ? require('../assets/images/logo-blue.png')
      : require('../assets/images/logo-white.png');

  const backgroundImage =
    currentTheme === 'dark'
      ? require('../assets/images/background-grey.png')
      : require('../assets/images/background-blue.png');

  const handleLogin = () => {
    if (!email || !password) {
      alert('Veuillez entrer votre e-mail et votre mot de passe.');
      return;
    }
    router.push('/dashboard');
  };

  return (
    <ImageBackground
      source={backgroundImage}
      className='flex-1 items-center justify-start'
      resizeMode='cover'>
      <View className='mt-20 flex-row items-center'>
        <Image source={logoSource} className='mb-4 h-24 w-4/12' resizeMode='contain' />
        {currentTheme === 'dark' ? (
          <MaskedView maskElement={<Text className='font-inter-semibold text-3xl'>Cleany®</Text>}>
            <LinearGradient
              colors={['#06b6d4', '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Text className='font-inter-semibold text-3xl opacity-0'>Cleany®</Text>
            </LinearGradient>
          </MaskedView>
        ) : (
          <Text className='font-inter-medium text-3xl text-slate-100'>Cleany®</Text>
        )}
      </View>

      <View className='mt-8 items-center'>
        <Text className='font-inter-semibold mt-28 text-7xl text-slate-100'>Bonjour</Text>
        <Text className='font-inter-medium mt-2 text-base text-slate-100'>
          Connectez-vous à votre compte
        </Text>
      </View>

      <View className='mt-10 w-10/12'>
        {[
          {
            value: email,
            setter: setEmail,
            placeholder: 'Email',
            icon: 'mail-outline',
            keyboardType: 'email-address',
          },
          {
            value: password,
            setter: setPassword,
            placeholder: 'Mot de passe',
            icon: 'lock-closed-outline',
            secure: true,
          },
        ].map(({ value, setter, placeholder, icon, keyboardType, secure }, index) => (
          <View
            key={index as any}
            className='mx-auto mb-4 w-10/12 flex-row items-center rounded-full bg-slate-100 px-4 py-3'>
            <Ionicons
              name={icon as any}
              size={24}
              color={currentTheme === 'dark' ? '#888' : '#000'}
              className='mr-2'
            />
            <TextInput
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              keyboardType={keyboardType as KeyboardTypeOptions}
              secureTextEntry={secure}
              autoCapitalize='none'
              placeholderTextColor={currentTheme === 'dark' ? '#888' : '#aaa'}
              className='m-1 flex-1 text-black'
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={() => alert('Mot de passe oublié ?')}
          className='mx-auto w-10/12'>
          <Text className='mb-6 text-right text-sm text-gray-500'>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          className='mr-7 ml-auto w-2/12 flex-row items-center justify-center rounded-full bg-blue-500 py-3'>
          <Text className='font-inter-semibold text-lg text-white'>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/signup')}
        className='absolute bottom-6 w-full items-center'>
        <Text className='font-inter-semibold text-md text-white'>
          Pas encore de compte ? <Text className='text-blue-500'>Créer</Text>
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default LoginScreen;
