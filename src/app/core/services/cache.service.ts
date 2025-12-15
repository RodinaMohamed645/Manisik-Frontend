import { Injectable, signal } from '@angular/core';
import { Observable, of, tap, shareReplay, Subject, takeUntil, map } from 'rxjs';

/**
 * Cache entry structure with TTL support
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Centralized caching service for API responses
 * Provides global caching with automatic TTL-based invalidation
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, Observable<any>>();
  private invalidation$ = new Subject<string | null>();

  // Default TTL: 5 minutes
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Store data in cache with optional TTL
   * @param key Unique cache key
   * @param data Data to cache
   * @param ttlMs Time-to-live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Get cached data if valid (not expired)
   * @param key Cache key
   * @returns Cached data or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a cache entry exists and is valid
   * @param key Cache key
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern Optional pattern to match keys (invalidates all if not provided)
   */
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.invalidation$.next(null);
      return;
    }

    // Invalidate all keys containing the pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    this.invalidation$.next(pattern);
  }

  /**
   * Get data from cache or fetch using the provided fetcher function
   * Prevents duplicate in-flight requests for the same key
   * @param key Unique cache key
   * @param fetcher Function returning Observable to fetch data
   * @param ttlMs Optional TTL override
   */
  getOrFetch<T>(
    key: string,
    fetcher: () => Observable<T>,
    ttlMs: number = this.DEFAULT_TTL
  ): Observable<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return of(cached);
    }

    // Check if request is already in flight
    const inFlight = this.inFlightRequests.get(key);
    if (inFlight) {
      return inFlight as Observable<T>;
    }

    // Make the request and cache the result
    const request$ = fetcher().pipe(
      tap(data => {
        this.set(key, data, ttlMs);
        this.inFlightRequests.delete(key);
      }),
      shareReplay(1),
      takeUntil(this.invalidation$.pipe(
        map(pattern => pattern === null || key.includes(pattern))
      ))
    );

    this.inFlightRequests.set(key, request$);
    return request$;
  }

  /**
   * Get cache size for debugging
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clear all cache (useful on logout)
   */
  clear(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
    this.invalidation$.next(null);
  }
}
