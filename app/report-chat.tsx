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
import { reportService, ReportDetail } from '../services/reportService';
import { useLiveChatRefresh } from '@hooks/useLiveChatRefresh';
import { chatBubbleStyles as styles } from '../lib/chatBubbleStyles';
import SatisfactionPrompt from '@components/SatisfactionPrompt';

export default function ReportChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark, primaryColor, classes, colors, layoutStyles } = useAppTheme();
  const { user } = useAuth();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isClosed = report?.status === 'Résolu' || report?.status === 'Clôturé';

  const loadReport = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!reportId || Number.isNaN(reportId)) return;
      const silent = options?.silent ?? false;
      try {
        const data = await reportService.getReport(reportId);
        setReport((prev) => {
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
    [reportId]
  );

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  useLiveChatRefresh(() => loadReport({ silent: true }), Boolean(report) && !isClosed);

  useEffect(() => {
    if (report?.messages.length) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [report?.messages.length]);

  const handleSend = async () => {
    const text = reply.trim();
    if (!text || isClosed) return;
    setSending(true);
    try {
      const updated = await reportService.reply(reportId, text);
      setReport(updated);
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

  if (!report) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Text className={classes.body}>Signalement introuvable.</Text>
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
              {report.category}
            </Text>
            <Text className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              REF-{String(report.id).padStart(4, '0')} · {report.status}
              {isClosed ? ' · Dossier clôturé' : ''}
            </Text>
          </View>
        </View>
      </View>

      {report.description ? (
        <View
          className={`border-b px-4 py-3 ${dark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50'}`}>
          <Text
            className={`text-xs font-bold tracking-wide uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Votre signalement
          </Text>
          <Text className={`mt-1 text-sm leading-5 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {report.description}
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
        keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          className='flex-1'
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {report.messages.length === 0 ? (
            <Text className={`py-8 text-center text-sm ${classes.body}`}>
              La mairie vous écrira ici si des précisions sont nécessaires.
            </Text>
          ) : (
            report.messages.map((msg) => {
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
            })
          )}
        </ScrollView>

        {!isClosed ? (
          <View
            style={{ paddingBottom: insets.bottom + 8, paddingHorizontal: 16, paddingTop: 8 }}
            className={`border-t ${dark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-white'}`}>
            <View className='flex-row items-end gap-2'>
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder='Votre réponse…'
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
              resourceType='report'
              resourceId={reportId}
              initialRating={report?.userRating}
              title="Comment s'est passé le traitement de votre signalement ?"
              onSubmitted={(rating) =>
                setReport((prev) => (prev ? { ...prev, userRating: rating } : prev))
              }
            />
            <View
              style={{ paddingBottom: insets.bottom + 8 }}
              className={`px-4 pb-2 ${dark ? 'bg-black' : 'bg-white'}`}>
              <Text className={`text-center text-xs ${classes.body}`}>
                Ce signalement est clôturé. Vous ne pouvez plus envoyer de messages.
              </Text>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
