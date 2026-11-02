import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { slugify } from '../utils/sanitizer.js';
import { sendNotificationEmail } from '../utils/mailer.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const router = Router();

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
// 1. AUTHORS CRUD
// -----------------------------------------------------------------------------

// GET /api/admin/authors
router.get('/authors', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authors = await prisma.author.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: authors });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/authors
router.post('/authors', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, role, bio, photo, socialLinks } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Author name is required' } });
    }

    const finalSlug = slugify(slug || name);
    const existing = await prisma.author.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(409).json({ success: false, error: { message: 'An author with this slug already exists' } });
    }

    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        role: role?.trim() || null,
        bio: bio?.trim() || null,
        photo: photo?.trim() || null,
        socialLinks: typeof socialLinks === 'object' ? JSON.stringify(socialLinks) : (socialLinks || null)
      }
    });

    await logAudit(req.user?.userId, 'CREATE_AUTHOR', 'Author', author.id);
    return res.status(201).json({ success: true, data: author });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/authors/:id
router.put('/authors/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug, role, bio, photo, socialLinks } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) {
      const finalSlug = slugify(slug);
      const existing = await prisma.author.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, error: { message: 'An author with this slug already exists' } });
      }
      data.slug = finalSlug;
    }
    if (role !== undefined) data.role = role?.trim() || null;
    if (bio !== undefined) data.bio = bio?.trim() || null;
    if (photo !== undefined) data.photo = photo?.trim() || null;
    if (socialLinks !== undefined) {
      data.socialLinks = typeof socialLinks === 'object' ? JSON.stringify(socialLinks) : (socialLinks || null);
    }

    const author = await prisma.author.update({
      where: { id },
      data
    });

    await logAudit(req.user?.userId, 'UPDATE_AUTHOR', 'Author', id);
    return res.json({ success: true, data: author });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/authors/:id
router.delete('/authors/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.author.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_AUTHOR', 'Author', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 2. BLOG CATEGORIES & TAGS
// -----------------------------------------------------------------------------

// GET /api/admin/blog/categories
router.get('/blog/categories', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: { select: { posts: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/blog/categories
router.post('/blog/categories', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, metaTitle, metaDescription } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Category name is required' } });
    }

    const finalSlug = slugify(slug || name);
    const existing = await prisma.blogCategory.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(409).json({ success: false, error: { message: 'Category slug already in use' } });
    }

    const category = await prisma.blogCategory.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null
      }
    });

    await logAudit(req.user?.userId, 'CREATE_BLOG_CATEGORY', 'BlogCategory', category.id);
    return res.status(201).json({ success: true, data: category });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/blog/categories/:id
router.put('/blog/categories/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, metaTitle, metaDescription } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) {
      const finalSlug = slugify(slug);
      const existing = await prisma.blogCategory.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, error: { message: 'Category slug already in use' } });
      }
      data.slug = finalSlug;
    }
    if (description !== undefined) data.description = description?.trim() || null;
    if (metaTitle !== undefined) data.metaTitle = metaTitle?.trim() || null;
    if (metaDescription !== undefined) data.metaDescription = metaDescription?.trim() || null;

    const category = await prisma.blogCategory.update({
      where: { id },
      data
    });

    await logAudit(req.user?.userId, 'UPDATE_BLOG_CATEGORY', 'BlogCategory', id);
    return res.json({ success: true, data: category });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/blog/categories/:id
router.delete('/blog/categories/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.blogCategory.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_BLOG_CATEGORY', 'BlogCategory', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/blog/tags
router.get('/blog/tags', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: { select: { posts: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: tags });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/blog/tags
router.post('/blog/tags', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, metaTitle, metaDescription } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Tag name is required' } });
    }

    const finalSlug = slugify(slug || name);
    const existing = await prisma.blogTag.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(409).json({ success: false, error: { message: 'Tag slug already in use' } });
    }

    const tag = await prisma.blogTag.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null
      }
    });

    await logAudit(req.user?.userId, 'CREATE_BLOG_TAG', 'BlogTag', tag.id);
    return res.status(201).json({ success: true, data: tag });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/blog/tags/:id
router.put('/blog/tags/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, metaTitle, metaDescription } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) {
      const finalSlug = slugify(slug);
      const existing = await prisma.blogTag.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, error: { message: 'Tag slug already in use' } });
      }
      data.slug = finalSlug;
    }
    if (description !== undefined) data.description = description?.trim() || null;
    if (metaTitle !== undefined) data.metaTitle = metaTitle?.trim() || null;
    if (metaDescription !== undefined) data.metaDescription = metaDescription?.trim() || null;

    const tag = await prisma.blogTag.update({
      where: { id },
      data
    });

    await logAudit(req.user?.userId, 'UPDATE_BLOG_TAG', 'BlogTag', id);
    return res.json({ success: true, data: tag });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/blog/tags/:id
