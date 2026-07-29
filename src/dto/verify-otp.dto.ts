import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;
}
