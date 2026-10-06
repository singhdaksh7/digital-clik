import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { formRateLimiter, publicRateLimiter } from '../middleware/rateLimiter.js';
import { sendNotificationEmail } from '../utils/mailer.js';

const router = Router();

// Apply public rate limiter
router.use(publicRateLimiter());

// -----------------------------------------------------------------------------
// 1. HEALTH CHECK & SITEMAP / ROBOTS
// -----------------------------------------------------------------------------
router.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'ok',
      service: 'DigitalClik API',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err: any) {
    return res.status(503).json({
      status: 'error',
      service: 'DigitalClik API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database query failed'
    });
  }
});

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://digitalclik.com';

    const services = await prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    });

    const industries = await prisma.industry.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    });

    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    });

    const caseStudies = await prisma.caseStudy.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    });

    const blogPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    });

    const staticRoutes = ['', '/services', '/industries', '/work', '/process', '/about', '/blog', '/contact'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url><loc>${baseUrl}${route}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    for (const item of services) {
      xml += `  <url><loc>${baseUrl}/services/${item.slug}</loc><lastmod>${item.updatedAt.toISOString()}</lastmod><priority>0.9</priority></url>\n`;
    }

    for (const item of industries) {
      xml += `  <url><loc>${baseUrl}/industries/${item.slug}</loc><lastmod>${item.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>\n`;
    }

    for (const item of projects) {
      xml += `  <url><loc>${baseUrl}/work/${item.slug}</loc><lastmod>${item.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>\n`;
    }

    for (const item of caseStudies) {
      xml += `  <url><loc>${baseUrl}/case-studies/${item.slug}</loc><lastmod>${item.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>\n`;
    }

    for (const item of blogPosts) {
      xml += `  <url><loc>${baseUrl}/blog/${item.slug}</loc><lastmod>${item.updatedAt.toISOString()}</lastmod><priority>0.7</priority></url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (err: any) {
    return res.status(500).send('Error generating sitemap');
  }
});

router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://digitalclik.com';
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nDisallow: /preview\n\nSitemap: ${baseUrl}/sitemap.xml`;
  res.header('Content-Type', 'text/plain');
  return res.send(robots);
});

// -----------------------------------------------------------------------------
// 2. PUBLIC SITE CONFIGURATION & NAVIGATION
// -----------------------------------------------------------------------------
router.get('/site-settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const announcement = await prisma.announcementBar.findUnique({ where: { id: 'default' } });
    return res.json({
      success: true,
      data: {
        settings: settings || {},
        announcement: announcement || {}
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/navigation', async (req: Request, res: Response) => {
  try {
    const menus = await prisma.navigationMenu.findMany({
      include: {
        items: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    const megaColumns = await prisma.megaMenuColumn.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({
      success: true,
      data: {
        menus,
        megaColumns
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 3. HOMEPAGE & CONTENT ENDPOINTS
// -----------------------------------------------------------------------------
router.get('/homepage', async (req: Request, res: Response) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' }
    });

    const heroMedia = await prisma.heroMedia.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' }
    });

    const services = await prisma.service.findMany({
      where: { status: 'PUBLISHED', featured: true },
      orderBy: { homepageOrder: 'asc' }
    });

    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED', featuredOnHomepage: true },
      orderBy: { homepageSortOrder: 'asc' }
    });

    const processSteps = await prisma.processStep.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' }
    });

    const industries = await prisma.industry.findMany({
      where: { status: 'PUBLISHED', featured: true },
      orderBy: { homepageOrder: 'asc' }
    });

    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'PUBLISHED', featured: true },
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({
      success: true,
      data: {
        sections,
        heroMedia,
        services,
        projects,
        processSteps,
        industries,
        testimonials
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/services', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: services });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/services/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!service || service.status !== 'PUBLISHED') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
    }

    return res.json({ success: true, data: service });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/industries', async (req: Request, res: Response) => {
  try {
    const industries = await prisma.industry.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: industries });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/industries/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const industry = await prisma.industry.findUnique({ where: { slug } });
    if (!industry || industry.status !== 'PUBLISHED') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Industry not found' } });
    }
    return res.json({ success: true, data: industry });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/projects', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { sortOrder: 'asc' },
      include: { gallery: { orderBy: { sortOrder: 'asc' } } }
    });
    return res.json({ success: true, data: projects });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/projects/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const project = await prisma.project.findUnique({
      where: { slug },
      include: { gallery: { orderBy: { sortOrder: 'asc' } } }
    });
    if (!project || project.status !== 'PUBLISHED') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    return res.json({ success: true, data: project });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/case-studies', async (req: Request, res: Response) => {
  try {
    const cases = await prisma.caseStudy.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: cases });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/case-studies/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const item = await prisma.caseStudy.findUnique({
      where: { slug },
      include: { sections: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } }
    });
    if (!item || item.status !== 'PUBLISHED') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case Study not found' } });
    }
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/blog', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' }
    });
    return res.json({ success: true, data: posts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/blog/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true }
    });
    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } });
    }
    return res.json({ success: true, data: post });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const items = await prisma.testimonial.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/process', async (req: Request, res: Response) => {
  try {
    const items = await prisma.processStep.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/faqs', async (req: Request, res: Response) => {
  try {
    const items = await prisma.fAQ.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 4. FORM SUBMISSIONS (WITH HONEYPOT & SMTP FAILURE SAFETY)
// -----------------------------------------------------------------------------
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5),
  sourcePage: z.string().optional(),
  hp: z.string().optional() // Honeypot
});

