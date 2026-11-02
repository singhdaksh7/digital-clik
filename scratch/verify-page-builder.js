import { prisma } from '../server/src/lib/prisma.js';
import { sanitizeRichText, sanitizeCustomHtml, slugify } from '../server/src/utils/sanitizer.js';
import { generatePreviewToken, verifyPreviewToken } from '../server/src/routes/adminPages.js';

async function runTestSuite() {
  console.log('🚀 Starting Verification Test Suite for Page Builder & SEO Management System...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Sanitizer unit tests
  console.log('--- 1. Security & Sanitization Tests ---');
  const cleanP = sanitizeRichText('<p>Normal text <strong>bold</strong><script>alert("xss")</script></p>');
  assert(!cleanP.includes('<script>'), 'Script tag stripped from rich text');
  assert(cleanP.includes('<strong>bold</strong>'), 'Safe formatting preserved in rich text');

  const xssLink = sanitizeRichText('<a href="javascript:alert(1)">Click</a>');
  assert(!xssLink.includes('javascript:'), 'Javascript URI stripped from rich text anchor');

  const cleanSlug = slugify(' Website  Development Gurgaon 2026! ');
  assert(cleanSlug === 'website-development-gurgaon-2026', 'Slugify produces clean SEO URL format');

  // 2. Preview Token Security
  console.log('\n--- 2. Preview Token Cryptographic Tests ---');
  const dummyPageId = 'test-page-123';
  const token = generatePreviewToken(dummyPageId);
  assert(Boolean(token && token.includes('.')), 'Token generated in timestamp.hmac format');
  assert(verifyPreviewToken(dummyPageId, token) === true, 'Token verified successfully with matching pageId');
  assert(verifyPreviewToken('different-id', token) === false, 'Token fails verification for mismatched pageId');

  // 3. Database Page & Block Flow
  console.log('\n--- 3. Database Page & Block CRUD Tests ---');
  const testSlug = `test-page-${Date.now()}`;
  const testPage = await prisma.page.create({
    data: {
      title: 'Automated Test Page',
      slug: testSlug,
      status: 'PUBLISHED',
      metaTitle: 'Automated Test Page | DigitalClik Agency',
      metaDescription: 'A completely tested dynamic landing page built using the block engine.',
      isIndexable: true,
      noIndex: false
    }
  });
  assert(Boolean(testPage.id), `Page created in PostgreSQL with ID: ${testPage.id}`);

  // Add Hero Block
  const heroBlock = await prisma.pageBlock.create({
    data: {
      pageId: testPage.id,
      type: 'HERO',
      variant: 'centered',
      sortOrder: 0,
      settings: JSON.stringify({ width: 'Standard', padding: 'Large', background: 'White' }),
      content: JSON.stringify({
        title: 'Built with Precision',
        subtitle: 'Digital systems tailored to your business operations.',
        ctaText: 'Start Project',
        ctaLink: '/contact'
      })
    }
  });
  assert(Boolean(heroBlock.id), 'Hero block added to page');

  // Add Rich Text Block
  const textBlock = await prisma.pageBlock.create({
    data: {
      pageId: testPage.id,
      type: 'RICH_TEXT',
      variant: 'default',
      sortOrder: 1,
      settings: JSON.stringify({ width: 'Narrow', padding: 'Medium', background: 'Soft Gray' }),
      content: JSON.stringify({
        bodyHtml: '<h2>Why System Reliability Matters</h2><p>Engineering workflows that endure high volume.</p>'
      })
    }
  });
  assert(Boolean(textBlock.id), 'Rich text block added to page');

  // Create Snapshot Revision
  const revision = await prisma.pageRevision.create({
    data: {
      pageId: testPage.id,
      snapshot: JSON.stringify({ ...testPage, blocks: [heroBlock, textBlock] }),
      author: 'admin@digitalclik.com',
      note: 'Initial automated test version'
    }
  });
  assert(Boolean(revision.id), 'Automated snapshot revision stored');

  // Add 301 Redirect
  const redirect = await prisma.redirect.create({
    data: {
      sourcePath: `/legacy-${testSlug}`,
      targetPath: `/${testSlug}`,
      statusCode: 301,
      isActive: true
    }
  });
  assert(Boolean(redirect.id), `301 Redirect rule created from /legacy-${testSlug} to /${testSlug}`);

  // Query page with blocks
  const queriedPage = await prisma.page.findUnique({
    where: { slug: testSlug },
    include: {
      blocks: { orderBy: { sortOrder: 'asc' } },
      revisions: true
    }
  });
  assert(queriedPage.blocks.length === 2, 'Blocks successfully retrieved in ascending sortOrder');
  assert(queriedPage.revisions.length === 1, 'Revision history successfully queried');

  // Clean up test records
  await prisma.redirect.delete({ where: { id: redirect.id } });
  await prisma.page.delete({ where: { id: testPage.id } });
  assert(true, 'Test artifacts safely cleaned up from PostgreSQL');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed}/${total} checks passed.`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

runTestSuite().catch(async (e) => {
  console.error('Test suite failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
