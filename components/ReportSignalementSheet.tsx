import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { ensureAuthenticatedForReport } from '../lib/requireAuthForReport';
import { reportService } from '../services/reportService';
import { pickProofImage } from '../utils/pickProofImage';
import { getReportLocation, LocationPermissionError } from '../utils/reportLocation';

const CATEGORIES = ['Voirie', 'Éclairage', 'Déchets', 'Espaces Verts', 'Autre'];

export type ReportSignalementSheetRef = {
  open: () => void;
  close: () => void;
};

const ReportSignalementSheet = forwardRef<ReportSignalementSheetRef>(
  function ReportSignalementSheet(_props, ref) {
    const modalizeRef = useRef<Modalize>(null);
    const allowCloseRef = useRef(false);
    const { dark, primaryColor, classes, colors } = useAppTheme();
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [address, setAddress] = useState('');
    const [reportCoords, setReportCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [comments, setComments] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formPaddingX = 24;
    const formContentStyle = {
      paddingHorizontal: formPaddingX,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 20) + 24,
    };
    const fieldInnerPadding = { paddingHorizontal: 16, paddingVertical: 14 };

    const resetForm = () => {
      setCategory(null);
      setComments('');
      setSelectedImage(null);
      setAddress('');
      setReportCoords(null);
    };

    const closeWithoutConfirm = () => {
      allowCloseRef.current = true;
      modalizeRef.current?.close();
    };

    const confirmDismiss = () => {
      Alert.alert(
        'Voulez-vous annuler le signalement ?',
        undefined,
        [
          {
            text: 'Non',
            style: 'cancel',
            onPress: () => modalizeRef.current?.open(),
          },
          {
            text: 'Oui',
            style: 'destructive',
            onPress: () => {
              resetForm();
              closeWithoutConfirm();
            },
          },
        ],
        { cancelable: true, onDismiss: () => modalizeRef.current?.open() }
      );
    };

    const handleDismissAttempt = () => {
      if (allowCloseRef.current) {
        allowCloseRef.current = false;
        return;
      }
      setTimeout(() => modalizeRef.current?.open(), 0);
      confirmDismiss();
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        if (!ensureAuthenticatedForReport(isAuthenticated, router)) return;
        modalizeRef.current?.open();
      },
      close: () => closeWithoutConfirm(),
    }));

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
            'Autorisez la localisation pour enregistrer l’emplacement du signalement.'
          );
        } else {
          setAddress('');
          Alert.alert(
            'Localisation indisponible',
            'Impossible de déterminer votre position. Réessayez ou saisissez l’adresse manuellement.'
          );
        }
      } finally {
        setIsLocating(false);
      }
    };

    const pickImage = async () => {
      const uri = await pickProofImage({
        title: 'Photo du signalement',
        message: 'Prenez une photo ou choisissez une image pour illustrer le problème.',
        pickerOptions: { aspect: [4, 3], quality: 0.35, allowsEditing: true },
      });
      if (uri) setSelectedImage(uri);
    };

    const handleSubmit = async () => {
      if (!category) {
        Alert.alert('Information manquante', 'Veuillez sélectionner une catégorie.');
        return;
      }

      if (!isAuthenticated || !user) {
        ensureAuthenticatedForReport(false, router);
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
        resetForm();
        closeWithoutConfirm();
      } catch (e) {
        if (e instanceof LocationPermissionError) {
          Alert.alert(
            'Localisation requise',
            'Autorisez la localisation pour envoyer le signalement avec sa position.'
          );
          return;
        }
        if (isAxiosError(e)) {
          const status = e.response?.status;
          if (status === 401) {
            Alert.alert('Session expirée', 'Reconnectez-vous pour envoyer votre signalement.', [
              { text: 'OK', onPress: () => router.push('/login') },
            ]);
            return;
          }
          const serverMsg =
            typeof e.response?.data === 'object' && e.response?.data && 'message' in e.response.data
              ? String((e.response.data as { message: unknown }).message)
              : null;
          Alert.alert(
            'Erreur',
            serverMsg || "Impossible d'envoyer le signalement. Vérifiez votre connexion."
          );
          return;
        }
        Alert.alert('Erreur', "Impossible d'envoyer le signalement.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modalize
        ref={modalizeRef}
        onOpened={() => {
          void refreshReportLocation();
        }}
        onClose={handleDismissAttempt}
        onBackButtonPress={() => {
          confirmDismiss();
          return true;
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
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.85}
                    className={isSelected ? undefined : classes.chipUnselected}
                    style={[
                      styles.categoryChip,
                      isSelected
                        ? {
                            backgroundColor: primaryColor,
                            shadowColor: primaryColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.35,
                            shadowRadius: 6,
                            elevation: 4,
                          }
                        : undefined,
                    ]}>
                    <Text
                      numberOfLines={2}
                      className={`text-center text-xs font-bold ${isSelected ? 'text-white' : classes.chipUnselectedText}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
    );
  }
);

export default ReportSignalementSheet;

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    width: '48%',
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
