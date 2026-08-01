import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('refresh')
  refresh(@Body('userId') userId: number, @Body('refreshToken') rt: string) {
    return this.authService.refreshTokens(userId, rt);
  }
}
