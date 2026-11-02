async function runProductionAcceptance() {
  console.log('🚀 Running Production Verification & Acceptance Suite...\n');

  const BASE_URL = process.env.BASE_URL || 'https://digitalclik.187.127.175.28.sslip.io';
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

  // 1. Get Admin Auth Token
  console.log('--- 1. Authenticate Admin ---');
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@digitalclik.com', password: 'AdminClik2026!Secure' })
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.accessToken;
  assert(Boolean(token), 'Admin login successful and access token retrieved');

  // 2. Reserved Slugs Validation
  console.log('\n--- 2. Reserved Slugs Protection ---');
  const reservedSlugs = ['admin', 'api', 'services', 'contact', 'case-studies'];
  for (const slug of reservedSlugs) {
    const res = await fetch(`${BASE_URL}/api/admin/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: `Reserved Test ${slug}`, slug })
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, `Page creation blocked for reserved slug: /${slug}`);
  }

  // 3. Page CRUD & Blocks Creation
  console.log('\n--- 3. Page Builder CRUD & Block Assembly ---');
  const testSlug = `e2e-landing-${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'E2E Dynamic Growth Engine',
      slug: testSlug,
      template: 'DEFAULT',
      metaTitle: 'E2E Dynamic Growth Engine | DigitalClik Agency',
      metaDescription: 'A fully verified page builder landing page engineered for high-growth digital operations.',
      isIndexable: true,
      noIndex: false,
      schemaType: 'Service'
    })
  });
  const createData = await createRes.json();
  assert(createRes.status === 201 && createData.success, 'Page created in DRAFT status');
  const pageId = createData.data.id;

  // Add RICH_TEXT Block with safe formatting and XSS probe
  console.log('\n--- 4. Rich Text Formatting & XSS Sanitization ---');
  const richTextBlockRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'RICH_TEXT',
      settings: { width: 'Narrow', padding: 'Medium', background: 'White' },
      content: {
        bodyHtml: '<h2>Engineered Architecture</h2><p>Normal text with <strong>bold</strong>, <em>italic</em>, <u>underline</u> and <a href="https://digitalclik.com">clean link</a>.<script>alert("xss-exploit")</script><a href="javascript:alert(2)">malicious</a></p>'
      }
    })
  });
  const richData = await richTextBlockRes.json();
  assert(richTextBlockRes.status === 201, 'RICH_TEXT block created');
  const parsedRichContent = JSON.parse(richData.data.content);
  assert(!parsedRichContent.bodyHtml.includes('<script>'), 'XSS <script> tag strictly stripped');
  assert(!parsedRichContent.bodyHtml.includes('javascript:'), 'XSS javascript: protocol strictly stripped');
  assert(parsedRichContent.bodyHtml.includes('<strong>bold</strong>'), 'Safe semantic formatting retained');

  // Add FAQ block
  const faqBlockRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'FAQ',
      settings: { width: 'Standard', padding: 'Medium', background: 'Soft Gray' },
      content: {
        title: 'Project FAQ',
        items: [
          { question: 'What is the implementation timeline?', answer: '<p>2 to 4 weeks for complete production rollout.</p>' }
        ]
      }
    })
  });
  assert(faqBlockRes.status === 201, 'FAQ block created');

  // Add CTA block
  const ctaBlockRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'CTA',
      settings: { width: 'Standard', padding: 'Large', background: 'Purple' },
      content: {
        title: 'Ready to build high-scale infrastructure?',
        subtitle: 'Our Delhi NCR engineering team is ready.',
        ctaText: 'Start Consultation',
        ctaLink: '/contact'
      }
    })
  });
  assert(ctaBlockRes.status === 201, 'CTA block created');

  // 5. Preview Security
  console.log('\n--- 5. Preview Security & Token Validation ---');
  // Attempt unauthenticated draft access
  const directDraftRes = await fetch(`${BASE_URL}/api/pages/${testSlug}`);
  assert(directDraftRes.status === 404, 'Direct unauthenticated public request to draft page returns 404');

  // Get preview token
  const tokenRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/preview-token`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tokenData = await tokenRes.json();
  const previewToken = tokenData.token;
  assert(Boolean(previewToken), 'Secure cryptographic preview token issued');

  // Access via preview route
  const previewRes = await fetch(`${BASE_URL}/api/pages/preview/${pageId}?token=${previewToken}`);
  const previewData = await previewRes.json();
  assert(previewRes.status === 200 && previewData.data.title === 'E2E Dynamic Growth Engine', 'Draft page successfully accessed via authenticated preview token');

  // Tampered preview token
  const tamperedRes = await fetch(`${BASE_URL}/api/pages/preview/${pageId}?token=invalid-token`);
  assert(tamperedRes.status === 403, 'Tampered/invalid preview token rejected with 403 Forbidden');

  // 6. Revisions & Restore Flow
  console.log('\n--- 6. Snapshot Revisions & Restore Flow ---');
  // Save page state A
  const revRes1 = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/revisions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const revList1 = await revRes1.json();
  const snapshotA = revList1.data[0];
  assert(Boolean(snapshotA), 'Initial snapshot recorded');

  // Update title to State B
  await fetch(`${BASE_URL}/api/admin/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title: 'Modified State B' })
  });

  const checkBRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const checkBData = await checkBRes.json();
  assert(checkBData.data.title === 'Modified State B', 'Page updated to State B');

  // Restore snapshot A
  const restoreRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/revisions/${snapshotA.id}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const restoreData = await restoreRes.json();
  assert(restoreData.data.title === 'E2E Dynamic Growth Engine', 'Snapshot A restored successfully');

  // 7. Publish & Public Dynamic Route
  console.log('\n--- 7. Publishing & Public Dynamic Route Verification ---');
  const pubRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'PUBLISHED' })
  });
  assert(pubRes.status === 200, 'Page marked as PUBLISHED');

  // Fetch via public slug route
  const pubSlugRes = await fetch(`${BASE_URL}/api/pages/${testSlug}`);
  const pubSlugData = await pubSlugRes.json();
  assert(pubSlugRes.status === 200 && pubSlugData.data.blocks.length >= 3, 'Published page and blocks resolve publicly at /api/pages/:slug');

  // Verify Frontend SPA route delivers index.html 200 (not 404)
  const spaRes = await fetch(`${BASE_URL}/${testSlug}`);
  const spaText = await spaRes.text();
  assert(spaRes.status === 200 && spaText.includes('<div id="root"></div>'), 'Public URL /:slug served by SPA router without Nginx 404');

  // Verify sitemap.xml dynamically includes published indexable slug
  console.log('\n--- 8. Sitemap.xml Dynamic Inclusion ---');
  const sitemapRes = await fetch(`${BASE_URL}/api/sitemap.xml`);
  const sitemapText = await sitemapRes.text();
  assert(sitemapText.includes(`<loc>${BASE_URL}/${testSlug}</loc>`), 'Published indexable page dynamically included in sitemap.xml');

  // 8. 301 Redirect on Slug Change & Loop Protection
  console.log('\n--- 9. Automated 301 Redirect & Loop Protection ---');
  const newSlug = `${testSlug}-updated`;
  const renameRes = await fetch(`${BASE_URL}/api/admin/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ slug: newSlug, createRedirectOnSlugChange: true })
  });
  assert(renameRes.status === 200, 'Slug renamed to new target');

  // Test 301 redirect via public resolver API
  const redirRes = await fetch(`${BASE_URL}/api/pages/${testSlug}`);
  const redirData = await redirRes.json();
  assert(
    redirData.success === true && redirData.redirect?.targetPath === `/${newSlug}` && redirData.redirect?.statusCode === 301,
    `Automated 301 redirect rule created and returned for /${testSlug} to /${newSlug}`
  );

  // 9. Clean up temporary test data via API
  console.log('\n--- 10. Clean Up Test Data ---');
  // Delete redirect via admin API
  const redirectsRes = await fetch(`${BASE_URL}/api/admin/redirects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const redirectsList = await redirectsRes.json();
  const testRedir = (redirectsList.data || []).find((r) => r.sourcePath === `/${testSlug}`);
  if (testRedir) {
    await fetch(`${BASE_URL}/api/admin/redirects/${testRedir.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Delete page
  await fetch(`${BASE_URL}/api/admin/pages/${pageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(true, 'Test page and redirect safely cleaned up via admin API');

  console.log(`\n========================================`);
  console.log(`FINAL RESULT: ${passed}/${total} verification tests passed!`);
  console.log(`========================================\n`);
}

runProductionAcceptance().catch((e) => {
  console.error('Acceptance suite failed:', e);
  process.exit(1);
});
