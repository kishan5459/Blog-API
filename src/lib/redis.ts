import Redis from 'ioredis';

export class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('❌ Missing REDIS_URL in environment variables');
    }

    this.client = new Redis(redisUrl, {
      tls: redisUrl.startsWith('rediss://') ? {} : undefined, // Enable TLS if using "rediss://"
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        console.warn(`⚠️ Redis retry attempt #${times}, retrying in ${delay}ms`);
        return delay;
      },
    });

    this.client.on('connect', () => console.log('✅ Connected to Upstash Redis'));
    this.client.on('error', (err) => console.error('❌ Redis error:', err));
    this.client.on('reconnecting', () => console.log('♻️ Reconnecting to Redis...'));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('🛑 Redis connection closed');
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    if (ttlSeconds) return this.client.set(key, value, 'EX', ttlSeconds);
    return this.client.set(key, value);
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<'OK' | null> {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (err) {
      console.error(`Failed to parse JSON for key "${key}":`, err);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  get raw(): Redis {
    return this.client;
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
}

// Export pre-configured singleton
const redis = RedisService.getInstance();
export default redis;