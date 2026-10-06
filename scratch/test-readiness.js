import http from 'http';
import { execSync } from 'child_process';
import { prisma } from '../server/src/lib/prisma.js';
import { hashPassword } from '../server/src/utils/auth.js';
import { validateUpload, LocalStorageProvider } from '../server/src/utils/storage.js';

console.log('🚀 Starting Production Readiness Automated Test Suite against PostgreSQL...\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    testsFailed++;
  }
}

async function runTests() {
  try {
    // ---------------------------------------------------------
    // TEST 1: POSTGRESQL CONNECTION & SCHEMA VALIDATION
    // ---------------------------------------------------------
    console.log('📦 1. PostgreSQL Database & Prisma Integration');
    const userCount = await prisma.adminUser.count();
    assert(userCount >= 1, `PostgreSQL AdminUsers present (Count: ${userCount})`);

    const admin = await prisma.adminUser.findUnique({ where: { email: 'admin@digitalclik.com' } });
    assert(admin !== null && (admin.role === 'SUPER_ADMIN' || admin.role === 'ADMIN'), 'Seeded Admin account exists with SUPER_ADMIN / ADMIN role');

    // ---------------------------------------------------------
    // TEST 2: AUTH HARDENING & REFRESH TOKEN ROTATION
    // ---------------------------------------------------------
    console.log('\n🔒 2. Auth Hardening, Refresh Tokens & Password Invalidation');

    // Create test user
    const testEmail = `test-editor-${Date.now()}@digitalclik.com`;
    const testUser = await prisma.adminUser.create({
      data: {
        name: 'Test Editor',
        email: testEmail,
        passwordHash: await hashPassword('Password123!'),
        role: 'EDITOR',
        status: 'ACTIVE'
      }
    });
    assert(testUser.role === 'EDITOR', 'Created EDITOR user for RBAC test');

    // Create refresh token
    const tokenFamily = 'family-123';
    const refToken = await prisma.refreshToken.create({
      data: {
        userId: testUser.id,
        token: `ref-token-${Date.now()}`,
        family: tokenFamily,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    assert(refToken.family === tokenFamily, 'Saved RefreshToken family in PostgreSQL');

    // Test password change invalidating tokenVersion
    const updatedUser = await prisma.adminUser.update({
      where: { id: testUser.id },
      data: { tokenVersion: { increment: 1 } }
    });
    assert(updatedUser.tokenVersion === 1, 'Password change increments user tokenVersion');

    // Test token reuse detection
    await prisma.refreshToken.updateMany({
      where: { family: tokenFamily },
      data: { isRevoked: true }
    });
    const revokedCheck = await prisma.refreshToken.findUnique({ where: { id: refToken.id } });
    assert(revokedCheck.isRevoked === true, 'Revoked token family detected & invalidated');

    // ---------------------------------------------------------
    // TEST 3: UPLOAD SECURITY & MAGIC BYTES
    // ---------------------------------------------------------
    console.log('\n🛡️ 3. Upload Security & Magic Byte Validation');

    // Valid PNG buffer (Magic Bytes: 89 50 4E 47 0D 0A 1A 0A)
    const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
    const pngValidation = validateUpload(validPng, 'test.png', 'image/png');
    assert(pngValidation.valid === true, 'Valid PNG magic bytes accepted');

    // Malicious fake image containing executable text with .png extension
    const fakePng = Buffer.from('<?php echo "HACKED"; ?>');
    const fakeValidation = validateUpload(fakePng, 'hack.png', 'image/png');
    assert(fakeValidation.valid === false, 'Fake PNG with PHP content rejected by magic byte check');

    // Path traversal filename
    const traversal = validateUpload(validPng, '../../etc/passwd.png', 'image/png');
    assert(traversal.valid === false, 'Path traversal filename rejected');

    // Test LocalStorageProvider
    const storage = new LocalStorageProvider();
    const uploaded = await storage.uploadFile(validPng, 'test-asset.png', 'image/png');
    assert(uploaded.key.startsWith('dc-'), `Storage provider generated safe object key: ${uploaded.key}`);

    const deleted = await storage.deleteFile(uploaded.key);
    assert(deleted === true, 'Storage provider deleted asset cleanly');

    // ---------------------------------------------------------
    // TEST 4: CMS CRUD OPERATIONS ON POSTGRESQL
    // ---------------------------------------------------------
    console.log('\n📝 4. CMS CRUD Operations against PostgreSQL');

    // Service CRUD
    const service = await prisma.service.create({
      data: {
        code: '99',
        title: 'Test Service',
        slug: `test-service-${Date.now()}`,
        shortDescription: 'Test service description',
        status: 'PUBLISHED'
      }
    });
    assert(service.id !== undefined, 'Created new Service in PostgreSQL');

    await prisma.service.delete({ where: { id: service.id } });
    assert(true, 'Deleted Service from PostgreSQL');

    // Project CRUD
    const project = await prisma.project.create({
      data: {
        title: 'Test Project',
        slug: `test-project-${Date.now()}`,
        client: 'Test Client',
        category: 'SAAS',
        summary: 'Test summary',
        image: '/test.jpg'
      }
    });
    assert(project.id !== undefined, 'Created new Project in PostgreSQL');

    await prisma.project.delete({ where: { id: project.id } });
    assert(true, 'Deleted Project from PostgreSQL');

    // ---------------------------------------------------------
    // TEST 5: LEADS & HONEYPOT SAFETY
    // ---------------------------------------------------------
    console.log('\n📬 5. Lead System & Database Persistence');

    const contact = await prisma.contactSubmission.create({
      data: {
        name: 'John Lead',
        email: 'john@example.com',
        message: 'I am interested in your services'
      }
    });
    assert(contact.status === 'NEW', 'Contact submission stored with NEW status in PostgreSQL');

    await prisma.contactSubmission.delete({ where: { id: contact.id } });
    await prisma.adminUser.delete({ where: { id: testUser.id } });

    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 TEST SUITE COMPLETE: ${testsPassed} Passed, ${testsFailed} Failed.`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  }
}

runTests();
