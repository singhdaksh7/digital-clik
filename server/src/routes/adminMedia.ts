import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { getStorageProvider, validateUpload } from '../utils/storage.js';
import { processImageVariants } from '../utils/imageOptimizer.js';
import multer from 'multer';
import path from 'path';

const router = Router();
const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Helper for audit logging
async function logAudit(userId: string | undefined, action: string, entityType: string, entityId?: string, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// -----------------------------------------------------------------------------
// MEDIA REFERENCE SCANNER
// -----------------------------------------------------------------------------
export async function findMediaReferences(url: string, filename?: string) {
  const references: Array<{ entityType: string; id: string; title: string; field: string; url?: string }> = [];

  const searchTarget = url;
  const filenameTarget = filename || path.basename(url);

  // 1. Pages (featuredImageUrl, ogImage, blocks)
  const pages = await prisma.page.findMany({
    where: {
      deletedAt: null,
      OR: [
        { featuredImageUrl: { contains: filenameTarget } },
        { ogImage: { contains: filenameTarget } },
        { blocks: { some: { content: { contains: filenameTarget } } } }
      ]
    },
    include: {
      blocks: {
        where: { content: { contains: filenameTarget } },
        select: { id: true, type: true }
      }
    }
  });

  for (const page of pages) {
    if (page.featuredImageUrl?.includes(filenameTarget)) {
      references.push({ entityType: 'Page', id: page.id, title: page.title, field: 'Featured Image', url: `/${page.slug}` });
    }
    if (page.ogImage?.includes(filenameTarget)) {
      references.push({ entityType: 'Page', id: page.id, title: page.title, field: 'OG Image', url: `/${page.slug}` });
    }
    for (const b of page.blocks) {
      references.push({ entityType: 'Page Block', id: b.id, title: `${page.title} (${b.type})`, field: 'Block Content', url: `/${page.slug}` });
    }
  }

  // 2. Blog Posts (coverImage, ogImage, content)
  const posts = await prisma.blogPost.findMany({
    where: {
      deletedAt: null,
      OR: [
        { coverImage: { contains: filenameTarget } },
        { ogImage: { contains: filenameTarget } },
        { content: { contains: filenameTarget } }
      ]
    },
    select: { id: true, title: true, slug: true, coverImage: true, ogImage: true, content: true }
  });

  for (const post of posts) {
    if (post.coverImage?.includes(filenameTarget)) {
      references.push({ entityType: 'Blog Post', id: post.id, title: post.title, field: 'Cover Image', url: `/blog/${post.slug}` });
    }
    if (post.ogImage?.includes(filenameTarget)) {
      references.push({ entityType: 'Blog Post', id: post.id, title: post.title, field: 'OG Image', url: `/blog/${post.slug}` });
    }
    if (post.content?.includes(filenameTarget)) {
      references.push({ entityType: 'Blog Post', id: post.id, title: post.title, field: 'Body Content', url: `/blog/${post.slug}` });
    }
  }

  // 3. Projects & Project Media
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      OR: [
        { image: { contains: filenameTarget } },
        { gallery: { some: { url: { contains: filenameTarget } } } }
      ]
    },
    include: {
      gallery: { where: { url: { contains: filenameTarget } } }
    }
  });

  for (const proj of projects) {
    if (proj.image?.includes(filenameTarget)) {
      references.push({ entityType: 'Project', id: proj.id, title: proj.title, field: 'Hero Image', url: `/work/${proj.slug}` });
    }
    for (const g of proj.gallery) {
      references.push({ entityType: 'Project Media', id: g.id, title: `${proj.title} Gallery`, field: 'Gallery Item', url: `/work/${proj.slug}` });
    }
  }

  // 4. Services
  const services = await prisma.service.findMany({
    where: {
      OR: [
        { heroMedia: { contains: filenameTarget } },
        { icon: { contains: filenameTarget } }
      ]
    },
    select: { id: true, title: true, slug: true, heroMedia: true, icon: true }
  });

  for (const serv of services) {
    if (serv.heroMedia?.includes(filenameTarget)) {
      references.push({ entityType: 'Service', id: serv.id, title: serv.title, field: 'Hero Media', url: `/services/${serv.slug}` });
    }
    if (serv.icon?.includes(filenameTarget)) {
      references.push({ entityType: 'Service', id: serv.id, title: serv.title, field: 'Icon', url: `/services/${serv.slug}` });
    }
  }

  // 5. Team Members
  const team = await prisma.teamMember.findMany({
    where: { photo: { contains: filenameTarget } },
    select: { id: true, name: true, photo: true }
  });
  for (const t of team) {
    references.push({ entityType: 'Team Member', id: t.id, title: t.name, field: 'Profile Photo' });
  }

  // 6. Global Blocks
  const globalBlocks = await prisma.globalBlock.findMany({
    where: { content: { contains: filenameTarget } },
    select: { id: true, name: true, type: true }
  });
  for (const gb of globalBlocks) {
    references.push({ entityType: 'Global Block', id: gb.id, title: gb.name, field: 'Block Content' });
  }

  return references;
}

