import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { slugify } from '../utils/sanitizer.js';

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
// 1. CUSTOM FORMS CRUD
// -----------------------------------------------------------------------------

// GET /api/admin/forms - List all custom forms
router.get('/forms', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const forms = await prisma.customForm.findMany({
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, count: forms.length, data: forms });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/admin/forms/:id - Get form by ID
router.get('/forms/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const form = await prisma.customForm.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { submissions: true } }
      }
    });
    if (!form) return res.status(404).json({ success: false, error: { message: 'Form not found' } });
    return res.json({ success: true, data: form });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/admin/forms - Create a new custom form with fields
router.post('/forms', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      title,
      slug,
      description,
      successMessage,
      redirectUrl,
      notificationRecipients,
      notifyEmail,
      autoresponderEnabled = false,
      autoresponderSubject,
      autoresponderBody,
      spamProtection = true,
      isPublished = true,
      fields = []
    } = req.body;

    const formName = (name || title || '').trim();
    if (!formName) {
      return res.status(400).json({ success: false, error: { message: 'Form name is required' } });
    }

    const finalSlug = slugify(slug || formName);
    const existing = await prisma.customForm.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(409).json({ success: false, error: { message: 'Form slug already in use' } });
    }

    const form = await prisma.customForm.create({
      data: {
        name: formName,
        slug: finalSlug,
        description: description?.trim() || null,
        successMessage: successMessage?.trim() || 'Thank you for your submission.',
        redirectUrl: redirectUrl?.trim() || null,
        notificationRecipients: (notificationRecipients || notifyEmail)?.trim() || null,
        autoresponderEnabled: Boolean(autoresponderEnabled),
        autoresponderSubject: autoresponderSubject?.trim() || null,
        autoresponderBody: autoresponderBody?.trim() || null,
        spamProtection: Boolean(spamProtection),
        isPublished: Boolean(isPublished),
        fields: {
          create: fields.map((f: any, idx: number) => ({
            label: f.label || `Field ${idx + 1}`,
            name: slugify(f.name || f.label || `field_${idx + 1}`).replace(/-/g, '_'),
            type: f.type || 'TEXT',
            placeholder: f.placeholder || null,
            isRequired: Boolean(f.isRequired),
            helpText: f.helpText || null,
            optionsJson: Array.isArray(f.options) ? JSON.stringify(f.options) : (f.optionsJson || null),
            validationJson: f.validation ? JSON.stringify(f.validation) : (f.validationJson || null),
            sortOrder: f.sortOrder !== undefined ? f.sortOrder : idx
          }))
        }
      },
      include: { fields: true }
    });

    await logAudit(req.user?.userId, 'CREATE_CUSTOM_FORM', 'CustomForm', form.id);
    return res.status(201).json({ success: true, data: form });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/forms/:id - Update form & sync fields
router.put('/forms/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      name,
      title,
      slug,
      description,
      successMessage,
      redirectUrl,
      notificationRecipients,
      notifyEmail,
      autoresponderEnabled,
      autoresponderSubject,
      autoresponderBody,
      spamProtection,
      isPublished,
      fields
    } = req.body;

    const data: any = {};
    if (name !== undefined || title !== undefined) data.name = (name || title).trim();
    if (slug !== undefined) data.slug = slugify(slug);
    if (description !== undefined) data.description = description?.trim() || null;
    if (successMessage !== undefined) data.successMessage = successMessage?.trim() || null;
    if (redirectUrl !== undefined) data.redirectUrl = redirectUrl?.trim() || null;
    if (notificationRecipients !== undefined || notifyEmail !== undefined) {
      data.notificationRecipients = (notificationRecipients || notifyEmail)?.trim() || null;
    }
    if (autoresponderEnabled !== undefined) data.autoresponderEnabled = Boolean(autoresponderEnabled);
    if (autoresponderSubject !== undefined) data.autoresponderSubject = autoresponderSubject?.trim() || null;
    if (autoresponderBody !== undefined) data.autoresponderBody = autoresponderBody?.trim() || null;
    if (spamProtection !== undefined) data.spamProtection = Boolean(spamProtection);
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);

    if (Array.isArray(fields)) {
      await prisma.formField.deleteMany({ where: { formId: id } });
      await prisma.formField.createMany({
        data: fields.map((f: any, idx: number) => ({
          formId: id,
          label: f.label || `Field ${idx + 1}`,
          name: slugify(f.name || f.label || `field_${idx + 1}`).replace(/-/g, '_'),
          type: f.type || 'TEXT',
          placeholder: f.placeholder || null,
          isRequired: Boolean(f.isRequired),
          helpText: f.helpText || null,
          optionsJson: Array.isArray(f.options) ? JSON.stringify(f.options) : (f.optionsJson || null),
          validationJson: f.validation ? JSON.stringify(f.validation) : (f.validationJson || null),
          sortOrder: f.sortOrder !== undefined ? f.sortOrder : idx
        }))
      });
    }

    const updated = await prisma.customForm.update({
      where: { id },
      data,
      include: { fields: { orderBy: { sortOrder: 'asc' } } }
    });

    await logAudit(req.user?.userId, 'UPDATE_CUSTOM_FORM', 'CustomForm', id);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/admin/forms/:id
