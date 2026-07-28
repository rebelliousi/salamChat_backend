import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Token'ı Header'dan al
      ignoreExpiration: false, // Süresi bittiyse reddet
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key', // .env ile aynı olmalı
    });
  }

  async validate(payload: any) {
    // Token geçerliyse, içindeki userId'yi döndürür
    // Bu veri 'req.user' içine yerleşir.
    return { userId: payload.userId };
  }
}