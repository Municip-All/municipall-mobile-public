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
      return '#FF9500';
    case 'En cours':
      return '#007AFF';
    case "À l'étude":
      return '#5856D6';
    case 'Retenue':
      return '#34C759';
    case 'Mise en œuvre':
      return '#007AFF';
    case 'Réalisée':
      return '#34C759';
    case 'Non retenue':
      return '#FF3B30';
    case 'Clôturé':
      return '#8E8E93';
    default:
      return '#8E8E93';
  }
}
