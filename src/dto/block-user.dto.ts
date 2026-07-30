import { IsInt, IsNotEmpty } from 'class-validator';

export class BlockUserDto {
  @IsInt()
  @IsNotEmpty()
  blockedId: number;
}
