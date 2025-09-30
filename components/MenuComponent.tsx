import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MenuComponent: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <ScrollView className='p-5'>
      <View className='mb-6 flex-row items-center rounded-lg bg-zinc-600 px-3 py-2'>
        <Ionicons name='search' size={24} color='gray' className='mr-2' />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='On est là pour vous aider !'
          placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
          className='flex-1 px-2 text-base text-black dark:text-white'
        />
        <Ionicons name='mic-outline' size={24} color='gray' className='ml-2' />
      </View>

      <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} mb-2 text-lg font-bold`}>
        Favoris
      </Text>

      <View className='mb-6 flex-row justify-between rounded-lg bg-zinc-600 p-2'>
        <TouchableOpacity
          className='mx-1 flex-1 items-center rounded-lg bg-gray-100 px-3 py-1'
          onPress={() => router.push('/report')}>
          <Ionicons name='warning-outline' size={16} color='#028CF3' />
          <Text className='ml-2 text-xs text-black'>Signalement</Text>
        </TouchableOpacity>

        <TouchableOpacity className='mx-1 flex-1 items-center rounded-lg bg-gray-100 px-3 py-1'>
          <Ionicons name='locate-outline' size={16} color='#028CF3' />
          <Text className='ml-2 text-xs text-black'>Localisez-moi !</Text>
        </TouchableOpacity>

        <TouchableOpacity className='mx-1 flex-1 items-center rounded-lg bg-gray-100 px-3 py-1'>
          <Ionicons name='leaf-outline' size={16} color='#028CF3' />
          <Text className='ml-2 text-xs text-black'>Compostes</Text>
        </TouchableOpacity>
      </View>

      <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} mb-4 text-lg font-bold`}>
        Vos récents rapports
      </Text>

      <View className='rounded-lg bg-zinc-600'>
        <TouchableOpacity className='flex-row items-center justify-between border-b border-gray-300 p-3 dark:border-slate-800'>
          <View className='flex-row items-center'>
            <View className='rounded-full bg-blue-400 p-2'>
              <Ionicons name='pricetag-outline' size={16} color='#fff' />
            </View>
            <View>
              <Text className='ml-2 text-base font-bold text-black dark:text-white'>
                Tag &quot;SKIBIDI&quot;
              </Text>
              <Text className='ml-2 text-xs text-gray-500 dark:text-gray-400'>68 rue Gignac</Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={20} color='#fff' />
        </TouchableOpacity>

        <TouchableOpacity className='flex-row items-center justify-between border-b border-gray-300 p-3 dark:border-slate-800'>
          <View className='flex-row items-center'>
            <View className='rounded-full bg-green-500 p-2'>
              <Ionicons name='trash-outline' size={16} color='#fff' />
            </View>
            <View>
              <Text className='ml-2 text-base font-bold text-black dark:text-white'>Déchets</Text>
              <Text className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                47 rue de Villier
              </Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={20} color='#fff' />
        </TouchableOpacity>

        <TouchableOpacity className='flex-row items-center justify-between p-4'>
          <View className='flex-row items-center'>
            <View className='rounded-full bg-red-400 p-2'>
              <Ionicons name='images-outline' size={16} color='#fff' />
            </View>
            <View>
              <Text className='ml-2 text-base font-bold text-black dark:text-white'>
                Autocollants
              </Text>
              <Text className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                12 chemin de Papaille
              </Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={20} color='#fff' />
        </TouchableOpacity>
      </View>

      <Text
        className={`${theme === 'dark' ? 'text-white' : 'text-black'} mt-6 mb-2 text-lg font-bold`}>
        Vos points
      </Text>
      <TouchableOpacity className='flex-row items-center justify-between rounded-lg bg-zinc-700 p-4'>
        <View className='flex-row items-center'>
          <View className='rounded-full bg-yellow-500 p-2'>
            <Ionicons name='star-outline' size={20} color='#fff' />
          </View>
          <View>
            <Text className='ml-2 text-base font-bold text-black dark:text-white'>+ 5</Text>
            <Text className='ml-2 text-xs text-gray-500 italic dark:text-gray-400'>
              Encore un petit effort !
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Text
        className={`${theme === 'dark' ? 'text-white' : 'text-black'} mt-4 text-center font-bold`}>
        Cleany®
      </Text>
    </ScrollView>
  );
};

export default MenuComponent;
