import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { formRateLimiter, publicRateLimiter } from '../middleware/rateLimiter.js';
import { sendNotificationEmail } from '../utils/mailer.js';
import { dispatchWebhook } from '../utils/webhook.js';

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

    // Dynamic Pages (Only published and indexable)
    const dynamicPages = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        isIndexable: true,
        noIndex: false
      },
      select: { slug: true, updatedAt: true }
    });

    for (const page of dynamicPages) {
      xml += `  <url><loc>${baseUrl}/${page.slug}</loc><lastmod>${page.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>\n`;
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
    const { category, tag } = req.query;
    const where: any = { status: 'PUBLISHED' };
    if (category && typeof category === 'string') {
      where.category = { slug: category };
    }
    if (tag && typeof tag === 'string') {
      where.tags = { some: { tag: { slug: tag } } };
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } }
      },
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
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } }
      }
    });
    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } });
    }
    return res.json({ success: true, data: post });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/blog-categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/blog-tags', async (req: Request, res: Response) => {
  try {
    const tags = await prisma.blogTag.findMany({
      include: { _count: { select: { posts: { where: { blogPost: { status: 'PUBLISHED' } } } } } },
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: tags });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get(['/search', '/public/search'], async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const [pages, services, projects, blogPosts] = await Promise.all([
      prisma.page.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { metaDescription: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 8,
        select: { id: true, title: true, slug: true, metaDescription: true }
      }),
      prisma.service.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { shortDescription: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 8,
        select: { id: true, title: true, slug: true, shortDescription: true }
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 8,
        select: { id: true, title: true, slug: true, description: true }
      }),
      prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 8,
        select: { id: true, title: true, slug: true, excerpt: true }
      })
    ]);

    const results = [
      ...pages.map(p => ({ type: 'page', title: p.title, url: `/${p.slug}`, description: p.metaDescription })),
      ...services.map(s => ({ type: 'service', title: s.title, url: `/services/${s.slug}`, description: s.shortDescription })),
      ...projects.map(p => ({ type: 'project', title: p.title, url: `/work/${p.slug}`, description: p.description })),
      ...blogPosts.map(b => ({ type: 'blog', title: b.title, url: `/blog/${b.slug}`, description: b.excerpt }))
    ];

    return res.json({ success: true, count: results.length, data: results });
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
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  landingPage: z.string().optional(),
  referrer: z.string().optional(),
  hp: z.string().optional() // Honeypot
});

