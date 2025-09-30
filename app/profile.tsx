import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ThemeSelector from '../components/ThemeSelector';
import { useTheme } from '../context/ThemeContext';

const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <ScrollView className={`flex-1 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
      <View className='relative'>
        <ImageBackground
          source={require('../assets/images/background-blue.png')}
          style={{ height: 160, overflow: 'hidden' }}
        />
        <View className='absolute top-16 right-0 left-0 items-center'>
          <LinearGradient
            colors={['#06b6d4', '#3b82f6']}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={require('../assets/images/avatar.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: 'white',
              }}
            />
          </LinearGradient>
          <Text
            className={`${theme === 'dark' ? 'text-white' : 'text-black'} mt-4 text-lg font-bold`}>
            John Brown
          </Text>
          <Text className='text-sm text-gray-400'>He/him</Text>
          <View className='absolute top-[89%] right-[38%]'>
            <Ionicons name='checkmark-circle' size={18} color='#3b82f6' />
          </View>
        </View>
      </View>

      <View className='mt-4 rounded-lg p-4'>
        <Text
          className={`mt-16 mb-2 ml-4 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Tous vos signalements
        </Text>
        <View className={`mx-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-600'}`}>
          <TouchableOpacity className='flex-row items-center justify-between border-b border-gray-300 p-2 dark:border-slate-800'>
            <View className='flex-row items-center'>
              <View className='rounded-full bg-blue-400 p-2'>
                <Ionicons name='pricetag-outline' size={16} color='#fff' />
              </View>
              <View>
                <Text className='ml-2 text-base font-bold text-white'>Tag &quot;SKIBIDI&quot;</Text>
                <Text className='ml-2 text-xs text-gray-400'>68 rue Gignac</Text>
              </View>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#fff' />
          </TouchableOpacity>

          <TouchableOpacity className='flex-row items-center justify-between border-b border-gray-300 p-2 dark:border-slate-800'>
            <View className='flex-row items-center'>
              <View className='rounded-full bg-green-500 p-2'>
                <Ionicons name='trash-outline' size={16} color='#fff' />
              </View>
              <View>
                <Text className='ml-2 text-base font-bold text-white'>Déchets</Text>
                <Text className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                  47 rue de Villier
                </Text>
              </View>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#fff' />
          </TouchableOpacity>

          <TouchableOpacity className='flex-row items-center justify-between p-2'>
            <View className='flex-row items-center'>
              <View className='rounded-full bg-red-400 p-2'>
                <Ionicons name='images-outline' size={16} color='#fff' />
              </View>
              <View>
                <Text className='ml-2 text-base font-bold text-white'>Autocollants</Text>
                <Text className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                  12 chemin de Papaille
                </Text>
              </View>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#fff' />
          </TouchableOpacity>
        </View>
        <Text className='mt-2 ml-4 text-sm text-gray-500 italic'>Voir plus...</Text>
      </View>

      <View className='p-4'>
        <Text
          className={`mx-auto mb-4 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Paramètres et confidentialité
        </Text>
        <View className='-mb-4 flex-row items-center rounded-full bg-gray-200 px-3 py-2 dark:bg-zinc-700'>
          <Ionicons name='search' size={24} color='#888' className='mr-2' />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Rechercher...'
            placeholderTextColor='#888'
            className='flex-1 px-2 text-base text-black dark:text-white'
          />
        </View>
      </View>

      <View className='p-4'>
        <View className='my-4 flex-row items-center'>
          <View className='mr-4 h-[1px] flex-1 bg-gray-500' />
          <Text
            className={`mr-32 text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Votre compte
          </Text>
        </View>
        <LinearGradient
          colors={['#ffffff', '']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className='mx-4 rounded-full p-[2px]'>
          <TouchableOpacity className='mb-4 flex-row items-center justify-between rounded-full bg-gray-800 p-3'>
            <View className='flex-row items-center'>
              <Image
                source={require('../assets/images/avatar.png')}
                className='mr-3 h-10 w-10 rounded-full'
              />
              <View>
                <Text className='text-sm font-bold text-white'>Mon compte</Text>
                <Text className='text-xs text-gray-400'>Mot de passe, email, informations</Text>
              </View>
            </View>
            <Ionicons name='chevron-forward' size={20} color='white' />
          </TouchableOpacity>
        </LinearGradient>

        <View className='my-4 flex-row items-center'>
          <Text
            className={`mr-4 ml-32 text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Votre application
          </Text>
          <View className='h-[1px] flex-1 bg-gray-500' />
        </View>

        <ThemeSelector />

        <View className='mb-4'>
          <TouchableOpacity
            className='mt-4 flex-row items-center justify-between rounded-lg'
            onPress={() => router.push('/cgu')}>
            <View className='flex-row items-center'>
              <Ionicons
                name='document-text-outline'
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className='mr-4'
              />
              <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} ml-1 text-base`}>
                Conditions générales d&apos;utilisation
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity className='mt-4 flex-row items-center justify-between rounded-lg'>
            <View className='flex-row items-center'>
              <Ionicons
                name='language-outline'
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className='mr-4'
              />
              <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} ml-1 text-base`}>
                Langue
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </View>

        <View className='mb-4'>
          <View className='mb-2 flex-row items-center justify-between'>
            <View className='mr-2 flex-1 border-b border-gray-500' />
            <Text
              className={`mr-36 text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
              Assistance
            </Text>
          </View>

          <TouchableOpacity className='flex-row items-center justify-between'>
            <View className='flex-row items-center'>
              <Ionicons
                name='help-circle-outline'
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className='mr-4'
              />
              <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} ml-1 text-base`}>
                Aide
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity className='mt-4 flex-row items-center justify-between'>
            <View className='flex-row items-center'>
              <Ionicons
                name='information-circle-outline'
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className='mr-4'
              />
              <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} ml-1 text-base`}>
                À propos
              </Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className='mt-12 flex-row items-center justify-between'
            onPress={() => router.push('/')}>
            <View className='flex-row items-center'>
              <Text className='ml-1 text-base text-red-600 text-white'>Se déconnecter</Text>
            </View>
            <Ionicons
              name='chevron-forward'
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
