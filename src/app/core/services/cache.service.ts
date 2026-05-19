import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private store = new Map<string, { data: unknown; ts: number }>();

  get<T>(key: string, ttlMs = 3_600_000): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() - entry.ts > ttlMs) return null;
    return entry.data as T;
  }

  set(key: string, data: unknown): void {
    this.store.set(key, { data, ts: Date.now() });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}
