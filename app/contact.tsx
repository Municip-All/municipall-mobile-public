import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/themecontext';

const ContactScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-900' : 'bg-white'} p-6`}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text className={`${dark ? 'text-white' : 'text-black'}`}>{'<'} Retour</Text>
      </TouchableOpacity>
      <View className='mt-10'>
        <Text className={`text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>Contact</Text>
        <Text className={`mt-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
          Écran de contact (placeholder). Ajoutez ici formulaire ou informations.
        </Text>
      </View>
    </View>
  );
};

export default ContactScreen;
