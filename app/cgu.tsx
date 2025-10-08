import React from 'react';
import { ScrollView, Text } from 'react-native';

const CGUPage: React.FC = () => {
  return (
    <ScrollView className='flex-1 bg-gray-900 p-4'>
      <Text className='mb-4 text-2xl font-bold text-white'>
        Conditions Générales d&apos;Utilisation
      </Text>

      <Text className='mb-4 text-base text-white'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget tellus
        tristique bibendum. Donec rutrum sed sem quis venenatis.
      </Text>

      <Text className='mb-4 text-base text-white'>
        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
        egestas. Integer nec libero venenatis, ultricies ligula id, sollicitudin lacus.
      </Text>
    </ScrollView>
  );
};

export default CGUPage;
