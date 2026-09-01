import { palette } from '../constants/design';

export type ContactTicketType = 'question' | 'suggestion';

const SUGGESTION_TERMINAL = new Set<string>(['Réalisée', 'Non retenue', 'Clôturé']);

export function isTerminalContactStatus(
  ticketType: ContactTicketType | undefined,
  status: string
): boolean {
  if (ticketType === 'suggestion') {
    return SUGGESTION_TERMINAL.has(status);
  }
  return status.trim().toLowerCase() === 'clôturé';
}

export function getContactStatusColor(status: string): string {
  switch (status) {
    case 'En attente':
      return palette.amber400;
    case 'En cours':
      return palette.info400;
    case "À l'étude":
      return palette.info400;
    case 'Retenue':
      return palette.matcha700;
    case 'Mise en œuvre':
      return palette.info400;
    case 'Réalisée':
      return palette.matcha700;
    case 'Non retenue':
      return palette.sake400;
    case 'Clôturé':
      return palette.muted;
    default:
      return palette.muted;
  }
}
