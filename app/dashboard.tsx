import React, { useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapComponent from '@components/mapcomponent';
import type { MapComponentMethods } from '@components/mapcomponent';
import FloatingButtons from '@components/floatingbuttons';
import BottomBar from '@components/bottombar';

const Dashboard: React.FC = () => {
  const mapRef = useRef<MapComponentMethods>(null);
  const [showComposts, setShowComposts] = useState(true);
  const [showToilets, setShowToilets] = useState(true);

  const toggleComposts = useCallback(() => setShowComposts((v) => !v), []);
  const toggleToilets = useCallback(() => setShowToilets((v) => !v), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapComponent ref={mapRef} showComposts={showComposts} showToilets={showToilets} />

        <FloatingButtons
          centerOnUserLocation={() => mapRef.current?.centerOnUserLocation()}
          goToNearestCompost={() => mapRef.current?.goToNearestCompost()}
          showComposts={showComposts}
          showToilets={showToilets}
          toggleComposts={toggleComposts}
          toggleToilets={toggleToilets}
        />

        <BottomBar />
      </View>
    </GestureHandlerRootView>
  );
};

export default Dashboard;
