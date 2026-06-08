import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reportService, Report } from '../services/reportService';

export default function SignalementsList() {
  const { dark, primaryColor, classes } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getReports();
        setReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en attente':
        return '#FF9500';
      case 'en cours':
        return '#007AFF';
      case 'résolu':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const filteredReports =
    activeFilter === 'Tous' ? reports : reports.filter((r) => r.status === activeFilter);

  return (
    <View className={`flex-1 ${classes.page}`}>
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
            Vigilance
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Signalements
          </Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-6'>
          {['Tous', 'En attente', 'En cours', 'Résolu'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`mr-2 rounded-full border px-6 py-2.5 ${
                activeFilter === filter
                  ? 'border-transparent'
                  : dark
                    ? 'border-zinc-800 bg-zinc-900'
                    : 'border-zinc-200 bg-white'
              }`}
              style={activeFilter === filter ? { backgroundColor: primaryColor } : {}}>
              <Text
                className={`text-sm font-bold ${activeFilter === filter ? 'text-white' : dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reports List */}
        {loading ? (
          <ActivityIndicator color={primaryColor} className='mt-10' />
        ) : filteredReports.length === 0 ? (
          <View className='mt-20 items-center'>
            <Ionicons name='document-text-outline' size={64} color={dark ? '#27272A' : '#E4E4E7'} />
            <Text
              className={`mt-4 text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Aucun signalement trouvé
            </Text>
          </View>
        ) : (
          <View className='space-y-4'>
            {filteredReports.map((report, i) => (
              <TouchableOpacity
                key={report.id || i}
                className={`mb-4 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
                <View className='p-6'>
                  <View className='mb-4 flex-row items-start justify-between'>
                    <View className='mr-4 flex-1'>
                      <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                        {report.category}
                      </Text>
                      <Text
                        className={`mt-1 text-xs font-bold tracking-tighter uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        REF-{report.id || 'N/A'} • {new Date().toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      className='rounded-full px-3 py-1'
                      style={{ backgroundColor: `${getStatusColor(report.status)}15` }}>
                      <Text
                        className='text-[10px] font-black uppercase'
                        style={{ color: getStatusColor(report.status) }}>
                        {report.status}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className={`mb-4 text-sm leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {report.description || "Signalement effectué via l'application citoyenne."}
                  </Text>

                  <View className='flex-row items-center border-t border-zinc-50 pt-4 dark:border-zinc-800'>
                    <Ionicons name='location-outline' size={14} color={primaryColor} />
                    <Text
                      className={`ml-2 text-xs font-semibold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
