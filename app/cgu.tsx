import React from 'react';
import { ScrollView, Text } from 'react-native';

const CGUPage: React.FC = () => {
  return (
    <ScrollView className='flex-1 bg-gray-900 p-4'>
      <Text className='mb-4 text-2xl font-bold text-white'>
        Conditions Générales d&apos;Utilisation
      </Text>

      {/* Add the actual CGU content here */}
      <Text className='mb-4 text-base text-white'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget tellus
        tristique bibendum. Donec rutrum sed sem quis venenatis.
      </Text>

      {/* More CGU content */}
      <Text className='mb-4 text-base text-white'>
        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
        egestas. Integer nec libero venenatis, ultricies ligula id, sollicitudin lacus.
      </Text>

      {/* Add as much content as you need */}
    </ScrollView>
  );
};

export default CGUPage;
