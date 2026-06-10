import React, { useEffect, useState } from 'react';
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
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import { updateUserProfile } from '../services/userProfileService';

export default function ProfilePersonalInfoScreen() {
  const { dark, classes, primaryColor, layoutStyles } = useAppTheme();
  const { user, updateUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    setName(user.name ?? '');
    setSurname(user.surname ?? '');
    setEmail(user.email ?? '');
    setNeighborhood(user.neighborhood ?? '');
  }, [isAuthenticated, user, router]);

  if (!user) return null;

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    if (!name.trim() || !surname.trim() || !trimmedEmail) {
      Alert.alert('Champs requis', 'Nom, prénom et e-mail sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        name: name.trim(),
        surname: surname.trim(),
        email: trimmedEmail,
        neighborhood: neighborhood.trim() || undefined,
      });
      updateUser({
        name: updated.name,
        surname: updated.surname,
        email: updated.email,
        neighborhood: updated.neighborhood,
      });
      Alert.alert('Succès', 'Vos informations ont été mises à jour.');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour vos informations.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={layoutStyles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProfileScreenHeader title='Informations personnelles' />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps='handled'>
        <View className={`rounded-[24px] p-5 ${classes.listGroup}`}>
          {[
            { label: 'Prénom', value: name, onChange: setName },
            { label: 'Nom', value: surname, onChange: setSurname },
            {
              label: 'E-mail',
              value: email,
              onChange: setEmail,
              keyboard: 'email-address' as const,
            },
            { label: 'Quartier', value: neighborhood, onChange: setNeighborhood },
          ].map((field, index) => (
            <View key={field.label} className={index > 0 ? 'mt-4' : ''}>
              <Text className={classes.meta}>{field.label}</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                keyboardType={field.keyboard}
                autoCapitalize={field.keyboard ? 'none' : 'words'}
                className={`mt-2 rounded-xl px-4 py-3 text-base ${classes.input}`}
                placeholderTextColor={dark ? '#71717A' : '#A1A1AA'}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => router.push('/legal/my-data')} className='mt-4 py-2'>
          <Text className={`text-center text-sm font-semibold`} style={{ color: primaryColor }}>
            Mes droits RGPD (accès, suppression…) →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className='mt-4 items-center rounded-2xl py-4'
          style={{ backgroundColor: primaryColor }}>
          {saving ? (
            <ActivityIndicator color='#FFF' />
          ) : (
            <Text className='text-base font-bold text-white'>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
