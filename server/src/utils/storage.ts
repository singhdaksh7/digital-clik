import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageFile {
  key: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IStorageProvider {
  uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageFile>;
  deleteFile(key: string): Promise<boolean>;
  replaceFile(oldKey: string, fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageFile>;
  getPublicUrl(key: string): string;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    this.baseUrl = process.env.APP_URL || 'http://localhost:5000';
  }

  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageFile> {
    const ext = getExtension(originalName, mimeType);
    const safeKey = `dc-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(this.uploadDir, safeKey);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      key: safeKey,
      url: `${this.baseUrl}/uploads/${safeKey}`,
      filename: safeKey,
      originalName,
      mimeType,
      size: fileBuffer.length
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const sanitizedKey = path.basename(key);
      const filePath = path.join(this.uploadDir, sanitizedKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async replaceFile(oldKey: string, fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageFile> {
    if (oldKey) {
      await this.deleteFile(oldKey);
    }
    return this.uploadFile(fileBuffer, originalName, mimeType);
  }

  getPublicUrl(key: string): string {
    const sanitizedKey = path.basename(key);
    return `${this.baseUrl}/uploads/${sanitizedKey}`;
  }
}

export class R2StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucket = process.env.R2_BUCKET || 'digitalclik-media';
    this.publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageFile> {
    const ext = getExtension(originalName, mimeType);
    const safeKey = `media/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: safeKey,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName
        }
      })
    );

    const url = `${this.publicUrl}/${safeKey}`;

    return {
      key: safeKey,
      url,
      filename: safeKey,
      originalName,
      mimeType,
      size: fileBuffer.length
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async replaceFile(oldKey: string, fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageFile> {
    if (oldKey) {
      await this.deleteFile(oldKey);
    }
    return this.uploadFile(fileBuffer, originalName, mimeType);
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}

function getExtension(originalName: string, mimeType: string): string {
  const ext = path.extname(originalName).toLowerCase();
  if (ext && ext !== '.') return ext;

  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'application/pdf': '.pdf'
  };

  return mimeMap[mimeType] || '.bin';
}

export function getStorageProvider(): IStorageProvider {
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  if (provider === 'r2' || provider === 's3') {
    return new R2StorageProvider();
  }
  return new LocalStorageProvider();
}

// -----------------------------------------------------------------------------
// UPLOAD SECURITY VALIDATION
// -----------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov', '.pdf'
]);

export function validateUpload(fileBuffer: Buffer, originalName: string, mimeType: string, maxSizeBytes = 15 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!fileBuffer || fileBuffer.length === 0) {
    return { valid: false, error: 'Empty file payload' };
  }

  if (fileBuffer.length > maxSizeBytes) {
    return { valid: false, error: 'File size exceeds maximum allowed limit (15MB)' };
  }

  // Path traversal check
  if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
    return { valid: false, error: 'Invalid file name. Path traversal characters detected.' };
  }

  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Disallowed file extension "${ext}". Only images, videos, and PDFs are permitted.` };
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false, error: `Disallowed MIME type "${mimeType}".` };
  }

  // Magic byte checks
  const magicValid = verifyMagicBytes(fileBuffer, mimeType);
  if (!magicValid) {
    return { valid: false, error: 'File magic bytes do not match declared MIME type. File content rejected.' };
  }

  return { valid: true };
}

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  const hex = buffer.subarray(0, 8).toString('hex').toUpperCase();

  switch (mimeType) {
    case 'image/jpeg':
      return hex.startsWith('FFD8FF');
    case 'image/png':
      return hex.startsWith('89504E47');
    case 'image/gif':
      return hex.startsWith('47494638');
    case 'image/webp':
      return hex.startsWith('52494646') && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    case 'application/pdf':
      return hex.startsWith('25504446'); // %PDF
    case 'image/svg+xml':
      {
        const snippet = buffer.subarray(0, 100).toString('utf8').toLowerCase();
        return snippet.includes('<svg') || snippet.includes('<?xml');
      }
    case 'video/mp4':
    case 'video/quicktime':
      {
        const ftyp = buffer.subarray(4, 8).toString('ascii');
        return ftyp === 'ftyp' || ftyp === 'moov' || ftyp === 'free' || hex.startsWith('000000');
      }
    case 'video/webm':
      return hex.startsWith('1A45DFA3');
    default:
      return true;
  }
}
