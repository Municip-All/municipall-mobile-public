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
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modalize } from 'react-native-modalize';
import { pickProofImage } from '../utils/pickProofImage';
import { getReportLocation, LocationPermissionError } from '../utils/reportLocation';
import { reportService } from '../services/reportService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/authcontext';
import axios from 'axios';
import { BlurView } from 'expo-blur';

function MapToolButton({
  onPress,
  label,
  children,
  active,
  chipBg,
  primaryColor,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  chipBg: string;
  primaryColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? `${primaryColor}22` : chipBg,
        borderWidth: active ? 1.5 : 0,
        borderColor: active ? primaryColor : 'transparent',
      }}>
      {children}
    </TouchableOpacity>
  );
}

export default function Carte() {
  const mapRef = useRef<MapComponentMethods>(null);
  const modalizeRef = useRef<Modalize>(null);
  const { dark, primaryColor, classes, colors } = useAppTheme();
  const { config } = useCity();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { action } = useLocalSearchParams();

  const [address, setAddress] = useState('');
  const [reportCoords, setReportCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [comments, setComments] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [showComposts, setShowComposts] = useState(true);
  const [showToilets, setShowToilets] = useState(true);
  const [showReports, setShowReports] = useState(true);

  const categories = ['Voirie', 'Éclairage', 'Déchets', 'Espaces Verts', 'Autre'];

  const formPaddingX = 24;
  const formContentStyle = {
    paddingHorizontal: formPaddingX,
    paddingTop: 12,
    paddingBottom: Math.max(insets.bottom, 20) + 24,
  };
  const fieldInnerPadding = { paddingHorizontal: 16, paddingVertical: 14 };
  const mapOverlayPadding = 20;

  const statusLegend = [
    { label: 'En attente', color: '#FF9500' },
    { label: 'En cours', color: '#007AFF' },
    { label: 'Résolu', color: '#34C759' },
  ] as const;

  const mapLayers = [
    {
      id: 'reports',
      label: 'Signalements',
      icon: 'alert-circle' as const,
      active: showReports,
      toggle: () => setShowReports((v) => !v),
    },
    {
      id: 'composts',
      label: 'Composteurs',
      icon: 'leaf' as const,
      active: showComposts,
      toggle: () => setShowComposts((v) => !v),
    },
    {
      id: 'toilets',
      label: 'Toilettes',
      icon: 'water' as const,
      active: showToilets,
      toggle: () => setShowToilets((v) => !v),
    },
  ] as const;

  const chipBg = dark ? 'rgba(39,39,42,0.9)' : 'rgba(228,228,231,0.9)';
  const dividerColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const refreshReportLocation = async () => {
    setIsLocating(true);
    setAddress('Localisation en cours…');
    try {
      const loc = await getReportLocation();
      setReportCoords({ lat: loc.lat, lon: loc.lon });
      setAddress(loc.addressLabel);
    } catch (e) {
      setReportCoords(null);
      if (e instanceof LocationPermissionError) {
        setAddress('');
        Alert.alert(
          'Localisation désactivée',
          'Autorisez la localisation pour enregistrer l’emplacement du signalement.',
        );
      } else {
        setAddress('');
        Alert.alert(
          'Localisation indisponible',
          'Impossible de déterminer votre position. Réessayez ou saisissez l’adresse manuellement.',
        );
      }
    } finally {
      setIsLocating(false);
    }
  };

  const onOpenReport = () => {
    modalizeRef.current?.open();
  };

  useEffect(() => {
    if (action === 'report') {
      onOpenReport();
    }
  }, [action]);

  const pickImage = async () => {
    const uri = await pickProofImage();
    if (uri) setSelectedImage(uri);
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Information manquante', 'Veuillez sélectionner une catégorie.');
      return;
    }

    if (!isAuthenticated || !user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour envoyer un signalement.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setIsSubmitting(true);
    try {
      let lat = reportCoords?.lat;
      let lon = reportCoords?.lon;

      if (lat == null || lon == null) {
        const loc = await getReportLocation();
        lat = loc.lat;
        lon = loc.lon;
        setReportCoords({ lat, lon });
        setAddress(loc.addressLabel);
      }

      await reportService.createReport({
        category,
        description: comments.trim() || address.trim() || undefined,
        imageUrl: selectedImage || undefined,
        lat,
        lon,
        userId: user.id,
        status: 'En attente',
      });

      Alert.alert('Merci !', 'Votre signalement a été enregistré.');
      modalizeRef.current?.close();
      setCategory(null);
      setComments('');
      setSelectedImage(null);
      setAddress('');
      setReportCoords(null);
    } catch (e) {
      if (e instanceof LocationPermissionError) {
        Alert.alert(
          'Localisation requise',
          'Autorisez la localisation pour envoyer le signalement avec sa position.',
        );
        return;
      }
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        if (status === 401) {
          Alert.alert(
            'Session expirée',
            'Reconnectez-vous pour envoyer votre signalement.',
            [{ text: 'OK', onPress: () => router.push('/login') }],
          );
          return;
        }
        const serverMsg =
          typeof e.response?.data === 'object' &&
          e.response?.data &&
          'message' in e.response.data
            ? String((e.response.data as { message: unknown }).message)
            : null;
        Alert.alert(
          'Erreur',
          serverMsg || "Impossible d'envoyer le signalement. Vérifiez votre connexion.",
        );
        return;
      }
      Alert.alert('Erreur', "Impossible d'envoyer le signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${classes.page}`}>
        {/* Map Container */}
        <View className='absolute inset-0'>
          <MapComponent
            ref={mapRef}
            showComposts={showComposts}
            showToilets={showToilets}
            showReports={showReports}
          />
        </View>

        {/* En-tête carte + légende (carte unique, aérée) */}
        <View
          pointerEvents='box-none'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            paddingTop: insets.top + 12,
            paddingHorizontal: mapOverlayPadding,
          }}>
          <BlurView
            intensity={dark ? 50 : 85}
            tint={dark ? 'dark' : 'light'}
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: dark ? 'rgba(63,63,70,0.55)' : 'rgba(255,255,255,0.35)',
            }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    className={`text-lg font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
                    {config?.name || "Municip'All"}
                  </Text>
                  <Text
                    className={`mt-1 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Explorez votre ville
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MapToolButton
                    chipBg={chipBg}
                    primaryColor={primaryColor}
                    onPress={() => mapRef.current?.zoomOut()}
                    label='Dézoomer'>
                    <Ionicons name='remove' size={20} color={dark ? '#FAFAFA' : '#3F3F46'} />
                  </MapToolButton>
                  <MapToolButton
                    chipBg={chipBg}
                    primaryColor={primaryColor}
                    onPress={() => mapRef.current?.zoomIn()}
                    label='Zoomer'>
                    <Ionicons name='add' size={20} color={dark ? '#FAFAFA' : '#3F3F46'} />
                  </MapToolButton>
                  <MapToolButton
                    chipBg={chipBg}
                    primaryColor={primaryColor}
                    onPress={() => mapRef.current?.centerOnUserLocation()}
                    label='Ma position'>
                    <Ionicons name='navigate' size={20} color={primaryColor} />
                  </MapToolButton>
                  <MapToolButton
                    chipBg={chipBg}
                    primaryColor={primaryColor}
                    onPress={() => setLayersOpen((o) => !o)}
                    label='Calques de la carte'
                    active={layersOpen}>
                    <Ionicons
                      name='layers'
                      size={20}
                      color={layersOpen ? primaryColor : dark ? '#FAFAFA' : '#3F3F46'}
                    />
                  </MapToolButton>
                </View>
              </View>

              {layersOpen && (
                <View style={{ marginTop: 14 }}>
                  <Text
                    className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Afficher sur la carte
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {mapLayers.map((layer) => (
                      <TouchableOpacity
                        key={layer.id}
                        onPress={layer.toggle}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: layer.active
                            ? `${primaryColor}18`
                            : dark
                              ? 'rgba(39,39,42,0.65)'
                              : 'rgba(255,255,255,0.65)',
                          borderWidth: 1,
                          borderColor: layer.active ? primaryColor : 'transparent',
                        }}>
                        <Ionicons
                          name={
                            layer.active
                              ? layer.icon
                              : (`${layer.icon}-outline` as keyof typeof Ionicons.glyphMap)
                          }
                          size={16}
                          color={layer.active ? primaryColor : dark ? '#A1A1AA' : '#71717A'}
                        />
                        <Text
                          className={`ml-2 text-xs font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                          {layer.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View
                style={{
                  height: 1,
                  marginTop: 14,
                  marginBottom: 12,
                  backgroundColor: dividerColor,
                }}
              />

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {statusLegend.map((item) => (
                  <View
                    key={item.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: dark ? 'rgba(39,39,42,0.65)' : 'rgba(255,255,255,0.65)',
                    }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: item.color,
                        marginRight: 6,
                      }}
                    />
                    <Text
                      className={`text-[11px] font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        </View>

        <BottomBar />

        {/* Apple Style Modal */}
        <Modalize
          ref={modalizeRef}
          onOpened={() => {
            void refreshReportLocation();
          }}
          adjustToContentHeight={false}
          snapPoint={650}
          modalStyle={{
            backgroundColor: colors.modalSheet,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          }}
          handleStyle={{
            backgroundColor: colors.handle,
            width: 40,
            height: 5,
            marginTop: 10,
          }}
          HeaderComponent={
            <View style={{ paddingHorizontal: formPaddingX, paddingTop: 40, paddingBottom: 12 }}>
              <Text
                className={`text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
                Nouveau Signalement
              </Text>
            </View>
          }>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={formContentStyle}
              keyboardShouldPersistTaps='handled'>
              <Text className={classes.formLabel}>Catégorie</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 4, paddingRight: 4 }}
                style={{ marginBottom: 24 }}>
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={isSelected ? 'rounded-full' : classes.chipUnselected}
                      style={[
                        { marginRight: 10 },
                        isSelected
                          ? {
                              backgroundColor: primaryColor,
                              paddingHorizontal: 20,
                              paddingVertical: 12,
                              shadowColor: primaryColor,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.35,
                              shadowRadius: 6,
                              elevation: 4,
                            }
                          : undefined,
                      ]}>
                      <Text
                        className={`text-sm font-bold ${isSelected ? 'text-white' : classes.chipUnselectedText}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text className={classes.formLabel}>Localisation</Text>
              <View
                className={`mb-6 flex-row items-center ${classes.formField}`}
                style={fieldInnerPadding}>
                <Ionicons name='location' size={18} color={primaryColor} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  editable={!isLocating}
                  placeholder='Adresse détectée automatiquement…'
                  placeholderTextColor={colors.placeholder}
                  className={`ml-3 flex-1 ${classes.formFieldText}`}
                />
                <TouchableOpacity
                  onPress={() => void refreshReportLocation()}
                  disabled={isLocating}
                  accessibilityLabel='Actualiser la position'
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {isLocating ? (
                    <ActivityIndicator size='small' color={primaryColor} />
                  ) : (
                    <Ionicons name='refresh' size={20} color={primaryColor} />
                  )}
                </TouchableOpacity>
              </View>

              <Text className={classes.formLabel}>Photo</Text>
              <TouchableOpacity
                onPress={pickImage}
                className={`mb-6 h-44 overflow-hidden ${classes.photoDropzone} items-center justify-center`}
                style={{ padding: 16 }}>
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    className='h-full w-full'
                    resizeMode='cover'
                  />
                ) : (
                  <View className='items-center'>
                    <Ionicons name='camera' size={36} color={colors.iconMuted} />
                    <Text className={classes.photoHint}>Photo ou galerie</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text className={classes.formLabel}>Commentaire</Text>
              <TextInput
                value={comments}
                onChangeText={setComments}
                placeholder='Décrivez le problème...'
                placeholderTextColor={colors.placeholder}
                multiline
                className={`mb-8 min-h-[120px] ${classes.formField} ${classes.formFieldText}`}
                style={fieldInnerPadding}
                textAlignVertical='top'
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className='items-center justify-center rounded-full shadow-lg'
                style={{
                  backgroundColor: primaryColor,
                  paddingVertical: 18,
                  marginTop: 8,
                }}>
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