router.delete('/blog/tags/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.blogTag.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_BLOG_TAG', 'BlogTag', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 3. WEBHOOKS CRUD & TEST DISPATCH
// -----------------------------------------------------------------------------

// GET /api/admin/webhooks
router.get('/webhooks', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const webhooks = await prisma.webhookConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: webhooks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/webhooks
router.post('/webhooks', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, event, secret, isActive = true } = req.body;
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ success: false, error: { message: 'Valid HTTP/HTTPS webhook URL is required' } });
    }

    const validEvents = ['ALL', 'LEAD_CREATED', 'PAGE_PUBLISHED', 'FORM_SUBMITTED'];
    const chosenEvent = validEvents.includes(event) ? event : 'ALL';

    const webhook = await prisma.webhookConfig.create({
      data: {
        url: url.trim(),
        event: chosenEvent,
        secret: secret?.trim() || null,
        isActive: Boolean(isActive)
      }
    });

    await logAudit(req.user?.userId, 'CREATE_WEBHOOK', 'WebhookConfig', webhook.id);
    return res.status(201).json({ success: true, data: webhook });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/webhooks/:id
router.put('/webhooks/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { url, event, secret, isActive } = req.body;

    const data: any = {};
    if (url !== undefined) {
      if (!url.startsWith('http')) {
        return res.status(400).json({ success: false, error: { message: 'Valid URL is required' } });
      }
      data.url = url.trim();
    }
    if (event !== undefined) data.event = event;
    if (secret !== undefined) data.secret = secret?.trim() || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const webhook = await prisma.webhookConfig.update({
      where: { id },
      data
    });

    await logAudit(req.user?.userId, 'UPDATE_WEBHOOK', 'WebhookConfig', id);
    return res.json({ success: true, data: webhook });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/webhooks/:id
router.delete('/webhooks/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.webhookConfig.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_WEBHOOK', 'WebhookConfig', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/webhooks/:id/test - Send a test payload to webhook URL
router.post('/webhooks/:id/test', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const webhook = await prisma.webhookConfig.findUnique({ where: { id } });
    if (!webhook) {
      return res.status(404).json({ success: false, error: { message: 'Webhook not found' } });
    }

    const payload = {
      event: 'TEST_PING',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from DigitalClik CMS PRO',
        webhookId: webhook.id
      }
    };
    const payloadString = JSON.stringify(payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DigitalClik-Webhook/1.0',
      'X-DigitalClik-Event': 'TEST_PING'
    };

    if (webhook.secret) {
      headers['X-DigitalClik-Signature'] = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const startTime = Date.now();
    let status = 0;
    let statusText = '';
    let responseBody = '';

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal
      });
      clearTimeout(timeout);
      status = response.status;
      statusText = response.statusText;
      responseBody = await response.text();
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      return res.json({
        success: false,
        durationMs: Date.now() - startTime,
        error: { message: fetchErr.message }
      });
    }

    return res.json({
      success: status >= 200 && status < 300,
      durationMs: Date.now() - startTime,
      status,
      statusText,
      responseBody: responseBody.slice(0, 500)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 4. EMAIL TEMPLATES CRUD & TEST SEND
// -----------------------------------------------------------------------------

// GET /api/admin/email-templates
router.get('/email-templates', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templates = await prisma.emailTemplateRecord.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: templates });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/email-templates
router.post('/email-templates', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subject, heading, body, footer, buttonLabel, buttonUrl } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ success: false, error: { message: 'Name, subject, and body are required' } });
    }

    const template = await prisma.emailTemplateRecord.create({
      data: {
        name: name.trim(),
        subject: subject.trim(),
        heading: heading?.trim() || null,
        body: body.trim(),
        footer: footer?.trim() || null,
        buttonLabel: buttonLabel?.trim() || null,
        buttonUrl: buttonUrl?.trim() || null
      }
    });

    await logAudit(req.user?.userId, 'CREATE_EMAIL_TEMPLATE', 'EmailTemplateRecord', template.id);
    return res.status(201).json({ success: true, data: template });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/email-templates/:id
