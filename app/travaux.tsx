import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../services/apiClient';

export default function Travaux() {
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const primaryColor = config?.theme.primaryColor || '#0B0080';

  const [works, setWorks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await apiClient.get('construction-works');
        setWorks(response.data);
      } catch (err) {
        console.error('Failed to fetch works', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours':
        return '#FF9500';
      case 'Annulé':
        return '#FF3B30';
      case 'Terminé':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'En cours':
        return 'bg-orange-100 dark:bg-orange-900/20';
      case 'Annulé':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'Terminé':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

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
        <View className='mb-8'>
          <Text
            className={`text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Infrastructure
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Travaux
          </Text>
        </View>

        {/* Works List */}
        <View className='space-y-4'>
          {isLoading ? (
            <ActivityIndicator color={primaryColor} size='large' style={{ marginTop: 40 }} />
          ) : works.length === 0 ? (
            <View className='items-center py-20'>
              <Ionicons name='hammer-outline' size={48} color={dark ? '#3F3F46' : '#D4D4D8'} />
              <Text className={`mt-4 font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Aucun chantier signalé
              </Text>
            </View>
          ) : (
            works.map((item, i) => (
              <TouchableOpacity
                key={i}
                className={`mb-4 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
                <View className='p-6'>
                  <View className='mb-4 flex-row items-center'>
                    <View
                      className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl ${getStatusBg(item.status)}`}>
                      <Ionicons name='construct' size={24} color={getStatusColor(item.status)} />
                    </View>
                    <View className='flex-1'>
                      <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                        {item.title}
                      </Text>
                      <Text
                        className={`text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {item.impactType || 'Travaux de voirie'}
                      </Text>
                    </View>
                  </View>

                  <View className='rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
                    <View className='mb-2 flex-row items-center justify-between'>
                      <Text
                        className={`text-xs font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        STATUT
                      </Text>
                      <Text
                        className='text-xs font-black uppercase'
                        style={{ color: getStatusColor(item.status) }}>
                        {item.status}
                      </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                      <Text
                        className={`text-xs font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        PÉRIODE
                      </Text>
                      <Text
                        className={`text-xs font-bold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        Du {new Date(item.startDate).toLocaleDateString()} au{' '}
                        {new Date(item.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Notice */}
        <View className='mt-8 rounded-[28px] border border-dashed border-zinc-200 p-6 dark:border-zinc-800'>
          <Text
            className={`text-center text-xs leading-5 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Ces informations sont fournies à titre indicatif par les services techniques de la
            ville. Les dates peuvent varier selon les conditions météorologiques.
          </Text>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
