/**
 * KV Cache Service
 * Centralized caching layer using Cloudflare KV
 * Provides consistent TTL management and cache invalidation
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  prefix?: string; // Optional key prefix for namespacing
}

export const CACHE_KEYS = {
  SPECIALTIES: "specialties:all",
  SPECIALTY: (id: string) => `specialty:${id}`,
  USER_STATS: (userId: string) => `user:${userId}:stats`,
  USER_QUIZ_HISTORY: (userId: string, page: number) =>
    `user:${userId}:quiz-history:${page}`,
  LEADERBOARD: (timeframe: "daily" | "weekly" | "monthly" | "all-time") =>
    `leaderboard:${timeframe}`,
  QUIZ_SESSION: (sessionId: string) => `quiz-session:${sessionId}`,
  STUDY_PACKAGE: (packageId: string) => `study-package:${packageId}`,
} as const;

export const CACHE_TTL = {
  SPECIALTIES: 3600, // 1 hour - rarely changes
  USER_STATS: 300, // 5 minutes - updates on quiz completion
  QUIZ_HISTORY: 600, // 10 minutes - updates on quiz completion
  LEADERBOARD: 600, // 10 minutes - updates frequently
  QUIZ_SESSION: 1800, // 30 minutes - active quiz session
  STUDY_PACKAGE: 3600, // 1 hour - rarely changes
  SHORT: 60, // 1 minute - for frequently changing data
  MEDIUM: 300, // 5 minutes - for moderate changes
  LONG: 3600, // 1 hour - for stable data
} as const;

/**
 * KV Cache Service Class
 * Handles all KV operations with proper error handling and logging
 */
export class KVCacheService {
  private kv: KVNamespace | null = null;

  constructor(kvNamespace?: KVNamespace) {
    this.kv = kvNamespace || null;
  }

  /**
   * Check if KV is available
   */
  isAvailable(): boolean {
    return this.kv !== null;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.kv) {
      console.warn(
        "[KV Cache] KV namespace not available - check wrangler.jsonc bindings"
      );
      return null;
    }

    try {
      const value = await this.kv.get(key, "json");
      if (value) {
        console.log(`[KV Cache] Hit: ${key}`);
      } else {
        console.log(`[KV Cache] Miss: ${key}`);
      }
      return value as T | null;
    } catch (error) {
      console.error(`[KV Cache] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<boolean> {
    if (!this.kv) {
      console.warn("[KV Cache] KV namespace not available");
      return false;
    }

    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: ttl,
      });
      console.log(`[KV Cache] Set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error(`[KV Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.kv) {
      console.warn("[KV Cache] KV namespace not available");
      return false;
    }

    try {
      await this.kv.delete(key);
      console.log(`[KV Cache] Deleted: ${key}`);
      return true;
    } catch (error) {
      console.error(`[KV Cache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern (prefix)
   */
  async deleteByPrefix(prefix: string): Promise<number> {
    if (!this.kv) {
      console.warn("[KV Cache] KV namespace not available");
      return 0;
    }

    try {
      const keys = await this.kv.list({ prefix });
      let deletedCount = 0;

      for (const key of keys.keys) {
        await this.kv.delete(key.name);
        deletedCount++;
      }

      console.log(
        `[KV Cache] Deleted ${deletedCount} keys with prefix: ${prefix}`
      );
      return deletedCount;
    } catch (error) {
      console.error(
        `[KV Cache] Error deleting keys with prefix ${prefix}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch and cache
    console.log(`[KV Cache] Computing: ${key}`);
    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate user-related caches
   * Call this when user completes a quiz or updates their profile
   */
  async invalidateUserCache(userId: string): Promise<void> {
    console.log(`[KV Cache] Invalidating cache for user: ${userId}`);

    await Promise.all([
      this.delete(CACHE_KEYS.USER_STATS(userId)),
      this.deleteByPrefix(`user:${userId}:quiz-history:`),
    ]);
  }

  /**
   * Invalidate leaderboard caches
   * Call this when quiz results might affect rankings
   */
  async invalidateLeaderboards(): Promise<void> {
    console.log(`[KV Cache] Invalidating leaderboards`);

    await Promise.all([
      this.delete(CACHE_KEYS.LEADERBOARD("daily")),
      this.delete(CACHE_KEYS.LEADERBOARD("weekly")),
      this.delete(CACHE_KEYS.LEADERBOARD("monthly")),
      this.delete(CACHE_KEYS.LEADERBOARD("all-time")),
    ]);
  }

  /**
   * Invalidate specialty cache
   * Call this when specialties are added or updated
   */
  async invalidateSpecialties(): Promise<void> {
    console.log(`[KV Cache] Invalidating specialties`);
    await this.delete(CACHE_KEYS.SPECIALTIES);
  }

  /**
   * Get cache statistics (useful for debugging)
   */
  async getStats(): Promise<{ available: boolean; message: string }> {
    if (!this.kv) {
      return {
        available: false,
        message: "KV namespace not configured",
      };
    }

    return {
      available: true,
      message: "KV cache is operational",
    };
  }
}

/**
 * Singleton instance for use in API routes
 * Initialize with KV namespace from request context
 */
let kvCacheInstance: KVCacheService | null = null;

export function getKVCache(kvNamespace?: KVNamespace): KVCacheService {
  if (!kvCacheInstance || kvNamespace) {
    kvCacheInstance = new KVCacheService(kvNamespace);
  }
  return kvCacheInstance;
}

/**
 * Helper to create KV cache from Cloudflare context
 * Usage in API routes:
 *
 * export async function GET(request: NextRequest) {
 *   const cache = await createKVCacheFromContext();
 *   const data = await cache.getOrSet('key', fetchFn, 300);
 *   return NextResponse.json(data);
 * }
 */
export async function createKVCacheFromContext(): Promise<KVCacheService> {
  try {
    // Get Cloudflare context (works in production and with wrangler dev)
    const context = await getCloudflareContext();
    const kvNamespace = context.env.KV_DENTAL as KVNamespace | undefined;

    if (kvNamespace) {
      console.log("[KV Cache] Successfully connected to KV_DENTAL namespace");
      return new KVCacheService(kvNamespace);
    } else {
      console.warn("[KV Cache] KV_DENTAL not found in Cloudflare context");
      return new KVCacheService();
    }
  } catch (error) {
    console.warn("[KV Cache] Error getting Cloudflare context:", error);
    return new KVCacheService();
  }
}

export default KVCacheService;
