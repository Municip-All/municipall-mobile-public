import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Appearance,
  Image,
  ImageBackground,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SignalementPage: React.FC = () => {
  const { theme } = useTheme();
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const currentTheme = theme === 'system' ? Appearance.getColorScheme() : theme;
  const [isTagChecked, setIsTagChecked] = useState(false);
  const [isWasteChecked, setIsWasteChecked] = useState(false);
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La permission de localisation est nécessaire.');
      return;
    }

    try {
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = userLocation.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (reverseGeocode.length > 0) {
        const { street, name, city, postalCode, country } = reverseGeocode[0];
        setAddress(`${name || street}, ${city}, ${postalCode}, ${country}`);
      } else {
        Alert.alert('Erreur', "Impossible de récupérer l'adresse.");
      }
    } catch {
      Alert.alert('Erreur', 'Échec de la récupération de la localisation.');
    }
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

  const handleSubmit = () => {
    if (!address || !selectedImage) {
      Alert.alert('Erreur', "Veuillez renseigner l'adresse et sélectionner une photo.");
      return;
    }
    Alert.alert('Signalement envoyé avec succès !');
    router.push('/dashboard');
  };

  const backgroundImage =
    currentTheme === 'dark'
      ? require('../assets/images/background-grey.png')
      : require('../assets/images/background-blue.png');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={backgroundImage}
        className='flex-1 items-center justify-center'
        resizeMode='cover'>
        <View className='flex-1 px-6 py-10'>
          <TouchableOpacity className='mt-4 mb-4 -ml-6' onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#FFFFFF' />
          </TouchableOpacity>

          <View className='mb-4'>
            <Text
              className={`text-center text-4xl font-bold ${
                theme === 'dark' ? 'text-blue-500' : 'text-white'
              }`}>
              SIGNALEMENT
            </Text>
            <View
              className={`mx-auto mt-2 h-1 w-64 rounded-full ${
                theme === 'dark' ? 'bg-slate-400' : 'bg-white'
              }`}
            />
          </View>

          <View className='mb-8'>
            <Text className='mx-4 mb-4 text-base text-black dark:text-white'>
              Que souhaitez-vous signaler ? :
            </Text>
            <View className='mx-4 mb-2 flex-row items-center'>
              <Checkbox
                value={isTagChecked}
                onValueChange={setIsTagChecked}
                color={isTagChecked ? '#028CF3' : undefined}
              />
              <Text className='ml-2 text-black dark:text-white'>Un tag</Text>
            </View>
            <View className='mx-4 mb-2 flex-row items-center'>
              <Checkbox
                value={isWasteChecked}
                onValueChange={setIsWasteChecked}
                color={isWasteChecked ? '#028CF3' : undefined}
              />
              <Text className='ml-2 text-black dark:text-white'>Des déchets</Text>
            </View>
            <View className='mx-4 flex-row items-center'>
              <Checkbox
                value={isOtherChecked}
                onValueChange={setIsOtherChecked}
                color={isOtherChecked ? '#028CF3' : undefined}
              />
              <Text className='ml-2 text-black dark:text-white'>Autre</Text>
            </View>
          </View>

          <View className='mb-4'>
            <Text className='mx-4 mb-4 text-black dark:text-white'>Adresse :</Text>
            <View
              className={`flex-row items-center rounded-lg px-3 ${
                theme === 'dark' ? 'bg-slate-600' : 'bg-slate-700'
              }`}>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Veuillez renseigner l'adresse"
                placeholderTextColor='#FFFFFF'
                className='flex-1 py-3 text-black dark:text-white'
              />
              <TouchableOpacity onPress={getLocation} className='ml-2'>
                <Ionicons name='location-outline' size={24} color='#FFFFFF' />
              </TouchableOpacity>
            </View>
          </View>

          <View className='mb-4'>
            <Text className='mx-4 mb-4 text-black dark:text-white'>Photo :</Text>
            <TouchableOpacity
              onPress={pickImage}
              className='flex h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600'>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} className='h-full w-full rounded-lg' />
              ) : (
                <View className='flex items-center justify-center'>
                  <Ionicons
                    name='image-outline'
                    size={50}
                    color={currentTheme === 'dark' ? '#028CF3' : '#FFFFFF'}
                  />
                  <Text className={`${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
                    Déposez votre image ici, ou parcourez
                  </Text>
                  <Text className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-white'}`}>
                    Supporté : JPG, JPEG, PNG
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className='mb-6'>
            <Text className='mx-4 mb-2 text-white'>Souhaitez-vous ajouter quelque chose ? :</Text>
            <TextInput
              value={comments}
              onChangeText={setComments}
              placeholder='Votre texte ici...'
              placeholderTextColor='#888'
              className={`h-20 w-full rounded-lg px-4 py-3 ${
                theme === 'dark' ? 'bg-slate-600' : 'bg-slate-700'
              } text-white`}
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className='flex-row items-center justify-center rounded-full bg-blue-500 py-4'>
            <Text className='mr-2 text-lg font-semibold text-white'>Signaler</Text>
            <Ionicons name='arrow-forward-outline' size={24} color='white' />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default SignalementPage;
