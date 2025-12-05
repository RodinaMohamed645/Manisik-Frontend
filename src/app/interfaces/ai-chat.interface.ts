export interface AIChatResponse {
  answer: string;
  sessionId?: string;
  message?: string;
  suggestedActions?: string[];
  data?: {
    intent: string;
    hotels: any | null;
    transports: any | null;
    userBookings: any | null;
  } | null;
}
