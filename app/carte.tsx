import React, { useRef, useState } from 'react';
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

export default function Carte() {
  const mapRef = useRef<MapComponentMethods>(null);
  const modalizeRef = useRef<Modalize>(null);
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const primaryColor = config?.theme.primaryColor || '#1D4ED8';

  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Voirie', 'Éclairage', 'Déchets', 'Espaces Verts', 'Autre'];

  const onOpenReport = () => {
    modalizeRef.current?.open();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Nous avons besoin de l'accès à vos photos pour joindre une preuve."
      );
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

      Alert.alert('Merci !', 'Votre signalement a été enregistré avec succès.');
      modalizeRef.current?.close();

      setCategory(null);
      setComments('');
      setSelectedImage(null);
      setAddress('');
    } catch (error) {
      console.error('Submission error', error);
      Alert.alert('Erreur', "Impossible d'envoyer le signalement. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-white'}`}>
        {/* Map Container */}
        <View className='absolute inset-0 flex-1'>
          <MapComponent ref={mapRef} showComposts={true} showToilets={true} />
        </View>

        {/* Floating Header */}
        <View
          className='z-10 w-full rounded-b-[24px] p-5 shadow-lg'
          style={{ paddingTop: Math.max(insets.top, 40), backgroundColor: primaryColor }}>
          <View className='flex-row items-center justify-between'>
            <View>
              <Text className='text-xl font-semibold text-white'>Carte Interactive</Text>
              <Text className='mt-1 text-xs text-blue-100'>Signalements autour de vous</Text>
            </View>
            <View className='rounded-full bg-white/20 p-2'>
              <Ionicons name='layers' size={20} color='#fff' />
            </View>
          </View>
        </View>

        {/* Floating Controls Overlay */}
        <View className='absolute top-42 left-4 z-10'>
          <View
            className={`rounded-[20px] p-4 shadow-sm ${dark ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-100 bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
            }}>
            <View className='mb-2 flex-row items-center'>
              <View className='mr-2 h-3 w-3 rounded-full bg-orange-500' />
              <Text className={`text-xs ${dark ? 'text-gray-300' : 'text-slate-700'}`}>
                En attente
              </Text>
            </View>
            <View className='mb-2 flex-row items-center'>
              <View className='mr-2 h-3 w-3 rounded-full bg-blue-500' />
              <Text className={`text-xs ${dark ? 'text-gray-300' : 'text-slate-700'}`}>
                En cours
              </Text>
            </View>
            <View className='flex-row items-center'>
              <View className='mr-2 h-3 w-3 rounded-full bg-green-500' />
              <Text className={`text-xs ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Résolu</Text>
            </View>
          </View>
        </View>

        <View className='absolute top-64 right-4 z-10'>
          <View
            className={`overflow-hidden rounded-[24px] shadow-lg ${dark ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-100 bg-white'}`}>
            <TouchableOpacity
              onPress={() => {}}
              className='items-center justify-center border-b border-gray-100 p-4 dark:border-zinc-800'>
              <Ionicons name='add' size={20} color={dark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} className='items-center justify-center p-4'>
              <Ionicons name='remove' size={20} color={dark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => mapRef.current?.centerOnUserLocation()}
            className={`mt-4 h-12 w-12 items-center justify-center rounded-full shadow-lg ${dark ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-100 bg-white'}`}>
            <Ionicons name='navigate' size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        {/* Floating Add Report Button */}
        <View className='absolute bottom-[90px] z-10 w-full items-center px-6'>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenReport}
            className='w-full flex-row items-center justify-center rounded-full px-8 py-4 shadow-2xl'
            style={{
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}>
            <Ionicons name='add' size={24} color='#FFF' />
            <Text className='ml-2 text-base font-semibold text-white'>Ajouter un signalement</Text>
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
            borderTopRightRadius: 32,
          }}
          handleStyle={{ backgroundColor: dark ? '#3f3f46' : '#d4d4d8', width: 60, height: 6 }}
          HeaderComponent={
            <View className='px-6 pt-8 pb-4'>
              <Text className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Nouveau Signalement
              </Text>
            </View>
          }>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className='px-6 pt-2 pb-10' showsVerticalScrollIndicator={false}>
              <Text
                className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>
                Que souhaitez-vous signaler ?
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className='mb-4 flex-row'>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 flex-row items-center rounded-full border border-gray-200 px-4 py-2 ${category === cat ? 'border-blue-500 bg-blue-500' : dark ? 'border-zinc-700 bg-zinc-800' : 'bg-white'}`}
                    style={
                      category === cat
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : {}
                    }>
                    <Text
                      className={
                        category === cat
                          ? 'font-medium text-white'
                          : dark
                            ? 'text-gray-300'
                            : 'text-slate-800'
                      }>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text
                className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>
                Adresse
              </Text>
              <View
                className={`mb-6 flex-row items-center rounded-2xl border px-4 py-3 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-50'}`}>
                <Ionicons name='location-outline' size={20} color={dark ? '#9ca3af' : '#64748b'} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder='Localisation actuelle'
                  placeholderTextColor={dark ? '#9ca3af' : '#94a3b8'}
                  className={`ml-2 flex-1 text-base ${dark ? 'text-white' : 'text-slate-900'}`}
                />
              </View>

              <Text
                className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>
                Photo
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                className={`mb-6 h-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed ${dark ? 'border-zinc-700 bg-zinc-900/50' : 'border-gray-300 bg-gray-50'}`}>
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    className='h-full w-full'
                    resizeMode='cover'
                  />
                ) : (
                  <View className='items-center'>
                    <Ionicons name='camera' size={32} color={dark ? '#6b7280' : '#94a3b8'} />
                    <Text className={`mt-2 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Ajouter une photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text
                className={`mb-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>
                Commentaire additionnel
              </Text>
              <TextInput
                value={comments}
                onChangeText={setComments}
                placeholder='Décrivez le problème...'
                placeholderTextColor={dark ? '#9ca3af' : '#94a3b8'}
                multiline
                numberOfLines={4}
                className={`mb-8 min-h-[100px] items-start justify-start rounded-2xl border px-4 py-3 ${dark ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-gray-200 bg-gray-50 text-slate-900'}`}
                textAlignVertical='top'
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className='w-full items-center justify-center rounded-full py-4'
                style={{ backgroundColor: primaryColor }}>
                {isSubmitting ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <Text className='text-base font-semibold text-white'>Envoyer le signalement</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}
