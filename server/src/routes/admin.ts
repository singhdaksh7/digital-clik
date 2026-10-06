import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword
} from '../utils/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { getStorageProvider, validateUpload } from '../utils/storage.js';
import multer from 'multer';
import crypto from 'crypto';

const router = Router();
const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Audit log helper
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
    console.error('Failed to log audit:', err);
  }
}

// -----------------------------------------------------------------------------
// AUTHENTICATION & SESSION MANAGEMENT
// -----------------------------------------------------------------------------

// POST /api/admin/auth/login
router.post('/auth/login', loginRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const tokenFamily = crypto.randomUUID();
    const tokenId = crypto.randomUUID();

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      family: tokenFamily,
      tokenId
    });

    // Save refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        token: refreshToken,
        family: tokenFamily,
        expiresAt
      }
    });

    await logAudit(user.id, 'LOGIN', 'AdminUser', user.id);

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/auth/refresh (Token Rotation & Stolen Reuse Detection)
router.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: { message: 'Refresh token is required' } });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token' } });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    // Stolen Refresh Token Reuse Detection
    if (!storedToken || storedToken.isRevoked) {
      if (storedToken?.family) {
        // Token reuse detected! Invalidate all tokens in this family
        await prisma.refreshToken.updateMany({
          where: { family: storedToken.family },
          data: { isRevoked: true }
        });
      }
      return res.status(401).json({ success: false, error: { message: 'Token reuse detected or token revoked' } });
    }

    const user = storedToken.user;
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: { message: 'User account is inactive or disabled' } });
    }

    // Revoke old refresh token (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    });

    // Issue new Access & Refresh tokens in the same family
    const newTokenId = crypto.randomUUID();
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      family: storedToken.family,
      tokenId: newTokenId
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        id: newTokenId,
        userId: user.id,
        token: newRefreshToken,
        family: storedToken.family,
        expiresAt
      }
    });

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/auth/logout
router.post('/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
    }
    if (req.user?.userId) {
      await logAudit(req.user.userId, 'LOGOUT', 'AdminUser', req.user.userId);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/auth/change-password
router.post('/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: { message: 'New password must be at least 8 characters' } });
    }

    const userId = req.user!.userId;
    const user = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const isValid = await verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Current password is incorrect' } });
    }

    const newHash = await hashPassword(newPassword);

    // Bump tokenVersion and revoke all refresh tokens (Password change invalidates all existing sessions)
    await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: userId },
        data: {
          passwordHash: newHash,
          tokenVersion: { increment: 1 }
        }
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true }
      })
    ]);

    await logAudit(userId, 'PASSWORD_CHANGE', 'AdminUser', userId);

    return res.json({ success: true, message: 'Password changed successfully. All previous sessions invalidated.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/auth/me
router.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.adminUser.findUnique({ where: { id: req.user?.userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Protect all subsequent CMS admin routes
router.use(requireAuth);

// -----------------------------------------------------------------------------
// DASHBOARD METRICS
// -----------------------------------------------------------------------------
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalEnquiries = await prisma.projectEnquiry.count();
    const newEnquiries = await prisma.projectEnquiry.count({ where: { status: 'NEW' } });
    const totalContacts = await prisma.contactSubmission.count();
    const newContacts = await prisma.contactSubmission.count({ where: { status: 'NEW' } });
    const totalServices = await prisma.service.count();
    const totalProjects = await prisma.project.count();
    const totalCaseStudies = await prisma.caseStudy.count();
    const totalSubscribers = await prisma.newsletterSubscriber.count();

    const recentEnquiries = await prisma.projectEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    return res.json({
      success: true,
      data: {
        metrics: {
          totalEnquiries,
          newEnquiries,
          totalContacts,
          newContacts,
          totalServices,
          totalProjects,
          totalCaseStudies,
          totalSubscribers
        },
        recentEnquiries,
        recentAuditLogs
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// HOMEPAGE SECTIONS & HERO MANAGEMENT
// -----------------------------------------------------------------------------
router.get('/homepage/sections', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: sections });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/homepage/sections/reorder', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: { message: 'Items array required' } });
    }

    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.homepageSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    await logAudit(req.user?.userId, 'REORDER', 'HomepageSection');
    return res.json({ success: true, message: 'Sections reordered successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/homepage/sections/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, subtitle, eyebrow, content, sortOrder, isVisible } = req.body;
    const updated = await prisma.homepageSection.update({
      where: { id },
      data: { title, subtitle, eyebrow, content: typeof content === 'object' ? JSON.stringify(content) : content, sortOrder, isVisible }
    });
    await logAudit(req.user?.userId, 'UPDATE', 'HomepageSection', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/homepage/hero-media', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.heroMedia.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/homepage/hero-media', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.heroMedia.create({ data: req.body });
    await logAudit(req.user?.userId, 'CREATE', 'HeroMedia', item.id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/homepage/hero-media/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.heroMedia.update({ where: { id }, data: req.body });
    await logAudit(req.user?.userId, 'UPDATE', 'HeroMedia', id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/homepage/hero-media/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.heroMedia.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'HeroMedia', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// SERVICES & SERVICE CATEGORIES
// -----------------------------------------------------------------------------
router.get('/services', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: { category: true, sections: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: services });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/services', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { capabilities, features, tools, ...rest } = req.body;
    const service = await prisma.service.create({
      data: {
        ...rest,
        capabilities: typeof capabilities === 'object' ? JSON.stringify(capabilities) : capabilities,
        features: typeof features === 'object' ? JSON.stringify(features) : features,
        tools: typeof tools === 'object' ? JSON.stringify(tools) : tools
      }
    });
    await logAudit(req.user?.userId, 'CREATE', 'Service', service.id);
    return res.json({ success: true, data: service });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/services/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { capabilities, features, tools, ...rest } = req.body;
    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...rest,
        capabilities: typeof capabilities === 'object' ? JSON.stringify(capabilities) : capabilities,
        features: typeof features === 'object' ? JSON.stringify(features) : features,
        tools: typeof tools === 'object' ? JSON.stringify(tools) : tools
      }
    });
    await logAudit(req.user?.userId, 'UPDATE', 'Service', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/services/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.service.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'Service', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/service-categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// INDUSTRIES
// -----------------------------------------------------------------------------
router.get('/industries', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const industries = await prisma.industry.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: industries });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/industries', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { challenges, solutions, ...rest } = req.body;
    const industry = await prisma.industry.create({
      data: {
        ...rest,
        challenges: typeof challenges === 'object' ? JSON.stringify(challenges) : challenges,
        solutions: typeof solutions === 'object' ? JSON.stringify(solutions) : solutions
      }
    });
    await logAudit(req.user?.userId, 'CREATE', 'Industry', industry.id);
    return res.json({ success: true, data: industry });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/industries/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { challenges, solutions, ...rest } = req.body;
    const updated = await prisma.industry.update({
      where: { id },
      data: {
        ...rest,
        challenges: typeof challenges === 'object' ? JSON.stringify(challenges) : challenges,
        solutions: typeof solutions === 'object' ? JSON.stringify(solutions) : solutions
      }
    });
    await logAudit(req.user?.userId, 'UPDATE', 'Industry', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/industries/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.industry.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'Industry', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// PROJECTS, PORTFOLIO & GALLERY MANAGEMENT
// -----------------------------------------------------------------------------
router.get('/projects', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: { gallery: { orderBy: { sortOrder: 'asc' } }, caseStudies: true },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: projects });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/projects', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deliverables, galleryItems, ...rest } = req.body;

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          ...rest,
          deliverables: typeof deliverables === 'object' ? JSON.stringify(deliverables) : deliverables
        }
      });

      if (Array.isArray(galleryItems) && galleryItems.length > 0) {
        await tx.projectMedia.createMany({
          data: galleryItems.map((g: any, idx: number) => ({
            projectId: created.id,
            url: g.url,
            caption: g.caption || null,
            alt: g.alt || 'Project Gallery Media',
            type: g.type || 'IMAGE',
            sortOrder: idx
          }))
        });
      }

      return created;
    });

    await logAudit(req.user?.userId, 'CREATE', 'Project', project.id);
    return res.json({ success: true, data: project });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/projects/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { deliverables, galleryItems, ...rest } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.update({
        where: { id },
        data: {
          ...rest,
          deliverables: typeof deliverables === 'object' ? JSON.stringify(deliverables) : deliverables
        }
      });

      if (Array.isArray(galleryItems)) {
        await tx.projectMedia.deleteMany({ where: { projectId: id } });
        if (galleryItems.length > 0) {
          await tx.projectMedia.createMany({
            data: galleryItems.map((g: any, idx: number) => ({
              projectId: id,
              url: g.url,
              caption: g.caption || null,
              alt: g.alt || 'Project Gallery Media',
              type: g.type || 'IMAGE',
              sortOrder: idx
            }))
          });
        }
      }

      return proj;
    });

    await logAudit(req.user?.userId, 'UPDATE', 'Project', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/projects/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.project.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'Project', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// CASE STUDIES
// -----------------------------------------------------------------------------
router.get('/case-studies', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.caseStudy.findMany({
      include: { project: true, sections: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/case-studies', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tags, ...rest } = req.body;
    const item = await prisma.caseStudy.create({
      data: {
        ...rest,
        tags: typeof tags === 'object' ? JSON.stringify(tags) : tags
      }
    });
    await logAudit(req.user?.userId, 'CREATE', 'CaseStudy', item.id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/case-studies/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { tags, ...rest } = req.body;
    const updated = await prisma.caseStudy.update({
      where: { id },
      data: {
        ...rest,
        tags: typeof tags === 'object' ? JSON.stringify(tags) : tags
      }
    });
    await logAudit(req.user?.userId, 'UPDATE', 'CaseStudy', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/case-studies/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.caseStudy.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'CaseStudy', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// CLIENTS & TESTIMONIALS
// -----------------------------------------------------------------------------
router.get('/clients', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: clients });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/clients', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.client.create({ data: req.body });
    await logAudit(req.user?.userId, 'CREATE', 'Client', item.id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/clients/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.client.update({ where: { id }, data: req.body });
    await logAudit(req.user?.userId, 'UPDATE', 'Client', id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/clients/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.client.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'Client', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/testimonials', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/testimonials', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.testimonial.create({ data: req.body });
    await logAudit(req.user?.userId, 'CREATE', 'Testimonial', item.id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/testimonials/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.testimonial.update({ where: { id }, data: req.body });
    await logAudit(req.user?.userId, 'UPDATE', 'Testimonial', id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/testimonials/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.testimonial.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'Testimonial', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// PROCESS STEPS & FAQS
// -----------------------------------------------------------------------------
router.get('/process', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.processStep.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/process', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.processStep.create({ data: req.body });
    await logAudit(req.user?.userId, 'CREATE', 'ProcessStep', item.id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/process/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.processStep.update({ where: { id }, data: req.body });
    await logAudit(req.user?.userId, 'UPDATE', 'ProcessStep', id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/faqs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/faqs', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.fAQ.create({ data: req.body });
    await logAudit(req.user?.userId, 'CREATE', 'FAQ', item.id);
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// BLOG MANAGEMENT
// -----------------------------------------------------------------------------
router.get('/blog', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      include: { category: true },
      orderBy: { publishedAt: 'desc' }
    });
    return res.json({ success: true, data: posts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/blog', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await prisma.blogPost.create({ data: req.body });
    await logAudit(req.user?.userId, 'CREATE', 'BlogPost', post.id);
    return res.json({ success: true, data: post });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/blog/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const post = await prisma.blogPost.update({ where: { id }, data: req.body });
    await logAudit(req.user?.userId, 'UPDATE', 'BlogPost', id);
    return res.json({ success: true, data: post });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/blog/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.blogPost.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE', 'BlogPost', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// MEDIA LIBRARY & STORAGE PROVIDER API
// -----------------------------------------------------------------------------
router.get('/media', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.mediaItem.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/media/upload', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), uploadMemory.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const { valid, error } = validateUpload(req.file.buffer, req.file.originalname, req.file.mimetype);
    if (!valid) {
      return res.status(400).json({ success: false, error: { message: error || 'Upload validation failed' } });
    }

    const storage = getStorageProvider();
    const result = await storage.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    const mediaItem = await prisma.mediaItem.create({
      data: {
        filename: result.key,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: result.size,
        url: result.url,
        altText: req.body.altText || req.file.originalname
      }
    });

    await logAudit(req.user?.userId, 'UPLOAD_MEDIA', 'MediaItem', mediaItem.id);
    return res.json({ success: true, data: mediaItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/media/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const media = await prisma.mediaItem.findUnique({ where: { id } });
    if (!media) {
      return res.status(404).json({ success: false, error: { message: 'Media item not found' } });
    }

    const storage = getStorageProvider();
    await storage.deleteFile(media.filename);

    await prisma.mediaItem.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_MEDIA', 'MediaItem', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// NAVIGATION & MEGA MENU
// -----------------------------------------------------------------------------
router.get('/navigation', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const menus = await prisma.navigationMenu.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } }
    });
    return res.json({ success: true, data: menus });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/mega-menu', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const columns = await prisma.megaMenuColumn.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: columns });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// SITE SETTINGS & ANNOUNCEMENT BAR
// -----------------------------------------------------------------------------
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const announcement = await prisma.announcementBar.findUnique({ where: { id: 'default' } });
    return res.json({ success: true, data: { settings, announcement } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/settings', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body }
    });
    await logAudit(req.user?.userId, 'UPDATE_SETTINGS', 'SiteSettings', 'default');
    return res.json({ success: true, data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// LEADS & INQUIRIES MANAGEMENT
// -----------------------------------------------------------------------------
router.get('/leads/contact', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leads = await prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: leads });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/leads/contact/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    const lead = await prisma.contactSubmission.update({
      where: { id },
      data: { status, notes }
    });
    await logAudit(req.user?.userId, 'UPDATE_LEAD', 'ContactSubmission', id);
    return res.json({ success: true, data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/leads/enquiries', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const enquiries = await prisma.projectEnquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: enquiries });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/leads/enquiries/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    const enquiry = await prisma.projectEnquiry.update({
      where: { id },
      data: { status, notes }
    });
    await logAudit(req.user?.userId, 'UPDATE_ENQUIRY', 'ProjectEnquiry', id);
    return res.json({ success: true, data: enquiry });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/leads/subscribers', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: 'desc' } });
    return res.json({ success: true, data: subscribers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// USER MANAGEMENT & AUDIT LOGS (SUPER_ADMIN ONLY)
// -----------------------------------------------------------------------------
router.get('/users', requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/users', requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Name, email, and password required' } });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'User with email already exists' } });
    }

    const hash = await hashPassword(password);
    const newUser = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: hash,
        role: role || 'ADMIN',
        status: status || 'ACTIVE'
      }
    });

    await logAudit(req.user?.userId, 'CREATE_USER', 'AdminUser', newUser.id);
    return res.json({
      success: true,
      data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.put('/users/:id', requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, email, role, status, password } = req.body;

    const data: any = { name, email, role, status };
    if (password && password.length >= 8) {
      data.passwordHash = await hashPassword(password);
      data.tokenVersion = { increment: 1 };
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data
    });

    if (status === 'INACTIVE' || password) {
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isRevoked: true }
      });
    }

    await logAudit(req.user?.userId, 'UPDATE_USER', 'AdminUser', id);
    return res.json({ success: true, data: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, status: updated.status } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/audit-logs', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true, role: true } } }
    });
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
