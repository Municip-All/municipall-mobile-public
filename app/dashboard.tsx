import React, { useRef } from 'react';
import { View, TouchableOpacity, Image, Appearance } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapComponent from '../components/MapComponent';
import type { MapComponentMethods } from '../components/MapComponent';
import FloatingButtons from '../components/FloatingButtons';
import MenuComponent from '../components/MenuComponent';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const systemTheme = Appearance.getColorScheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const modalizeRef = useRef<Modalize>(null);
  const mapRef = useRef<MapComponentMethods>(null);
  const router = useRouter();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapComponent ref={mapRef} />

        <FloatingButtons
          centerOnUserLocation={() => mapRef.current?.centerOnUserLocation()}
          goToNearestCompost={() => mapRef.current?.goToNearestCompost()}
        />

        <TouchableOpacity
          onPress={() => router.push('/profile')}
          className={`absolute top-20 right-4 p-1 rounded-full ${currentTheme === 'dark' ? 'bg-sky-500' : 'bg-sky-400'
            }`}
        >
          <Image
            source={require('../assets/images/avatar.png')}
            className="w-10 h-10 rounded-full"
          />
        </TouchableOpacity>

        <Modalize
          ref={modalizeRef}
          snapPoint={100}
          modalHeight={500}
          handlePosition="inside"
          adjustToContentHeight={false}
          withHandle={true}
          alwaysOpen={90}
          handleStyle={{
            backgroundColor: currentTheme === "dark" ? "#fff" : "#333",
          }}
          modalStyle={{
            backgroundColor: currentTheme === "dark" ? "#282828" : "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <MenuComponent />
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
};

export default Dashboard;
