import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service],
  exports: [S3Service], // Diğer modüllerin (UsersModule gibi) erişebilmesi için dışa aktarıyoruz
})
export class S3Module {}
