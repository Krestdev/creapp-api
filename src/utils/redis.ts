import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

/**
 * Cash Service
 */

type CacheValue<T> = T | null;

export class CacheService {
  /**
   * Get cached value
   */
  static async get<T>(key: string): Promise<CacheValue<T>> {
    try {
      if (!redisClient.isOpen) return null;

      const data = await redisClient.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`❌ Cache GET error [${key}]`, error);
      return null;
    }
  }

  /**
   * Set cache value
   */
  static async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      if (!redisClient.isOpen) return;

      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`❌ Cache SET error [${key}]`, error);
    }
  }

  /**
   * Delete cache key
   */
  static async del(key: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.del(key);
    } catch (error) {
      console.error(`❌ Cache DEL error [${key}]`, error);
    }
  }

  /**
   * Delete cache by pattern (use carefully)
   */
  static async delByPattern(pattern: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`❌ Cache DEL pattern error [${pattern}]`, error);
    }
  }
}
