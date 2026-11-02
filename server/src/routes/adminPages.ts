import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizeRichText, sanitizeCustomHtml, slugify } from '../utils/sanitizer.js';
import { refreshRedirectCache } from '../middleware/redirects.js';
import { dispatchWebhook } from '../utils/webhook.js';
import crypto from 'crypto';

const router = Router();

// Reserved system slugs that cannot be claimed by custom dynamic pages
export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'uploads', 'assets', 'preview',
  'services', 'work', 'case-studies', 'industries', 'process', 'about', 'blog', 'contact',
  'sitemap', 'robots', 'health', 'login', 'signup'
]);

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

// Helper to snapshot a page for revisions
async function createPageRevision(pageId: string, author?: string, note?: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!page) return;

    // Cap revisions to last 40
    const count = await prisma.pageRevision.count({ where: { pageId } });
    if (count >= 40) {
      const oldest = await prisma.pageRevision.findMany({
        where: { pageId },
        orderBy: { createdAt: 'asc' },
        take: count - 39
      });
      if (oldest.length > 0) {
        await prisma.pageRevision.deleteMany({
          where: { id: { in: oldest.map(r => r.id) } }
        });
      }
    }

    await prisma.pageRevision.create({
      data: {
        pageId,
        snapshot: JSON.stringify(page),
        author: author || 'system',
        note: note || 'Page update snapshot'
      }
    });
  } catch (err) {
    console.error('Failed to snapshot page revision:', err);
  }
}

// -----------------------------------------------------------------------------
// 1. PAGE CRUD
// -----------------------------------------------------------------------------

// GET /api/admin/pages - List all pages with filtering
router.get('/pages', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type, search } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (type && typeof type === 'string' && type !== 'ALL') {
      where.pageType = type;
    }
    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
        { excerpt: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { blocks: true, revisions: true }
        }
      }
    });

    return res.json({ success: true, data: pages });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/pages/:id - Get single page with ordered blocks & revisions
