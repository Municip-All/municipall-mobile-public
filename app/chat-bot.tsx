import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import {
  chatbotService,
  CITIZEN_CHAT_MAX_LENGTH,
} from '../services/chatbotService';
import { palette, tintColor } from '@constants/design';

interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  role: 'bot',
  text: "Bonjour ! Je suis l'assistant municipal. Décrivez votre problème en quelques mots (lampadaire, déchets, voirie…) et je vous indique la suite.",
};

const ERROR_MESSAGE = 'Le service est momentanément indisponible. Veuillez réessayer.';

let nextMessageId = 1;

function createMessage(role: ChatMessage['role'], text: string): ChatMessage {
  const message: ChatMessage = { id: nextMessageId, role, text };
  nextMessageId += 1;
  return message;
}

export default function ChatBotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark, primaryColor, classes, colors, layoutStyles } = useAppTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const lastFailedRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(id);
  }, [messages.length, sending, errorVisible]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    lastFailedRef.current = trimmed;
    setErrorVisible(false);
    setInput('');
    setMessages((prev) => [...prev, createMessage('user', trimmed)]);
    setSending(true);
    try {
      const response = await chatbotService.sendCitoyenMessage(trimmed);
      setMessages((prev) => [...prev, createMessage('bot', response.reply)]);
      lastFailedRef.current = null;
    } catch {
      setErrorVisible(true);
    } finally {
      setSending(false);
    }
  }, [sending]);

  useEffect(() => {
    return () => {
      lastFailedRef.current = null;
    };
  }, []);

  const handleRetry = useCallback(() => {
    const failed = lastFailedRef.current;
    if (failed) void send(failed);
  }, [send]);

  const renderBubble = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    return (
      <View
        key={message.id}
        style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: primaryColor }
              : dark
                ? styles.bubbleBotDark
                : styles.bubbleBotLight,
          ]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : (dark ? styles.bubbleTextBotDark : styles.bubbleTextBotLight)]}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={layoutStyles.page}>
      <View
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}
        className={`border-b ${dark ? 'border-night-border bg-night-surface' : 'border-cream-200 bg-cream-50'}`}>
        <View className='flex-row items-center'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='mr-3 p-2'
            accessibilityRole='button'
            accessibilityLabel='Retour'>
            <Ionicons
              name='chevron-back'
              size={24}
              color={dark ? palette.nightText : palette.matcha900}
            />
          </TouchableOpacity>
          <View
            className='mr-3 h-10 w-10 items-center justify-center rounded-full'
            style={{ backgroundColor: dark ? palette.nightElevated : palette.matcha100 }}>
            <Ionicons name='leaf' size={20} color={primaryColor} />
          </View>
          <View className='flex-1'>
            <Text
              className={`text-base font-bold ${dark ? 'text-night-text' : 'text-matcha-900'}`}>
              Assistant municipal
            </Text>
            <Text className={`text-xs ${dark ? 'text-night-muted' : 'text-muted'}`}>
              Municip’All · En ligne
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
          {messages.map(renderBubble)}

          {sending ? (
            <View style={styles.messageRow}>
              <View style={[styles.bubble, dark ? styles.bubbleBotDark : styles.bubbleBotLight]}>
                <View className='flex-row items-center gap-2'>
                  <ActivityIndicator size='small' color={primaryColor} />
                  <Text
                    className={`text-xs ${dark ? 'text-night-muted' : 'text-muted'}`}>
                    L’assistant rédige une réponse…
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {errorVisible ? (
            <View style={styles.messageRow}>
              <View
                style={[
                  styles.bubble,
                  styles.bubbleError,
                  { backgroundColor: dark ? palette.nightSurface : tintColor(palette.sake400) },
                ]}>
                <View className='flex-row items-center gap-2'>
                  <Ionicons name='warning-outline' size={16} color={palette.sake400} />
                  <Text className='flex-1 text-xs' style={{ color: palette.sake400 }}>
                    {ERROR_MESSAGE}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleRetry}
                  className='mt-2 self-start rounded-xl px-3 py-2'
                  style={{ backgroundColor: primaryColor }}
                  accessibilityRole='button'
                  accessibilityLabel='Réessayer l’envoi du message'>
                  <Text style={{ color: colors.onPrimary }} className='text-xs font-semibold'>
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{ paddingBottom: insets.bottom + 8, paddingHorizontal: 16, paddingTop: 8 }}
          className={`border-t ${dark ? 'border-night-border bg-night-bg' : 'border-cream-200 bg-cream-50'}`}>
          <View className='flex-row items-end gap-2'>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder='Décrivez votre problème…'
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={CITIZEN_CHAT_MAX_LENGTH}
              editable={!sending}
              className={`max-h-28 flex-1 px-4 py-3 ${classes.formField} ${classes.formFieldText}`}
              accessibilityLabel='Votre message à l’assistant municipal'
            />
            <TouchableOpacity
              onPress={() => void send(input)}
              disabled={sending || !input.trim()}
              accessibilityLabel='Envoyer'
              accessibilityRole='button'
              style={{
                backgroundColor: primaryColor,
                opacity: sending || !input.trim() ? 0.5 : 1,
              }}
              className='h-11 w-11 items-center justify-center rounded-full'>
              {sending ? (
                <ActivityIndicator color={colors.onPrimary} size='small' />
              ) : (
                <Ionicons name='send' size={18} color={colors.onPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleBotLight: {
    backgroundColor: palette.cream50,
    borderWidth: 1,
    borderColor: palette.cream200,
  },
  bubbleBotDark: {
    backgroundColor: palette.nightSurface,
    borderWidth: 1,
    borderColor: palette.nightBorder,
  },
  bubbleError: {
    borderWidth: 1,
    borderColor: palette.sake400,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: palette.cream50,
  },
  bubbleTextBotLight: {
    color: palette.charcoal,
  },
  bubbleTextBotDark: {
    color: palette.nightText,
  },
});
