import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { slugify } from '../utils/sanitizer.js';
import { sendNotificationEmail } from '../utils/mailer.js';
import crypto from 'crypto';

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
// 5. SEO OVERVIEW & AUDIT ENGINE
// -----------------------------------------------------------------------------

// GET /api/admin/seo/overview
router.get('/seo/overview', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [pages, posts, redirectsCount, open404s, servicesCount, projectsCount] = await Promise.all([
      prisma.page.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, slug: true, status: true, metaTitle: true, metaDescription: true, ogImage: true, publishedAt: true }
      }),
      prisma.blogPost.findMany({
        select: { id: true, title: true, slug: true, status: true, metaTitle: true, metaDescription: true, ogImage: true, publishedAt: true }
      }),
      prisma.redirect.count({ where: { isActive: true } }),
      prisma.notFoundLog.count(),
      prisma.service.count(),
      prisma.project.count()
    ]);

    const issues: any[] = [];

    // Analyze dynamic pages
    for (const p of pages) {
      if (p.status !== 'PUBLISHED') continue;
      const title = p.metaTitle || p.title;
      if (!p.metaTitle) {
        issues.push({ type: 'MISSING_META_TITLE', entity: 'Page', title: p.title, url: `/${p.slug}`, severity: 'HIGH' });
      } else if (title.length < 20) {
        issues.push({ type: 'SHORT_TITLE', entity: 'Page', title: p.title, url: `/${p.slug}`, severity: 'LOW', details: `${title.length} chars (recommended: 30-60)` });
      }

      if (!p.metaDescription) {
        issues.push({ type: 'MISSING_META_DESC', entity: 'Page', title: p.title, url: `/${p.slug}`, severity: 'HIGH' });
      } else if (p.metaDescription.length < 50) {
        issues.push({ type: 'SHORT_DESC', entity: 'Page', title: p.title, url: `/${p.slug}`, severity: 'MEDIUM', details: `${p.metaDescription.length} chars (recommended: 120-160)` });
      }

      if (!p.ogImage) {
        issues.push({ type: 'MISSING_OG_IMAGE', entity: 'Page', title: p.title, url: `/${p.slug}`, severity: 'MEDIUM' });
      }
    }

    // Analyze blog posts
    for (const b of posts) {
      if (b.status !== 'PUBLISHED') continue;
      if (!b.metaTitle) {
        issues.push({ type: 'MISSING_META_TITLE', entity: 'BlogPost', title: b.title, url: `/blog/${b.slug}`, severity: 'HIGH' });
      }
      if (!b.metaDescription) {
        issues.push({ type: 'MISSING_META_DESC', entity: 'BlogPost', title: b.title, url: `/blog/${b.slug}`, severity: 'HIGH' });
      }
      if (!b.ogImage) {
        issues.push({ type: 'MISSING_OG_IMAGE', entity: 'BlogPost', title: b.title, url: `/blog/${b.slug}`, severity: 'MEDIUM' });
      }
    }

    const publishedPagesCount = pages.filter((p: any) => p.status === 'PUBLISHED').length;
    const publishedPostsCount = posts.filter((b: any) => b.status === 'PUBLISHED').length;
    const totalIndexable = publishedPagesCount + publishedPostsCount + servicesCount + projectsCount;

    return res.json({
      success: true,
      data: {
        totalIndexable,
        publishedPagesCount,
        publishedPostsCount,
        servicesCount,
        projectsCount,
        redirectsCount,
        open404s,
        totalIssues: issues.length,
        highSeverityIssues: issues.filter(i => i.severity === 'HIGH').length,
        mediumSeverityIssues: issues.filter(i => i.severity === 'MEDIUM').length,
        issues
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 6. SYSTEM HEALTH & DIAGNOSTICS
// -----------------------------------------------------------------------------

// GET /api/admin/system-health
router.get('/system-health', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startDb;

    const [pageCount, mediaCount, userCount, leadCount] = await Promise.all([
      prisma.page.count({ where: { deletedAt: null } }),
      prisma.mediaItem.count(),
      prisma.adminUser.count(),
      prisma.contactSubmission.count()
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
        stats: {
          totalPages: pageCount,
          totalMedia: mediaCount,
          totalAdmins: userCount,
          totalLeads: leadCount
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
