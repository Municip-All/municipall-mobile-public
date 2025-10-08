import React, { useRef } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapComponent from '@components/mapcomponent';
import type { MapComponentMethods } from '@components/mapcomponent';
import FloatingButtons from '@components/floatingbuttons';
import BottomBar from '@components/bottombar';

const Dashboard: React.FC = () => {
  const mapRef = useRef<MapComponentMethods>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapComponent ref={mapRef} />

        <FloatingButtons
          centerOnUserLocation={() => mapRef.current?.centerOnUserLocation()}
          goToNearestCompost={() => mapRef.current?.goToNearestCompost()}
        />

        <BottomBar />
      </View>
    </GestureHandlerRootView>
  );
};

export default Dashboard;
