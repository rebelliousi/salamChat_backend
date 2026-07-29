import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class MatchFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100)
  maxAge?: number;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsIn(['native', 'learning'])
  languageFilterType?: 'native' | 'learning';

  @IsOptional()
  @IsString()
  level?: string;
}
