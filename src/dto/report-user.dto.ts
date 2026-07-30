import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReportUserDto {
  @IsInt()
  @IsNotEmpty()
  reportedId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
