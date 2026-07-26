import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: 'localhost',
      port: 6380,
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async setOTP(phoneNumber: string, code: string) {
    await this.client.set(`otp:${phoneNumber}`, code, 'EX', 120);
  }

  async getOTP(phoneNumber: string): Promise<string | null> {
    return await this.client.get(`otp:${phoneNumber}`);
  }

  async deleteOTP(phoneNumber: string) {
    await this.client.del(`otp:${phoneNumber}`);
  }

  async saveRefreshToken(userId: string, token: string) {
    const thirtyDays = 30 * 24 * 60 * 60;
    await this.client.set(`refresh:${userId}`, token, 'EX', thirtyDays);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return await this.client.get(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string) {
    await this.client.del(`refresh:${userId}`);
  }
}
