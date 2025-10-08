import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FloatingButtonsProps {
  centerOnUserLocation: () => void;
  goToNearestCompost: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  centerOnUserLocation,
  goToNearestCompost,
}) => {
  const router = useRouter();

  return (
    <View className='absolute top-24 left-4 rounded-full bg-gray-700 p-2'>
      <TouchableOpacity
        onPress={() => router.push('/report')}
        className='mb-3 rounded-full bg-white p-2'>
        <Ionicons name='megaphone-outline' size={20} color='#028CF3' />
      </TouchableOpacity>
      <TouchableOpacity onPress={centerOnUserLocation} className='mb-3 rounded-full bg-white p-2'>
        <Ionicons name='locate-outline' size={20} color='#028CF3' />
      </TouchableOpacity>
      <TouchableOpacity onPress={goToNearestCompost} className='rounded-full bg-white p-2'>
        <Ionicons name='leaf-outline' size={20} color='#028CF3' />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingButtons;
