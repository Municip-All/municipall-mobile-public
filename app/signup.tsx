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

const SignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = theme === 'system' ? Appearance.getColorScheme() : theme;
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const logoSource =
    currentTheme === 'dark'
      ? require('../assets/images/logo-blue.png')
      : require('../assets/images/logo-white.png');
  const backgroundImage =
    currentTheme === 'dark'
      ? require('../assets/images/background-grey.png')
      : require('../assets/images/background-blue.png');

  const handleRegister = () => {
    if (!email || !password || !username || !phone) {
      alert('Veuillez entrer toutes les informations.');
      return;
    }
    alert(`Connexion réussie avec l'email : ${email}`);
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
        <Text className='font-inter-semibold mt-28 text-4xl text-slate-100'>
          Créez votre compte
        </Text>
        <Text className='font-inter-medium mt-2 text-base text-slate-100'>
          On a hâte de vous connaitre !
        </Text>
      </View>

      <View className='mt-10 w-10/12'>
        {[
          {
            placeholder: 'Identifiant',
            value: username,
            setter: setUsername,
            icon: 'person-outline',
          },
          {
            placeholder: 'Email',
            value: email,
            setter: setEmail,
            icon: 'mail-outline',
            keyboardType: 'email-address',
          },
          {
            placeholder: 'Mot de passe',
            value: password,
            setter: setPassword,
            icon: 'lock-closed-outline',
            secure: true,
          },
          {
            placeholder: 'Téléphone',
            value: phone,
            setter: setPhone,
            icon: 'call-outline',
            keyboardType: 'phone-pad',
          },
        ].map(({ placeholder, value, setter, icon, keyboardType, secure }, index) => (
          <View
            key={index}
            className='mx-auto mb-4 w-10/12 flex-row items-center rounded-full bg-slate-100 px-4 py-3'>
            <Ionicons
              // @ToDo
              name={icon as any}
              size={24}
              color={currentTheme === 'dark' ? '#028CF3' : '#000'}
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
          onPress={handleRegister}
          className='mt-6 mr-7 ml-auto w-2/12 flex-row items-center justify-center rounded-full bg-blue-500 py-3'>
          <Text className='font-inter-semibold text-lg text-white'>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/login')}
        className='absolute bottom-6 w-full items-center'>
        <Text className='font-inter-semibold text-md text-white'>
          Vous avez déjà un compte ? <Text className='text-blue-500'>Connectez-vous !</Text>
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default SignupScreen;
