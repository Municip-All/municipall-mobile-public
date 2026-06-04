import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';

interface FloatingButtonsProps {
  centerOnUserLocation: () => void;
  goToNearestCompost: () => void;
  showComposts: boolean;
  showToilets: boolean;
  toggleComposts: () => void;
  toggleToilets: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  centerOnUserLocation,
  goToNearestCompost,
  showComposts,
  showToilets,
  toggleComposts,
  toggleToilets,
}) => {
  const { dark, colors } = useAppTheme();
  const [open, setOpen] = React.useState(false);

  const panelBg = dark ? 'bg-zinc-900' : 'bg-white';
  const buttonBg = dark ? 'bg-zinc-800' : 'bg-white';
  const railBg = dark ? 'bg-zinc-900/90' : 'bg-zinc-800/90';
  const iconAccent = colors.info;

  return (
    <View className='absolute top-24 right-4 items-end space-y-2'>
      {open && (
        <View className={`mb-1 w-40 rounded-xl p-3 shadow-lg ${panelBg} border border-zinc-200 dark:border-zinc-700`}>
          <TouchableOpacity
            className='mb-2 flex-row items-center justify-between'
            onPress={toggleComposts}>
            <Ionicons name='leaf-outline' size={18} color={showComposts ? colors.success : colors.iconMuted} />
            <View className='flex-1 pl-2'>
              <Ionicons
                name={showComposts ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={showComposts ? colors.success : colors.iconMuted}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row items-center justify-between'
            onPress={toggleToilets}>
            <Ionicons name='water-outline' size={18} color={showToilets ? colors.info : colors.iconMuted} />
            <View className='flex-1 pl-2'>
              <Ionicons
                name={showToilets ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={showToilets ? colors.info : colors.iconMuted}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <View className={`rounded-full p-2 ${railBg}`}>
        <TouchableOpacity
          onPress={() => setOpen((o) => !o)}
          className={`mb-3 rounded-full p-2 ${buttonBg} shadow-md`}>
          <Ionicons name='funnel-outline' size={20} color={iconAccent} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={centerOnUserLocation}
          className={`mb-3 rounded-full p-2 ${buttonBg} shadow-md`}>
          <Ionicons name='locate-outline' size={20} color={iconAccent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNearestCompost} className={`rounded-full p-2 ${buttonBg} shadow-md`}>
          <Ionicons name='leaf-outline' size={20} color={colors.success} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FloatingButtons;