// -----------------------------------------------------------------------------
// ENDPOINTS
// -----------------------------------------------------------------------------

// GET /api/admin/media - Complete Media Library list with filtering, search, sorting
router.get('/media', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      type,
      collection,
      missingAlt,
      largeFiles,
      trashed,
      sort = 'newest'
    } = req.query;

    const where: any = {
      isTrashed: trashed === 'true'
    };

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      where.OR = [
        { originalName: { contains: q, mode: 'insensitive' } },
        { filename: { contains: q, mode: 'insensitive' } },
        { altText: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { caption: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (collection && typeof collection === 'string' && collection !== 'ALL') {
      where.collection = collection;
    }

    if (type && typeof type === 'string' && type !== 'ALL') {
      if (type === 'IMAGE') where.mimeType = { startsWith: 'image/' };
      else if (type === 'VIDEO') where.mimeType = { startsWith: 'video/' };
      else if (type === 'DOCUMENT') where.mimeType = { in: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] };
    }

    if (missingAlt === 'true') {
      where.OR = [
        { altText: null },
        { altText: '' },
        { altText: 'DigitalClik Media Asset' }
      ];
    }

    if (largeFiles === 'true') {
      where.size = { gt: 2 * 1024 * 1024 }; // > 2MB
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'name') orderBy = { originalName: 'asc' };
    else if (sort === 'size') orderBy = { size: 'desc' };

    const items = await prisma.mediaItem.findMany({
      where,
      orderBy,
      take: 200
    });

    return res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/media/collections - List distinct collections with asset counts
router.get('/media/collections', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = await prisma.mediaItem.groupBy({
      by: ['collection'],
      _count: { id: true },
      where: { isTrashed: false }
    });

    const collections = raw.map(r => ({
      name: r.collection,
      count: r._count.id
    }));

    return res.json({ success: true, data: collections });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/media/:id/references - Find all occurrences where asset is referenced
router.get('/media/:id/references', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const media = await prisma.mediaItem.findUnique({ where: { id } });
    if (!media) {
      return res.status(404).json({ success: false, error: { message: 'Media item not found' } });
    }

    const references = await findMediaReferences(media.url, media.filename);

    return res.json({
      success: true,
      mediaId: id,
      usageCount: references.length,
      references
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/media/upload - Upload file, optimize & extract metadata
router.post('/media/upload', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), uploadMemory.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const { valid, error } = validateUpload(req.file.buffer, req.file.originalname, req.file.mimetype);
    if (!valid) {
      return res.status(400).json({ success: false, error: { message: error } });
    }

    const storage = getStorageProvider();
    const stored = await storage.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Process image variants (WebP + thumbnail) and dimensions
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    const { dimensions, thumbnailUrl, webpUrl } = await processImageVariants(
      req.file.buffer,
      stored.filename,
      uploadDir,
      req.file.mimetype
    );

    const { collection = 'General', altText, title, caption, description } = req.body;

    const media = await prisma.mediaItem.create({
      data: {
        filename: stored.filename,
        originalName: stored.originalName,
        mimeType: stored.mimeType,
        size: stored.size,
        url: stored.url,
        altText: altText?.trim() || req.file.originalname.replace(/\.[^/.]+$/, ''),
        title: title?.trim() || null,
        caption: caption?.trim() || null,
        description: description?.trim() || null,
        collection: collection || 'General',
        dimensions: dimensions || null,
        uploadedBy: req.user?.email || null,
        variantsJson: thumbnailUrl ? JSON.stringify({ thumbnail: thumbnailUrl, webp: webpUrl }) : null
      }
    });

    await logAudit(req.user?.userId, 'UPLOAD_MEDIA', 'MediaItem', media.id);
    return res.status(201).json({ success: true, data: media });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/media/:id - Update metadata
router.put('/media/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { altText, title, caption, description, collection } = req.body;

    const data: any = {};
    if (altText !== undefined) data.altText = altText?.trim() || null;
    if (title !== undefined) data.title = title?.trim() || null;
    if (caption !== undefined) data.caption = caption?.trim() || null;
    if (description !== undefined) data.description = description?.trim() || null;
    if (collection !== undefined) data.collection = collection?.trim() || 'General';

    const updated = await prisma.mediaItem.update({
      where: { id },
      data
    });

    await logAudit(req.user?.userId, 'UPDATE_MEDIA', 'MediaItem', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/media/:id - Safe delete with reference protection
router.delete('/media/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const force = req.query.force === 'true';
    const permanent = req.query.permanent === 'true';

    const media = await prisma.mediaItem.findUnique({ where: { id } });
    if (!media) {
      return res.status(404).json({ success: false, error: { message: 'Media item not found' } });
    }

    // Reference safety check
    const references = await findMediaReferences(media.url, media.filename);
    if (references.length > 0 && !force) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'REFERENCED_ASSET',
          message: `This file is currently used in ${references.length} place(s). Please replace references before deleting or request a Super Admin force delete.`,
          references
        }
      });
    }

    if (force && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only SUPER_ADMIN can force-delete referenced media assets.' }
      });
    }

    // Soft delete to Trash unless permanent requested
    if (!permanent && !media.isTrashed) {
      await prisma.mediaItem.update({
        where: { id },
        data: { isTrashed: true, trashedAt: new Date() }
      });
      await logAudit(req.user?.userId, 'TRASH_MEDIA', 'MediaItem', id);
      return res.json({ success: true, message: 'Asset moved to trash', id, trashed: true });
    }

    // Hard delete
    const storage = getStorageProvider();
    await storage.deleteFile(media.filename).catch(() => {});
    await prisma.mediaItem.delete({ where: { id } });

    await logAudit(req.user?.userId, 'DELETE_MEDIA_PERMANENT', 'MediaItem', id);
    return res.json({ success: true, message: 'Asset permanently removed', id });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/media/:id/restore - Restore from trash
router.post('/media/:id/restore', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.mediaItem.update({
      where: { id },
      data: { isTrashed: false, trashedAt: null }
    });
    await logAudit(req.user?.userId, 'RESTORE_MEDIA', 'MediaItem', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/media/replace - Replace old media URL everywhere
router.post('/media/replace', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldUrl, newUrl } = req.body;
    if (!oldUrl || !newUrl) {
      return res.status(400).json({ success: false, error: { message: 'Both oldUrl and newUrl are required' } });
    }

    let totalReplacements = 0;

    // 1. Pages featured / og image
    const pagesUpdated = await prisma.page.updateMany({
      where: { featuredImageUrl: oldUrl },
      data: { featuredImageUrl: newUrl }
    });
    totalReplacements += pagesUpdated.count;

    const pagesOgUpdated = await prisma.page.updateMany({
      where: { ogImage: oldUrl },
      data: { ogImage: newUrl }
    });
    totalReplacements += pagesOgUpdated.count;

    // 2. Page Blocks (content replace)
    const blocks = await prisma.pageBlock.findMany({
      where: { content: { contains: oldUrl } }
    });
    for (const b of blocks) {
      const updatedContent = b.content.replaceAll(oldUrl, newUrl);
      await prisma.pageBlock.update({
        where: { id: b.id },
        data: { content: updatedContent }
      });
      totalReplacements++;
    }

    // 3. Blog Posts
    const blogCovers = await prisma.blogPost.updateMany({
      where: { coverImage: oldUrl },
      data: { coverImage: newUrl }
    });
    totalReplacements += blogCovers.count;

    // 4. Projects
    const projectImages = await prisma.project.updateMany({
      where: { image: oldUrl },
      data: { image: newUrl }
    });
    totalReplacements += projectImages.count;

    // 5. Global Blocks
    const gblocks = await prisma.globalBlock.findMany({
      where: { content: { contains: oldUrl } }
    });
    for (const gb of gblocks) {
      await prisma.globalBlock.update({
        where: { id: gb.id },
        data: { content: gb.content.replaceAll(oldUrl, newUrl) }
      });
      totalReplacements++;
    }

    await logAudit(req.user?.userId, 'REPLACE_MEDIA_EVERYWHERE', 'MediaItem', undefined, { oldUrl, newUrl, totalReplacements });
    return res.json({ success: true, totalReplacements, oldUrl, newUrl });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/media/bulk - Perform bulk actions (delete, move, alt_prefix)
router.post('/media/bulk', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, mediaIds, collection, prefix } = req.body;
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'mediaIds array is required' } });
    }

    if (action === 'delete') {
      const updated = await prisma.mediaItem.updateMany({
        where: { id: { in: mediaIds } },
        data: { isTrashed: true, trashedAt: new Date() }
      });
      await logAudit(req.user?.userId, 'BULK_TRASH_MEDIA', 'MediaItem', undefined, { count: updated.count });
      return res.json({ success: true, count: updated.count });
    }

    if (action === 'move_collection') {
      if (!collection) return res.status(400).json({ success: false, error: { message: 'Target collection name is required' } });
      const updated = await prisma.mediaItem.updateMany({
        where: { id: { in: mediaIds } },
        data: { collection }
      });
      await logAudit(req.user?.userId, 'BULK_MOVE_COLLECTION', 'MediaItem', undefined, { collection, count: updated.count });
      return res.json({ success: true, count: updated.count, collection });
    }

    if (action === 'alt_prefix') {
      if (!prefix) return res.status(400).json({ success: false, error: { message: 'Prefix string is required' } });
      const items = await prisma.mediaItem.findMany({ where: { id: { in: mediaIds } } });
      for (const item of items) {
        const newAlt = `${prefix.trim()} ${item.altText || item.originalName}`.trim();
        await prisma.mediaItem.update({
          where: { id: item.id },
          data: { altText: newAlt }
        });
      }
      return res.json({ success: true, count: items.length });
    }

    return res.status(400).json({ success: false, error: { message: `Unsupported action: ${action}` } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