router.get('/pages/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' }
        },
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages - Create new page
router.post('/pages', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      slug: rawSlug,
      pageType = 'STANDARD',
      template = 'DEFAULT',
      excerpt,
      featuredImageUrl,
      featuredImageId,
      metaTitle,
      metaDescription,
      canonicalUrl,
      isIndexable = true,
      noFollow = false,
      noIndex = false,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      schemaType = 'WebPage',
      breadcrumbLabel
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: { message: 'Page title is required' } });
    }

    let slug = slugify(rawSlug || title);
    if (!slug) {
      slug = `page-${Date.now()}`;
    }

    if (RESERVED_SLUGS.has(slug)) {
      return res.status(400).json({ success: false, error: { message: `"${slug}" is a reserved system URL and cannot be used.` } });
    }

    // Check collision
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newPage = await prisma.page.create({
      data: {
        title,
        slug,
        pageType,
        template,
        excerpt,
        featuredImageUrl,
        featuredImageId,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || '',
        canonicalUrl,
        isIndexable: Boolean(isIndexable),
        noFollow: Boolean(noFollow),
        noIndex: Boolean(noIndex),
        ogTitle: ogTitle || title,
        ogDescription: ogDescription || metaDescription || '',
        ogImage: ogImage || featuredImageUrl || null,
        twitterTitle: twitterTitle || ogTitle || title,
        twitterDescription: twitterDescription || ogDescription || metaDescription || '',
        twitterImage: twitterImage || ogImage || featuredImageUrl || null,
        schemaType: schemaType || 'WebPage',
        breadcrumbLabel: breadcrumbLabel || title,
        status: 'DRAFT',
        createdBy: req.user?.email || 'admin',
        updatedBy: req.user?.email || 'admin'
      }
    });

    // Create default hero block
    await prisma.pageBlock.create({
      data: {
        pageId: newPage.id,
        type: 'HERO',
        variant: 'centered',
        sortOrder: 0,
        settings: JSON.stringify({
          width: 'Standard',
          padding: 'Large',
          background: 'Soft Gray',
          alignment: 'Center'
        }),
        content: JSON.stringify({
          eyebrow: 'Welcome to',
          title: title,
          subtitle: 'Add a clear, grounded description here.',
          ctaText: 'Talk to Us',
          ctaLink: '/contact',
          secondaryCtaText: 'Explore',
          secondaryCtaLink: '#explore'
        })
      }
    });

    await createPageRevision(newPage.id, req.user?.email, 'Initial page creation');
    await logAudit(req.user?.userId, 'CREATE_PAGE', 'Page', newPage.id, { slug, title });

    const created = await prisma.page.findUnique({
      where: { id: newPage.id },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } }
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/pages/:id - Update page metadata, SEO and slug
router.put('/pages/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    const {
      title,
      slug: rawSlug,
      pageType,
      template,
      excerpt,
      featuredImageUrl,
      featuredImageId,
      status,
      metaTitle,
      metaDescription,
      canonicalUrl,
      isIndexable,
      noFollow,
      noIndex,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      schemaType,
      breadcrumbLabel,
      createRedirectOnSlugChange = true
    } = req.body;

    let targetSlug = existing.slug;
    if (rawSlug && rawSlug !== existing.slug) {
      const cleaned = slugify(rawSlug);
      if (RESERVED_SLUGS.has(cleaned)) {
        return res.status(400).json({ success: false, error: { message: `"${cleaned}" is a reserved system URL.` } });
      }

      // Check collision
      const collision = await prisma.page.findFirst({
        where: { slug: cleaned, NOT: { id } }
      });
      if (collision) {
        return res.status(400).json({ success: false, error: { message: `Slug "${cleaned}" is already taken by another page.` } });
      }

      targetSlug = cleaned;

      // Handle 301 redirect from old slug to new slug if published
      if (createRedirectOnSlugChange && existing.slug && existing.slug !== targetSlug) {
        const oldPath = `/${existing.slug}`;
        const newPath = `/${targetSlug}`;

        await prisma.redirect.upsert({
          where: { sourcePath: oldPath },
          update: { targetPath: newPath, statusCode: 301, isActive: true },
          create: { sourcePath: oldPath, targetPath: newPath, statusCode: 301, isActive: true }
        });
        await refreshRedirectCache();
      }
    }

    let publishedAt = existing.publishedAt;
    if (status === 'PUBLISHED' && !publishedAt) {
      publishedAt = new Date();
    }

    const updated = await prisma.page.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: targetSlug,
        pageType: pageType !== undefined ? pageType : existing.pageType,
        template: template !== undefined ? template : existing.template,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl : existing.featuredImageUrl,
        featuredImageId: featuredImageId !== undefined ? featuredImageId : existing.featuredImageId,
        status: status !== undefined ? status : existing.status,
        publishedAt,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : existing.canonicalUrl,
        isIndexable: isIndexable !== undefined ? Boolean(isIndexable) : existing.isIndexable,
        noFollow: noFollow !== undefined ? Boolean(noFollow) : existing.noFollow,
        noIndex: noIndex !== undefined ? Boolean(noIndex) : existing.noIndex,
        ogTitle: ogTitle !== undefined ? ogTitle : existing.ogTitle,
        ogDescription: ogDescription !== undefined ? ogDescription : existing.ogDescription,
        ogImage: ogImage !== undefined ? ogImage : existing.ogImage,
        twitterTitle: twitterTitle !== undefined ? twitterTitle : existing.twitterTitle,
        twitterDescription: twitterDescription !== undefined ? twitterDescription : existing.twitterDescription,
        twitterImage: twitterImage !== undefined ? twitterImage : existing.twitterImage,
        schemaType: schemaType !== undefined ? schemaType : existing.schemaType,
        breadcrumbLabel: breadcrumbLabel !== undefined ? breadcrumbLabel : existing.breadcrumbLabel,
        updatedBy: req.user?.email || 'admin'
      },
      include: {
        blocks: { orderBy: { sortOrder: 'asc' } }
      }
    });

    await createPageRevision(id, req.user?.email, 'Page settings updated');
    await logAudit(req.user?.userId, 'UPDATE_PAGE', 'Page', id, { slug: targetSlug });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages/:id/publish - One-click publish / unpublish
