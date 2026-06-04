import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@context/themecontext';

export interface MapComponentMethods {
  centerOnUserLocation: () => void;
  goToNearestCompost: () => Promise<void> | void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const MapComponent = forwardRef<MapComponentMethods, object>((_props, ref) => {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';

  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      console.info('[MapComponent.web] centerOnUserLocation() noop');
    },
    goToNearestCompost: async () => {
      console.info('[MapComponent.web] goToNearestCompost() noop');
    },
    zoomIn: () => {
      console.info('[MapComponent.web] zoomIn() noop');
    },
    zoomOut: () => {
      console.info('[MapComponent.web] zoomOut() noop');
    },
  }));

  return (
    <View
      className={`flex-1 items-center justify-center ${dark ? 'bg-black' : 'bg-white'}`}>
      <Text className={`${dark ? 'text-white' : 'text-black'} px-6 text-center`}>
        {
          "La carte native n'est pas disponible sur le web pour l'instant.\nOuvre l'application mobile pour la carte interactive."
        }
      </Text>
    </View>
  );
});

export default MapComponent;
