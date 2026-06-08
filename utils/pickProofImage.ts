import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const defaultPickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.5,
};

export type PickProofImageOptions = {
  title?: string;
  message?: string;
  pickerOptions?: Pick<ImagePicker.ImagePickerOptions, 'aspect' | 'quality' | 'allowsEditing'>;
};

async function requestLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission refusée',
      'Autorisez l’accès à la galerie dans les réglages du téléphone.'
    );
    return false;
  }
  return true;
}

async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission refusée',
      'Autorisez l’accès à l’appareil photo dans les réglages du téléphone.'
    );
    return false;
  }
  return true;
}

function resolvePickerOptions(
  overrides?: PickProofImageOptions['pickerOptions']
): ImagePicker.ImagePickerOptions {
  return { ...defaultPickerOptions, ...overrides };
}

async function pickFromLibrary(
  pickerOptions: ImagePicker.ImagePickerOptions
): Promise<string | null> {
  if (!(await requestLibraryPermission())) return null;
  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

async function pickFromCamera(
  pickerOptions: ImagePicker.ImagePickerOptions
): Promise<string | null> {
  if (!(await requestCameraPermission())) return null;
  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

/**
 * Propose à l'utilisateur : appareil photo ou galerie.
 * Retourne l'URI locale de l'image, ou null si annulé.
 */
export function pickProofImage(options?: PickProofImageOptions): Promise<string | null> {
  const title = options?.title ?? 'Ajouter une preuve';
  const message = options?.message ?? 'Prenez une photo ou choisissez une image existante.';
  const pickerOptions = resolvePickerOptions(options?.pickerOptions);

  return new Promise((resolve) => {
    const finish = (uri: string | null) => resolve(uri);

    if (Platform.OS === 'web') {
      pickFromLibrary(pickerOptions).then(finish);
      return;
    }

    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => finish(null) },
      {
        text: 'Galerie',
        onPress: () => {
          pickFromLibrary(pickerOptions).then(finish);
        },
      },
      {
        text: 'Appareil photo',
        onPress: () => {
          pickFromCamera(pickerOptions).then(finish);
        },
      },
    ]);
  });
}