router.post('/pages/:id/publish', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status = 'PUBLISHED' } = req.body;

    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    const updated = await prisma.page.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? (page.publishedAt || new Date()) : page.publishedAt,
        updatedBy: req.user?.email
      }
    });

    await createPageRevision(id, req.user?.email, `Status changed to ${status}`);
    await logAudit(req.user?.userId, status === 'PUBLISHED' ? 'PUBLISH_PAGE' : 'UNPUBLISH_PAGE', 'Page', id);

    if (status === 'PUBLISHED') {
      dispatchWebhook('PAGE_PUBLISHED', {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        publishedAt: updated.publishedAt
      }).catch(e => console.error('Webhook publish error:', e));
    }

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages/:id/duplicate - Clone page and all its blocks
router.post('/pages/:id/duplicate', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const source = await prisma.page.findUnique({
      where: { id },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!source) {
      return res.status(404).json({ success: false, error: { message: 'Source page not found' } });
    }

    const copySlug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
    const copyTitle = `${source.title} (Copy)`;

    const newPage = await prisma.page.create({
      data: {
        title: copyTitle,
        slug: copySlug,
        pageType: source.pageType,
        template: source.template,
        excerpt: source.excerpt,
        featuredImageUrl: source.featuredImageUrl,
        featuredImageId: source.featuredImageId,
        status: 'DRAFT',
        metaTitle: source.metaTitle ? `${source.metaTitle} (Copy)` : copyTitle,
        metaDescription: source.metaDescription,
        canonicalUrl: source.canonicalUrl,
        isIndexable: source.isIndexable,
        noFollow: source.noFollow,
        noIndex: source.noIndex,
        ogTitle: source.ogTitle,
        ogDescription: source.ogDescription,
        ogImage: source.ogImage,
        twitterTitle: source.twitterTitle,
        twitterDescription: source.twitterDescription,
        twitterImage: source.twitterImage,
        schemaType: source.schemaType,
        breadcrumbLabel: copyTitle,
        createdBy: req.user?.email,
        updatedBy: req.user?.email
      }
    });

    // Duplicate blocks
    if (source.blocks.length > 0) {
      await prisma.pageBlock.createMany({
        data: source.blocks.map(b => ({
          pageId: newPage.id,
          type: b.type,
          variant: b.variant,
          sortOrder: b.sortOrder,
          isVisible: b.isVisible,
          settings: b.settings,
          content: b.content
        }))
      });
    }

    await createPageRevision(newPage.id, req.user?.email, `Duplicated from ${source.title}`);
    await logAudit(req.user?.userId, 'DUPLICATE_PAGE', 'Page', newPage.id, { sourceId: id });

    const duplicated = await prisma.page.findUnique({
      where: { id: newPage.id },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } }
    });

    return res.status(201).json({ success: true, data: duplicated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/pages/:id - Delete page, blocks and revisions (cascade)
router.delete('/pages/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    await prisma.page.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_PAGE', 'Page', id, { title: page.title, slug: page.slug });

    return res.json({ success: true, message: 'Page deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 2. BLOCK MANAGEMENT & ORDERING
// -----------------------------------------------------------------------------

// Helper to sanitize block content based on block type & user role
function sanitizeBlockData(type: string, content: any, isSuperAdmin: boolean): any {
  if (!content || typeof content !== 'object') return {};

  const clean = { ...content };

  // Sanitize rich text fields
  if (typeof clean.bodyHtml === 'string') {
    clean.bodyHtml = sanitizeRichText(clean.bodyHtml);
  }
  if (typeof clean.description === 'string') {
    clean.description = sanitizeRichText(clean.description);
  }

  // Custom HTML blocks strictly for Super Admin
  if (type === 'CUSTOM_CONTENT') {
    if (typeof clean.html === 'string') {
      clean.html = isSuperAdmin ? sanitizeCustomHtml(clean.html) : sanitizeRichText(clean.html);
    }
  }

  // Sanitize nested cards/items if any
  if (Array.isArray(clean.cards)) {
    clean.cards = clean.cards.map((c: any) => ({
      ...c,
      description: typeof c.description === 'string' ? sanitizeRichText(c.description) : c.description
    }));
  }
  if (Array.isArray(clean.items)) {
    clean.items = clean.items.map((item: any) => ({
      ...item,
      description: typeof item.description === 'string' ? sanitizeRichText(item.description) : item.description,
      answer: typeof item.answer === 'string' ? sanitizeRichText(item.answer) : item.answer
    }));
  }

  return clean;
}

// POST /api/admin/pages/:pageId/blocks - Add a block
router.post('/pages/:pageId/blocks', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pageId = req.params.pageId as string;
    const { type, variant = 'default', settings = {}, content = {}, sortOrder } = req.body;

    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    // Determine sort order
    let order = sortOrder;
    if (typeof order !== 'number') {
      const lastBlock = await prisma.pageBlock.findFirst({
        where: { pageId },
        orderBy: { sortOrder: 'desc' }
      });
      order = lastBlock ? lastBlock.sortOrder + 1 : 0;
    }

    const isSuper = req.user?.role === 'SUPER_ADMIN';
    const cleanContent = sanitizeBlockData(type, content, isSuper);

    const block = await prisma.pageBlock.create({
      data: {
        pageId,
        type,
        variant,
        sortOrder: order,
        settings: typeof settings === 'string' ? settings : JSON.stringify(settings),
        content: JSON.stringify(cleanContent)
      }
    });

    await prisma.page.update({
      where: { id: pageId },
      data: { updatedBy: req.user?.email }
    });

    await createPageRevision(pageId, req.user?.email, `Added block: ${type}`);
    return res.status(201).json({ success: true, data: block });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/blocks/:id - Update single block
router.put('/blocks/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { variant, isVisible, settings, content, sortOrder } = req.body;

    const block = await prisma.pageBlock.findUnique({ where: { id } });
    if (!block) {
      return res.status(404).json({ success: false, error: { message: 'Block not found' } });
    }

    const isSuper = req.user?.role === 'SUPER_ADMIN';

    let contentStr = block.content;
    if (content !== undefined) {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      const cleaned = sanitizeBlockData(block.type, parsed, isSuper);
      contentStr = JSON.stringify(cleaned);
    }

    let settingsStr = block.settings;
    if (settings !== undefined) {
      settingsStr = typeof settings === 'string' ? settings : JSON.stringify(settings);
    }

    const updated = await prisma.pageBlock.update({
      where: { id },
      data: {
        variant: variant !== undefined ? variant : block.variant,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : block.isVisible,
        settings: settingsStr,
        content: contentStr,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : block.sortOrder
      }
    });

    await prisma.page.update({
      where: { id: block.pageId },
      data: { updatedBy: req.user?.email }
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages/:pageId/reorder - Reorder blocks atomically in a transaction
router.post('/pages/:pageId/reorder', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pageId = req.params.pageId as string;
    const { blockIds } = req.body; // Array of block IDs in new order

    if (!Array.isArray(blockIds)) {
      return res.status(400).json({ success: false, error: { message: 'blockIds array is required' } });
    }

    // Execute in transaction
    await prisma.$transaction(
      blockIds.map((id: string, index: number) =>
        prisma.pageBlock.update({
          where: { id, pageId },
          data: { sortOrder: index }
        })
      )
    );

    await prisma.page.update({
      where: { id: pageId },
      data: { updatedBy: req.user?.email }
    });

    const orderedBlocks = await prisma.pageBlock.findMany({
      where: { pageId },
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({ success: true, data: orderedBlocks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/blocks/:id/duplicate - Duplicate single block
router.post('/blocks/:id/duplicate', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const block = await prisma.pageBlock.findUnique({ where: { id } });
    if (!block) {
      return res.status(404).json({ success: false, error: { message: 'Block not found' } });
    }

    // Shift all subsequent blocks order by 1
    await prisma.pageBlock.updateMany({
      where: {
        pageId: block.pageId,
        sortOrder: { gt: block.sortOrder }
      },
      data: {
        sortOrder: { increment: 1 }
      }
    });

    const newBlock = await prisma.pageBlock.create({
      data: {
        pageId: block.pageId,
        type: block.type,
        variant: block.variant,
        sortOrder: block.sortOrder + 1,
        isVisible: block.isVisible,
        settings: block.settings,
        content: block.content
      }
    });

    await prisma.page.update({
      where: { id: block.pageId },
      data: { updatedBy: req.user?.email }
    });

    await createPageRevision(block.pageId, req.user?.email, `Duplicated block: ${block.type}`);
    return res.status(201).json({ success: true, data: newBlock });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/blocks/:id - Delete block
router.delete('/blocks/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const block = await prisma.pageBlock.findUnique({ where: { id } });
    if (!block) {
      return res.status(404).json({ success: false, error: { message: 'Block not found' } });
    }

    await prisma.pageBlock.delete({ where: { id } });

    await prisma.page.update({
      where: { id: block.pageId },
      data: { updatedBy: req.user?.email }
    });

    await createPageRevision(block.pageId, req.user?.email, `Deleted block: ${block.type}`);
    return res.json({ success: true, message: 'Block deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 3. REVISION HISTORY & RESTORE
// -----------------------------------------------------------------------------

// GET /api/admin/pages/:pageId/revisions - List snapshots
router.get('/pages/:pageId/revisions', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pageId = req.params.pageId as string;
    const revisions = await prisma.pageRevision.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        pageId: true,
        author: true,
        note: true,
        createdAt: true
      }
    });

    return res.json({ success: true, data: revisions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages/:pageId/revisions/:revisionId/restore - Restore snapshot
router.post('/pages/:pageId/revisions/:revisionId/restore', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pageId = req.params.pageId as string;
    const revisionId = req.params.revisionId as string;
    const revision = await prisma.pageRevision.findUnique({ where: { id: revisionId } });
    if (!revision || revision.pageId !== pageId) {
      return res.status(404).json({ success: false, error: { message: 'Revision not found' } });
    }

    const snapshot = JSON.parse(revision.snapshot);

    // Snapshot backup of current state first
    await createPageRevision(pageId, req.user?.email, 'Pre-restore backup snapshot');

    // Restore page fields
    await prisma.page.update({
      where: { id: pageId },
      data: {
        title: snapshot.title,
        template: snapshot.template,
        excerpt: snapshot.excerpt,
        featuredImageUrl: snapshot.featuredImageUrl,
        featuredImageId: snapshot.featuredImageId,
        metaTitle: snapshot.metaTitle,
        metaDescription: snapshot.metaDescription,
        canonicalUrl: snapshot.canonicalUrl,
        isIndexable: snapshot.isIndexable,
        noFollow: snapshot.noFollow,
        noIndex: snapshot.noIndex,
        ogTitle: snapshot.ogTitle,
        ogDescription: snapshot.ogDescription,
        ogImage: snapshot.ogImage,
        twitterTitle: snapshot.twitterTitle,
        twitterDescription: snapshot.twitterDescription,
        twitterImage: snapshot.twitterImage,
        schemaType: snapshot.schemaType,
        breadcrumbLabel: snapshot.breadcrumbLabel,
        updatedBy: req.user?.email
      }
    });

    // Delete current blocks and re-create from snapshot
    await prisma.pageBlock.deleteMany({ where: { pageId } });

    if (Array.isArray(snapshot.blocks) && snapshot.blocks.length > 0) {
      await prisma.pageBlock.createMany({
        data: snapshot.blocks.map((b: any, index: number) => ({
          pageId,
          type: b.type,
          variant: b.variant || 'default',
          sortOrder: typeof b.sortOrder === 'number' ? b.sortOrder : index,
          isVisible: b.isVisible !== undefined ? b.isVisible : true,
          settings: typeof b.settings === 'string' ? b.settings : JSON.stringify(b.settings || {}),
          content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content || {})
        }))
      });
    }

    const restored = await prisma.page.findUnique({
      where: { id: pageId },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } }
    });

    await logAudit(req.user?.userId, 'RESTORE_REVISION', 'Page', pageId, { revisionId });
    return res.json({ success: true, data: restored, message: 'Page revision restored successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 4. 301/302 REDIRECTS MANAGEMENT
// -----------------------------------------------------------------------------

// GET /api/admin/redirects
router.get('/redirects', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const redirects = await prisma.redirect.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return res.json({ success: true, data: redirects });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/redirects
router.post('/redirects', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { sourcePath, targetPath, statusCode = 301, isActive = true } = req.body;
    if (!sourcePath || !targetPath) {
      return res.status(400).json({ success: false, error: { message: 'sourcePath and targetPath are required' } });
    }

    sourcePath = sourcePath.trim().toLowerCase();
    if (!sourcePath.startsWith('/')) sourcePath = '/' + sourcePath;

    targetPath = targetPath.trim();
    if (!targetPath.startsWith('http://') && !targetPath.startsWith('https://') && !targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }

    if (sourcePath === targetPath) {
      return res.status(400).json({ success: false, error: { message: 'Source and target cannot be identical (circular redirect)' } });
    }

    const redirect = await prisma.redirect.create({
      data: {
        sourcePath,
        targetPath,
        statusCode: Number(statusCode) || 301,
        isActive: Boolean(isActive)
      }
    });

    await refreshRedirectCache();
    await logAudit(req.user?.userId, 'CREATE_REDIRECT', 'Redirect', redirect.id, { sourcePath, targetPath });

    return res.status(201).json({ success: true, data: redirect });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/redirects/:id
router.put('/redirects/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    let { sourcePath, targetPath, statusCode, isActive } = req.body;

    const existing = await prisma.redirect.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Redirect not found' } });
    }

    const data: any = {};
    if (sourcePath !== undefined) {
      let src = sourcePath.trim().toLowerCase();
      if (!src.startsWith('/')) src = '/' + src;
      data.sourcePath = src;
    }
    if (targetPath !== undefined) {
      let tgt = targetPath.trim();
      if (!tgt.startsWith('http://') && !tgt.startsWith('https://') && !tgt.startsWith('/')) {
        tgt = '/' + tgt;
      }
      data.targetPath = tgt;
    }
    if (statusCode !== undefined) data.statusCode = Number(statusCode);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.redirect.update({
      where: { id },
      data
    });

    await refreshRedirectCache();
    await logAudit(req.user?.userId, 'UPDATE_REDIRECT', 'Redirect', id);

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/redirects/:id
router.delete('/redirects/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.redirect.delete({ where: { id } });
    await refreshRedirectCache();
    await logAudit(req.user?.userId, 'DELETE_REDIRECT', 'Redirect', id);
    return res.json({ success: true, message: 'Redirect deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 5. GLOBAL BLOCKS, TEMPLATES, COMMENTS, 404 LOGS & SUBMISSIONS
// -----------------------------------------------------------------------------

// GET /api/admin/global-blocks
router.get('/global-blocks', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blocks = await prisma.globalBlock.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { blocks: true } } }
    });
    return res.json({ success: true, data: blocks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/global-blocks
router.post('/global-blocks', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category = 'GENERAL', description, type, settings, content } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, error: { message: 'Name and type are required' } });
    }

    const block = await prisma.globalBlock.create({
      data: {
        name,
        category,
        description,
        type,
        settings: typeof settings === 'string' ? settings : JSON.stringify(settings || {}),
        content: typeof content === 'string' ? content : JSON.stringify(content || {})
      }
    });

    return res.status(201).json({ success: true, data: block });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/global-blocks/:id
router.put('/global-blocks/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, category, description, settings, content } = req.body;

    const updated = await prisma.globalBlock.update({
      where: { id },
      data: {
        name,
        category,
        description,
        settings: settings !== undefined ? (typeof settings === 'string' ? settings : JSON.stringify(settings)) : undefined,
        content: content !== undefined ? (typeof content === 'string' ? content : JSON.stringify(content)) : undefined
      }
    });

    // Update all linked page blocks
    if (settings !== undefined || content !== undefined) {
      await prisma.pageBlock.updateMany({
        where: { globalBlockId: id },
        data: {
          settings: updated.settings,
          content: updated.content
        }
      });
    }

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/global-blocks/:id
router.delete('/global-blocks/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.globalBlock.delete({ where: { id } });
    return res.json({ success: true, message: 'Global block deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/templates
router.get('/templates', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templates = await prisma.pageTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: templates });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/templates (Save current page as template)
router.post('/templates', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, category = 'STANDARD', previewImage, pageId } = req.body;
    if (!name || !pageId) {
      return res.status(400).json({ success: false, error: { message: 'name and pageId required' } });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { blocks: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    const template = await prisma.pageTemplate.create({
      data: {
        name,
        description,
        category,
        previewImage: previewImage || page.featuredImageUrl || null,
        blocksJson: JSON.stringify(page.blocks)
      }
    });

    return res.status(201).json({ success: true, data: template });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/404-logs
router.get('/404-logs', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.notFoundLog.findMany({
      orderBy: { count: 'desc' },
      take: 100
    });
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/form-submissions
router.get('/form-submissions', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { formName, status } = req.query;
    const where: any = {};
    if (formName && typeof formName === 'string') where.formName = formName;
    if (status && typeof status === 'string') where.status = status;

    const submissions = await prisma.formSubmissionRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 150
    });
    return res.json({ success: true, data: submissions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/form-submissions/:id
router.put('/form-submissions/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    const updated = await prisma.formSubmissionRecord.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/search-content - Global content search
router.get('/search-content', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q) return res.json({ success: true, data: { pages: [], services: [], projects: [] } });

    const [pages, services, projects] = await Promise.all([
      prisma.page.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } }
          ],
          deletedAt: null
        },
        take: 10,
        select: { id: true, title: true, slug: true, status: true }
      }),
      prisma.service.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: { id: true, title: true, slug: true }
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: { id: true, title: true, slug: true }
      })
    ]);

    return res.json({
      success: true,
      data: { pages, services, projects }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/media-audit - Image audit for missing alts & large images
router.get('/media-audit', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const issues: any[] = [];
    for (const item of items) {
      if (!item.altText || !item.altText.trim()) {
        issues.push({ id: item.id, url: item.url, filename: item.filename, type: 'MISSING_ALT', message: 'Missing accessible alt description' });
      }
      if (item.size && item.size > 2 * 1024 * 1024) {
        issues.push({ id: item.id, url: item.url, filename: item.filename, type: 'OVERSIZED', message: `Oversized image file (${(item.size / 1024 / 1024).toFixed(1)} MB)` });
      }
    }

    return res.json({ success: true, data: { totalMedia: items.length, issuesCount: issues.length, issues } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 6. PREVIEW TOKEN GENERATOR
// -----------------------------------------------------------------------------

export function generatePreviewToken(pageId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET || 'preview-secret';
  const timestamp = Date.now();
  const hash = crypto.createHmac('sha256', secret).update(`${pageId}:${timestamp}`).digest('hex');
  return `${timestamp}.${hash}`;
}

export function verifyPreviewToken(pageId: string, token: string): boolean {
  try {
    const [timestampStr, hash] = token.split('.');
    if (!timestampStr || !hash) return false;
    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 2 hours
    if (Date.now() - timestamp > 2 * 60 * 60 * 1000) return false;
    const secret = process.env.JWT_ACCESS_SECRET || 'preview-secret';
    const expected = crypto.createHmac('sha256', secret).update(`${pageId}:${timestamp}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  } catch {
    return false;
  }
}

// GET /api/admin/pages/:id/preview-token - Get a secure preview URL token
router.get('/pages/:id/preview-token', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const token = generatePreviewToken(id);
    return res.json({ success: true, token, previewUrl: `/preview/page/${id}?token=${token}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
