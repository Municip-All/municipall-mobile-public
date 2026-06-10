import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reportService, Report } from '../services/reportService';
import { ensureAuthenticatedForReport } from '../lib/requireAuthForReport';

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

function getStatusColor(status: string): string {
  switch (normalizeStatus(status)) {
    case 'en attente':
      return '#FF9500';
    case 'en cours':
      return '#007AFF';
    case 'résolu':
      return '#34C759';
    case 'clôturé':
      return '#8E8E93';
    default:
      return '#8E8E93';
  }
}

function isArchivedReport(status: string): boolean {
  const s = normalizeStatus(status);
  return s === 'résolu' || s === 'clôturé';
}

function matchesFilter(report: Report, filter: string): boolean {
  const status = normalizeStatus(report.status);
  if (filter === 'Tous') return true;
  if (filter === 'En attente') return status === 'en attente';
  if (filter === 'En cours') return status === 'en cours';
  return report.status === filter;
}

function formatDate(value?: string): string {
  if (!value) return new Date().toLocaleDateString('fr-FR');
  return new Date(value).toLocaleDateString('fr-FR');
}

function ReportCard({
  report,
  dark,
  primaryColor,
  onPress,
}: {
  report: Report;
  dark: boolean;
  primaryColor: string;
  onPress: () => void;
}) {
  const statusColor = getStatusColor(report.status);
  const lastFromAgent = report.lastMessage?.senderRole === 'agent';

  const previewBody = report.lastMessage
    ? report.lastMessage.body
    : report.description?.trim() || "Signalement envoyé depuis l'application.";

  const previewCaption = report.lastMessage
    ? lastFromAgent
      ? 'Dernier message · Mairie'
      : 'Dernier message · Vous'
    : 'Votre signalement';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.reportCard}
      className={`overflow-hidden rounded-3xl border ${
        dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
      } ${lastFromAgent ? (dark ? 'border-blue-900/50' : 'border-blue-100') : ''}`}>
      {lastFromAgent ? (
        <View className='h-1 w-full' style={{ backgroundColor: dark ? '#3B82F6' : '#007AFF' }} />
      ) : null}

      <View className='p-5'>
        <View className='flex-row items-start justify-between gap-3'>
          <View className='min-w-0 flex-1'>
            <Text
              className={`text-lg font-bold ${dark ? 'text-white' : 'text-black'}`}
              numberOfLines={1}>
              {report.category}
            </Text>
            <Text
              className={`mt-0.5 text-[11px] font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Réf. {report.id ?? '—'} · {formatDate(report.createdAt)}
            </Text>
          </View>
          <View
            className='shrink-0 rounded-full px-2.5 py-1'
            style={{ backgroundColor: `${statusColor}18` }}>
            <Text className='text-[10px] font-black uppercase' style={{ color: statusColor }}>
              {report.status}
            </Text>
          </View>
        </View>

        <View className={`mt-4 rounded-2xl px-3.5 py-3 ${dark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}>
          <Text
            className={`text-[10px] font-bold tracking-wide uppercase ${
              lastFromAgent
                ? 'text-blue-600 dark:text-blue-400'
                : dark
                  ? 'text-zinc-500'
                  : 'text-zinc-400'
            }`}>
            {previewCaption}
          </Text>
          <Text
            className={`mt-1 text-sm leading-5 ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}
            numberOfLines={3}>
            {previewBody}
          </Text>
        </View>

        <View className='mt-4 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-2'>
            <Ionicons
              name={lastFromAgent ? 'mail-unread-outline' : 'chatbubbles-outline'}
              size={16}
              color={lastFromAgent ? '#007AFF' : primaryColor}
            />
            <Text
              className={`text-xs font-semibold ${
                lastFromAgent
                  ? 'text-blue-600 dark:text-blue-400'
                  : dark
                    ? 'text-zinc-400'
                    : 'text-zinc-500'
              }`}>
              {lastFromAgent ? 'Réponse à lire' : 'Voir la conversation'}
            </Text>
          </View>
          <Ionicons name='chevron-forward' size={16} color={dark ? '#71717a' : '#a1a1aa'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SignalementsList() {
  const { dark, primaryColor, classes, layoutStyles } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [showArchives, setShowArchives] = useState(false);

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

  const activeReports = reports.filter((r) => !isArchivedReport(r.status));
  const archivedReports = reports.filter((r) => isArchivedReport(r.status));
  const filteredReports = activeReports.filter((r) => matchesFilter(r, activeFilter));

  const openNewReport = () => {
    if (!ensureAuthenticatedForReport(isAuthenticated, router)) return;
    router.push({ pathname: '/carte', params: { action: 'report' } });
  };

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View className='mb-6'>
          <Text
            className={`text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Vigilance
          </Text>
          <Text
            className={`text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
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
            <View style={styles.filterRow}>
              {(['Tous', 'En attente', 'En cours'] as const).map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    activeOpacity={0.8}
                    style={[
                      styles.filterChip,
                      isActive
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : {
                            backgroundColor: dark ? '#18181b' : '#ffffff',
                            borderColor: dark ? '#27272a' : '#e4e4e7',
                          },
                    ]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive
                          ? styles.filterChipTextActive
                          : { color: dark ? '#a1a1aa' : '#71717a' },
                      ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loading ? (
              <ActivityIndicator color={primaryColor} className='mt-10' />
            ) : filteredReports.length === 0 && activeReports.length === 0 ? (
              <View className='mt-16 items-center'>
                <Ionicons
                  name='document-text-outline'
                  size={56}
                  color={dark ? '#27272A' : '#E4E4E7'}
                />
                <Text
                  className={`mt-4 text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Aucun signalement en cours
                </Text>
                <TouchableOpacity onPress={openNewReport} className='mt-6'>
                  <Text style={{ color: primaryColor }} className='text-sm font-bold'>
                    Faire un signalement
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {filteredReports.length === 0 ? (
                  <Text
                    className={`mb-4 text-center text-sm ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Aucun signalement pour ce filtre
                  </Text>
                ) : (
                  <View style={styles.reportList}>
                    {filteredReports.map((report, i) => (
                      <ReportCard
                        key={report.id ?? i}
                        report={report}
                        dark={dark}
                        primaryColor={primaryColor}
                        onPress={() =>
                          report.id &&
                          router.push({
                            pathname: '/report-chat',
                            params: { id: String(report.id) },
                          })
                        }
                      />
                    ))}
                  </View>
                )}

                {archivedReports.length > 0 && (
                  <View className='mt-6'>
                    <TouchableOpacity
                      onPress={() => setShowArchives((v) => !v)}
                      activeOpacity={0.8}
                      className={`mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                        dark ? 'bg-zinc-900' : 'bg-zinc-100'
                      }`}>
                      <View className='flex-row items-center gap-2'>
                        <Ionicons name='archive-outline' size={18} color='#8E8E93' />
                        <Text
                          className={`text-xs font-bold tracking-wide uppercase ${
                            dark ? 'text-zinc-400' : 'text-zinc-500'
                          }`}>
                          Archives ({archivedReports.length})
                        </Text>
                      </View>
                      <Ionicons
                        name={showArchives ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color='#8E8E93'
                      />
                    </TouchableOpacity>
                    {showArchives &&
                      archivedReports.map((report, i) => (
                        <View key={report.id ?? i} style={{ opacity: 0.75 }}>
                          <ReportCard
                            report={report}
                            dark={dark}
                            primaryColor={primaryColor}
                            onPress={() =>
                              report.id &&
                              router.push({
                                pathname: '/report-chat',
                                params: { id: String(report.id) },
                              })
                            }
                          />
                        </View>
                      ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginTop: 4,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  reportList: {
    marginTop: 8,
  },
  reportCard: {
    marginBottom: 12,
  },
});
