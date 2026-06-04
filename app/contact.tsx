import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contactService, ContactTicketListItem } from '../services/contactService';

const ContactScreen: React.FC = () => {
  const { dark, primaryColor, classes, colors } = useAppTheme();
  const { config } = useCity();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tickets, setTickets] = useState<ContactTicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!isAuthenticated) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await contactService.getMyTickets();
      setTickets(data);
    } catch (e) {
      console.error(e);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const contactEmail = config?.contact?.email?.trim();
  const contactPhone = config?.contact?.phone?.trim();
  const helpText =
    config?.contact?.helpText?.trim() ||
    'Notre équipe est à votre disposition pour toute question concernant les services de la mairie.';

  const openEmail = () => {
    if (!contactEmail) {
      Alert.alert('Contact', "L'e-mail de la mairie n'est pas encore configuré.");
      return;
    }
    Linking.openURL(`mailto:${contactEmail}`);
  };

  const openPhone = () => {
    if (!contactPhone) {
      Alert.alert('Contact', "Le numéro de la mairie n'est pas encore configuré.");
      return;
    }
    Linking.openURL(`tel:${contactPhone.replace(/\s/g, '')}`);
  };

  const handleCreateTicket = async () => {
    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour contacter la mairie.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/login') },
      ]);
      return;
    }

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    if (!trimmedSubject) {
      Alert.alert('Message incomplet', 'Veuillez indiquer un sujet.');
      return;
    }
    if (trimmedBody.length < 10) {
      Alert.alert('Message incomplet', 'Votre message doit contenir au moins 10 caractères.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await contactService.createTicket(trimmedSubject, trimmedBody);
      setSubject('');
      setBody('');
      setShowNew(false);
      router.push({ pathname: '/contact-chat', params: { id: String(ticket.id) } });
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir la conversation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente':
        return '#FF9500';
      case 'En cours':
        return '#007AFF';
      case 'Clôturé':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const openTickets = tickets.filter((t) => t.status !== 'Clôturé');
  const closedTickets = tickets.filter((t) => t.status === 'Clôturé');

  return (
    <View className={`flex-1 ${classes.page}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
        keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: 120,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'>
          <View className='mb-8'>
            <Text className={classes.eyebrow}>Assistance</Text>
            <Text className={classes.title}>Contact</Text>
          </View>

          <View className={`mb-8 rounded-[28px] p-6 ${classes.card}`}>
            <Text className={`mb-2 text-lg font-bold ${dark ? 'text-white' : 'text-black'}`}>
              Besoin d&apos;aide ?
            </Text>
            <Text className={`mb-6 text-sm leading-5 ${classes.body}`}>{helpText}</Text>
            <TouchableOpacity
              onPress={openEmail}
              disabled={!contactEmail}
              className={`mb-3 flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'} ${!contactEmail ? 'opacity-50' : ''}`}>
              <Ionicons name='mail-outline' size={20} color={primaryColor} />
              <Text className={`ml-3 flex-1 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>
                {contactEmail || 'E-mail non renseigné'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openPhone}
              disabled={!contactPhone}
              className={`flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'} ${!contactPhone ? 'opacity-50' : ''}`}>
              <Ionicons name='call-outline' size={20} color={primaryColor} />
              <Text className={`ml-3 flex-1 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>
                {contactPhone || 'Téléphone non renseigné'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className='mb-4 flex-row items-center justify-between'>
            <Text className={classes.sectionTitle}>Mes conversations</Text>
            {isAuthenticated && (
              <TouchableOpacity
                onPress={() => setShowNew((v) => !v)}
                className='rounded-full px-4 py-2'
                style={{ backgroundColor: primaryColor }}>
                <Text className='text-xs font-bold text-white'>
                  {showNew ? 'Annuler' : 'Nouveau'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showNew && isAuthenticated && (
            <View className={`mb-6 rounded-[28px] p-4 ${classes.card}`}>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder='Sujet de votre demande'
                placeholderTextColor={colors.placeholder}
                className={`mb-3 rounded-xl px-4 py-3 font-medium ${classes.formField} ${classes.formFieldText}`}
              />
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder='Décrivez votre demande…'
                placeholderTextColor={colors.placeholder}
                multiline
                className={`mb-4 min-h-[100px] rounded-xl px-4 py-3 font-medium ${classes.formField} ${classes.formFieldText}`}
                textAlignVertical='top'
              />
              <TouchableOpacity
                onPress={handleCreateTicket}
                disabled={isSubmitting}
                className='items-center rounded-full py-4'
                style={{ backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='font-bold text-white'>Démarrer la conversation</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className={`mb-8 overflow-hidden rounded-[28px] ${classes.card}`}>
            {!isAuthenticated ? (
              <View className='items-center p-8'>
                <Text className={`text-center text-sm ${classes.body}`}>
                  Connectez-vous pour échanger avec la mairie.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/login')}
                  className='mt-4 rounded-full px-6 py-3'
                  style={{ backgroundColor: primaryColor }}>
                  <Text className='font-bold text-white'>Se connecter</Text>
                </TouchableOpacity>
              </View>
            ) : loading ? (
              <ActivityIndicator className='my-8' color={primaryColor} />
            ) : tickets.length === 0 ? (
              <View className='items-center p-8'>
                <Text className={`text-sm ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Aucune conversation. Créez-en une pour contacter la mairie.
                </Text>
              </View>
            ) : (
              <>
                {openTickets.map((ticket, i) => (
                  <TouchableOpacity
                    key={ticket.id}
                    onPress={() =>
                      router.push({ pathname: '/contact-chat', params: { id: String(ticket.id) } })
                    }
                    className={`flex-row items-center p-4 ${i < openTickets.length - 1 || closedTickets.length ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                    <View
                      className='mr-3 h-10 w-10 items-center justify-center rounded-xl'
                      style={{ backgroundColor: `${getStatusColor(ticket.status)}15` }}>
                      <Ionicons
                        name='chatbubbles-outline'
                        size={20}
                        color={getStatusColor(ticket.status)}
                      />
                    </View>
                    <View className='mr-2 flex-1'>
                      <Text
                        numberOfLines={1}
                        className={`text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                        {ticket.subject}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`mt-0.5 text-[11px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {ticket.lastMessage?.body || 'Nouvelle conversation'}
                      </Text>
                    </View>
                    <Ionicons name='chevron-forward' size={16} color='#A1A1AA' />
                  </TouchableOpacity>
                ))}
                {closedTickets.length > 0 && (
                  <>
                    <View className='bg-zinc-50 px-4 py-2 dark:bg-zinc-800/50'>
                      <Text className='text-[10px] font-bold uppercase text-zinc-500'>Clôturées</Text>
                    </View>
                    {closedTickets.map((ticket, i) => (
                      <TouchableOpacity
                        key={ticket.id}
                        onPress={() =>
                          router.push({
                            pathname: '/contact-chat',
                            params: { id: String(ticket.id) },
                          })
                        }
                        className={`flex-row items-center p-4 opacity-70 ${i < closedTickets.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                        <View className='mr-3 h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800'>
                          <Ionicons name='checkmark-done' size={20} color='#34C759' />
                        </View>
                        <View className='flex-1'>
                          <Text
                            numberOfLines={1}
                            className={`text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                            {ticket.subject}
                          </Text>
                        </View>
                        <Ionicons name='chevron-forward' size={16} color='#A1A1AA' />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
};

export default ContactScreen;
