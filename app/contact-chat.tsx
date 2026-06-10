import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { contactService, ContactTicketDetail } from '../services/contactService';
import { isTerminalContactStatus } from '../lib/contactTicketStatus';
import SatisfactionPrompt from '@components/SatisfactionPrompt';
import { useLiveChatRefresh } from '@hooks/useLiveChatRefresh';
import { chatBubbleStyles as styles } from '../lib/chatBubbleStyles';

export default function ContactChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark, primaryColor, classes, colors, layoutStyles } = useAppTheme();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<ContactTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isClosed = ticket
    ? isTerminalContactStatus(ticket.ticketType ?? 'question', ticket.status)
    : false;

  const loadTicket = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!ticketId || Number.isNaN(ticketId)) return;
      const silent = options?.silent ?? false;
      try {
        const data = await contactService.getTicket(ticketId);
        setTicket((prev) => {
          if (!prev) return data;
          const prevLastId = prev.messages[prev.messages.length - 1]?.id;
          const nextLastId = data.messages[data.messages.length - 1]?.id;
          if (
            prev.messages.length === data.messages.length &&
            prevLastId === nextLastId &&
            prev.status === data.status
          ) {
            return prev;
          }
          return data;
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [ticketId]
  );

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  useLiveChatRefresh(() => loadTicket({ silent: true }), Boolean(ticket) && !isClosed);

  useEffect(() => {
    if (ticket?.messages.length) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [ticket?.messages.length]);

  const handleSend = async () => {
    const text = reply.trim();
    if (!text || isClosed) return;
    setSending(true);
    try {
      const updated = await contactService.reply(ticketId, text);
      setTicket(updated);
      setReply('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <ActivityIndicator color={primaryColor} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Text className={classes.body}>Conversation introuvable.</Text>
        <TouchableOpacity onPress={() => router.back()} className='mt-4'>
          <Text style={{ color: primaryColor }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={layoutStyles.page}>
      <View
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}
        className={`border-b ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <View className='flex-row items-center'>
          <TouchableOpacity onPress={() => router.back()} className='mr-3 p-2'>
            <Ionicons name='chevron-back' size={24} color={dark ? '#FFF' : '#000'} />
          </TouchableOpacity>
          <View className='flex-1'>
            <Text
              numberOfLines={1}
              className={`text-base font-bold ${dark ? 'text-white' : 'text-black'}`}>
              {ticket.subject}
            </Text>
            <Text className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {ticket.ticketType === 'suggestion' ? 'Suggestion · ' : 'Question · '}
              {ticket.status}
              {isClosed ? ' · Archivée' : ''}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
        keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          className='flex-1'
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {ticket.messages.map((msg) => {
            const isMine = msg.senderRole === 'citizen' && msg.senderId === user?.id;
            const isAgent = msg.senderRole === 'agent';

            const bubbleStyle = isMine
              ? { backgroundColor: primaryColor }
              : isAgent
                ? dark
                  ? styles.bubbleAgentDark
                  : styles.bubbleAgentLight
                : dark
                  ? styles.bubbleOtherDark
                  : styles.bubbleOtherLight;

            const textStyle = isMine
              ? styles.bubbleTextMine
              : dark
                ? styles.bubbleTextDark
                : styles.bubbleTextLight;

            return (
              <View key={msg.id} style={styles.messageRow}>
                <View
                  style={[
                    styles.messageCol,
                    isMine ? styles.messageColMine : styles.messageColOther,
                  ]}>
                  <Text
                    style={[
                      styles.senderLabel,
                      dark ? styles.senderLabelDark : styles.senderLabelLight,
                      isMine ? styles.senderLabelMine : undefined,
                    ]}>
                    {msg.senderName}
                  </Text>
                  <View style={[styles.bubble, bubbleStyle]}>
                    <Text style={[styles.bubbleText, textStyle]}>{msg.body}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {!isClosed ? (
          <View
            style={{ paddingBottom: insets.bottom + 8, paddingHorizontal: 16, paddingTop: 8 }}
            className={`border-t ${dark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-white'}`}>
            <View className='flex-row items-end gap-2'>
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder='Votre message…'
                placeholderTextColor={colors.placeholder}
                multiline
                className={`max-h-28 flex-1 rounded-2xl px-4 py-3 text-base ${classes.formField} ${classes.formFieldText}`}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={sending || !reply.trim()}
                style={{
                  backgroundColor: primaryColor,
                  opacity: sending || !reply.trim() ? 0.5 : 1,
                }}
                className='h-11 w-11 items-center justify-center rounded-full'>
                {sending ? (
                  <ActivityIndicator color='white' size='small' />
                ) : (
                  <Ionicons name='send' size={18} color='#FFF' />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <SatisfactionPrompt
              resourceType='contact_ticket'
              resourceId={ticketId}
              initialRating={ticket?.userRating}
              title={
                ticket?.ticketType === 'suggestion'
                  ? 'Comment évaluez-vous le suivi de votre suggestion ?'
                  : "Comment s'est passé votre échange avec la mairie ?"
              }
              onSubmitted={(rating) =>
                setTicket((prev) => (prev ? { ...prev, userRating: rating } : prev))
              }
            />
            <View
              style={{ paddingBottom: insets.bottom + 8 }}
              className={`px-4 pb-2 ${dark ? 'bg-black' : 'bg-white'}`}>
              <Text className={`text-center text-xs ${classes.body}`}>
                Cette conversation est terminée. Vous ne pouvez plus envoyer de messages.
              </Text>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
