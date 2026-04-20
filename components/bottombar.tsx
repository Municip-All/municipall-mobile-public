import React from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';
import { BlurView } from 'expo-blur';

const BottomBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const dark = theme === 'dark';

  const getIconColor = (path: string) => {
    if (pathname === path) return '#2563EB'; // Ethereal Blue
    return dark ? '#9CA3AF' : '#64748B';
  };

  const getLabelColor = (path: string) => {
    if (pathname === path) return 'text-blue-600 dark:text-blue-500';
    return dark ? 'text-gray-400' : 'text-slate-500';
  };

  return (
    <View pointerEvents='box-none' className='absolute inset-x-0 bottom-0'>
      <View
        className={`flex-row justify-between px-2 pt-3 pb-8 sm:pb-4 border-t ${
          dark ? 'bg-[#18181b]/95 border-zinc-800' : 'bg-white/95 border-gray-100'
        }`}
        style={Platform.OS === 'ios' ? { paddingBottom: 32 } : { paddingBottom: 16 }}>
        {/* Accueil */}
        <Pressable
          accessibilityRole='button'
          onPress={() => router.replace('/home')}
          className='flex-1 items-center'>
          <Ionicons name={pathname === '/home' ? 'home' : 'home-outline'} size={24} color={getIconColor('/home')} />
          <Text className={`mt-1 text-[11px] font-medium ${getLabelColor('/home')}`}>Accueil</Text>
        </Pressable>

        {/* Carte */}
        <Pressable
          accessibilityRole='button'
          onPress={() => router.replace('/carte')}
          className='flex-1 items-center'>
          <Ionicons name={pathname === '/carte' ? 'map' : 'map-outline'} size={24} color={getIconColor('/carte')} />
          <Text className={`mt-1 text-[11px] font-medium ${getLabelColor('/carte')}`}>Carte</Text>
        </Pressable>

        {/* Demandes */}
        <Pressable
          accessibilityRole='button'
          onPress={() => router.replace('/demandes')}
          className='flex-1 items-center'>
          <Ionicons name={pathname === '/demandes' ? 'document-text' : 'document-text-outline'} size={24} color={getIconColor('/demandes')} />
          <Text className={`mt-1 text-[11px] font-medium ${getLabelColor('/demandes')}`}>Demandes</Text>
        </Pressable>

        {/* Agenda */}
        <Pressable
          accessibilityRole='button'
          onPress={() => router.replace('/events')}
          className='flex-1 items-center'>
          <Ionicons name={pathname === '/events' ? 'calendar' : 'calendar-outline'} size={24} color={getIconColor('/events')} />
          <Text className={`mt-1 text-[11px] font-medium ${getLabelColor('/events')}`}>Agenda</Text>
        </Pressable>

        {/* Profil */}
        <Pressable
          accessibilityRole='button'
          onPress={() => {
            if (!isAuthenticated) {
              router.replace({ pathname: '/login', params: { redirectTo: '/profile' } as any });
            } else {
              router.replace('/profile');
            }
          }}
          className='flex-1 items-center'>
          <Ionicons name={pathname === '/profile' ? 'person' : 'person-outline'} size={24} color={getIconColor('/profile')} />
          <Text className={`mt-1 text-[11px] font-medium ${getLabelColor('/profile')}`}>Profil</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default BottomBar;
