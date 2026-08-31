import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Report } from '../services/reportService';
import { useTheme } from '@context/themecontext';

function statusColor(status: string): string {
  switch (status) {
    case 'En attente':
      return '#FF9500';
    case 'En cours':
      return '#007AFF';
    case 'Résolu':
      return '#34C759';
    default:
      return '#8E8E93';
  }
}

function formatDate(value?: string): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ReportSummaryCard({
  report,
  onOpen,
  showDivider,
  dark,
}: {
  report: Report;
  onOpen: () => void;
  showDivider: boolean;
  dark: boolean;
}) {
  const color = statusColor(report.status);
  const preview =
    report.lastMessage?.body?.trim() ||
    report.description?.trim() ||
    'Signalement citoyen sur la carte.';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onOpen}
      style={[
        styles.card,
        showDivider && styles.cardDivider,
        showDivider && { borderTopColor: dark ? '#3f3f46' : '#e4e4e7' },
      ]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: dark ? '#ffffff' : '#18181b' }]} numberOfLines={1}>
          {report.category}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.statusText, { color }]}>{report.status}</Text>
        </View>
      </View>
      <Text style={[styles.cardMeta, { color: dark ? '#a1a1aa' : '#71717a' }]}>
        Réf. {report.id ?? '—'}
        {report.createdAt ? ` · ${formatDate(report.createdAt)}` : ''}
      </Text>
      <Text style={[styles.cardBody, { color: dark ? '#d4d4d8' : '#3f3f46' }]} numberOfLines={3}>
        {report.lastMessage?.senderRole === 'agent' ? 'Mairie : ' : ''}
        {preview}
      </Text>
      <Text style={[styles.cardAction, { color: dark ? '#818cf8' : '#0B0080' }]}>
        Voir le détail →
      </Text>
    </TouchableOpacity>
  );
}

type ReportMapSummarySheetProps = {
  visible: boolean;
  reports: Report[];
  bottomInset?: number;
  onClose: () => void;
  onOpenReport: (reportId: number) => void;
};

/** Feuille résumé signalement(s) — overlay absolu (évite Modal + Callout instables). */
export default function ReportMapSummarySheet({
  visible,
  reports,
  bottomInset = 16,
  onClose,
  onOpenReport,
}: ReportMapSummarySheetProps) {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';

  if (!visible) return null;

  const multiple = reports.length > 1;

  return (
    <View style={styles.root} pointerEvents='box-none'>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel='Fermer' />
      <View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(bottomInset, 16),
            backgroundColor: dark ? '#18181b' : '#ffffff',
          },
        ]}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.heading, { color: dark ? '#ffffff' : '#18181b' }]}>
            {multiple ? `${reports.length} signalements ici` : 'Signalement'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel='Fermer'>
            <Ionicons name='close' size={22} color={dark ? '#a1a1aa' : '#71717a'} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={multiple}>
          {reports.map((report, index) => (
            <ReportSummaryCard
              key={report.id ?? index}
              report={report}
              onOpen={() => {
                if (report.id) {
                  onClose();
                  onOpenReport(report.id);
                }
              }}
              showDivider={index > 0}
              dark={dark}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingTop: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  heading: {
    fontSize: 17,
    fontWeight: '800',
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cardDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  cardAction: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
});
