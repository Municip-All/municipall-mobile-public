import { StyleSheet } from 'react-native';
import { palette } from '@constants/design';

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
    color: palette.muted,
  },
  senderLabelDark: {
    color: palette.nightMuted,
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
    backgroundColor: palette.cream200,
  },
  bubbleAgentDark: {
    backgroundColor: palette.nightElevated,
  },
  bubbleOtherLight: {
    backgroundColor: palette.cream50,
    borderWidth: 1,
    borderColor: palette.cream200,
  },
  bubbleOtherDark: {
    backgroundColor: palette.nightSurface,
    borderWidth: 1,
    borderColor: palette.nightBorder,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: palette.cream50,
  },
  bubbleTextLight: {
    color: palette.charcoal,
  },
  bubbleTextDark: {
    color: palette.nightText,
  },
});
