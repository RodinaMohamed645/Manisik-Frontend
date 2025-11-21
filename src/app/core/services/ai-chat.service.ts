import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface AIChatResponse {
  message: string;
  sessionId: string;
  suggestedActions: string[];
  data: {
    intent: string;
    hotels: any | null;
    transports: any | null;
    userBookings: any | null;
  };
}


/**
 * AIChatService
 * Responsible for communicating with the backend AI endpoint.
 * - sendMessage(conversationId, message) sends the user's message and returns AI response.
 * - The backend contract is assumed to accept { conversationId?, message } and return { conversationId, reply }
 * - Keep this service small so it can be mocked in tests.
 */
@Injectable({ providedIn: 'root' })
export class AIChatService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  sendMessage(sessionId: string | null, message: string): Observable<{ conversationId: string; reply: string }> {
  if (!sessionId) sessionId = crypto.randomUUID();

  return this.http
    .post<AIChatResponse>(`${this.base}/AI/chat`, {
      sessionId,
      role: "user",
      message,
      language: "en",
      timestamp: new Date().toISOString(),
    })
    .pipe(
      map((res) => ({
        conversationId: res.sessionId, // use sessionId from response
        reply: res.message,            // message from backend
      }))
    );
}


  clearSession(sessionId: string) {
    return this.http.post(
      `${this.base}/AI/clear?sessionId=${sessionId}`,
      {}
    );
  }
}
