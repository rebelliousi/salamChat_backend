import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  async sendOtp(email: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    await this.redis.setOTP(email, code);

    await this.mailService.sendOtpEmail(email, code);

    return { message: 'OTP was sent to your email' };
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
    const { email, otpCode, ...userData } = dto;

    const savedOtp = await this.redis.getOTP(email);

    if (!savedOtp || savedOtp !== otpCode) {
      throw new UnauthorizedException('Code is wrong or expired');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      if (
        !userData.name ||
        !userData.nativeLanguage ||
        !userData.targetLanguage ||
        !userData.level
      ) {
        throw new BadRequestException(
          'Profile information is required for new users',
        );
      }

      user = await this.prisma.user.create({
        data: {
          email,
          name: userData.name,
          nativeLanguage: userData.nativeLanguage,
          targetLanguage: userData.targetLanguage,
          level: userData.level,
          bio: userData.bio,
          age: userData.age,
          gender: userData.gender,
          isVerified: true,
        },
      });
    }

    await this.redis.deleteOTP(email);

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
