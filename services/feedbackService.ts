import apiClient from './apiClient';

export type FeedbackResourceType = 'report' | 'contact_ticket';

export interface UserRating {
  stars: number;
  message?: string;
  createdAt: string;
}

export const feedbackService = {
  submit: async (
    resourceType: FeedbackResourceType,
    resourceId: number,
    stars: number,
    message?: string
  ): Promise<UserRating> => {
    const response = await apiClient.post('feedback', {
      resourceType,
      resourceId,
      stars,
      message: message?.trim() || undefined,
    });
    return response.data as UserRating;
  },
};
