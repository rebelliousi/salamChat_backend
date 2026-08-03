import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly endpoint: string;
  private readonly port: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_PORT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;

    if (!endpoint || !port || !accessKey || !secretKey) {
      throw new Error('MinIO environment variables are not set');
    }

    this.endpoint = endpoint;
    this.port = port;

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

      return `http://${this.endpoint}:${this.port}/${bucketName}/${fileName}`;
    } catch (error: unknown) {
      console.error('MinIO Upload Error:', error);
      throw new Error('Something went wrong while loading file.');
    }
  }
}