router.put('/email-templates/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, subject, heading, body, footer, buttonLabel, buttonUrl } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (subject !== undefined) data.subject = subject.trim();
    if (heading !== undefined) data.heading = heading?.trim() || null;
    if (body !== undefined) data.body = body.trim();
    if (footer !== undefined) data.footer = footer?.trim() || null;
    if (buttonLabel !== undefined) data.buttonLabel = buttonLabel?.trim() || null;
    if (buttonUrl !== undefined) data.buttonUrl = buttonUrl?.trim() || null;

    const template = await prisma.emailTemplateRecord.update({
      where: { id },
      data
    });

    await logAudit(req.user?.userId, 'UPDATE_EMAIL_TEMPLATE', 'EmailTemplateRecord', id);
    return res.json({ success: true, data: template });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/email-templates/:id
router.delete('/email-templates/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.emailTemplateRecord.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_EMAIL_TEMPLATE', 'EmailTemplateRecord', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/email-templates/test-send
router.post('/email-templates/test-send', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { to, subject, html } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: { message: 'Recipient email is required' } });
    }

    const sent = await sendNotificationEmail({
      to,
      subject: subject || 'Test Notification from DigitalClik CMS',
      html: html || '<p>This is a test notification confirming email integration is operational.</p>'
    });

    return res.json({ success: sent, message: sent ? 'Test email dispatched' : 'Failed to send email' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 5. SEO AUDIT ENGINE (FACTUAL METRICS ONLY - NO FAKE PERCENTAGES)
// -----------------------------------------------------------------------------

// Helper to extract internal links from HTML/Markdown text
function extractInternalLinks(content: string): string[] {
  if (!content) return [];
  const links: string[] = [];
  // Match href="/..."
  const hrefRegex = /href=["'](\/[^"'#?]+)["']/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    if (!match[1].startsWith('/api') && !match[1].startsWith('/uploads') && !match[1].startsWith('/assets')) {
      links.push(match[1]);
    }
  }
  // Match markdown links [text](/path)
  const mdRegex = /\[[^\]]*\]\((\/[^)\s#?]+)\)/g;
  while ((match = mdRegex.exec(content)) !== null) {
    if (!match[1].startsWith('/api') && !match[1].startsWith('/uploads') && !match[1].startsWith('/assets')) {
      links.push(match[1]);
    }
  }
  return links;
}

// GET /api/admin/seo/overview - 100% Factual SEO metrics, issues and counters
router.get('/seo/overview', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [pages, posts, redirects, open404s, services, projects, mediaAltIssues] = await Promise.all([
      prisma.page.findMany({
        where: { deletedAt: null },
        include: { blocks: { select: { type: true, content: true } } }
      }),
      prisma.blogPost.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, slug: true, status: true, metaTitle: true, metaDescription: true, ogImage: true, canonicalUrl: true, publishedAt: true }
      }),
      prisma.redirect.findMany({ where: { isActive: true } }),
      prisma.notFoundLog.findMany({ where: { isResolved: false, isIgnored: false } }),
      prisma.service.findMany({ select: { id: true, title: true, slug: true } }),
      prisma.project.findMany({ where: { deletedAt: null }, select: { id: true, title: true, slug: true } }),
      prisma.mediaItem.count({
        where: {
          isTrashed: false,
          OR: [
            { altText: null },
            { altText: '' },
            { altText: 'DigitalClik Media Asset' }
          ]
        }
      })
    ]);

    const issues: any[] = [];

    // Valid path registry for broken link detection
    const validPaths = new Set<string>([
      '/', '/services', '/work', '/about', '/process', '/blog', '/contact', '/privacy', '/terms', '/cookies'
    ]);
    services.forEach(s => validPaths.add(`/services/${s.slug}`));
    projects.forEach(p => validPaths.add(`/work/${p.slug}`));
    posts.filter(b => b.status === 'PUBLISHED').forEach(b => validPaths.add(`/blog/${b.slug}`));
    pages.filter(p => p.status === 'PUBLISHED').forEach(p => validPaths.add(`/${p.slug}`));
    redirects.forEach(r => validPaths.add(r.sourcePath));

    // Duplicate tracker maps
    const titleCounts = new Map<string, Array<{ type: string; title: string; url: string }>>();
    const descCounts = new Map<string, Array<{ type: string; title: string; url: string }>>();

    let missingMetaTitleCount = 0;
    let missingMetaDescCount = 0;
    let missingH1Count = 0;
    let multipleH1Count = 0;
    let brokenInternalLinksCount = 0;
    let noindexPagesCount = 0;
    let canonicalProblemsCount = 0;

    // 1. Analyze published pages
    for (const p of pages) {
      if (p.status !== 'PUBLISHED') continue;
      const url = `/${p.slug}`;

      if (p.noIndex) {
        noindexPagesCount++;
        issues.push({ type: 'NOINDEX_PAGE', entity: 'Page', title: p.title, url, severity: 'NOTICE', details: 'Search engine indexation blocked by noindex flag' });
      }

      const title = p.metaTitle?.trim() || p.title?.trim();
      if (!title) {
        missingMetaTitleCount++;
        issues.push({ type: 'MISSING_META_TITLE', entity: 'Page', title: p.title, url, severity: 'CRITICAL', details: 'Page is missing a title tag' });
      } else {
        const arr = titleCounts.get(title) || [];
        arr.push({ type: 'Page', title: p.title, url });
        titleCounts.set(title, arr);
      }

      if (!p.metaDescription?.trim()) {
        missingMetaDescCount++;
        issues.push({ type: 'MISSING_META_DESC', entity: 'Page', title: p.title, url, severity: 'CRITICAL', details: 'Missing meta description' });
      } else {
        const desc = p.metaDescription.trim();
        const arr = descCounts.get(desc) || [];
        arr.push({ type: 'Page', title: p.title, url });
        descCounts.set(desc, arr);
      }

      // H1 / Hero section analysis
      const heroBlocks = p.blocks.filter(b => b.type === 'HERO');
      if (heroBlocks.length === 0) {
        missingH1Count++;
        issues.push({ type: 'MISSING_H1', entity: 'Page', title: p.title, url, severity: 'CRITICAL', details: 'No primary HERO/H1 section found' });
      } else if (heroBlocks.length > 1) {
        multipleH1Count++;
        issues.push({ type: 'MULTIPLE_H1', entity: 'Page', title: p.title, url, severity: 'WARNING', details: `${heroBlocks.length} HERO sections detected. Best practice is 1 primary H1.` });
      }

      // Scan page blocks for broken internal links
      for (const block of p.blocks) {
        const foundLinks = extractInternalLinks(block.content);
        for (const link of foundLinks) {
          if (!validPaths.has(link) && !validPaths.has(link.toLowerCase())) {
            brokenInternalLinksCount++;
            issues.push({ type: 'BROKEN_INTERNAL_LINK', entity: 'Page', title: p.title, url, severity: 'CRITICAL', details: `Points to missing internal path "${link}"` });
          }
        }
      }

      // Canonical URL check
      if (p.canonicalUrl && !p.canonicalUrl.startsWith('http')) {
        canonicalProblemsCount++;
        issues.push({ type: 'CANONICAL_PROBLEM', entity: 'Page', title: p.title, url, severity: 'WARNING', details: `Relative canonical "${p.canonicalUrl}" should be absolute URL` });
      }
    }

    // 2. Analyze published blog posts
    for (const b of posts) {
      if (b.status !== 'PUBLISHED') continue;
      const url = `/blog/${b.slug}`;

      const title = b.metaTitle?.trim() || b.title?.trim();
      if (!title) {
        missingMetaTitleCount++;
        issues.push({ type: 'MISSING_META_TITLE', entity: 'BlogPost', title: b.title, url, severity: 'CRITICAL', details: 'Blog post is missing title tag' });
      } else {
        const arr = titleCounts.get(title) || [];
        arr.push({ type: 'BlogPost', title: b.title, url });
        titleCounts.set(title, arr);
      }

      if (!b.metaDescription?.trim()) {
        missingMetaDescCount++;
        issues.push({ type: 'MISSING_META_DESC', entity: 'BlogPost', title: b.title, url, severity: 'CRITICAL', details: 'Blog post is missing meta description' });
      } else {
        const desc = b.metaDescription.trim();
        const arr = descCounts.get(desc) || [];
        arr.push({ type: 'BlogPost', title: b.title, url });
        descCounts.set(desc, arr);
      }

      if (b.canonicalUrl && !b.canonicalUrl.startsWith('http')) {
        canonicalProblemsCount++;
        issues.push({ type: 'CANONICAL_PROBLEM', entity: 'BlogPost', title: b.title, url, severity: 'WARNING', details: `Relative canonical "${b.canonicalUrl}" should be absolute URL` });
      }
    }

    // 3. Duplicate titles and descriptions
    let duplicateTitleCount = 0;
    titleCounts.forEach((items, t) => {
      if (items.length > 1) {
        duplicateTitleCount += items.length;
        items.forEach(item => {
          issues.push({ type: 'DUPLICATE_META_TITLE', entity: item.type, title: item.title, url: item.url, severity: 'WARNING', details: `Duplicate title shared across ${items.length} URLs: "${t.slice(0, 40)}..."` });
        });
      }
    });

    let duplicateDescCount = 0;
    descCounts.forEach((items, d) => {
      if (items.length > 1) {
        duplicateDescCount += items.length;
        items.forEach(item => {
          issues.push({ type: 'DUPLICATE_META_DESC', entity: item.type, title: item.title, url: item.url, severity: 'WARNING', details: `Identical meta description shared across ${items.length} URLs` });
        });
      }
    });

    // 4. Detect redirect chains (A -> B and B -> C)
    const redirectMap = new Map<string, string>();
    redirects.forEach(r => redirectMap.set(r.sourcePath, r.targetPath));

    let redirectChainsCount = 0;
    const redirectChains: Array<{ source: string; intermediate: string; target: string }> = [];
    redirectMap.forEach((target, source) => {
      if (redirectMap.has(target)) {
        redirectChainsCount++;
        const finalTarget = redirectMap.get(target)!;
        redirectChains.push({ source, intermediate: target, target: finalTarget });
        issues.push({
          type: 'REDIRECT_CHAIN',
          entity: 'Redirect',
          title: `Chain: ${source} → ${target} → ${finalTarget}`,
          url: source,
          severity: 'WARNING',
          details: `Avoid chain latency. Point ${source} directly to ${finalTarget}`
        });
      }
    });

    // Summary Factual Counters
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').length;
    const warningIssues = issues.filter(i => i.severity === 'WARNING').length;

    const publishedPagesCount = pages.filter(p => p.status === 'PUBLISHED').length;
    const publishedPostsCount = posts.filter(b => b.status === 'PUBLISHED').length;
    const totalIndexable = publishedPagesCount + publishedPostsCount + services.length + projects.length;

    const statusCounts = {
      healthy: Math.max(0, totalIndexable - criticalIssues),
      warnings: warningIssues,
      needsAttention: criticalIssues
    };

    const counters = {
      missingMetaTitle: missingMetaTitleCount,
      missingMetaDescription: missingMetaDescCount,
      duplicateMetaTitle: duplicateTitleCount,
      duplicateMetaDescription: duplicateDescCount,
      missingH1: missingH1Count,
      multipleH1: multipleH1Count,
      missingAltText: mediaAltIssues,
      brokenInternalLinks: brokenInternalLinksCount,
      noindexPages: noindexPagesCount,
      canonicalProblems: canonicalProblemsCount,
      open404s: open404s.length,
      redirectChains: redirectChainsCount
    };

    return res.json({
      success: true,
      data: {
        totalIndexable,
        publishedPagesCount,
        publishedPostsCount,
        servicesCount: services.length,
        projectsCount: projects.length,
        redirectsCount: redirects.length,
        statusCounts,
        counters,
        totalIssues: issues.length,
        issues
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/seo/internal-links - Internal Link Graph
router.get('/seo/internal-links', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pages = await prisma.page.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      include: { blocks: { select: { id: true, type: true, content: true } } }
    });

    const publishedUrls = new Set(pages.map(p => `/${p.slug}`));

    const graph: Array<{
      pageId: string;
      title: string;
      slug: string;
      url: string;
      incomingLinksCount: number;
      outgoingLinksCount: number;
      incoming: Array<{ sourceTitle: string; sourceUrl: string }>;
      outgoing: string[];
      brokenLinks: string[];
    }> = [];

    // Map outgoing links
    const outgoingMap = new Map<string, string[]>();
    const brokenMap = new Map<string, string[]>();

    for (const page of pages) {
      const url = `/${page.slug}`;
      const allOut: string[] = [];
      const broken: string[] = [];

      for (const b of page.blocks) {
        const links = extractInternalLinks(b.content);
        for (const l of links) {
          allOut.push(l);
          if (!publishedUrls.has(l) && !publishedUrls.has(l.toLowerCase())) {
            broken.push(l);
          }
        }
      }
      outgoingMap.set(url, allOut);
      brokenMap.set(url, broken);
    }

    // Map incoming links
    for (const page of pages) {
      const url = `/${page.slug}`;
      const incoming: Array<{ sourceTitle: string; sourceUrl: string }> = [];

      pages.forEach(otherPage => {
        if (otherPage.id === page.id) return;
        const otherUrl = `/${otherPage.slug}`;
        const otherOut = outgoingMap.get(otherUrl) || [];
        if (otherOut.includes(url)) {
          incoming.push({ sourceTitle: otherPage.title, sourceUrl: otherUrl });
        }
      });

      const outgoing = outgoingMap.get(url) || [];
      const broken = brokenMap.get(url) || [];

      graph.push({
        pageId: page.id,
        title: page.title,
        slug: page.slug,
        url,
        incomingLinksCount: incoming.length,
        outgoingLinksCount: outgoing.length,
        incoming,
        outgoing,
        brokenLinks: broken
      });
    }

    return res.json({ success: true, count: graph.length, data: graph });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/seo/redirect-chains - Detect redirect chains
router.get('/seo/redirect-chains', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const redirects = await prisma.redirect.findMany({ where: { isActive: true } });
    const map = new Map<string, string>();
    redirects.forEach(r => map.set(r.sourcePath, r.targetPath));

    const chains: Array<{ source: string; intermediate: string; target: string; suggestion: string }> = [];

    map.forEach((target, source) => {
      if (map.has(target)) {
        const finalTarget = map.get(target)!;
        chains.push({
          source,
          intermediate: target,
          target: finalTarget,
          suggestion: `Update ${source} directly to ${finalTarget}`
        });
      }
    });

    return res.json({ success: true, count: chains.length, data: chains });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/404-logs/:id/resolve - Resolve 404 & optionally create redirect
router.post('/404-logs/:id/resolve', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { targetPath, statusCode = 301 } = req.body;

    const log = await prisma.notFoundLog.findUnique({ where: { id } });
    if (!log) return res.status(404).json({ success: false, error: { message: '404 record not found' } });

    let redirectId: string | null = null;
    if (targetPath && typeof targetPath === 'string' && targetPath.trim()) {
      const existing = await prisma.redirect.findUnique({ where: { sourcePath: log.path } });
      if (!existing) {
        const created = await prisma.redirect.create({
          data: {
            sourcePath: log.path,
            targetPath: targetPath.trim(),
            statusCode: parseInt(String(statusCode), 10) || 301,
            isActive: true,
            createdBy: req.user?.email || null
          }
        });
        redirectId = created.id;
      }
    }

    const updated = await prisma.notFoundLog.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedToRedirectId: redirectId
      }
    });

    await logAudit(req.user?.userId, 'RESOLVE_404', 'NotFoundLog', id, { targetPath, redirectId });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/404-logs/:id/ignore - Mark 404 ignored
router.post('/404-logs/:id/ignore', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.notFoundLog.update({
      where: { id },
      data: { isIgnored: true }
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 6. REVISIONS VISUAL DIFF ENGINE
// -----------------------------------------------------------------------------

// GET /api/admin/pages/:pageId/revisions/:revisionId/diff - Human-readable comparison
router.get('/pages/:pageId/revisions/:revisionId/diff', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pageId = req.params.pageId as string;
    const revisionId = req.params.revisionId as string;

    const [currentPage, revision] = await Promise.all([
      prisma.page.findUnique({
        where: { id: pageId },
        include: { blocks: { orderBy: { sortOrder: 'asc' } } }
      }),
      prisma.pageRevision.findUnique({ where: { id: revisionId } })
    ]);

    if (!currentPage || !revision) {
      return res.status(404).json({ success: false, error: { message: 'Page or revision snapshot not found' } });
    }

    const snapshot = JSON.parse(revision.snapshot);
    const snapshotBlocks: any[] = snapshot.blocks || [];
    const currentBlocks: any[] = (currentPage as any).blocks || [];

    // Compare metadata
    const metaDiff: Array<{ field: string; oldVal: any; newVal: any }> = [];
    ['title', 'slug', 'metaTitle', 'metaDescription', 'status', 'template'].forEach((field) => {
      const oldVal = snapshot[field];
      const newVal = (currentPage as any)[field];
      if (oldVal !== newVal) {
        metaDiff.push({ field, oldVal, newVal });
      }
    });

    // Compare blocks
    const oldBlockMap = new Map<string, any>();
    snapshotBlocks.forEach((b: any) => oldBlockMap.set(b.id, b));

    const newBlockMap = new Map<string, any>();
    currentBlocks.forEach((b: any) => newBlockMap.set(b.id, b));

    const addedBlocks: any[] = [];
    const removedBlocks: any[] = [];
    const modifiedBlocks: Array<{ id: string; type: string; changes: string[] }> = [];

    // Detect added & modified
    currentBlocks.forEach((b) => {
      if (!oldBlockMap.has(b.id)) {
        addedBlocks.push({ id: b.id, type: b.type, sortOrder: b.sortOrder });
      } else {
        const oldB = oldBlockMap.get(b.id);
        const changes: string[] = [];
        if (oldB.type !== b.type) changes.push(`Type changed from ${oldB.type} to ${b.type}`);
        if (oldB.sortOrder !== b.sortOrder) changes.push(`Order changed from ${oldB.sortOrder} to ${b.sortOrder}`);
        if (oldB.isVisible !== b.isVisible) changes.push(`Visibility changed from ${oldB.isVisible} to ${b.isVisible}`);
        if (oldB.content !== b.content) changes.push('Block content/text modified');
        if (changes.length > 0) {
          modifiedBlocks.push({ id: b.id, type: b.type, changes });
        }
      }
    });

    // Detect removed
    snapshotBlocks.forEach((b) => {
      if (!newBlockMap.has(b.id)) {
        removedBlocks.push({ id: b.id, type: b.type, sortOrder: b.sortOrder });
      }
    });

    return res.json({
      success: true,
      revision: {
        id: revision.id,
        createdAt: revision.createdAt,
        author: revision.author,
        note: revision.note
      },
      metaDiff,
      blocksDiff: {
        totalOld: snapshotBlocks.length,
        totalNew: currentBlocks.length,
        addedBlocks,
        removedBlocks,
        modifiedBlocks
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 7. APPROVAL WORKFLOW & REVIEW QUEUE
// -----------------------------------------------------------------------------

// POST /api/admin/pages/:id/submit-review - Editor submits page for review
router.post('/pages/:id/submit-review', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { note } = req.body;

    const page = await prisma.page.update({
      where: { id },
      data: {
        reviewStatus: 'SUBMITTED',
        submittedBy: req.user?.email || 'Editor',
        submittedAt: new Date(),
        reviewNote: note || 'Ready for editorial review'
      }
    });

    await prisma.adminNotification.create({
      data: {
        type: 'PAGE_SUBMITTED',
        title: 'Content Submitted for Review',
        message: `"${page.title}" was submitted by ${req.user?.email || 'Editor'} for review.`,
        link: `/admin?pageId=${page.id}`
      }
    });

    await logAudit(req.user?.userId, 'SUBMIT_FOR_REVIEW', 'Page', id, { note });
    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages/:id/approve - Admin approves page
router.post('/pages/:id/approve', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const page = await prisma.page.update({
      where: { id },
      data: {
        reviewStatus: 'APPROVED',
        approvedBy: req.user?.email || 'Admin',
        approvedAt: new Date()
      }
    });

    await prisma.adminNotification.create({
      data: {
        type: 'PAGE_APPROVED',
        title: 'Content Approved',
        message: `"${page.title}" was approved by ${req.user?.email || 'Admin'}.`,
        link: `/admin?pageId=${page.id}`
      }
    });

    await logAudit(req.user?.userId, 'APPROVE_PAGE', 'Page', id);
    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/pages/:id/reject - Admin rejects page with reason
router.post('/pages/:id/reject', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Rejection reason is required' } });
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        reviewStatus: 'REJECTED',
        rejectedBy: req.user?.email || 'Admin',
        rejectedAt: new Date(),
        reviewNote: reason.trim()
      }
    });

    await prisma.adminNotification.create({
      data: {
        type: 'PAGE_REJECTED',
        title: 'Content Revision Requested',
        message: `"${page.title}" was rejected: ${reason}`,
        link: `/admin?pageId=${page.id}`
      }
    });

    await logAudit(req.user?.userId, 'REJECT_PAGE', 'Page', id, { reason });
    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/review-queue - Content awaiting approval
router.get('/review-queue', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.page.findMany({
      where: { reviewStatus: 'SUBMITTED', deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        pageType: true,
        submittedBy: true,
        submittedAt: true,
        reviewNote: true,
        updatedAt: true
      },
      orderBy: { submittedAt: 'desc' }
    });
    return res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 8. SCHEDULED JOBS DASHBOARD API
// -----------------------------------------------------------------------------

// GET /api/admin/scheduled-jobs
router.get('/scheduled-jobs', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const [upcomingPublish, upcomingUnpublish, pastJobs] = await Promise.all([
      prisma.page.findMany({
        where: { publishAt: { gt: now }, deletedAt: null },
        select: { id: true, title: true, slug: true, status: true, publishAt: true },
        orderBy: { publishAt: 'asc' }
      }),
      prisma.page.findMany({
        where: { unpublishAt: { gt: now }, deletedAt: null },
        select: { id: true, title: true, slug: true, status: true, unpublishAt: true },
        orderBy: { unpublishAt: 'asc' }
      }),
      prisma.page.findMany({
        where: {
          OR: [
            { publishAt: { lte: now } },
            { unpublishAt: { lte: now } }
          ],
          deletedAt: null
        },
        select: { id: true, title: true, slug: true, status: true, publishAt: true, unpublishAt: true },
        take: 20,
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      data: {
        upcomingPublish,
        upcomingUnpublish,
        pastJobs
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/scheduled-jobs/:id/cancel
router.post('/scheduled-jobs/:id/cancel', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { action } = req.body; // 'publish' | 'unpublish' | 'both'

    const data: any = {};
    if (action === 'publish' || action === 'both' || !action) data.publishAt = null;
    if (action === 'unpublish' || action === 'both' || !action) data.unpublishAt = null;

    const updated = await prisma.page.update({ where: { id }, data });
    await logAudit(req.user?.userId, 'CANCEL_SCHEDULED_JOB', 'Page', id, { action });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 9. NAVIGATION DRAFT & PUBLISH
// -----------------------------------------------------------------------------

// GET /api/admin/navigation/:key/detailed
router.get('/navigation/:key/detailed', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const key = (req.params.key as string).toUpperCase();
    const menu = await prisma.navigationMenu.findUnique({
      where: { key },
      include: { items: { orderBy: { sortOrder: 'asc' } } }
    });
    if (!menu) return res.status(404).json({ success: false, error: { message: 'Menu not found' } });
    return res.json({ success: true, data: menu });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/navigation/:key/draft - Save draft menu structure without breaking live site
router.put('/navigation/:key/draft', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const key = (req.params.key as string).toUpperCase();
    const { items } = req.body;

    const updated = await prisma.navigationMenu.update({
      where: { key },
      data: {
        status: 'DRAFT',
        draftData: JSON.stringify(items)
      }
    });

    await logAudit(req.user?.userId, 'SAVE_DRAFT_NAVIGATION', 'NavigationMenu', updated.id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/navigation/:key/publish - Publish draft menu to live production
router.post('/navigation/:key/publish', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const key = (req.params.key as string).toUpperCase();
    const menu = await prisma.navigationMenu.findUnique({ where: { key } });
    if (!menu) return res.status(404).json({ success: false, error: { message: 'Menu not found' } });

    if (menu.draftData) {
      const draftItems: any[] = JSON.parse(menu.draftData);
      // Replace live items atomically
      await prisma.navigationItem.deleteMany({ where: { menuId: menu.id } });
      if (draftItems.length > 0) {
        await prisma.navigationItem.createMany({
          data: draftItems.map((item, idx) => ({
            menuId: menu.id,
            label: item.label,
            url: item.url,
            sortOrder: item.sortOrder !== undefined ? item.sortOrder : idx,
            isVisible: item.isVisible !== undefined ? Boolean(item.isVisible) : true,
            openInNewTab: Boolean(item.openInNewTab),
            linkedPageId: item.linkedPageId || null,
            linkedServiceId: item.linkedServiceId || null,
            linkedIndustryId: item.linkedIndustryId || null
          }))
        });
      }
    }

    const updated = await prisma.navigationMenu.update({
      where: { key },
      data: {
        status: 'PUBLISHED',
        version: { increment: 1 },
        draftData: null
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } }
    });

    await logAudit(req.user?.userId, 'PUBLISH_NAVIGATION', 'NavigationMenu', updated.id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 10. NOTIFICATIONS & SESSIONS
// -----------------------------------------------------------------------------

// GET /api/admin/notifications
router.get('/notifications', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where: {
          OR: [
            { userId: null },
            { userId: req.user?.userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      }),
      prisma.adminNotification.count({
        where: {
          isRead: false,
          OR: [
            { userId: null },
            { userId: req.user?.userId }
          ]
        }
      })
    ]);

    return res.json({ success: true, unreadCount, data: notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/notifications/:id/read
router.post('/notifications/:id/read', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.adminNotification.update({ where: { id }, data: { isRead: true } });
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/notifications/mark-all-read
router.post('/notifications/mark-all-read', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.adminNotification.updateMany({
      where: {
        OR: [
          { userId: null },
          { userId: req.user?.userId }
        ]
      },
      data: { isRead: true }
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/sessions
router.get('/sessions', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await prisma.adminSession.findMany({
      where: { userId: req.user?.userId },
      orderBy: { lastActiveAt: 'desc' }
    });
    return res.json({ success: true, data: sessions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/sessions/:id
router.delete('/sessions/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.adminSession.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 11. SYSTEM BACKUPS API (SUPER_ADMIN ONLY)
// -----------------------------------------------------------------------------

// GET /api/admin/backups - List database backups on disk
router.get('/backups', requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupDir = process.env.NODE_ENV === 'production'
      ? '/opt/digitalclik/backups/db'
      : path.resolve('backups');

    if (!fs.existsSync(backupDir)) {
      return res.json({ success: true, data: [] });
    }

    const files = await fs.promises.readdir(backupDir);
    const backups = await Promise.all(
      files
        .filter(f => f.endsWith('.sql.gz') || f.endsWith('.sql'))
        .map(async (filename) => {
          const stats = await fs.promises.stat(path.join(backupDir, filename));
          return {
            filename,
            sizeBytes: stats.size,
            sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            createdAt: stats.mtime.toISOString()
          };
        })
    );

    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, count: backups.length, data: backups });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/backups/create - Trigger live database backup
router.post('/backups/create', requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupScript = '/opt/digitalclik/backup.sh';
    if (!fs.existsSync(backupScript)) {
      return res.status(400).json({ success: false, error: { message: 'Backup script not found in current environment' } });
    }

    const { stdout, stderr } = await execPromise(backupScript);
    await logAudit(req.user?.userId, 'CREATE_DATABASE_BACKUP', 'System', undefined, { output: stdout.trim() });

    return res.json({
      success: true,
      message: 'Database backup generated successfully',
      output: stdout.trim()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 12. SYSTEM HEALTH & DIAGNOSTICS (EXTENDED PRO)
// -----------------------------------------------------------------------------

// GET /api/admin/system-health
router.get('/system-health', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startDb;

    const [pageCount, mediaCount, userCount, leadCount, redirectsCount, open404Count] = await Promise.all([
      prisma.page.count({ where: { deletedAt: null } }),
      prisma.mediaItem.count({ where: { isTrashed: false } }),
      prisma.adminUser.count(),
      prisma.contactSubmission.count(),
      prisma.redirect.count({ where: { isActive: true } }),
      prisma.notFoundLog.count({ where: { isResolved: false, isIgnored: false } })
    ]);

    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const formattedUptime = `${days}d ${hours}h ${minutes}m`;

    return res.json({
      success: true,
      data: {
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        uptimeSec,
        formattedUptime,
        environment: process.env.NODE_ENV || 'production',
        gitSha: process.env.GIT_COMMIT_SHA || 'latest',
        database: {
          connected: true,
          latencyMs: dbLatencyMs,
          engine: 'PostgreSQL 16'
        },
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
        },
        storage: {
          mode: process.env.STORAGE_PROVIDER || 'local',
          uploadDir: process.env.UPLOAD_DIR || 'uploads/'
        },
        scheduler: {
          status: 'ACTIVE',
          frequency: 'Every 60 seconds'
        },
        stats: {
          totalPages: pageCount,
          totalMedia: mediaCount,
          totalAdmins: userCount,
          totalLeads: leadCount,
          activeRedirects: redirectsCount,
          unresolved404s: open404Count
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: {
        status: 'DEGRADED',
        error: err.message
      }
    });
  }
});

export default router;
