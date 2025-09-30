import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme } from '../context/ThemeContext';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const isDarkTheme = theme === 'dark';
  const logoSource = isDarkTheme
    ? require('../assets/images/logo-blue.png')
    : require('../assets/images/logo-white.png');
  const backgroundImage = isDarkTheme
    ? require('../assets/images/background-grey.png')
    : require('../assets/images/background-blue.png');

  return (
    <ImageBackground
      source={backgroundImage}
      className='flex-1 items-center justify-center'
      resizeMode='cover'>
      <Image source={logoSource} className='mb-4 h-1/4 w-4/12' resizeMode='contain' />

      {isDarkTheme ? (
        <MaskedView
          maskElement={
            <Text
              style={{
                fontSize: 40,
                fontFamily: Platform.OS === 'ios' ? 'Inter-SemiBold' : 'Inter_600SemiBold',
                backgroundColor: 'transparent',
              }}>
              Cleany®
            </Text>
          }>
          <LinearGradient
            colors={['#06b6d4', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text
              style={{
                opacity: 0,
                fontSize: 40,
                fontFamily: Platform.OS === 'ios' ? 'Inter-SemiBold' : 'Inter_600SemiBold',
              }}>
              Cleany®
            </Text>
          </LinearGradient>
        </MaskedView>
      ) : (
        <Text className='font-inter-medium text-4xl text-slate-100'>Cleany®</Text>
      )}

      <View className='mt-8 w-full px-8'>
        <Text className='font-inter-semibold mb-2 text-center text-lg text-slate-100'>
          De retour ? Connectez-vous !
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          className={`mx-auto mb-6 w-10/12 overflow-hidden rounded-full ${
            isDarkTheme ? 'bg-transparent' : 'bg-slate-100'
          }`}
          activeOpacity={0.8}>
          {isDarkTheme ? (
            <LinearGradient
              colors={['#06b6d4', '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className='w-full items-center justify-center py-3'>
              <Text className='font-inter-semibold text-center text-lg text-slate-100'>
                Connexion
              </Text>
            </LinearGradient>
          ) : (
            <Text className='font-inter-medium py-3 text-center text-lg text-sky-400'>
              Connexion
            </Text>
          )}
        </TouchableOpacity>

        <Text className='font-inter-semibold mb-2 text-center text-lg text-slate-100'>
          Vous êtes nouveau ? Inscrivez-vous !
        </Text>

        <TouchableOpacity
          className='mx-auto mb-6 w-10/12 overflow-hidden rounded-full bg-slate-100 py-3'
          onPress={() => router.push('/signup')}>
          <Text className='font-inter-medium text-center text-lg text-sky-400'>Inscription</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;
