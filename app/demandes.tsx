import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/BottomBar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reportService, Report } from '../services/reportService';
import { ensureCanReport } from '../lib/requireAuthForReport';
import { palette, semanticColors } from '@constants/design';
import { useCityServicesAccess } from '@hooks/useCityServicesAccess';
import NoPartnerCityBanner from '@components/NoPartnerCityBanner';

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

function getStatusColor(status: string, dark: boolean): string {
  switch (normalizeStatus(status)) {
    case 'en attente':
      return semanticColors.warning;
    case 'en cours':
      return semanticColors.info;
    case 'résolu':
      return dark ? semanticColors.successDark : semanticColors.success;
    case 'clôturé':
      return dark ? palette.nightMuted : palette.muted;
    default:
      return dark ? palette.nightMuted : palette.muted;
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
  colors,
  onPress,
}: {
  report: Report;
  dark: boolean;
  primaryColor: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  onPress: () => void;
}) {
  const statusColor = getStatusColor(report.status, dark);
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
      style={[
        styles.reportCard,
        {
          backgroundColor: colors.card,
          borderColor: lastFromAgent ? semanticColors.info : colors.border,
        },
      ]}
      className='overflow-hidden rounded-[20px] border'>
      {lastFromAgent ? (
        <View className='h-1 w-full' style={{ backgroundColor: semanticColors.info }} />
      ) : null}

      <View className='p-5'>
        <View className='flex-row items-start justify-between gap-3'>
          <View className='min-w-0 flex-1'>
            <Text className='text-lg font-bold' numberOfLines={1} style={{ color: colors.textPrimary }}>
              {report.category}
            </Text>
            <Text className='mt-0.5 text-[11px] font-semibold' style={{ color: colors.textSecondary }}>
              Réf. {report.id ?? '—'} · {formatDate(report.createdAt)}
            </Text>
          </View>
          <View
            className='shrink-0 rounded-full px-2.5 py-1'
            style={{ backgroundColor: `${statusColor}18` }}>
            <Text className='text-[10px] font-extrabold uppercase' style={{ color: statusColor }}>
              {report.status}
            </Text>
          </View>
        </View>

        <View
          className='mt-4 rounded-2xl px-3.5 py-3'
          style={{ backgroundColor: colors.elevated }}>
          <Text
            className='text-[10px] font-bold tracking-wide uppercase'
            style={{ color: lastFromAgent ? semanticColors.info : colors.textSecondary }}>
            {previewCaption}
          </Text>
          <Text className='mt-1 text-sm leading-5' numberOfLines={3} style={{ color: colors.textBody }}>
            {previewBody}
          </Text>
        </View>

        <View className='mt-4 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-2'>
            <Ionicons
              name={lastFromAgent ? 'mail-unread-outline' : 'chatbubbles-outline'}
              size={16}
              color={lastFromAgent ? semanticColors.info : primaryColor}
            />
            <Text
              className='text-xs font-semibold'
              style={{ color: lastFromAgent ? semanticColors.info : colors.textSecondary }}>
              {lastFromAgent ? 'Réponse à lire' : 'Voir la conversation'}
            </Text>
          </View>
          <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SignalementsList() {
  const { dark, primaryColor, classes, colors, layoutStyles, typeStyles } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const { needsPartnerCity, cityServicesEnabled } = useCityServicesAccess();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [showArchives, setShowArchives] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!isAuthenticated || needsPartnerCity) {
        setReports([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await reportService.getReports();
        if (!signal?.cancelled) setReports(data);
      } catch {
        if (!signal?.cancelled) {
          setReports([]);
          Alert.alert('Erreur', 'Impossible de charger vos signalements.');
        }
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [isAuthenticated, needsPartnerCity]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    loadReports(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadReports]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }, [loadReports]);

  const activeReports = reports.filter((r) => !isArchivedReport(r.status));
  const archivedReports = reports.filter((r) => isArchivedReport(r.status));
  const filteredReports = activeReports.filter((r) => matchesFilter(r, activeFilter));

  const openNewReport = () => {
    if (!ensureCanReport(isAuthenticated, cityServicesEnabled, router)) return;
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }>
        <View className='mb-6'>
          <Text className={classes.eyebrow} style={typeStyles.eyebrow}>Vigilance</Text>
          <Text
 className={`text-3xl font-extrabold tracking-tight`} style={{ color: colors.textPrimary }}>
            Signalements
          </Text>
        </View>

        {!isAuthenticated ? (
          <View className='mt-16 items-center px-4'>
            <Ionicons name='lock-closed-outline' size={48} color={colors.iconMuted} />
            <Text className={`mt-4 text-center text-sm ${classes.body}`} style={typeStyles.body}>
              Connectez-vous pour suivre vos signalements et échanger avec la mairie.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              className='mt-6 rounded-full px-8 py-3'
              style={{ backgroundColor: primaryColor }}
              accessibilityRole='button'
              accessibilityLabel='Se connecter'>
              <Text className='text-sm font-bold' style={{ color: colors.onPrimary }}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        ) : needsPartnerCity ? (
          <NoPartnerCityBanner />
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
                    accessibilityRole='button'
                    accessibilityLabel={`Filtrer par ${filter}`}
                    style={[
                      styles.filterChip,
                      isActive
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive ? { color: colors.onPrimary } : { color: colors.iconMuted },
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
                  color={dark ? palette.nightBorder : palette.cream200}
                />
                <Text className={`mt-4 ${classes.subtitle}`} style={typeStyles.subtitle}>Aucun signalement en cours</Text>
                <TouchableOpacity
                  onPress={openNewReport}
                  className='mt-6'
                  accessibilityRole='button'
                  accessibilityLabel='Faire un signalement'>
                  <Text style={{ color: primaryColor }} className='text-sm font-bold'>
                    Faire un signalement
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {filteredReports.length === 0 ? (
                  <Text
 className={`mb-4 text-center text-sm`} style={{ color: colors.textSecondary }}>
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
                        colors={colors}
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
                      className={`mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3 ${ dark ? 'bg-night-surface' : 'bg-cream-100' }`}
                      accessibilityRole='button'
                      accessibilityLabel={
                        showArchives ? 'Masquer les archives' : 'Afficher les archives'
                      }>
                      <View className='flex-row items-center gap-2'>
                        <Ionicons
                          name='archive-outline'
                          size={18}
                          color={dark ? palette.nightMuted : palette.muted}
                        />
                        <Text className={classes.eyebrow} style={typeStyles.eyebrow}>Archives ({archivedReports.length})</Text>
                      </View>
                      <Ionicons
                        name={showArchives ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={dark ? palette.nightMuted : palette.muted}
                      />
                    </TouchableOpacity>
                    {showArchives &&
                      archivedReports.map((report, i) => (
                        <View key={report.id ?? i} style={{ opacity: 0.75 }}>
                          <ReportCard
                            report={report}
                            dark={dark}
                            primaryColor={primaryColor}
                            colors={colors}
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
  reportList: {
    marginTop: 8,
  },
  reportCard: {
    marginBottom: 12,
  },
});
