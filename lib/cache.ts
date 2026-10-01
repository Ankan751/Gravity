// In-Memory Query & Data Cache with TTL and invalidation
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Global cache object so it persists across hot-reloads and serverless warm containers
declare global {
  // eslint-disable-next-line no-var
  var memoryDataCache: Map<string, CacheEntry<any>> | undefined;
}

const cache: Map<string, CacheEntry<any>> =
  global.memoryDataCache || new Map<string, CacheEntry<any>>();

if (!global.memoryDataCache) {
  global.memoryDataCache = cache;
}

/**
 * Retrieve cached data by key if not expired
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store data in cache with a TTL (in seconds, default 60s)
 */
export function setCached<T>(key: string, data: T, ttlSeconds: number = 60): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate a specific key or all keys matching a prefix
 */
export function invalidateCache(prefixOrKey: string): void {
  for (const key of cache.keys()) {
    if (key === prefixOrKey || key.startsWith(prefixOrKey)) {
      cache.delete(key);
    }
  }
}
