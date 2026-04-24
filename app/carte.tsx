import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapComponent from '@components/mapcomponent';
import type { MapComponentMethods } from '@components/mapcomponent';
import BottomBar from '@components/bottombar';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modalize } from 'react-native-modalize';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { reportService } from '../services/reportService';
import { useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function Carte() {
  const mapRef = useRef<MapComponentMethods>(null);
  const modalizeRef = useRef<Modalize>(null);
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { action } = useLocalSearchParams();

  const primaryColor = config?.theme.primaryColor || '#0B0080';

  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Voirie', 'Éclairage', 'Déchets', 'Espaces Verts', 'Autre'];

  const onOpenReport = () => {
    modalizeRef.current?.open();
  };

  useEffect(() => {
    if (action === 'report') {
      onOpenReport();
    }
  }, [action]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès aux photos nécessaire.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Information manquante', 'Veuillez sélectionner une catégorie.');
      return;
    }

    setIsSubmitting(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      await reportService.createReport({
        category,
        description: comments,
        imageUrl: selectedImage || undefined,
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        status: 'En attente',
      });

      Alert.alert('Merci !', 'Votre signalement a été enregistré.');
      modalizeRef.current?.close();
      setCategory(null);
      setComments('');
      setSelectedImage(null);
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer le signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
        {/* Map Container */}
        <View className='absolute inset-0'>
          <MapComponent ref={mapRef} showComposts={true} showToilets={true} />
        </View>

        {/* Floating Apple-style Header */}
        <View
          className='absolute top-0 right-0 left-0 z-20 px-4'
          style={{ paddingTop: insets.top + 10 }}>
          <BlurView
            intensity={dark ? 40 : 80}
            tint={dark ? 'dark' : 'light'}
            className='flex-row items-center justify-between rounded-[24px] border border-white/20 p-4 shadow-lg dark:border-zinc-800/50'>
            <View>
              <Text
                className={`text-sm font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
                {config?.name || 'Carte Interactive'}
              </Text>
              <Text className={`text-[10px] font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Explorez votre ville
              </Text>
            </View>
            <TouchableOpacity className='h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 dark:bg-zinc-800/50'>
              <Ionicons name='layers' size={20} color={dark ? '#FFF' : '#3F3F46'} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Status Legend (Pill style) */}
        <View className='absolute top-[130px] left-4 z-10 flex-row'>
          <BlurView
            intensity={dark ? 60 : 90}
            tint={dark ? 'dark' : 'light'}
            className='flex-row items-center rounded-full border border-white/10 px-4 py-2 shadow-sm'>
            <View className='mr-4 flex-row items-center'>
              <View className='mr-2 h-2 w-2 rounded-full bg-orange-500' />
              <Text className={`text-[10px] font-bold ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Attente
              </Text>
            </View>
            <View className='mr-4 flex-row items-center'>
              <View className='mr-2 h-2 w-2 rounded-full bg-blue-500' />
              <Text className={`text-[10px] font-bold ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Cours
              </Text>
            </View>
            <View className='flex-row items-center'>
              <View className='mr-2 h-2 w-2 rounded-full bg-green-500' />
              <Text className={`text-[10px] font-bold ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Résolu
              </Text>
            </View>
          </BlurView>
        </View>

        {/* Floating Controls */}
        <View className='absolute top-[130px] right-4 z-10 space-y-3'>
          <BlurView
            intensity={dark ? 60 : 90}
            tint={dark ? 'dark' : 'light'}
            className='overflow-hidden rounded-[20px] border border-white/10'>
            <TouchableOpacity
              onPress={() => {}}
              className='items-center justify-center border-b border-zinc-100/10 p-3'>
              <Ionicons name='add' size={22} color={dark ? '#FFF' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} className='items-center justify-center p-3'>
              <Ionicons name='remove' size={22} color={dark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </BlurView>

          <TouchableOpacity
            onPress={() => mapRef.current?.centerOnUserLocation()}
            className='h-12 w-12 items-center justify-center rounded-full shadow-lg'
            style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }}>
            <Ionicons name='navigate' size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <BottomBar />

        {/* Apple Style Modal */}
        <Modalize
          ref={modalizeRef}
          adjustToContentHeight={false}
          snapPoint={650}
          modalStyle={{
            backgroundColor: dark ? '#1C1C1E' : '#F2F2F7',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          }}
          handleStyle={{
            backgroundColor: dark ? '#3F3F46' : '#D1D1D6',
            width: 40,
            height: 5,
            marginTop: 10,
          }}
          HeaderComponent={
            <View className='px-6 pt-10 pb-4'>
              <Text
                className={`text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
                Nouveau Signalement
              </Text>
            </View>
          }>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className='px-6 pt-2 pb-10' showsVerticalScrollIndicator={false}>
              <Text
                className={`mb-3 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Catégorie
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-6'>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 rounded-full border px-6 py-3 ${
                      category === cat
                        ? 'border-transparent'
                        : dark
                          ? 'border-zinc-800 bg-zinc-800/50'
                          : 'border-zinc-200 bg-white'
                    }`}
                    style={category === cat ? { backgroundColor: primaryColor } : {}}>
                    <Text
                      className={`text-sm font-bold ${category === cat ? 'text-white' : dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text
                className={`mb-3 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Localisation
              </Text>
              <View
                className={`mb-6 flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800/50' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
                <Ionicons name='location' size={18} color={primaryColor} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder='Localisation automatique...'
                  placeholderTextColor={dark ? '#52525B' : '#A1A1AA'}
                  className={`ml-3 flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                />
              </View>

              <Text
                className={`mb-3 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Photo
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                className={`mb-6 h-40 overflow-hidden rounded-3xl border-2 border-dashed ${dark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-300 bg-white'} items-center justify-center`}>
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    className='h-full w-full'
                    resizeMode='cover'
                  />
                ) : (
                  <View className='items-center'>
                    <Ionicons name='camera' size={32} color={dark ? '#3F3F46' : '#D4D4D8'} />
                    <Text
                      className={`mt-2 text-xs font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Ajouter une preuve
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text
                className={`mb-3 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Commentaire
              </Text>
              <TextInput
                value={comments}
                onChangeText={setComments}
                placeholder='Décrivez le problème...'
                placeholderTextColor={dark ? '#52525B' : '#A1A1AA'}
                multiline
                className={`mb-8 min-h-[100px] rounded-2xl p-4 font-medium ${dark ? 'bg-zinc-800/50 text-white' : 'bg-white text-black'} border border-zinc-100 shadow-sm dark:border-zinc-800`}
                textAlignVertical='top'
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className='w-full items-center justify-center rounded-full py-5 shadow-lg'
                style={{ backgroundColor: primaryColor }}>
                {isSubmitting ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-lg font-black text-white'>Envoyer</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}
