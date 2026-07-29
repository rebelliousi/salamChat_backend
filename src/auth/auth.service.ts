import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
  ) {}

  async sendOtp(phoneNumber: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await this.redis.setOTP(phoneNumber, code);
    console.log(`[OTP] ${phoneNumber} for code : ${code}`);
    return { message: 'OTP was sent' };
  }

  async getTokens(userId: number) {
    const [at, rt] = await Promise.all([
      this.jwt.signAsync({ userId }, { expiresIn: '1h' }),
      this.jwt.signAsync({ userId }, { expiresIn: '30d' }),
    ]);

    await this.redis.saveRefreshToken(userId.toString(), rt);

    return { accessToken: at, refreshToken: rt };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phoneNumber, otpCode, ...userData } = dto;
    const savedOtp = await this.redis.getOTP(phoneNumber);

    if (!savedOtp || savedOtp !== otpCode) {
      throw new UnauthorizedException('code is wrong');
    }

    let user = await this.prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phoneNumber, ...userData, isVerified: true },
      });
    }

    await this.redis.deleteOTP(phoneNumber);
    const tokens = await this.getTokens(user.id);
    return { user, ...tokens };
  }

  async refreshTokens(userId: number, rt: string) {
    const savedRt = await this.redis.getRefreshToken(userId.toString());
    if (!savedRt || savedRt !== rt) {
      throw new UnauthorizedException('Refresh is expired!');
    }

    return await this.getTokens(userId);
  }
}
