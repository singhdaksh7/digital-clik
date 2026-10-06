import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DigitalClik CMS database seed...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@digitalclik.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('❌ SECURITY FAILURE: SEED_ADMIN_PASSWORD environment variable must be set in production!');
  }

  const finalPassword = adminPassword || 'DevPassword123!';
  const passwordHash = await argon2.hash(finalPassword);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      name: 'DigitalClik Administrator',
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log(`✅ Admin Account Created: ${admin.email}`);

  // 2. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'DigitalClik',
      shortName: 'DigitalClik Agency',
      email: 'hello@digitalclik.com',
      phone: '+1 (800) 555-CLIK',
      whatsapp: '+18005552545',
      address: 'DigitalClik Creative Studio',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      businessHours: 'Mon-Fri: 9:00 AM - 6:00 PM EST',
      defaultMetaTitle: 'DigitalClik | Premier Digital Agency & AI Search Experts',
      defaultMetaDescription: 'DigitalClik is an independent creative studio and digital growth agency specializing in brand identity, sub-second web platforms, AEO/GEO search authority, and performance media.'
    }
  });
  console.log('✅ Site Settings Initialized');

  // 3. Announcement Bar
  await prisma.announcementBar.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      enabled: true,
      text: 'AI Search Authority (AEO/GEO) & High-Speed Web Platforms',
      linkText: 'EXPLORE AUDIT ↗',
      linkUrl: '#audit'
    }
  });

  // 4. Homepage Sections Configuration
  const sections = [
    { sectionKey: 'HERO', title: 'Hero Section', sortOrder: 1, isVisible: true },
    { sectionKey: 'MANIFESTO', title: 'Brand Manifesto', sortOrder: 2, isVisible: true },
    { sectionKey: 'SERVICES', title: 'Services Explorer', sortOrder: 3, isVisible: true },
    { sectionKey: 'FEATURED_WORK', title: 'Selected Portfolio', sortOrder: 4, isVisible: true },
    { sectionKey: 'PROCESS', title: '6-Step Methodology', sortOrder: 5, isVisible: true },
    { sectionKey: 'INDUSTRIES', title: 'Industry Playbooks', sortOrder: 6, isVisible: true },
    { sectionKey: 'TESTIMONIALS', title: 'Client Proof', sortOrder: 7, isVisible: true },
    { sectionKey: 'CTA', title: 'Climax CTA', sortOrder: 8, isVisible: true },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: sec.sectionKey },
      update: sec,
      create: sec
    });
  }
  console.log('✅ Homepage Sections Configured');

  // 5. Hero Media Wall Items
  await prisma.heroMedia.deleteMany();
  const heroMediaItems = [
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', altText: 'Web Platform', label: 'NEXT.JS / WEB PLATFORM', sortOrder: 1, isVisible: true },
    { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', altText: 'Mobile Experience', label: 'MOBILE & APP', sortOrder: 2, isVisible: true },
    { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80', altText: 'Brand Identity', label: 'BRAND & CREATIVE', sortOrder: 3, isVisible: true }
  ];
  for (const item of heroMediaItems) {
    await prisma.heroMedia.create({ data: item });
  }

  // 6. Service Categories & Services
  const servicesData = [
    {
      code: '01',
      title: 'Strategy & Brand Identity',
      slug: 'strategy-brand-identity',
      categoryLabel: 'BRAND ARCHITECTURE',
      shortDescription: 'We craft distinctive brand positioning, design systems, and identity frameworks that make your business instantly recognizable and trusted.',
      metric: 'Distinctive Market Authority',
      capabilities: JSON.stringify(['Brand Positioning & Messaging', 'Visual Identity & Design Systems', 'Logo Architecture & Style Guides', 'Brand Collateral & Assets']),
      featured: true,
      homepageOrder: 1,
      sortOrder: 1,
      status: 'PUBLISHED'
    },
    {
      code: '02',
      title: 'Websites & E-Commerce',
      slug: 'websites-e-commerce',
      categoryLabel: 'DIGITAL PLATFORMS',
      shortDescription: 'Sub-second, high-converting digital storefronts and web platforms built on Next.js App Router and modern headless e-commerce stacks.',
      metric: 'High-Speed Web Architecture',
      capabilities: JSON.stringify(['Next.js & React Engineering', 'Headless Storefront Systems', 'Page Load & Performance Optimization', 'UI/UX Interactive Prototyping']),
      featured: true,
      homepageOrder: 2,
      sortOrder: 2,
      status: 'PUBLISHED'
    },
    {
      code: '03',
      title: 'SEO & AI Search (AEO/GEO)',
      slug: 'seo-ai-search',
      categoryLabel: 'ORGANIC VISIBILITY',
      shortDescription: 'Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO). We optimize your entity graph so ChatGPT, Perplexity & Google Gemini cite your brand.',
      metric: 'AI Search Entity Authority',
      capabilities: JSON.stringify(['LLM Entity Authority Seeding', 'Schema & Vector Search Structuring', 'Enterprise Technical Audits', 'Google AI Overview Optimization']),
      featured: true,
      homepageOrder: 3,
      sortOrder: 3,
      status: 'PUBLISHED'
    },
    {
      code: '04',
      title: 'Performance Paid Media',
      slug: 'performance-paid-media',
      categoryLabel: 'PAID ACQUISITION',
      shortDescription: 'Data-backed paid search and paid social campaigns engineered around strict cost-per-acquisition (CPA) targets and customer lifetime value.',
      metric: 'Performance Paid Media Scale',
      capabilities: JSON.stringify(['Google Search & Shopping Ads', 'Meta & TikTok Paid Social', 'LinkedIn B2B Lead Acquisition', 'Multi-Touch Attribution Modeling']),
      featured: true,
      homepageOrder: 4,
      sortOrder: 4,
      status: 'PUBLISHED'
    },
    {
      code: '05',
      title: 'Video & Creative Studio',
      slug: 'video-creative-studio',
      categoryLabel: 'HIGH-SCALE CREATIVE',
      shortDescription: 'High-velocity UGC ad production, creator campaigns, and corporate films designed to drive engagement and conversion across social feeds.',
      metric: 'High-Velocity Creative Pipeline',
      capabilities: JSON.stringify(['Short-Form Social Reels & Shorts', 'Creator-Led UGC Ad Pipelines', 'Scriptwriting & Storyboarding', 'Multi-Language Localization']),
      featured: true,
      homepageOrder: 5,
      sortOrder: 5,
      status: 'PUBLISHED'
    },
    {
      code: '06',
      title: 'AI & Automation Systems',
      slug: 'ai-automation-systems',
      categoryLabel: 'OPERATIONAL EFFICIENCY',
      shortDescription: 'Custom AI workflows, automated CRM funnels, and conversion rate optimization (CRO) engines that eliminate operational friction.',
      metric: 'Conversion Rate Optimization',
      capabilities: JSON.stringify(['Custom AI Workflow Integrations', 'Automated Lead Qualification', 'A/B Multivariate Testing', 'Session Analytics & Friction Removal']),
      featured: true,
      homepageOrder: 6,
      sortOrder: 6,
      status: 'PUBLISHED'
    }
  ];

  for (const svc of servicesData) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: svc,
      create: svc
    });
  }
  console.log('✅ 6 Core Services Seeded');

  // 7. Industry Playbooks
  const industriesData = [
    { code: '01', name: 'REAL ESTATE & PROPTECH', slug: 'real-estate', shortDescription: 'Hyper-local search engine optimization, property video tours & lead capture.', featured: true, homepageOrder: 1, sortOrder: 1 },
    { code: '02', name: 'EDUCATION & ACADEMICS', slug: 'education', shortDescription: 'Enrollment acquisition campaigns, university branding & student portals.', featured: true, homepageOrder: 2, sortOrder: 2 },
    { code: '03', name: 'E-COMMERCE & DTC RETAIL', slug: 'e-commerce', shortDescription: 'Headless storefront engineering, UGC video ads & high-ROAS paid media.', featured: true, homepageOrder: 3, sortOrder: 3 },
    { code: '04', name: 'HEALTHCARE & MEDTECH', slug: 'healthcare', shortDescription: 'HIPAA-compliant patient portals, local search authority & clinic growth.', featured: true, homepageOrder: 4, sortOrder: 4 },
    { code: '05', name: 'FINTECH & DIGITAL BANKING', slug: 'fintech', shortDescription: 'AI search entity authority, compliant investor acquisition & web apps.', featured: true, homepageOrder: 5, sortOrder: 5 },
    { code: '06', name: 'ENTERPRISE SAAS & B2B', slug: 'saas', shortDescription: 'Account-based marketing, enterprise search positioning & demo funnels.', featured: true, homepageOrder: 6, sortOrder: 6 }
  ];

  for (const ind of industriesData) {
    await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: ind,
      create: ind
    });
  }
  console.log('✅ 6 Industries Seeded');

  // 8. Projects & Portfolio
  const projectsData = [
    {
      title: 'Digital Banking System & AI Search Engine Authority',
      slug: 'nexopay-digital-banking',
      client: 'NexoPay Banking',
      category: 'FINTECH PLATFORM',
      year: '2026',
      metric: 'SEO & Organic Growth',
      layout: 'full',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      summary: 'Re-architected NexoPay\'s digital search presence and customer portal, capturing high-intent financial queries and scaling monthly digital transactions.',
      deliverables: JSON.stringify(['AI Search Entity Structuring', 'Next.js Web Portal Development', 'B2B Acquisition Campaign']),
      featuredOnHomepage: true,
      homepageSortOrder: 1,
      sortOrder: 1,
      status: 'PUBLISHED'
    },
    {
      title: 'Enterprise ABM Acquisition & Performance Media Scale',
      slug: 'cloudscale-enterprise-abm',
      client: 'CloudScale AI',
      category: 'ENTERPRISE SAAS',
      year: '2025',
      metric: 'Performance Marketing',
      layout: 'split',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      summary: 'Deployed targeted LinkedIn and Google Search account-based campaigns to acquire Fortune 500 infrastructure and CTO leads.',
      deliverables: JSON.stringify(['LinkedIn ABM Campaigns', 'Google Search Infrastructure', 'CRO & Landing Page Optimization']),
      featuredOnHomepage: true,
      homepageSortOrder: 2,
      sortOrder: 2,
      status: 'PUBLISHED'
    },
    {
      title: 'Omnichannel Storefront & UGC Creative Studio',
      slug: 'verve-luxury-omnichannel',
      client: 'Verve Luxury',
      category: 'DIRECT-TO-CONSUMER',
      year: '2025',
      metric: 'Omnichannel Ad Scale',
      layout: 'bleed',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
      summary: 'Built high-velocity creator UGC video ad pipelines releasing multi-angle variations weekly across Meta and TikTok feeds.',
      deliverables: JSON.stringify(['AI Avatar & Creator UGC Studio', 'TikTok & Meta Ad Scale', 'Headless Storefront Design']),
      featuredOnHomepage: true,
      homepageSortOrder: 3,
      sortOrder: 3,
      status: 'PUBLISHED'
    }
  ];

  for (const proj of projectsData) {
    await prisma.project.upsert({
      where: { slug: proj.slug },
      update: proj,
      create: proj
    });
  }
  console.log('✅ Portfolio Projects Seeded');

  // 9. Process Steps
  const steps = [
    { num: '01', title: 'DISCOVER', subtitle: 'Market Intelligence & Positioning Audit', description: 'We audit your category competitors, target user search behavior, brand positioning, and technical bottlenecks to identify high-leverage growth opportunities.', sortOrder: 1, isVisible: true },
    { num: '02', title: 'DEFINE', subtitle: 'Strategy & System Architecture', description: 'We map out clear project deliverables, content strategy, AI search entity structuring, and web engineering blueprints before touching design tools.', sortOrder: 2, isVisible: true },
    { num: '03', title: 'DESIGN', subtitle: 'High-Impact Art-Directed Interfaces', description: 'We craft distinctive visual design systems, custom component libraries, and interactive prototypes engineered to captivate and convert visitors.', sortOrder: 3, isVisible: true },
    { num: '04', title: 'BUILD', subtitle: 'Sub-Second Full-Stack Development', description: 'Our engineering team develops high-performance Next.js, React, and Node.js applications with 99+ Core Web Vitals and bulletproof security.', sortOrder: 4, isVisible: true },
    { num: '05', title: 'LAUNCH', subtitle: 'Seamless Deployment & QA Hardening', description: 'Rigorous cross-browser testing, accessibility compliance, serverless infrastructure deployment, and live AI search index verification.', sortOrder: 5, isVisible: true },
    { num: '06', title: 'GROW', subtitle: 'Continuous Optimization & Ad Scale', description: 'Ongoing A/B multivariate CRO testing, performance media scaling across search & paid social, and continuous search authority expansion.', sortOrder: 6, isVisible: true }
  ];

  await prisma.processStep.deleteMany();
  for (const step of steps) {
    await prisma.processStep.create({ data: step });
  }

  // 10. Testimonials
  const testimonials = [
    {
      author: 'Marcus Vance',
      title: 'Chief Marketing Officer',
      company: 'NexoPay Global',
      quote: 'DigitalClik completely transformed our online presence and search footprint. They engineered a sub-second Next.js web application and positioned us as a recommended solution across AI search engines.',
      featured: true,
      sortOrder: 1,
      status: 'PUBLISHED'
    },
    {
      author: 'Elena Rostova',
      title: 'VP of Growth & Strategy',
      company: 'CloudScale AI',
      quote: 'The strategic clarity and design execution DigitalClik brought to CloudScale was unmatched. Their performance campaigns scaled our demo pipeline volume while optimizing our acquisition costs.',
      featured: true,
      sortOrder: 2,
      status: 'PUBLISHED'
    },
    {
      author: 'Julian Sterling',
      title: 'Founder & CEO',
      company: 'Verve Luxury Group',
      quote: 'Working with DigitalClik feels like having an elite internal product and creative team. Their UGC ad studio and web engineering enabled us to achieve strong e-commerce growth.',
      featured: true,
      sortOrder: 3,
      status: 'PUBLISHED'
    }
  ];

  await prisma.testimonial.deleteMany();
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // 11. Navigation Menus
  await prisma.navigationMenu.upsert({
    where: { key: 'HEADER' },
    update: {},
    create: {
      key: 'HEADER',
      title: 'Header Main Navigation'
    }
  });

  console.log('🚀 DigitalClik Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
