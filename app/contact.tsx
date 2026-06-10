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
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  contactService,
  ContactTicketListItem,
  ContactTicketType,
} from '../services/contactService';
import { getContactStatusColor, isTerminalContactStatus } from '../lib/contactTicketStatus';

function SuggestionCard({
  ticket,
  dark,
  primaryColor,
  onPress,
}: {
  ticket: ContactTicketListItem;
  dark: boolean;
  primaryColor: string;
  onPress: () => void;
}) {
  const statusColor = getContactStatusColor(ticket.status);
  const lastFromAgent = ticket.lastMessage?.senderRole === 'agent';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`mb-3 overflow-hidden rounded-3xl border ${
        dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
      }`}>
      {lastFromAgent ? (
        <View className='h-1 w-full' style={{ backgroundColor: '#007AFF' }} />
      ) : null}
      <View className='p-5'>
        <View className='flex-row items-start justify-between gap-3'>
          <View className='min-w-0 flex-1'>
            <Text
              className={`text-base font-bold ${dark ? 'text-white' : 'text-black'}`}
              numberOfLines={2}>
              {ticket.subject}
            </Text>
            <Text className={`mt-1 text-[11px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Suggestion · Réf. {ticket.id}
            </Text>
          </View>
          <View
            className='shrink-0 rounded-full px-2.5 py-1'
            style={{ backgroundColor: `${statusColor}18` }}>
            <Text className='text-[10px] font-black uppercase' style={{ color: statusColor }}>
              {ticket.status}
            </Text>
          </View>
        </View>
        <View className={`mt-3 rounded-2xl px-3.5 py-3 ${dark ? 'bg-zinc-800/60' : 'bg-zinc-50'}`}>
          <Text
            className={`text-sm leading-5 ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}
            numberOfLines={3}>
            {ticket.lastMessage?.body || 'Votre suggestion a été transmise à la mairie.'}
          </Text>
        </View>
        <View className='mt-3 flex-row items-center gap-2'>
          <Ionicons
            name={lastFromAgent ? 'mail-unread-outline' : 'megaphone-outline'}
            size={16}
            color={lastFromAgent ? '#007AFF' : primaryColor}
          />
          <Text
            className={`text-xs font-semibold ${
              lastFromAgent ? 'text-blue-600' : dark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
            {lastFromAgent ? 'Suivi mairie — réponse à lire' : 'Suivi de votre suggestion'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ContactScreen: React.FC = () => {
  const { dark, primaryColor, classes, colors, layoutStyles } = useAppTheme();
  const { config } = useCity();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tickets, setTickets] = useState<ContactTicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<ContactTicketType>('question');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchives, setShowArchives] = useState(false);

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
      const ticket = await contactService.createTicket(trimmedSubject, trimmedBody, newType);
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

  const openTickets = tickets.filter(
    (t) => !isTerminalContactStatus(t.ticketType ?? 'question', t.status)
  );
  const archivedTickets = tickets.filter((t) =>
    isTerminalContactStatus(t.ticketType ?? 'question', t.status)
  );
  const openQuestions = openTickets.filter((t) => (t.ticketType ?? 'question') === 'question');
  const openSuggestions = openTickets.filter((t) => t.ticketType === 'suggestion');

  const openChat = (id: number) => {
    router.push({ pathname: '/contact-chat', params: { id: String(id) } });
  };

  return (
    <View style={layoutStyles.page}>
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
              <Text
                className={`ml-3 flex-1 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>
                {contactEmail || 'E-mail non renseigné'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openPhone}
              disabled={!contactPhone}
              className={`flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'} ${!contactPhone ? 'opacity-50' : ''}`}>
              <Ionicons name='call-outline' size={20} color={primaryColor} />
              <Text
                className={`ml-3 flex-1 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>
                {contactPhone || 'Téléphone non renseigné'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className='mb-4 flex-row items-center justify-between'>
            <Text className={classes.sectionTitle}>Écrire à la mairie</Text>
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
              <Text className={`mb-3 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                Type de demande
              </Text>
              <View style={styles.typeRow}>
                {(
                  [
                    {
                      id: 'question' as const,
                      label: 'Question',
                      hint: 'Réponse rapide',
                      icon: 'help-circle-outline' as const,
                    },
                    {
                      id: 'suggestion' as const,
                      label: 'Suggestion',
                      hint: 'Suivi par la mairie',
                      icon: 'bulb-outline' as const,
                    },
                  ] as const
                ).map((opt) => {
                  const active = newType === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setNewType(opt.id)}
                      style={[
                        styles.typeChip,
                        active
                          ? { borderColor: primaryColor, backgroundColor: `${primaryColor}12` }
                          : {
                              borderColor: dark ? '#3f3f46' : '#e4e4e7',
                              backgroundColor: dark ? '#18181b' : '#fafafa',
                            },
                      ]}>
                      <Ionicons
                        name={opt.icon}
                        size={22}
                        color={active ? primaryColor : '#8E8E93'}
                      />
                      <Text
                        className={`mt-2 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                        {opt.label}
                      </Text>
                      <Text
                        className={`mt-0.5 text-[10px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {opt.hint}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder={
                  newType === 'suggestion' ? 'Titre de votre suggestion' : 'Sujet de votre question'
                }
                placeholderTextColor={colors.placeholder}
                className={`mb-3 rounded-xl px-4 py-3 font-medium ${classes.formField} ${classes.formFieldText}`}
              />
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder={
                  newType === 'suggestion'
                    ? 'Décrivez votre idée pour améliorer la commune…'
                    : 'Posez votre question…'
                }
                placeholderTextColor={colors.placeholder}
                multiline
                className={`mb-4 min-h-[100px] rounded-xl px-4 py-3 font-medium ${classes.formField} ${classes.formFieldText}`}
                textAlignVertical='top'
              />
              {newType === 'suggestion' && (
                <Text
                  className={`mb-3 text-xs leading-5 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Votre suggestion sera suivie comme un dossier : la mairie pourra vous répondre et
                  vous informer des avancées.
                </Text>
              )}
              <TouchableOpacity
                onPress={handleCreateTicket}
                disabled={isSubmitting}
                className='items-center rounded-full py-4'
                style={{ backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='font-bold text-white'>
                    {newType === 'suggestion' ? 'Envoyer ma suggestion' : 'Poser ma question'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!isAuthenticated ? (
            <View className={`items-center rounded-[28px] p-8 ${classes.card}`}>
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
            <View className={`items-center rounded-[28px] p-8 ${classes.card}`}>
              <Text className={`text-sm ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Aucune conversation. Posez une question ou partagez une suggestion.
              </Text>
            </View>
          ) : (
            <>
              {openSuggestions.length > 0 && (
                <View className='mb-6'>
                  <Text className={`mb-3 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                    Mes suggestions
                  </Text>
                  {openSuggestions.map((ticket) => (
                    <SuggestionCard
                      key={ticket.id}
                      ticket={ticket}
                      dark={dark}
                      primaryColor={primaryColor}
                      onPress={() => openChat(ticket.id)}
                    />
                  ))}
                </View>
              )}

              {openQuestions.length > 0 && (
                <View className={`mb-6 overflow-hidden rounded-[28px] ${classes.card}`}>
                  <View className='border-b border-zinc-50 px-4 py-3 dark:border-zinc-800'>
                    <Text className={`text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                      Questions
                    </Text>
                  </View>
                  {openQuestions.map((ticket, i) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => openChat(ticket.id)}
                      className={`flex-row items-center p-4 ${i < openQuestions.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                      <View
                        className='mr-3 h-10 w-10 items-center justify-center rounded-xl'
                        style={{ backgroundColor: `${getContactStatusColor(ticket.status)}15` }}>
                        <Ionicons
                          name='chatbubble-outline'
                          size={20}
                          color={getContactStatusColor(ticket.status)}
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
                          {ticket.lastMessage?.body || 'Nouvelle question'}
                        </Text>
                      </View>
                      <Ionicons name='chevron-forward' size={16} color='#A1A1AA' />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {archivedTickets.length > 0 && (
                <View className='mb-4'>
                  <TouchableOpacity
                    onPress={() => setShowArchives((v) => !v)}
                    activeOpacity={0.8}
                    className={`mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                      dark ? 'bg-zinc-900' : 'bg-zinc-100'
                    }`}>
                    <View className='flex-row items-center gap-2'>
                      <Ionicons name='archive-outline' size={18} color='#8E8E93' />
                      <Text
                        className={`text-xs font-bold tracking-wide uppercase ${
                          dark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                        Archives ({archivedTickets.length})
                      </Text>
                    </View>
                    <Ionicons
                      name={showArchives ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color='#8E8E93'
                    />
                  </TouchableOpacity>
                  {showArchives && (
                    <View className={`overflow-hidden rounded-[28px] opacity-75 ${classes.card}`}>
                      {archivedTickets.map((ticket, i) => (
                        <TouchableOpacity
                          key={ticket.id}
                          onPress={() => openChat(ticket.id)}
                          className={`flex-row items-center p-4 ${i < archivedTickets.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                          <View className='mr-3 h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800'>
                            <Ionicons name='checkmark-done' size={20} color='#8E8E93' />
                          </View>
                          <View className='flex-1'>
                            <Text
                              numberOfLines={1}
                              className={`text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                              {ticket.subject}
                            </Text>
                            <Text
                              className={`text-[10px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {ticket.ticketType === 'suggestion' ? 'Suggestion' : 'Question'} ·
                              Clôturé
                            </Text>
                          </View>
                          <Ionicons name='chevron-forward' size={16} color='#A1A1AA' />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
});

export default ContactScreen;
