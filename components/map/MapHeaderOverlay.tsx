import type { ComponentProps, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';

export type MapLayerItem = {
  id: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  onToggle: () => void;
};

type Props = {
  cityName?: string;
  layersOpen: boolean;
  onLayersOpenChange: (open: boolean) => void;
  mapLayers: MapLayerItem[];
  statusLegend: readonly { label: string; color: string }[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterLocation: () => void;
};

function IconButton({
  onPress,
  label,
  children,
  active,
  primaryColor,
  dark,
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
  active?: boolean;
  primaryColor: string;
  dark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      style={[
        styles.iconBtn,
        {
          backgroundColor: active
            ? `${primaryColor}22`
            : dark
              ? 'rgba(63,63,70,0.55)'
              : 'rgba(255,255,255,0.55)',
          borderColor: active ? primaryColor : 'transparent',
          borderWidth: active ? 1 : 0,
        },
      ]}>
      {children}
    </TouchableOpacity>
  );
}

export default function MapHeaderOverlay({
  cityName = "Municip'All",
  layersOpen,
  onLayersOpenChange,
  mapLayers,
  statusLegend,
  onZoomIn,
  onZoomOut,
  onCenterLocation,
}: Props) {
  const insets = useSafeAreaInsets();
  const { dark, primaryColor } = useAppTheme();
  const iconColor = dark ? '#E4E4E7' : '#3F3F46';

  return (
    <View
      pointerEvents='box-none'
      style={[styles.wrapper, { paddingTop: insets.top + 6 }]}>
      <BlurView
        intensity={dark ? 28 : 45}
        tint={dark ? 'dark' : 'light'}
        style={[
          styles.panel,
          {
            borderColor: dark ? 'rgba(63,63,70,0.4)' : 'rgba(255,255,255,0.45)',
          },
        ]}>
        <View style={styles.bar}>
          <Text
            numberOfLines={1}
            className={`flex-1 text-sm font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}
            style={styles.title}>
            {cityName}
          </Text>
          <View style={styles.actions}>
            <IconButton
              dark={dark}
              primaryColor={primaryColor}
              onPress={onZoomOut}
              label='Dézoomer'>
              <Ionicons name='remove' size={16} color={iconColor} />
            </IconButton>
            <IconButton dark={dark} primaryColor={primaryColor} onPress={onZoomIn} label='Zoomer'>
              <Ionicons name='add' size={16} color={iconColor} />
            </IconButton>
            <IconButton
              dark={dark}
              primaryColor={primaryColor}
              onPress={onCenterLocation}
              label='Ma position'>
              <Ionicons name='navigate' size={16} color={primaryColor} />
            </IconButton>
            <IconButton
              dark={dark}
              primaryColor={primaryColor}
              onPress={() => onLayersOpenChange(!layersOpen)}
              label='Calques'
              active={layersOpen}>
              <Ionicons
                name={layersOpen ? 'layers' : 'layers-outline'}
                size={16}
                color={layersOpen ? primaryColor : iconColor}
              />
            </IconButton>
          </View>
        </View>

        {layersOpen ? (
          <View style={styles.expanded}>
            <View style={styles.layerRow}>
              {mapLayers.map((layer) => (
                <TouchableOpacity
                  key={layer.id}
                  onPress={layer.onToggle}
                  accessibilityLabel={layer.label}
                  style={[
                    styles.layerChip,
                    {
                      backgroundColor: layer.active
                        ? `${primaryColor}18`
                        : dark
                          ? 'rgba(39,39,42,0.5)'
                          : 'rgba(255,255,255,0.45)',
                      borderColor: layer.active ? primaryColor : 'transparent',
                    },
                  ]}>
                  <Ionicons
                    name={
                      layer.active
                        ? layer.icon
                        : (`${layer.icon}-outline` as ComponentProps<typeof Ionicons>['name'])
                    }
                    size={15}
                    color={layer.active ? primaryColor : dark ? '#A1A1AA' : '#71717A'}
                  />
                  <Text
                    numberOfLines={1}
                    className={`ml-1.5 text-[10px] font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                    {layer.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.legendRow}>
              {statusLegend.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text
                    numberOfLines={1}
                    className={`text-[9px] font-medium ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 12,
  },
  panel: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  title: {
    marginRight: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expanded: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  layerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
  },
  layerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: '48%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
