import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Même interface publique que la version native
export interface MapComponentMethods {
  centerOnUserLocation: () => void;
  goToNearestCompost: () => Promise<void> | void;
}

// Fallback web léger sans dépendances natives
const MapComponent = forwardRef<MapComponentMethods, object>((_props, ref) => {
  const { theme } = useTheme();

  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      // no-op sur web
      console.info('[MapComponent.web] centerOnUserLocation() noop');
    },
    goToNearestCompost: async () => {
      console.info('[MapComponent.web] goToNearestCompost() noop');
    },
  }));

  return (
    <View
      className={`flex-1 items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} px-6 text-center`}>
        {
          "La carte native n'est pas disponible sur le web pour l'instant.\nOuvre l'application mobile pour la carte interactive."
        }
      </Text>
    </View>
  );
});

export default MapComponent;
