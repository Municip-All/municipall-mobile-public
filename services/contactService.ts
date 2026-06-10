import apiClient from './apiClient';

export interface TicketMessage {
  id: number;
  senderId: number;
  senderRole: 'citizen' | 'agent';
  senderName: string;
  body: string;
  createdAt: string;
}

export type ContactTicketType = 'question' | 'suggestion';

export interface ContactTicketListItem {
  id: number;
  subject: string;
  ticketType?: ContactTicketType;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    body: string;
    senderRole: 'citizen' | 'agent';
    createdAt: string;
  };
}

export interface UserRating {
  stars: number;
  message?: string;
  createdAt: string;
}

export interface ContactTicketDetail {
  id: number;
  subject: string;
  ticketType?: ContactTicketType;
  status: string;
  userId: number;
  citizenName: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  messages: TicketMessage[];
  userRating?: UserRating;
}

export const contactService = {
  getMyTickets: async (): Promise<ContactTicketListItem[]> => {
    const response = await apiClient.get('contact-tickets/mine');
    return response.data;
  },

  createTicket: async (
    subject: string,
    body: string,
    ticketType: ContactTicketType = 'question'
  ): Promise<ContactTicketDetail> => {
    const response = await apiClient.post('contact-tickets', {
      subject,
      body,
      ticketType,
    });
    return response.data;
  },

  getTicket: async (id: number): Promise<ContactTicketDetail> => {
    const response = await apiClient.get(`contact-tickets/${id}`);
    return response.data;
  },

  reply: async (id: number, body: string): Promise<ContactTicketDetail> => {
    const response = await apiClient.post(`contact-tickets/${id}/messages`, { body });
    return response.data;
  },
};
