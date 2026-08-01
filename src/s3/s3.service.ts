import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
    const port = this.configService.getOrThrow<string>('MINIO_PORT');
    const accessKey = this.configService.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.getOrThrow<string>('MINIO_SECRET_KEY');

    const s3Config: S3ClientConfig = {
      endpoint: `http://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    };

    this.s3Client = new S3Client(s3Config);
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string,
  ): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const endpoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
      const port = this.configService.getOrThrow<string>('MINIO_PORT');

      return `http://${endpoint}:${port}/${bucketName}/${fileName}`;
    } catch (error: unknown) {
      console.error('MinIO Upload Error:', error);
      throw new Error('Something went wrong while loading file.');
    }
  }
}