router.post('/contact', formRateLimiter(), async (req: Request, res: Response) => {
  try {
    // Honeypot check
    if (req.body.hp || req.body.website_hp) {
      console.warn('🤖 Bot honeypot caught contact submission');
      return res.json({ success: true, data: { message: 'Submission received' } });
    }

    const parsed = contactSchema.parse(req.body);
    const { hp, ...data } = parsed;

    const submission = await prisma.contactSubmission.create({
      data
    });

    // Safe email notification
    sendNotificationEmail({
      to: process.env.NOTIFICATION_EMAIL || 'hello@digitalclik.com',
      subject: `[New Lead] Contact Form: ${submission.name}`,
      html: `<p>New contact submission received from <strong>${submission.name}</strong> (${submission.email}).</p><p>Message: ${submission.message}</p>`
    }).catch(e => console.error('Email notify background error:', e));

    return res.json({ success: true, data: submission });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
});

const auditSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().min(3),
  services: z.array(z.string()).optional(),
  monthlySpend: z.string().optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional(),
  hp: z.string().optional() // Honeypot
});

router.post('/project-enquiries', formRateLimiter(), async (req: Request, res: Response) => {
  try {
    if (req.body.hp || req.body.website_hp) {
      console.warn('🤖 Bot honeypot caught project enquiry submission');
      return res.json({ success: true, data: { message: 'Submission received' } });
    }

    const parsed = auditSchema.parse(req.body);
    const enquiry = await prisma.projectEnquiry.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        company: parsed.company,
        website: parsed.website,
        services: parsed.services ? JSON.stringify(parsed.services) : undefined,
        monthlySpend: parsed.monthlySpend,
        message: parsed.message,
        sourcePage: parsed.sourcePage
      }
    });

    sendNotificationEmail({
      to: process.env.NOTIFICATION_EMAIL || 'hello@digitalclik.com',
      subject: `[New Lead] Audit Request: ${enquiry.name}`,
      html: `<p>New audit/project enquiry from <strong>${enquiry.name}</strong> (${enquiry.email}) for website <strong>${enquiry.website}</strong>.</p>`
    }).catch(e => console.error('Email notify background error:', e));

    return res.json({ success: true, data: enquiry });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/newsletter', formRateLimiter(), async (req: Request, res: Response) => {
  try {
    if (req.body.hp) {
      return res.json({ success: true, data: { message: 'Subscribed' } });
    }

    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: { message: 'Valid email required' } });
    }

    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { status: 'SUBSCRIBED' },
      create: { email }
    });

    return res.json({ success: true, data: sub });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
