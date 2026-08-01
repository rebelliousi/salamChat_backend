import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
