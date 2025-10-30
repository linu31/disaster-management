interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class LocationCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, expiresInMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(lat: number, lng: number, radius: number): string {
    return `${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
  }
}

export const locationCache = new LocationCache();
