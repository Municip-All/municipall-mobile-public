import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reportService, Report } from '../services/reportService';

const ContactScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const primaryColor = config?.theme.primaryColor || '#0B0080';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getReports();
        setReports(data.slice(0, 5)); // Show last 5
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
            Assistance
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Contact
          </Text>
        </View>

        {/* Support Section */}
        <View
          className={`mb-8 rounded-[28px] p-6 ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          <Text className={`mb-2 text-lg font-bold ${dark ? 'text-white' : 'text-black'}`}>
            Besoin d&apos;aide ?
          </Text>
          <Text className={`mb-6 text-sm leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Notre équipe est à votre disposition pour toute question concernant les services de la
            mairie.
          </Text>

          <View className='space-y-4'>
            <TouchableOpacity
              className={`rounded-2xl p-4 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'} mb-3 flex-row items-center`}>
              <Ionicons name='mail-outline' size={20} color={primaryColor} />
              <Text className={`ml-3 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>
                mairie@bouffemont.fr
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-2xl p-4 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'} flex-row items-center`}>
              <Ionicons name='call-outline' size={20} color={primaryColor} />
              <Text className={`ml-3 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>
                01 39 91 00 00
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Requests Section (Apple Style List) */}
        <Text className={`mb-4 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
          Vos demandes
        </Text>
        <View
          className={`mb-8 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          {loading ? (
            <ActivityIndicator className='my-8' color={primaryColor} />
          ) : reports.length === 0 ? (
            <View className='items-center p-8'>
              <Text className={`text-sm ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Aucune demande en cours
              </Text>
            </View>
          ) : (
            reports.map((report, i) => (
              <TouchableOpacity
                key={report.id || i}
                className={`flex-row items-center justify-between p-4 ${i !== reports.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                <View className='flex-1 flex-row items-center'>
                  <View
                    className='mr-3 h-10 w-10 items-center justify-center rounded-xl'
                    style={{ backgroundColor: `${getStatusColor(report.status)}15` }}>
                    <Ionicons
                      name='document-text-outline'
                      size={20}
                      color={getStatusColor(report.status)}
                    />
                  </View>
                  <View className='mr-2 flex-1'>
                    <Text
                      numberOfLines={1}
                      className={`text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                      {report.category}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className={`mt-0.5 text-[11px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {report.description || 'Pas de description'}
                    </Text>
                  </View>
                </View>
                <View className='flex-row items-center'>
                  <View
                    className='mr-2 rounded-full px-2 py-1'
                    style={{ backgroundColor: `${getStatusColor(report.status)}20` }}>
                    <Text
                      className='text-[9px] font-black uppercase'
                      style={{ color: getStatusColor(report.status) }}>
                      {report.status}
                    </Text>
                  </View>
                  <Ionicons name='chevron-forward' size={14} color='#A1A1AA' />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Message Form */}
        <Text className={`mb-4 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
          Envoyer un message
        </Text>
        <View
          className={`rounded-[28px] p-4 ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          <TextInput
            placeholder='Sujet de votre message'
            placeholderTextColor={dark ? '#52525B' : '#A1A1AA'}
            className={`border-b border-zinc-50 p-4 font-medium dark:border-zinc-800 ${dark ? 'text-white' : 'text-black'}`}
          />
          <TextInput
            placeholder='Comment pouvons-nous vous aider ?'
            placeholderTextColor={dark ? '#52525B' : '#A1A1AA'}
            multiline
            numberOfLines={5}
            className={`h-32 p-4 font-medium ${dark ? 'text-white' : 'text-black'}`}
            textAlignVertical='top'
          />
          <TouchableOpacity
            className='mt-4 items-center justify-center rounded-full py-4'
            style={{ backgroundColor: primaryColor }}>
            <Text className='font-bold text-white'>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
};

export default ContactScreen;
