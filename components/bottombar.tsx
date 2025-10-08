import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';
import { BlurView } from 'expo-blur';

const BottomBar: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const dark = theme === 'dark';

  const iconColor = dark ? '#FFFFFF' : '#000000';
  const labelColor = dark ? 'text-white' : 'text-black';

  return (
    <View pointerEvents='box-none' className='absolute inset-x-0 bottom-4 items-center'>
      <BlurView
        intensity={40}
        tint={dark ? 'dark' : 'light'}
        className={`relative w-[92%] flex-row items-center justify-between overflow-hidden rounded-full px-4 py-3 shadow-lg`}
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}>
        <View
          pointerEvents='none'
          className={`absolute inset-0 ${dark ? 'bg-white/5' : 'bg-white/40'}`}
        />

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Ouvrir la carte'
          onPress={() => router.push('/dashboard')}
          className='flex-1 items-center'>
          <Ionicons name='map-outline' size={22} color={iconColor} />
          <Text className={`mt-1 text-[11px] ${labelColor}`}>Carte</Text>
        </Pressable>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Ouvrir les évènements'
          onPress={() => router.push('/events')}
          className='flex-1 items-center'>
          <Ionicons name='calendar-outline' size={22} color={iconColor} />
          <Text className={`mt-1 text-[11px] ${labelColor}`}>Évènement</Text>
        </Pressable>

        <View style={{ width: 64 }} className='items-center'>
          <Text className={`mt-7 text-[11px] ${labelColor}`}>Signaler</Text>
        </View>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Ouvrir le contact'
          onPress={() => router.push('/contact')}
          className='flex-1 items-center'>
          <Ionicons name='chatbox-outline' size={22} color={iconColor} />
          <Text className={`mt-1 text-[11px] ${labelColor}`}>Contact</Text>
        </Pressable>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Ouvrir le profil'
          onPress={() => {
            if (!isAuthenticated) {
              router.push({ pathname: '/login', params: { redirectTo: '/profile' } as any });
            } else {
              router.push('/profile');
            }
          }}
          className='flex-1 items-center'>
          <Ionicons name='person-outline' size={22} color={iconColor} />
          <Text className={`mt-1 text-[11px] ${labelColor}`}>Profile</Text>
        </Pressable>
      </BlurView>

      <View className='absolute' style={{ top: -20 }}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Signaler'
          onPress={() => {
            if (!isAuthenticated) {
              router.push({ pathname: '/login', params: { redirectTo: '/report' } as any });
            } else {
              router.push('/report');
            }
          }}
          className={`h-16 w-16 items-center justify-center rounded-full ${dark ? 'bg-slate-700/90' : 'bg-slate-800/90'} shadow-xl`}
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          }}>
          <Ionicons name='paper-plane-outline' size={26} color={'#FFFFFF'} />
        </Pressable>
      </View>
    </View>
  );
};

export default BottomBar;
