import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting safe copy update for DigitalClik CMS database...');

  // 1. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      companyName: 'DigitalClik',
      shortName: 'DigitalClik Studio',
      address: 'DigitalClik Studio',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
      businessHours: 'Mon-Sat: 10:00 AM - 7:00 PM IST',
      defaultMetaTitle: 'DigitalClik | Websites, Software & Digital Services',
      defaultMetaDescription: 'DigitalClik builds websites, custom software, workflow automation and digital content for businesses that need one reliable team to handle the work.'
    },
    create: {
      id: 'default',
      companyName: 'DigitalClik',
      shortName: 'DigitalClik Studio',
      email: 'hello@digitalclik.com',
      phone: '+1 (800) 555-CLIK',
      whatsapp: '+18005552545',
      address: 'DigitalClik Studio',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
      businessHours: 'Mon-Sat: 10:00 AM - 7:00 PM IST',
      defaultMetaTitle: 'DigitalClik | Websites, Software & Digital Services',
      defaultMetaDescription: 'DigitalClik builds websites, custom software, workflow automation and digital content for businesses that need one reliable team to handle the work.'
    }
  });
  console.log('✅ SiteSettings updated');

  // 2. Announcement Bar
  await prisma.announcementBar.upsert({
    where: { id: 'default' },
    update: {
      text: 'Websites, custom software, automations and digital content built for real business needs.',
      linkText: 'TALK TO US ↗',
      linkUrl: '#contact'
    },
    create: {
      id: 'default',
      enabled: true,
      text: 'Websites, custom software, automations and digital content built for real business needs.',
      linkText: 'TALK TO US ↗',
      linkUrl: '#contact'
    }
  });
  console.log('✅ AnnouncementBar updated');

  // 3. Homepage Sections
  const sectionsData = [
    {
      sectionKey: 'HERO',
      title: 'Hero Section',
      eyebrow: 'DIGITAL STUDIO & EXECUTION TEAM',
      subtitle: 'Websites, custom software, automations and digital content built around how your business actually works.',
      content: 'DigitalClik designs, builds and manages the digital side of your business — from websites to custom software, automations and day-to-day content.',
      sortOrder: 1,
      isVisible: true
    },
    {
      sectionKey: 'MANIFESTO',
      title: 'Brand Manifesto',
      eyebrow: 'OUR APPROACH',
      subtitle: 'GOOD DESIGN IS USELESS IF THE BUSINESS BEHIND IT STILL FEELS SLOW.',
      content: 'A website is only one piece of the puzzle. If your internal workflows are slow, your leads are scattered across WhatsApp chats, or your tools do not connect, design alone will not fix it. We build the complete system behind your digital presence.',
      sortOrder: 2,
      isVisible: true
    },
    {
      sectionKey: 'SERVICES',
      title: 'Our Core Service Capabilities',
      eyebrow: 'WHAT WE DO',
      subtitle: 'We design, build and manage the digital side of your business — from websites to custom software, automations and content.',
      content: 'We bring design, development, business workflows and content execution under one accountable team.',
      sortOrder: 3,
      isVisible: true
    },
    {
      sectionKey: 'FEATURED_WORK',
      title: 'Recent Projects',
      eyebrow: 'SELECTED WORK',
      subtitle: 'Websites, custom software, automations and digital content built for real business needs.',
      content: 'A sample of client systems, internal tools, and digital platforms we have delivered.',
      sortOrder: 4,
      isVisible: true
    },
    {
      sectionKey: 'PROCESS',
      title: 'How We Work',
      eyebrow: 'OUR PROCESS',
      subtitle: 'A straightforward, stage-by-stage process so you always know what is being built, why, and what comes next.',
      content: 'Disciplined delivery from initial scope to ongoing updates.',
      sortOrder: 5,
      isVisible: true
    },
    {
      sectionKey: 'INDUSTRIES',
      title: 'Industries We Work With',
      eyebrow: 'WHO WE WORK WITH',
      subtitle: 'From local businesses to fast-growing firms, we build the digital systems that keep operations moving.',
      content: 'Practical digital systems tailored to how your industry operates.',
      sortOrder: 6,
      isVisible: true
    },
    {
      sectionKey: 'TESTIMONIALS',
      title: 'How We Operate',
      eyebrow: 'OUR COMMITMENT',
      subtitle: 'WE PREFER SHOWING THE WORK.',
      content: 'Every project starts with a different problem. Our job is to understand it properly, build what is actually needed, and stay involved until it works.',
      sortOrder: 7,
      isVisible: true
    },
    {
      sectionKey: 'CTA',
      title: 'Start a Project',
      eyebrow: 'GET IN TOUCH',
      subtitle: 'Have a project in mind? Tell us what you are trying to build.',
      content: 'Websites, software, automation and digital content — built around how your business works.',
      sortOrder: 8,
      isVisible: true
    }
  ];

  for (const sec of sectionsData) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: sec.sectionKey },
      update: sec,
      create: sec
    });
  }
  console.log('✅ HomepageSections updated');

  // 4. Hero Media Wall Items
  await prisma.heroMedia.deleteMany();
  const heroMediaItems = [
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', altText: 'Websites & Web Apps', label: 'WEBSITES & WEB APPS', sortOrder: 1, isVisible: true },
    { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', altText: 'Custom Software & Tools', label: 'CUSTOM SOFTWARE & TOOLS', sortOrder: 2, isVisible: true },
    { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80', altText: 'Content & Social Creative', label: 'CONTENT & SOCIAL CREATIVE', sortOrder: 3, isVisible: true }
  ];
  for (const item of heroMediaItems) {
    await prisma.heroMedia.create({ data: item });
  }
  console.log('✅ HeroMedia items updated');

  // 5. Services
  // Cleanly replace previous 6 services with updated human-toned services
  await prisma.service.deleteMany();
  const newServices = [
    {
      code: '01',
      title: 'Website Development',
      slug: 'website-development',
      categoryLabel: 'WEBSITES & WEB APPS',
      shortDescription: 'Fast, responsive business websites, landing pages and web apps built around your brand, your content, and the actual customer journey.',
      metric: 'Clean Code & Fast Loads',
      capabilities: JSON.stringify(['Business & Corporate Websites', 'High-Converting Landing Pages', 'Custom CMS & Content Management', 'Mobile Responsive & Core Web Vitals']),
      featured: true,
      homepageOrder: 1,
      sortOrder: 1,
      status: 'PUBLISHED'
    },
    {
      code: '02',
      title: 'Custom Software & CRM',
      slug: 'custom-software-crm',
      categoryLabel: 'INTERNAL TOOLS & PORTALS',
      shortDescription: 'Internal tools, admin dashboards, portals and custom CRM/ERP systems tailored to the exact way your team operates day-to-day.',
      metric: 'Built for Your Workflow',
      capabilities: JSON.stringify(['Custom CRM & Lead Tracking', 'Admin Dashboards & Portals', 'Role-Based Access & Data Tables', 'Inventory & Operations Management']),
      featured: true,
      homepageOrder: 2,
      sortOrder: 2,
      status: 'PUBLISHED'
    },
    {
      code: '03',
      title: 'Business Automation',
      slug: 'business-automation',
      categoryLabel: 'WORKFLOWS & INTEGRATIONS',
      shortDescription: 'If your team is manually copying leads between WhatsApp, Google Sheets, and email, that is exactly what we connect and automate.',
      metric: 'Zero Manual Busywork',
      capabilities: JSON.stringify(['WhatsApp & Email Lead Alerts', 'CRM & Spreadsheet Sync', 'Form & Notification Workflows', 'API Integrations & Webhooks']),
      featured: true,
      homepageOrder: 3,
      sortOrder: 3,
      status: 'PUBLISHED'
    },
    {
      code: '04',
      title: 'E-Commerce Systems',
      slug: 'ecommerce-systems',
      categoryLabel: 'STOREFRONTS & PAYMENTS',
      shortDescription: 'Online stores and catalogue platforms designed for smooth browsing, fast checkout, reliable payment gateways, and straightforward order management.',
      metric: 'Smooth Checkout Flows',
      capabilities: JSON.stringify(['Custom Storefronts & Catalogues', 'Payment Gateway Integration', 'Order Flow & Cart Experience', 'B2B Wholesale & Pricing Rules']),
      featured: true,
      homepageOrder: 4,
      sortOrder: 4,
      status: 'PUBLISHED'
    },
    {
      code: '05',
      title: 'Search & Visibility (SEO)',
      slug: 'search-visibility-seo',
      categoryLabel: 'SEARCH & LOCAL DISCOVERY',
      shortDescription: 'Clean technical SEO, on-page structure, speed optimization, and local search visibility so potential clients can actually find you on Google.',
      metric: 'Clean Search Structure',
      capabilities: JSON.stringify(['Technical & On-Page SEO', 'Google Business Profile & Local SEO', 'Speed & Mobile Optimization', 'Search Analytics & Clear Reporting']),
      featured: true,
      homepageOrder: 5,
      sortOrder: 5,
      status: 'PUBLISHED'
    },
    {
      code: '06',
      title: 'Social Media & Content',
      slug: 'social-media-content',
      categoryLabel: 'CONTENT & VIDEO EDITING',
      shortDescription: 'Content planning, reels, video edits, graphic posts and regular publishing for brands that want consistent social presence without freelancer chaos.',
      metric: 'Consistent Execution',
      capabilities: JSON.stringify(['Reel Editing & Short-Form Video', 'Post Design & Content Calendars', 'Page & Profile Management', 'Ad Creative & Launch Support']),
      featured: true,
      homepageOrder: 6,
      sortOrder: 6,
      status: 'PUBLISHED'
    }
  ];

  for (const svc of newServices) {
    await prisma.service.create({ data: svc });
  }
  console.log('✅ Services updated');

  // 6. Industries
  await prisma.industry.deleteMany();
  const newIndustries = [
    { code: '01', name: 'REAL ESTATE', slug: 'real-estate', shortDescription: 'Property listing portals, broker CRMs, lead capture workflows and project landing pages.', featured: true, homepageOrder: 1, sortOrder: 1 },
    { code: '02', name: 'HEALTHCARE', slug: 'healthcare', shortDescription: 'Patient booking systems, clinic websites, doctor schedules and local search presence.', featured: true, homepageOrder: 2, sortOrder: 2 },
    { code: '03', name: 'E-COMMERCE & RETAIL', slug: 'e-commerce', shortDescription: 'Online stores, catalogue management, payment setup and inventory sync.', featured: true, homepageOrder: 3, sortOrder: 3 },
    { code: '04', name: 'EDUCATION', slug: 'education', shortDescription: 'Course enquiry pages, student portals, school websites and admission forms.', featured: true, homepageOrder: 4, sortOrder: 4 },
    { code: '05', name: 'PROFESSIONAL SERVICES', slug: 'professional-services', shortDescription: 'Firm websites, case inquiry forms, client portals and local search visibility.', featured: true, homepageOrder: 5, sortOrder: 5 },
    { code: '06', name: 'STARTUPS & GROWING BUSINESSES', slug: 'startups', shortDescription: 'MVPs, internal dashboards, custom web apps and workflow automation.', featured: true, homepageOrder: 6, sortOrder: 6 }
  ];

  for (const ind of newIndustries) {
    await prisma.industry.create({ data: ind });
  }
  console.log('✅ Industries updated');

  // 7. Projects (Grounded, realistic, zero fake lifts)
  await prisma.project.deleteMany();
  const newProjects = [
    {
      title: 'Custom Lead Management & Property Portal',
      slug: 'commercial-property-crm',
      client: 'Real Estate Sales Team',
      category: 'PROPERTY CRM & PORTAL',
      year: '2026',
      metric: 'Lead Workflow & CRM',
      layout: 'full',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      summary: 'Centralized property CRM and listing portal built for a real estate sales team to manage incoming inquiries, client requirements, follow-ups, and site visits in one place.',
      deliverables: JSON.stringify(['Custom CRM Dashboard', 'WhatsApp Lead Capture', 'Client Follow-up Tracker', 'Responsive Property Portal']),
      featuredOnHomepage: true,
      homepageSortOrder: 1,
      sortOrder: 1,
      status: 'PUBLISHED'
    },
    {
      title: 'Clinic Booking & Patient Records Dashboard',
      slug: 'clinic-booking-system',
      client: 'Diagnostic & Clinic Network',
      category: 'PATIENT BOOKING WEB APP',
      year: '2025',
      metric: 'Direct Booking System',
      layout: 'split',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      summary: 'Fast patient scheduling interface and clinic management dashboard allowing front-desk staff and patients to coordinate appointments without manual phone tag.',
      deliverables: JSON.stringify(['Appointment Scheduling Engine', 'Doctor Slot Management', 'Automated SMS/WhatsApp Confirmations', 'Admin Reception Panel']),
      featuredOnHomepage: true,
      homepageSortOrder: 2,
      sortOrder: 2,
      status: 'PUBLISHED'
    },
    {
      title: 'Custom Shopify Storefront & Social Content Engine',
      slug: 'apparel-storefront-content',
      client: 'Direct-to-Consumer Apparel Brand',
      category: 'STOREFRONT & CONTENT',
      year: '2025',
      metric: 'Storefront & Content',
      layout: 'bleed',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
      summary: 'Custom storefront rebuild paired with weekly reel production, product photography edits, and catalogue management to support seasonal drops.',
      deliverables: JSON.stringify(['Custom Shopify Storefront', 'Payment Gateway Integration', 'Short-Form Video Production', 'Weekly Post & Reel Calendars']),
      featuredOnHomepage: true,
      homepageSortOrder: 3,
      sortOrder: 3,
      status: 'PUBLISHED'
    }
  ];

  for (const proj of newProjects) {
    await prisma.project.create({ data: proj });
  }
  console.log('✅ Projects updated');

  // 8. Process Steps
  await prisma.processStep.deleteMany();
  const newProcessSteps = [
    { num: '01', title: 'UNDERSTAND', subtitle: 'Scope & Workflow Mapping', description: 'We start with how your business works, what is broken, and what the final system actually needs to do.', sortOrder: 1, isVisible: true },
    { num: '02', title: 'PLAN', subtitle: 'Architecture & Priorities', description: 'We map pages, features, workflows and priorities before development starts.', sortOrder: 2, isVisible: true },
    { num: '03', title: 'DESIGN', subtitle: 'UI/UX & Prototypes', description: 'We design clean, modern interfaces that are easy to use and look sharp on every screen.', sortOrder: 3, isVisible: true },
    { num: '04', title: 'BUILD', subtitle: 'Clean Full-Stack Development', description: 'We develop in stages, test properly and keep you involved throughout.', sortOrder: 4, isVisible: true },
    { num: '05', title: 'LAUNCH', subtitle: 'Testing & Go-Live', description: 'We handle deployment, domains, integrations and final checks.', sortOrder: 5, isVisible: true },
    { num: '06', title: 'IMPROVE', subtitle: 'Ongoing Support', description: 'We stay available for updates, fixes and the next version.', sortOrder: 6, isVisible: true }
  ];

  for (const step of newProcessSteps) {
    await prisma.processStep.create({ data: step });
  }
  console.log('✅ ProcessSteps updated');

  // 9. Trust Section (Replaces fake person quotes with honest studio commitments)
  await prisma.testimonial.deleteMany();
  const newTrustPillars = [
    {
      author: 'Direct Communication',
      title: 'Our Practice',
      company: 'DigitalClik Studio',
      quote: 'Every project starts with a different problem. Our job is to understand it properly, build what is actually needed, and stay involved until it works.',
      featured: true,
      sortOrder: 1,
      status: 'PUBLISHED'
    },
    {
      author: 'Reliable Support',
      title: 'Our Practice',
      company: 'DigitalClik Studio',
      quote: 'We do not build and vanish. When your team needs updates, bug fixes, or a new feature three months down the line, we are still here.',
      featured: true,
      sortOrder: 2,
      status: 'PUBLISHED'
    },
    {
      author: 'Full Ownership',
      title: 'Our Practice',
      company: 'DigitalClik Studio',
      quote: 'Code you can actually maintain. No messy spaghetti code, no locked-in proprietary traps, and complete handover of all accounts and assets.',
      featured: true,
      sortOrder: 3,
      status: 'PUBLISHED'
    }
  ];

  for (const t of newTrustPillars) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('✅ Trust section updated');

  console.log('✨ All CMS records safely updated to the new human voice!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
