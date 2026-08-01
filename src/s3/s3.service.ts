import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: `http://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, bucketName: string) {
    const fileName = `${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer, // Dosyayı RAM'den alıyoruz (Memory Storage)
        ContentType: file.mimetype,
      }),
    );

    return `http://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${bucketName}/${fileName}`;
  }
}
