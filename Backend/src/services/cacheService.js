const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.warn('⚠️ Redis connection refused. Continuing without cache.');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Redis Connected');
    } catch (error) {
      console.warn('⚠️ Redis not available. Cache disabled.');
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async set(key, value, ttl = 300) { // Default 5 minutes
    if (!this.isConnected) return;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      // Silent fail
    }
  }

  async del(key) {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      // Silent fail
    }
  }

  async delPattern(pattern) {
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      // Silent fail
    }
  }

  generateKey(prefix, params) {
    return `${prefix}:${JSON.stringify(params)}`;
  }
}

module.exports = new CacheService();