router.delete('/forms/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.customForm.delete({ where: { id } });
    await logAudit(req.user?.userId, 'DELETE_CUSTOM_FORM', 'CustomForm', id);
    return res.json({ success: true, data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 2. UNIFIED LEADS & SUBMISSIONS
// -----------------------------------------------------------------------------

// GET /api/admin/leads/unified - Combined view of all leads across touchpoints
router.get('/leads/unified', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const [contacts, enquiries, formSubs] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: status && typeof status === 'string' && status !== 'ALL' ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.projectEnquiry.findMany({
        where: status && typeof status === 'string' && status !== 'ALL' ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.formSubmissionRecord.findMany({
        where: status && typeof status === 'string' && status !== 'ALL' ? { status } : undefined,
        include: { customForm: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ]);

    const unified: any[] = [];

    for (const c of contacts) {
      unified.push({
        id: c.id,
        leadType: 'CONTACT',
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        website: c.website,
        source: c.sourcePage || 'Contact Page',
        status: c.status,
        assignedTo: c.assignedTo,
        notes: c.notes,
        utmSource: c.utmSource,
        utmMedium: c.utmMedium,
        utmCampaign: c.utmCampaign,
        utmTerm: c.utmTerm,
        utmContent: c.utmContent,
        landingPage: c.landingPage,
        referrer: c.referrer,
        timeline: c.timelineJson ? JSON.parse(c.timelineJson) : [],
        data: { subject: c.subject, message: c.message },
        createdAt: c.createdAt
      });
    }

    for (const e of enquiries) {
      unified.push({
        id: e.id,
        leadType: 'ENQUIRY',
        name: e.name,
        email: e.email,
        phone: e.phone,
        company: e.company,
        website: e.website,
        source: e.sourcePage || 'Audit Modal',
        status: e.status,
        assignedTo: e.assignedTo,
        notes: e.notes,
        utmSource: e.utmSource,
        utmMedium: e.utmMedium,
        utmCampaign: e.utmCampaign,
        utmTerm: e.utmTerm,
        utmContent: e.utmContent,
        landingPage: null,
        referrer: e.referrer,
        timeline: e.timelineJson ? JSON.parse(e.timelineJson) : [],
        data: { monthlySpend: e.monthlySpend, message: e.message, services: e.services },
        createdAt: e.createdAt
      });
    }

    for (const f of formSubs) {
      let parsedData: any = {};
      try { parsedData = JSON.parse(f.data); } catch {}
      unified.push({
        id: f.id,
        leadType: 'CUSTOM_FORM',
        name: parsedData.name || parsedData.fullName || 'Anonymous Submission',
        email: parsedData.email || 'N/A',
        phone: parsedData.phone || parsedData.tel || null,
        company: parsedData.company || null,
        website: parsedData.website || null,
        source: f.customForm?.name || f.formName,
        status: f.status,
        assignedTo: null,
        notes: f.notes,
        utmSource: f.utmSource,
        utmMedium: f.utmMedium,
        utmCampaign: f.utmCampaign,
        utmTerm: f.utmTerm,
        utmContent: f.utmContent,
        landingPage: f.landingPage,
        referrer: f.referrer,
        timeline: [],
        data: parsedData,
        createdAt: f.createdAt
      });
    }

    // Sort unified leads by createdAt desc
    unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let filtered = unified;
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = unified.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PUT /api/admin/leads/:id/status - Update lead status & append to timeline
router.put('/leads/:id/status', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, leadType, note } = req.body;

    const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'SPAM'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status code' } });
    }

    const timelineEvent = {
      type: 'STATUS_CHANGE',
      from: '',
      to: status,
      changedBy: req.user?.email || 'Admin',
      note: note || `Status updated to ${status}`,
      timestamp: new Date().toISOString()
    };

    if (leadType === 'ENQUIRY') {
      const existing = await prisma.projectEnquiry.findUnique({ where: { id } });
      const currentTimeline = existing?.timelineJson ? JSON.parse(existing.timelineJson) : [];
      timelineEvent.from = existing?.status || 'NEW';
      currentTimeline.push(timelineEvent);

      await prisma.projectEnquiry.update({
        where: { id },
        data: {
          status,
          timelineJson: JSON.stringify(currentTimeline)
        }
      });
    } else if (leadType === 'CUSTOM_FORM') {
      await prisma.formSubmissionRecord.update({
        where: { id },
        data: { status, notes: note || undefined }
      });
    } else {
      // Default ContactSubmission
      const existing = await prisma.contactSubmission.findUnique({ where: { id } });
      const currentTimeline = existing?.timelineJson ? JSON.parse(existing.timelineJson) : [];
      timelineEvent.from = existing?.status || 'NEW';
      currentTimeline.push(timelineEvent);

      await prisma.contactSubmission.update({
        where: { id },
        data: {
          status,
          timelineJson: JSON.stringify(currentTimeline)
        }
      });
    }

    await logAudit(req.user?.userId, 'UPDATE_LEAD_STATUS', 'Lead', id, { status, leadType });
    return res.json({ success: true, id, status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// 3. SECURE CSV EXPORT (No secrets, formula injection safe)
// -----------------------------------------------------------------------------

function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Protect against CSV formula injection (=, +, -, @, tab, cr)
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/admin/export/:entity - Export CSV for leads, forms, submissions, blog, pages, redirects, 404s
router.get('/export/:entity', requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entity = (req.params.entity as string).toLowerCase();
    let csvHeaders: string[] = [];
    let rows: string[][] = [];
    const filename = `digitalclik-${entity}-${new Date().toISOString().split('T')[0]}.csv`;

    if (entity === 'leads') {
      csvHeaders = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Company', 'Website', 'Source', 'Status', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Created At'];
      const [contacts, enquiries] = await Promise.all([
        prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.projectEnquiry.findMany({ orderBy: { createdAt: 'desc' } })
      ]);

      for (const c of contacts) {
        rows.push([
          c.id, 'Contact', c.name, c.email, c.phone || '', c.company || '', c.website || '',
          c.sourcePage || 'Contact Page', c.status, c.utmSource || '', c.utmMedium || '', c.utmCampaign || '', c.createdAt.toISOString()
        ]);
      }
      for (const e of enquiries) {
        rows.push([
          e.id, 'Enquiry', e.name, e.email, e.phone || '', e.company || '', e.website || '',
          e.sourcePage || 'Audit Modal', e.status, e.utmSource || '', e.utmMedium || '', e.utmCampaign || '', e.createdAt.toISOString()
        ]);
      }
    } else if (entity === 'pages') {
      csvHeaders = ['ID', 'Title', 'Slug', 'Status', 'Review Status', 'Meta Title', 'Meta Description', 'Created At', 'Published At'];
      const pages = await prisma.page.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
      for (const p of pages) {
        rows.push([
          p.id, p.title, `/${p.slug}`, p.status, p.reviewStatus, p.metaTitle || '', p.metaDescription || '',
          p.createdAt.toISOString(), p.publishedAt ? p.publishedAt.toISOString() : ''
        ]);
      }
    } else if (entity === 'blog') {
      csvHeaders = ['ID', 'Title', 'Slug', 'Category', 'Author', 'Status', 'Meta Title', 'Published At'];
      const posts = await prisma.blogPost.findMany({
        where: { deletedAt: null },
        include: { category: true, author: true },
        orderBy: { publishedAt: 'desc' }
      });
      for (const b of posts) {
        rows.push([
          b.id, b.title, `/blog/${b.slug}`, b.category?.name || 'General', b.author?.name || b.authorName,
          b.status, b.metaTitle || '', b.publishedAt.toISOString()
        ]);
      }
    } else if (entity === 'redirects') {
      csvHeaders = ['ID', 'Source Path', 'Target Path', 'Status Code', 'Active', 'Hit Count', 'Last Hit At'];
      const redirects = await prisma.redirect.findMany({ orderBy: { hitCount: 'desc' } });
      for (const r of redirects) {
        rows.push([
          r.id, r.sourcePath, r.targetPath, String(r.statusCode), String(r.isActive),
          String(r.hitCount), r.lastHitAt ? r.lastHitAt.toISOString() : ''
        ]);
      }
    } else if (entity === '404s') {
      csvHeaders = ['ID', 'Path', 'Hit Count', 'First Seen', 'Last Seen', 'Resolved', 'Ignored', 'Referrer'];
      const logs = await prisma.notFoundLog.findMany({ orderBy: { count: 'desc' } });
      for (const l of logs) {
        rows.push([
          l.id, l.path, String(l.count), l.firstSeen.toISOString(), l.lastSeen.toISOString(),
          String(l.isResolved), String(l.isIgnored), l.referrer || ''
        ]);
      }
    } else {
      return res.status(400).json({ success: false, error: { message: `Export entity '${entity}' not supported` } });
    }

    const csvContent = [
      csvHeaders.map(sanitizeCsvCell).join(','),
      ...rows.map(row => row.map(sanitizeCsvCell).join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
