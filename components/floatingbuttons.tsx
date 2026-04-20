import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const [open, setOpen] = React.useState(false);

  return (
    <View className='absolute top-24 right-4 items-end space-y-2'>
      {open && (
        <View className='mb-1 w-40 rounded-xl bg-white p-3 shadow-lg dark:bg-neutral-800'>
          <TouchableOpacity
            className='mb-2 flex-row items-center justify-between'
            onPress={toggleComposts}>
            <Ionicons name='leaf-outline' size={18} color={showComposts ? '#16a34a' : '#6b7280'} />
            <View className='flex-1 pl-2'>
              <Ionicons
                name={showComposts ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={showComposts ? '#16a34a' : '#6b7280'}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row items-center justify-between'
            onPress={toggleToilets}>
            <Ionicons name='water-outline' size={18} color={showToilets ? '#0ea5e9' : '#6b7280'} />
            <View className='flex-1 pl-2'>
              <Ionicons
                name={showToilets ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={showToilets ? '#0ea5e9' : '#6b7280'}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <View className='rounded-full bg-gray-700 p-2 dark:bg-black/60'>
        <TouchableOpacity
          onPress={() => setOpen((o) => !o)}
          className='mb-3 rounded-full bg-white p-2 dark:bg-neutral-200'>
          <Ionicons name='funnel-outline' size={20} color='#028CF3' />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={centerOnUserLocation}
          className='mb-3 rounded-full bg-white p-2 dark:bg-neutral-200'>
          <Ionicons name='locate-outline' size={20} color='#028CF3' />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goToNearestCompost}
          className='rounded-full bg-white p-2 dark:bg-neutral-200'>
          <Ionicons name='leaf-outline' size={20} color='#028CF3' />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FloatingButtons;
