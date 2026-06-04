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
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import { contactService, ContactTicketDetail } from '../services/contactService';

export default function ContactChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark, primaryColor, classes, colors } = useAppTheme();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<ContactTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isClosed = ticket?.status === 'Clôturé';

  const loadTicket = useCallback(async () => {
    if (!ticketId || Number.isNaN(ticketId)) return;
    try {
      const data = await contactService.getTicket(ticketId);
      setTicket(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

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
      <View className={`flex-1 items-center justify-center ${classes.page}`}>
        <ActivityIndicator color={primaryColor} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${classes.page}`}>
        <Text className={classes.body}>Conversation introuvable.</Text>
        <TouchableOpacity onPress={() => router.back()} className='mt-4'>
          <Text style={{ color: primaryColor }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${classes.page}`}>
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
              {ticket.status}
              {isClosed ? ' · Conversation terminée' : ''}
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
          className='flex-1 px-4'
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {ticket.messages.map((msg) => {
            const isMine =
              msg.senderRole === 'citizen' && msg.senderId === user?.id;
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
          <View
            className={`border-t px-4 py-4 ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <Text className={`text-center text-sm ${classes.body}`}>
              Cette conversation est clôturée par la mairie.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  messageRow: {
    width: '100%',
    marginBottom: 12,
  },
  messageCol: {
    maxWidth: '85%',
  },
  messageColMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageColOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  senderLabelLight: {
    color: '#a1a1aa',
  },
  senderLabelDark: {
    color: '#71717a',
  },
  senderLabelMine: {
    textAlign: 'right',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAgentLight: {
    backgroundColor: '#e4e4e7',
  },
  bubbleAgentDark: {
    backgroundColor: '#27272a',
  },
  bubbleOtherLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  bubbleOtherDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#ffffff',
  },
  bubbleTextLight: {
    color: '#27272a',
  },
  bubbleTextDark: {
    color: '#e4e4e7',
  },
});