router.post('/contact', formRateLimiter(), async (req: Request, res: Response) => {
  try {
    // Honeypot check
    if (req.body.hp || req.body.website_hp) {
      console.warn('Bot honeypot caught contact submission');
      return res.json({ success: true, data: { message: 'Submission received' } });
    }

    const parsed = contactSchema.parse(req.body);
    const { hp, utm_source, utm_medium, utm_campaign, utm_term, utm_content, landingPage, referrer, ...data } = parsed;

    const submission = await prisma.contactSubmission.create({
      data: {
        ...data,
        utmSource: utm_source || null,
        utmMedium: utm_medium || null,
        utmCampaign: utm_campaign || null,
        utmTerm: utm_term || null,
        utmContent: utm_content || null,
        landingPage: landingPage || null,
        referrer: referrer || (req.headers.referer as string) || null,
        timelineJson: JSON.stringify([
          { type: 'LEAD_CREATED', source: data.sourcePage || 'Contact Page', timestamp: new Date().toISOString() }
        ])
      }
    });

    // Notify admins via in-app alert
    await prisma.adminNotification.create({
      data: {
        type: 'LEAD_RECEIVED',
        title: 'New Contact Submission',
        message: `${submission.name} (${submission.email}) submitted a message.`,
        link: '/admin?tab=leads'
      }
    }).catch(() => {});

    // Safe email notification
    sendNotificationEmail({
      to: process.env.NOTIFICATION_EMAIL || 'hello@digitalclik.com',
      subject: `[New Lead] Contact Form: ${submission.name}`,
      html: `<p>New contact submission received from <strong>${submission.name}</strong> (${submission.email}).</p><p>Message: ${submission.message}</p>`
    }).catch(e => console.error('Email notify background error:', e));

    dispatchWebhook('LEAD_CREATED', {
      type: 'contact',
      id: submission.id,
      name: submission.name,
      email: submission.email,
      phone: submission.phone || undefined,
      subject: submission.subject || undefined,
      createdAt: submission.createdAt
    }).catch(e => console.error('Webhook notify background error:', e));

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
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  referrer: z.string().optional(),
  hp: z.string().optional() // Honeypot
});

router.post('/project-enquiries', formRateLimiter(), async (req: Request, res: Response) => {
  try {
    if (req.body.hp || req.body.website_hp) {
      console.warn('Bot honeypot caught project enquiry submission');
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
        sourcePage: parsed.sourcePage,
        utmSource: parsed.utm_source || null,
        utmMedium: parsed.utm_medium || null,
        utmCampaign: parsed.utm_campaign || null,
        utmTerm: parsed.utm_term || null,
        utmContent: parsed.utm_content || null,
        referrer: parsed.referrer || (req.headers.referer as string) || null,
        timelineJson: JSON.stringify([
          { type: 'LEAD_CREATED', source: parsed.sourcePage || 'Audit Modal', timestamp: new Date().toISOString() }
        ])
      }
    });

    await prisma.adminNotification.create({
      data: {
        type: 'LEAD_RECEIVED',
        title: 'New Project Audit Request',
        message: `${enquiry.name} (${enquiry.email}) requested project consultation for ${enquiry.website}.`,
        link: '/admin?tab=leads'
      }
    }).catch(() => {});

    sendNotificationEmail({
      to: process.env.NOTIFICATION_EMAIL || 'hello@digitalclik.com',
      subject: `[New Lead] Audit Request: ${enquiry.name}`,
      html: `<p>New audit/project enquiry from <strong>${enquiry.name}</strong> (${enquiry.email}) for website <strong>${enquiry.website}</strong>.</p>`
    }).catch(e => console.error('Email notify background error:', e));

    dispatchWebhook('LEAD_CREATED', {
      type: 'project_enquiry',
      id: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      website: enquiry.website,
      monthlySpend: enquiry.monthlySpend,
      createdAt: enquiry.createdAt
    }).catch(e => console.error('Webhook notify background error:', e));

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

// POST /api/forms/submit - Dynamic custom form submission & UTM attribution
router.post(['/forms/submit', '/public/forms/submit'], formRateLimiter(), async (req: Request, res: Response) => {
  try {
    const {
      formId,
      formName = 'Custom Form',
      pageSlug,
      hp,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      landingPage,
      referrer,
      ...fields
    } = req.body;

    // Honeypot check
    if (hp) {
      return res.json({ success: true, message: 'Form submitted successfully' });
    }

    // If linked to a custom form, validate required fields
    if (formId) {
      const customForm = await prisma.customForm.findUnique({
        where: { id: formId },
        include: { fields: true }
      });
      if (customForm) {
        for (const f of customForm.fields) {
          if (f.isRequired && (!fields[f.name] || !String(fields[f.name]).trim())) {
            return res.status(400).json({ success: false, error: { message: `Field "${f.label}" is required` } });
          }
        }
      }
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const submission = await prisma.formSubmissionRecord.create({
      data: {
        formName: String(formName),
        customForm: formId ? { connect: { id: formId } } : undefined,
        pageSlug: pageSlug ? String(pageSlug) : null,
        data: JSON.stringify(fields),
        status: 'NEW',
        clientIp: String(clientIp),
        userAgent: String(userAgent),
        utmSource: utm_source || null,
        utmMedium: utm_medium || null,
        utmCampaign: utm_campaign || null,
        utmTerm: utm_term || null,
        utmContent: utm_content || null,
        landingPage: landingPage || null,
        referrer: referrer || (req.headers.referer as string) || null
      }
    });

    // Unify into leads if email is present
    if (fields.email && typeof fields.email === 'string' && fields.email.includes('@')) {
      const name = fields.name || fields.fullName || fields.firstName || 'Inquiry Contact';
      await prisma.contactSubmission.create({
        data: {
          name: String(name),
          email: fields.email.trim(),
          phone: fields.phone ? String(fields.phone) : null,
          company: fields.company ? String(fields.company) : null,
          subject: `Form: ${formName}`,
          message: JSON.stringify(fields),
          sourcePage: pageSlug ? `/${pageSlug}` : formName,
          status: 'NEW',
          utmSource: utm_source || null,
          utmMedium: utm_medium || null,
          utmCampaign: utm_campaign || null,
          utmTerm: utm_term || null,
          utmContent: utm_content || null,
          landingPage: landingPage || null,
          referrer: referrer || (req.headers.referer as string) || null,
          timelineJson: JSON.stringify([
            { type: 'FORM_SUBMISSION', formName, timestamp: new Date().toISOString() }
          ])
        }
      }).catch(() => {});
    }

    // In-app alert for admins
    await prisma.adminNotification.create({
      data: {
        type: 'FORM_SUBMITTED',
        title: `New Form Submission: ${formName}`,
        message: `Received new entry for form "${formName}".`,
        link: '/admin?tab=form-submissions'
      }
    }).catch(() => {});

    sendNotificationEmail({
      to: process.env.NOTIFICATION_EMAIL || 'hello@digitalclik.com',
      subject: `[New Submission] ${formName} on /${pageSlug || 'site'}`,
      html: `<p>New form submission received for <strong>${formName}</strong>:</p><pre>${JSON.stringify(fields, null, 2)}</pre>`
    }).catch(() => {});

    dispatchWebhook('FORM_SUBMITTED', {
      id: submission.id,
      formName: submission.formName,
      pageSlug: submission.pageSlug,
      data: fields,
      createdAt: submission.createdAt
    }).catch(() => {});

    return res.status(201).json({ success: true, data: submission });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// DYNAMIC PAGES (PUBLIC RESOLVER & PREVIEW)
// -----------------------------------------------------------------------------

// GET /api/pages/preview/:id?token=... - Preview unpublished drafts securely
router.get('/pages/preview/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const token = req.query.token as string | undefined;

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ success: false, error: { message: 'Preview token required' } });
    }

    const { verifyPreviewToken } = await import('./adminPages.js');
    if (!verifyPreviewToken(id, token)) {
      return res.status(403).json({ success: false, error: { message: 'Invalid or expired preview token' } });
    }

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }

    return res.json({ success: true, data: page, isPreview: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/pages/:slug - Fetch published page with visible blocks
router.get('/pages/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    // Check if path has a 301/302 redirect configured
    const redirect = await prisma.redirect.findFirst({
      where: {
        sourcePath: { in: [`/${slug}`, slug] },
        isActive: true
      }
    });

    if (redirect) {
      return res.json({
        success: true,
        redirect: {
          targetPath: redirect.targetPath,
          statusCode: redirect.statusCode
        }
      });
    }

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!page || page.status !== 'PUBLISHED' || page.deletedAt) {
      // Clean path, remove query parameters, detect bot noise
      const cleanPath = `/${slug.split('?')[0].toLowerCase()}`;
      const isBotNoise = /(\.php|wp-|cgi-bin|setup\.cgi|\.env|\.git|eval-stdin|xmlrpc)/i.test(cleanPath);

      prisma.notFoundLog.upsert({
        where: { path: cleanPath },
        update: { count: { increment: 1 }, lastSeen: new Date(), isIgnored: isBotNoise },
        create: {
          path: cleanPath,
          referrer: (req.headers.referer as string) || null,
          isIgnored: isBotNoise
        }
      }).catch(() => {});

      return res.status(404).json({ success: false, error: { message: 'Page not found or unpublished' } });
    }

    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
