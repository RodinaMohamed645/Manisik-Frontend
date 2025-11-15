import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  sendMessage(sessionId: string | null, message: string): Observable<any> {
    if (!sessionId) sessionId = crypto.randomUUID();

    return this.http
      .post<{ answer: string }>(`${this.base}/ChatBotAi/chat`, {
        sessionId,
        message,
      })
      .pipe(
        map((res) => ({
          conversationId: sessionId,
          reply: res.answer,
        }))
      );
  }

  clearSession(sessionId: string) {
    return this.http.post(
      `${this.base}/ChatBotAi/clear?sessionId=${sessionId}`,
      {}
    );
  }
}
