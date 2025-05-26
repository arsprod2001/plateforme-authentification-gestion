import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
      }
    });

    this.client.on('error', (err) => console.error('Redis Error:', err));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async set(key, value, ttl = 3600) {
    await this.client.set(key, value, { EX: ttl });
  }

  async get(key) {
    return await this.client.get(key);
  }

  async del(key) {
    return await this.client.del(key);
  }

  async exists(key) {
    return (await this.client.exists(key)) === 1;
  }

  async incr(key) {
    return await this.client.incr(key);
  }

  async expire(key, seconds) {
    return await this.client.expire(key, seconds);
  }
}

export default new RedisClient();
