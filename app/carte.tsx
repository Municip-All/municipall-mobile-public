import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapComponent from '@components/mapcomponent';
import type { MapComponentMethods } from '@components/mapcomponent';
import BottomBar from '@components/bottombar';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modalize } from 'react-native-modalize';
import * as ImagePicker from 'expo-image-picker';
import { Checkbox } from 'expo-checkbox';

export default function Carte() {
  const mapRef = useRef<MapComponentMethods>(null);
  const modalizeRef = useRef<Modalize>(null);
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTagChecked, setIsTagChecked] = useState(false);
  const [isWasteChecked, setIsWasteChecked] = useState(false);
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  const onOpenReport = () => {
    modalizeRef.current?.open();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-white'}`}>
        
        {/* Map Container */}
        <View className="flex-1 absolute inset-0">
          <MapComponent ref={mapRef} showComposts={true} showToilets={true} />
        </View>

        {/* Floating Header */}
        <View 
          className="w-full bg-[#1e40af]/90 shadow-lg z-10 p-5 rounded-b-[24px]"
          style={{ paddingTop: Math.max(insets.top, 40) }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-xl font-semibold">Carte Interactive</Text>
              <Text className="text-blue-100 text-xs mt-1">Signalements autour de vous</Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full">
              <Ionicons name="layers" size={20} color="#fff" />
            </View>
          </View>
        </View>

        {/* Floating Controls Overlay */}
        <View className="absolute top-32 left-4 z-10">
          <View className={`rounded-[20px] p-4 shadow-sm ${dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
              <Text className={`text-xs ${dark ? 'text-gray-300' : 'text-slate-700'}`}>En attente</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <Text className={`text-xs ${dark ? 'text-gray-300' : 'text-slate-700'}`}>En cours</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <Text className={`text-xs ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Résolu</Text>
            </View>
          </View>
        </View>

        <View className="absolute top-64 right-4 z-10">
          <View className={`rounded-[24px] overflow-hidden shadow-lg ${dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}>
            <TouchableOpacity onPress={() => {}} className="p-4 items-center justify-center border-b border-gray-100 dark:border-zinc-800">
              <Ionicons name="add" size={20} color={dark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} className="p-4 items-center justify-center">
              <Ionicons name="remove" size={20} color={dark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => mapRef.current?.centerOnUserLocation()}
            className={`mt-4 w-12 h-12 rounded-full items-center justify-center shadow-lg ${dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}>
            <Ionicons name="navigate" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Floating Add Report Button */}
        <View className="absolute bottom-[90px] w-full items-center z-10 px-6">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={onOpenReport}
            className="flex-row items-center justify-center bg-[#1D4ED8] rounded-full py-4 px-8 shadow-2xl w-full"
            style={{ shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>
            <Ionicons name="add" size={24} color="#FFF" />
            <Text className="text-white text-base font-semibold ml-2">Ajouter un signalement</Text>
          </TouchableOpacity>
        </View>

        <BottomBar />

        {/* Glassmorphic Report Sheet */}
        <Modalize 
          ref={modalizeRef} 
          adjustToContentHeight={false}
          snapPoint={600}
          modalStyle={{ 
            backgroundColor: dark ? '#18181b' : '#ffffff',
            borderTopLeftRadius: 32, 
            borderTopRightRadius: 32 
          }}
          handleStyle={{ backgroundColor: dark ? '#3f3f46' : '#d4d4d8', width: 60, height: 6 }}
          HeaderComponent={
            <View className="px-6 pt-8 pb-4">
              <Text className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Nouveau Signalement</Text>
            </View>
          }
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className="px-6 pt-2 pb-10" showsVerticalScrollIndicator={false}>
              
              <Text className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Que souhaitez-vous signaler ?</Text>
              
              <View className="flex-row mb-4">
                <TouchableOpacity onPress={() => setIsTagChecked(!isTagChecked)} className={`px-4 py-2 rounded-full border mr-2 flex-row items-center ${isTagChecked ? 'bg-blue-500 border-blue-500' : (dark ? 'border-zinc-700' : 'border-gray-200')}`}>
                  <Text className={isTagChecked ? 'text-white' : (dark ? 'text-white' : 'text-slate-800')}>Un tag</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsWasteChecked(!isWasteChecked)} className={`px-4 py-2 rounded-full border mr-2 flex-row items-center ${isWasteChecked ? 'bg-blue-500 border-blue-500' : (dark ? 'border-zinc-700' : 'border-gray-200')}`}>
                  <Text className={isWasteChecked ? 'text-white' : (dark ? 'text-white' : 'text-slate-800')}>Déchets</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsOtherChecked(!isOtherChecked)} className={`px-4 py-2 rounded-full border flex-row items-center ${isOtherChecked ? 'bg-blue-500 border-blue-500' : (dark ? 'border-zinc-700' : 'border-gray-200')}`}>
                  <Text className={isOtherChecked ? 'text-white' : (dark ? 'text-white' : 'text-slate-800')}>Autre</Text>
                </TouchableOpacity>
              </View>

              <Text className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Adresse</Text>
              <View className={`flex-row items-center rounded-2xl px-4 py-3 mb-6 border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                <Ionicons name="location-outline" size={20} color={dark ? '#9ca3af' : '#64748b'} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Localisation actuelle"
                  placeholderTextColor={dark ? '#9ca3af' : '#94a3b8'}
                  className={`flex-1 ml-2 text-base ${dark ? 'text-white' : 'text-slate-900'}`}
                />
              </View>

              <Text className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Photo</Text>
              <TouchableOpacity onPress={pickImage} className={`h-32 rounded-2xl border-2 border-dashed items-center justify-center mb-6 overflow-hidden ${dark ? 'border-zinc-700 bg-zinc-900/50' : 'border-gray-300 bg-gray-50'}`}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera" size={32} color={dark ? '#6b7280' : '#94a3b8'} />
                    <Text className={`text-xs mt-2 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Ajouter une photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Commentaire additionnel</Text>
              <TextInput
                value={comments}
                onChangeText={setComments}
                placeholder="Décrivez le problème..."
                placeholderTextColor={dark ? '#9ca3af' : '#94a3b8'}
                multiline
                numberOfLines={4}
                className={`rounded-2xl px-4 py-3 min-h-[100px] mb-8 border items-start justify-start ${dark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`}
                textAlignVertical="top"
              />

              <TouchableOpacity 
                onPress={() => modalizeRef.current?.close()}
                className="w-full py-4 rounded-full items-center justify-center bg-[#1D4ED8]"
              >
                <Text className="text-white text-base font-semibold">Envoyer le signalement</Text>
              </TouchableOpacity>
              
            </ScrollView>
          </KeyboardAvoidingView>
        </Modalize>

      </View>
    </GestureHandlerRootView>
  );
}
