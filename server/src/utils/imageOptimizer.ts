import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export interface ImageOptimizationResult {
  dimensions?: string;
  thumbnailUrl?: string;
  webpUrl?: string;
}

export async function processImageVariants(
  fileBuffer: Buffer,
  filename: string,
  uploadDir: string,
  mimeType: string
): Promise<ImageOptimizationResult> {
  // Only process standard raster images
  if (!mimeType.startsWith('image/') || mimeType.includes('svg')) {
    return {};
  }

  try {
    const metadata = await sharp(fileBuffer).metadata();
    const dimensions = metadata.width && metadata.height ? `${metadata.width}x${metadata.height}` : undefined;

    const baseName = path.parse(filename).name;
    const thumbFilename = `thumb-${baseName}.webp`;
    const webpFilename = `${baseName}.webp`;

    const thumbPath = path.join(uploadDir, thumbFilename);
    const webpPath = path.join(uploadDir, webpFilename);

    // Generate 320px WebP thumbnail
    await sharp(fileBuffer)
      .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // Generate optimized full-size WebP
    await sharp(fileBuffer)
      .webp({ quality: 85 })
      .toFile(webpPath);

    return {
      dimensions,
      thumbnailUrl: `/uploads/${thumbFilename}`,
      webpUrl: `/uploads/${webpFilename}`
    };
  } catch (err: any) {
    console.warn('[Image Optimizer Warning] Could not process variants:', err.message);
    return {};
  }
}

