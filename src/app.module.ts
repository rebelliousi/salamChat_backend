import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { ChatModule } from './chat/chat.module';
import { MailModule } from './mail/mail.module';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RedisModule,
    ChatModule,
    MailModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
