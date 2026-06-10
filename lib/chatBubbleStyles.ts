import { StyleSheet } from 'react-native';

/** Marge latérale fiable (évite les bulles collées au bord sur ScrollView). */
export const CHAT_SCREEN_PADDING_H = 20;

export const chatBubbleStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: CHAT_SCREEN_PADDING_H,
  },
  messageRow: {
    width: '100%',
    marginBottom: 12,
  },
  messageCol: {
    maxWidth: '82%',
  },
  messageColMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginLeft: 40,
  },
  messageColOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    marginRight: 40,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    paddingHorizontal: 2,
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
