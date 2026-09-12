import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join, resolve } from 'path';

@Injectable()
export class StorageService {
  private readonly driver = process.env.STORAGE_DRIVER || 'local';
  private readonly localDir = resolve(process.env.LOCAL_UPLOAD_DIR || 'uploads');
  private readonly s3 = this.driver === 's3' ? new S3Client({ region: process.env.S3_REGION, endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', credentials: process.env.S3_ACCESS_KEY_ID ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' } : undefined }) : undefined;

  async save(file: { originalname:string; mimetype:string; buffer:Buffer }) {
    const safeName = basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${new Date().toISOString().slice(0, 10)}/${randomBytes(16).toString('hex')}${extname(safeName)}`;
    if (this.driver === 's3') {
      if (!this.s3 || !process.env.S3_BUCKET) throw new InternalServerErrorException('Falta configurar el almacenamiento S3');
      await this.s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: file.buffer, ContentType: file.mimetype, ContentDisposition: `attachment; filename="${safeName}"` }));
      return `s3:${key}`;
    }
    await mkdir(this.localDir, { recursive: true });
    const path = join(this.localDir, key.replace('/', '_'));
    await writeFile(path, file.buffer);
    return path;
  }

  async download(path:string) {
    if (!path.startsWith('s3:')) return { localPath: resolve(path) };
    if (!this.s3 || !process.env.S3_BUCKET) throw new InternalServerErrorException('Falta configurar el almacenamiento S3');
    const url = await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: path.slice(3) }), { expiresIn: 300 });
    return { url };
  }
}
