export class VerifyOtpDto {
  phoneNumber: string;
  otpCode: string;
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: string;
  bio?: string;
  age?: number;
  gender?: string;
}
