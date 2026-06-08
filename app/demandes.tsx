import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reportService, Report } from '../services/reportService';

export default function SignalementsList() {
  const { dark, primaryColor, classes } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');

  const loadReports = useCallback(async () => {
    if (!isAuthenticated) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      console.error(error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

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

  const formatDate = (value?: string) => {
    if (!value) return new Date().toLocaleDateString('fr-FR');
    return new Date(value).toLocaleDateString('fr-FR');
  };

  return (
    <View className={`flex-1 ${classes.page}`}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
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

        {!isAuthenticated ? (
          <View className='mt-16 items-center px-4'>
            <Ionicons name='lock-closed-outline' size={48} color={dark ? '#3f3f46' : '#d4d4d8'} />
            <Text className={`mt-4 text-center text-sm ${classes.body}`}>
              Connectez-vous pour suivre vos signalements et échanger avec la mairie.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              className='mt-6 rounded-full px-8 py-3'
              style={{ backgroundColor: primaryColor }}>
              <Text className='text-sm font-bold text-white'>Se connecter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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

            {loading ? (
              <ActivityIndicator color={primaryColor} className='mt-10' />
            ) : filteredReports.length === 0 ? (
              <View className='mt-20 items-center'>
                <Ionicons
                  name='document-text-outline'
                  size={64}
                  color={dark ? '#27272A' : '#E4E4E7'}
                />
                <Text
                  className={`mt-4 text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Aucun signalement trouvé
                </Text>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/carte', params: { action: 'report' } })}
                  className='mt-6'>
                  <Text style={{ color: primaryColor }} className='text-sm font-bold'>
                    Faire un signalement
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className='space-y-4'>
                {filteredReports.map((report, i) => {
                  const hasAgentReply = report.lastMessage?.senderRole === 'agent';
                  return (
                    <TouchableOpacity
                      key={report.id || i}
                      onPress={() =>
                        report.id &&
                        router.push({ pathname: '/report-chat', params: { id: String(report.id) } })
                      }
                      className={`mb-4 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
                      <View className='p-6'>
                        <View className='mb-4 flex-row items-start justify-between'>
                          <View className='mr-4 flex-1'>
                            <Text
                              className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                              {report.category}
                            </Text>
                            <Text
                              className={`mt-1 text-xs font-bold tracking-tighter uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              REF-{report.id || 'N/A'} • {formatDate(report.createdAt)}
                            </Text>
                          </View>
                          <View className='items-end gap-2'>
                            <View
                              className='rounded-full px-3 py-1'
                              style={{ backgroundColor: `${getStatusColor(report.status)}15` }}>
                              <Text
                                className='text-[10px] font-black uppercase'
                                style={{ color: getStatusColor(report.status) }}>
                                {report.status}
                              </Text>
                            </View>
                            {hasAgentReply ? (
                              <View className='flex-row items-center gap-1'>
                                <View className='h-2 w-2 rounded-full bg-[#007AFF]' />
                                <Text className='text-[10px] font-bold text-[#007AFF]'>Mairie</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>

                        <Text
                          className={`mb-3 text-sm leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}
                          numberOfLines={2}>
                          {report.description ||
                            "Signalement effectué via l'application citoyenne."}
                        </Text>

                        {report.lastMessage ? (
                          <View
                            className={`mb-3 rounded-2xl px-3 py-2 ${dark ? 'bg-zinc-800/80' : 'bg-zinc-50'}`}>
                            <Text
                              className={`text-xs leading-5 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}
                              numberOfLines={2}>
                              {report.lastMessage.senderRole === 'agent' ? 'Mairie : ' : 'Vous : '}
                              {report.lastMessage.body}
                            </Text>
                          </View>
                        ) : null}

                        <View className='flex-row items-center justify-between border-t border-zinc-50 pt-4 dark:border-zinc-800'>
                          <View className='flex-row items-center'>
                            <Ionicons name='chatbubbles-outline' size={14} color={primaryColor} />
                            <Text
                              className={`ml-2 text-xs font-semibold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Voir la conversation
                            </Text>
                          </View>
                          <Ionicons
                            name='chevron-forward'
                            size={16}
                            color={dark ? '#71717a' : '#a1a1aa'}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
