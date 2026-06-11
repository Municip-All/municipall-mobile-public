import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CityMap, MapHeaderOverlay, type CityMapMethods } from '@components/map';
import type { MapLayerItem } from '@components/map/MapHeaderOverlay';
import BottomBar from '@components/bottombar';
import ReportSignalementSheet, {
  type ReportSignalementSheetRef,
} from '@components/ReportSignalementSheet';
import ReportMapSummarySheet from '@components/ReportMapCallout';
import TransportMapCallout from '@components/TransportMapCallout';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { ensureAuthenticatedForReport } from '../lib/requireAuthForReport';
import type { ReportLocationGroup } from '../lib/groupReportsByLocation';
import type { TransportStopMarker } from '../services/transportService';

export default function Carte() {
  const mapRef = useRef<CityMapMethods>(null);
  const reportSheetRef = useRef<ReportSignalementSheetRef>(null);
  const { layoutStyles } = useAppTheme();
  const { config } = useCity();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const transportEnabled =
    (config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false;

  const [layersOpen, setLayersOpen] = useState(false);
  const [showComposts, setShowComposts] = useState(true);
  const [showToilets, setShowToilets] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showTransports, setShowTransports] = useState(true);
  const [selectedReportGroup, setSelectedReportGroup] = useState<ReportLocationGroup | null>(null);
  const [selectedTransportStop, setSelectedTransportStop] = useState<TransportStopMarker | null>(
    null
  );

  const statusLegend = useMemo(
    () =>
      [
        { label: 'En attente', color: '#FF9500' },
        { label: 'En cours', color: '#007AFF' },
        { label: 'Résolu', color: '#34C759' },
        ...(transportEnabled
          ? [
              { label: 'Zone transports', color: '#007AFF' },
              { label: 'Perturbation', color: '#FF9500' },
            ]
          : []),
      ] as const,
    [transportEnabled]
  );

  const mapLayers = useMemo<MapLayerItem[]>(
    () => [
      {
        id: 'reports',
        label: 'Signalements',
        icon: 'alert-circle',
        active: showReports,
        onToggle: () => setShowReports((v) => !v),
      },
      ...(transportEnabled
        ? [
            {
              id: 'transports',
              label: 'Transports',
              icon: 'bus' as const,
              active: showTransports,
              onToggle: () => setShowTransports((v) => !v),
            },
          ]
        : []),
      {
        id: 'composts',
        label: 'Composteurs',
        icon: 'leaf',
        active: showComposts,
        onToggle: () => setShowComposts((v) => !v),
      },
      {
        id: 'toilets',
        label: 'Toilettes',
        icon: 'water',
        active: showToilets,
        onToggle: () => setShowToilets((v) => !v),
      },
    ],
    [showComposts, showReports, showToilets, showTransports, transportEnabled]
  );

  useEffect(() => {
    if (action !== 'report') return;
    if (!isAuthenticated) {
      ensureAuthenticatedForReport(false, router);
      router.replace('/carte');
      return;
    }
    reportSheetRef.current?.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ouverture liée au deep link ?action=report
  }, [action, isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={layoutStyles.page}>
        <View style={{ flex: 1 }}>
          <CityMap
            ref={mapRef}
            showComposts={showComposts}
            showToilets={showToilets}
            showReports={showReports}
            showTransports={showTransports}
            onReportGroupPress={setSelectedReportGroup}
            onTransportStopPress={setSelectedTransportStop}
          />
          <MapHeaderOverlay
            cityName={config?.name}
            layersOpen={layersOpen}
            onLayersOpenChange={setLayersOpen}
            mapLayers={mapLayers}
            statusLegend={statusLegend}
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onCenterLocation={() => mapRef.current?.centerOnUserLocation()}
          />
        </View>
        <BottomBar />
        <ReportSignalementSheet ref={reportSheetRef} />
        <ReportMapSummarySheet
          visible={selectedReportGroup != null}
          reports={selectedReportGroup?.reports ?? []}
          bottomInset={insets.bottom}
          onClose={() => setSelectedReportGroup(null)}
          onOpenReport={(reportId) => {
            if (!ensureAuthenticatedForReport(isAuthenticated, router)) return;
            router.push({ pathname: '/report-chat', params: { id: String(reportId) } });
          }}
        />
        <TransportMapCallout
          visible={selectedTransportStop != null}
          stop={selectedTransportStop}
          bottomInset={insets.bottom + 72}
          onClose={() => setSelectedTransportStop(null)}
        />
      </View>
    </GestureHandlerRootView>
  );
}
