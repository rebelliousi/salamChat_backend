import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6380,
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async setOTP(email: string, code: string) {
    await this.client.set(`otp:${email}`, code, 'EX', 120);
  }

  async getOTP(email: string): Promise<string | null> {
    return await this.client.get(`otp:${email}`);
  }

  async deleteOTP(email: string) {
    await this.client.del(`otp:${email}`);
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
