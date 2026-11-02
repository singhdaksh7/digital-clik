import { prisma } from '../server/src/lib/prisma.js';

async function verifyCmsPro() {
  console.log('--- Starting CMS Pro Local Verification ---');

  // 1. Authors verification
  console.log('1. Testing Author model...');
  const author = await prisma.author.upsert({
    where: { slug: 'daksh-singh-lead' },
    update: { name: 'Daksh Singh', role: 'Head of Growth & Digital Strategy' },
    create: {
      name: 'Daksh Singh',
      slug: 'daksh-singh-lead',
      role: 'Head of Growth & Digital Strategy',
      bio: 'Leading digital architecture, CRO, and performance engineering.'
    }
  });
  console.log(`✓ Author verified: ${author.name} (${author.slug})`);

  // 2. Categories & Tags verification
  console.log('2. Testing BlogCategory & BlogTag models...');
  const category = await prisma.blogCategory.upsert({
    where: { slug: 'search-engine-optimization' },
    update: { name: 'Search Engine Optimization' },
    create: {
      name: 'Search Engine Optimization',
      slug: 'search-engine-optimization',
      description: 'Advanced organic acquisition and technical SEO strategies.'
    }
  });

  const tag = await prisma.blogTag.upsert({
    where: { slug: 'core-web-vitals' },
    update: { name: 'Core Web Vitals' },
    create: {
      name: 'Core Web Vitals',
      slug: 'core-web-vitals',
      description: 'INP, LCP, CLS optimization guides'
    }
  });
  console.log(`✓ Category & Tag verified: [${category.name}] & [${tag.name}]`);

  // 3. Blog Post with Author and Tags
  console.log('3. Testing BlogPost creation with relations...');
  const post = await prisma.blogPost.upsert({
    where: { slug: 'optimizing-core-web-vitals-2026' },
    update: {
      title: 'Optimizing Core Web Vitals for Superior Conversion in 2026',
      authorId: author.id,
      categoryId: category.id
    },
    create: {
      title: 'Optimizing Core Web Vitals for Superior Conversion in 2026',
      slug: 'optimizing-core-web-vitals-2026',
      excerpt: 'How sub-second interaction speed directly multiplies enterprise lead velocity.',
      content: 'Technical speed is a direct commercial lever. In this teardown we examine FID to INP migration...',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      authorId: author.id,
      categoryId: category.id,
      status: 'PUBLISHED',
      metaTitle: 'Core Web Vitals Conversion Guide | DigitalClik',
      metaDescription: 'Complete technical breakdown of modern Web Vitals and performance benchmarks for high-converting platforms.'
    }
  });

  await prisma.blogPostTag.upsert({
    where: {
      blogPostId_tagId: {
        blogPostId: post.id,
        tagId: tag.id
      }
    },
    update: {},
    create: {
      blogPostId: post.id,
      tagId: tag.id
    }
  });
  console.log(`✓ BlogPost created with author & tag: ${post.title}`);

  // 4. WebhookConfig verification
  console.log('4. Testing WebhookConfig model...');
  const webhook = await prisma.webhookConfig.create({
    data: {
      url: 'https://webhook.site/test-endpoint',
      event: 'LEAD_CREATED',
      secret: 'secret-token-12345',
      isActive: true
    }
  });
  console.log(`✓ Webhook registered: ID ${webhook.id} for event ${webhook.event}`);

  // Clean up test webhook
  await prisma.webhookConfig.delete({ where: { id: webhook.id } });
  console.log('✓ Test webhook cleaned up');

  // 5. EmailTemplateRecord verification
  console.log('5. Testing EmailTemplateRecord model...');
  const emailTemplate = await prisma.emailTemplateRecord.upsert({
    where: { name: 'welcome-lead' },
    update: { subject: 'We received your project enquiry' },
    create: {
      name: 'welcome-lead',
      subject: 'We received your project enquiry',
      heading: 'Thank you for consulting DigitalClik',
      body: 'Our engineering and digital strategy teams are reviewing your submission.',
      buttonLabel: 'Explore Our Work',
      buttonUrl: 'https://digitalclik.com/work'
    }
  });
  console.log(`✓ EmailTemplateRecord verified: ${emailTemplate.name}`);

  console.log('--- ALL CMS PRO MODELS & DATABASE RELATIONS VERIFIED SUCCESSFULLY ---');
  await prisma.$disconnect();
}

verifyCmsPro().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
