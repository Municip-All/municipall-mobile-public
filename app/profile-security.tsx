import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import { updateUserPassword } from '../services/userProfileService';

export default function ProfileSecurityScreen() {
  const { classes, primaryColor, colors, layoutStyles } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const handleSave = async () => {
    if (!current || !newPassword || !confirm) {
      Alert.alert('Champs requis', 'Remplissez tous les champs.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Mot de passe', 'Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert('Mot de passe', 'La confirmation ne correspond pas.');
      return;
    }
    setSaving(true);
    try {
      await updateUserPassword({ current, new: newPassword, confirm });
      Alert.alert('Succès', 'Votre mot de passe a été mis à jour.');
      router.back();
    } catch (e) {
      const msg =
        (e as Error)?.message === 'PASSWORD_MISMATCH'
          ? 'La confirmation ne correspond pas.'
          : 'Vérifiez votre mot de passe actuel et réessayez.';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      label: 'Mot de passe actuel',
      value: current,
      onChange: setCurrent,
      visible: showCurrent,
      toggle: () => setShowCurrent((v) => !v),
    },
    {
      label: 'Nouveau mot de passe',
      value: newPassword,
      onChange: setNewPassword,
      visible: showNew,
      toggle: () => setShowNew((v) => !v),
    },
    {
      label: 'Confirmer le nouveau mot de passe',
      value: confirm,
      onChange: setConfirm,
      visible: showNew,
      toggle: () => setShowNew((v) => !v),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={layoutStyles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProfileScreenHeader title='Sécurité et mot de passe' />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps='handled'>
        <Text className={`mb-4 ${classes.body}`}>
          Choisissez un mot de passe d&apos;au moins 8 caractères. Vous resterez connecté après la
          modification.
        </Text>
        <View className={`rounded-[24px] p-5 ${classes.listGroup}`}>
          {fields.map((field, index) => (
            <View key={field.label} className={index > 0 ? 'mt-4' : ''}>
              <Text className={classes.meta}>{field.label}</Text>
              <View className='relative mt-2'>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry={!field.visible}
                  autoCapitalize='none'
                  className={`rounded-xl px-4 py-3 pr-12 text-base ${classes.input}`}
                  placeholderTextColor={colors.placeholder}
                />
                <TouchableOpacity onPress={field.toggle} className='absolute top-3 right-3 p-1'>
                  <Ionicons
                    name={field.visible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.chevron}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className='mt-6 items-center rounded-2xl py-4'
          style={{ backgroundColor: primaryColor }}>
          {saving ? (
            <ActivityIndicator color='#FFF' />
          ) : (
            <Text className='text-base font-bold text-white'>Mettre à jour le mot de passe</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
