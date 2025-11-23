import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Notification, NotificationType } from '../../interfaces';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationSubject = new Subject<Notification>();
  public readonly notifications$: Observable<Notification> =
    this.notificationSubject.asObservable();

  show(
    message: string,
    type: NotificationType = NotificationType.INFO,
    title?: string
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      title: title || this.getDefaultTitle(type),
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notificationSubject.next(notification);
  }

  success(message: string, title?: string): void {
    this.show(message, NotificationType.SUCCESS, title);
  }

  error(message: string, title?: string): void {
    this.show(message, NotificationType.ERROR, title);
  }

  warning(message: string, title?: string): void {
    this.show(message, NotificationType.WARNING, title);
  }

  info(message: string, title?: string): void {
    this.show(message, NotificationType.INFO, title);
  }

  private getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'Success';
      case NotificationType.ERROR:
        return 'Error';
      case NotificationType.WARNING:
        return 'Warning';
      case NotificationType.INFO:
        return 'Information';
      default:
        return 'Notification';
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
