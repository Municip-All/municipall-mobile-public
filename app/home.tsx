import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { colorScheme } = useTheme();
  const { config, weatherData, weatherLoading, fetchWeather } = useCity();
  const dark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const primaryColor = config?.theme.primaryColor || '#0B0080';
  const cityName = weatherData?.city || config?.name || 'Ma Ville';

  const logo = config?.theme.logoUrl
    ? { uri: config.theme.logoUrl }
    : require('../assets/images/logo_white.png');

  return (
    <View className={`flex-1 ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Apple Style Header */}
        <View className='mb-8 flex-row items-end justify-between'>
          <View>
            <Text
              className={`text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <Text
              className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
              {cityName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className='h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800'>
            <Image source={logo} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
          </TouchableOpacity>
        </View>

        {/* Highlight Card (Weather) */}
        <View className='mb-6 shadow-sm'>
          <BlurView
            intensity={dark ? 40 : 80}
            tint={dark ? 'dark' : 'light'}
            className='overflow-hidden rounded-[28px] border border-white/20 dark:border-zinc-800/50'>
            <TouchableOpacity
              onPress={fetchWeather}
              className='flex-row items-center justify-between p-6'>
              <View>
                <Text
                  className={`text-sm font-semibold ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Météo
                </Text>
                <Text className={`mt-1 text-3xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                  {weatherLoading ? '...' : weatherData ? `${weatherData.temp}°` : '--°'}
                </Text>
                <Text className={`text-sm font-medium ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {weatherData?.description || 'Partiellement couvert'}
                </Text>
              </View>
              <View className='items-center'>
                <Ionicons
                  name={weatherData?.icon ? 'cloud-outline' : 'partly-sunny'}
                  size={48}
                  color={primaryColor}
                />
              </View>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Quick Actions Grid */}
        <View className='mb-8 flex-row justify-between'>
          {[
            { label: 'Signalement', icon: 'alert-circle', color: '#FF3B30', path: '/demandes' },
            { label: 'Déchets', icon: 'trash', color: '#34C759', path: '/collecte' },
            { label: 'Travaux', icon: 'construct', color: '#FF9500', path: '/travaux' },
            { label: 'Social', icon: 'heart', color: '#AF52DE', path: '/contact' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(item.path as any)}
              className='items-center'>
              <View
                className='mb-2 h-16 w-16 items-center justify-center rounded-2xl shadow-sm'
                style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text className={`text-[10px] font-bold ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feed / Alerts */}
        <Text className={`mb-4 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
          À ne pas manquer
        </Text>

        <TouchableOpacity
          className={`mb-4 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          <View className='flex-row p-5'>
            <View className='mr-4 h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <Ionicons name='alert' size={24} color='#FF3B30' />
            </View>
            <View className='flex-1'>
              <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>
                Collecte des déchets
              </Text>
              <Text
                className={`mt-1 text-sm leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Prochaine collecte mercredi 23 avril. N&apos;oubliez pas de sortir vos bacs.
              </Text>
              <Text className='mt-3 text-[11px] font-bold text-zinc-400'>IL Y A 2H</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mb-4 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          <View className='flex-row p-5'>
            <View className='mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
              <Ionicons name='construct' size={24} color='#007AFF' />
            </View>
            <View className='flex-1'>
              <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>
                Travaux Avenue République
              </Text>
              <Text
                className={`mt-1 text-sm leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Circulation alternée jusqu&apos;au vendredi 25 avril inclus.
              </Text>
              <Text className='mt-3 text-[11px] font-bold text-zinc-400'>IL Y A 5H</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
