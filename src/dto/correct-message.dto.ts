import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CorrectMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  correction: string;
}
