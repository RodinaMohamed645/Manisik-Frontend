import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private requestCount = 0;

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      Promise.resolve().then(() => this.loadingSubject.next(true));
    }
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      Promise.resolve().then(() => this.loadingSubject.next(false));
    }
  }

  getLoadingValue(): boolean {
    return this.loadingSubject.value;
  }
}

