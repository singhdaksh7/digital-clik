/*
  Warnings:

  - You are about to drop the `PageSection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PageSection" DROP CONSTRAINT "PageSection_pageId_fkey";

-- AlterTable
ALTER TABLE "AnnouncementBar" ALTER COLUMN "text" SET DEFAULT 'Websites, custom software, automations and digital content built for real business needs.',
ALTER COLUMN "linkText" SET DEFAULT 'TALK TO US ↗',
ALTER COLUMN "linkUrl" SET DEFAULT '#contact';

-- AlterTable
ALTER TABLE "NavigationItem" ADD COLUMN     "linkedPageId" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "breadcrumbLabel" TEXT,
ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "featuredImageId" TEXT,
ADD COLUMN     "featuredImageUrl" TEXT,
ADD COLUMN     "isIndexable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "noFollow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogDescription" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "schemaType" TEXT NOT NULL DEFAULT 'WebPage',
ADD COLUMN     "template" TEXT NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN     "twitterDescription" TEXT,
ADD COLUMN     "twitterImage" TEXT,
ADD COLUMN     "twitterTitle" TEXT,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "pageType" SET DEFAULT 'STANDARD',
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "shortName" SET DEFAULT 'DigitalClik Studio',
ALTER COLUMN "address" SET DEFAULT 'DigitalClik Studio',
ALTER COLUMN "city" SET DEFAULT 'New Delhi',
ALTER COLUMN "state" SET DEFAULT 'Delhi',
ALTER COLUMN "country" SET DEFAULT 'India',
ALTER COLUMN "postalCode" SET DEFAULT '110001',
ALTER COLUMN "businessHours" SET DEFAULT 'Mon-Sat: 10:00 AM - 7:00 PM IST',
ALTER COLUMN "defaultMetaTitle" SET DEFAULT 'DigitalClik | Websites, Software & Digital Services',
ALTER COLUMN "defaultMetaDescription" SET DEFAULT 'DigitalClik builds websites, custom software, workflow automation and digital content for businesses that need one reliable team to handle the work.';

-- DropTable
DROP TABLE "PageSection";

-- CreateTable
CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT 'default',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "content" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageRevision" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "author" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageBlock_pageId_idx" ON "PageBlock"("pageId");

-- CreateIndex
CREATE INDEX "PageBlock_sortOrder_idx" ON "PageBlock"("sortOrder");

-- CreateIndex
CREATE INDEX "PageRevision_pageId_idx" ON "PageRevision"("pageId");

-- CreateIndex
CREATE INDEX "PageRevision_createdAt_idx" ON "PageRevision"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_sourcePath_key" ON "Redirect"("sourcePath");

-- CreateIndex
CREATE INDEX "Redirect_sourcePath_idx" ON "Redirect"("sourcePath");

-- CreateIndex
CREATE INDEX "Redirect_isActive_idx" ON "Redirect"("isActive");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE INDEX "Page_pageType_idx" ON "Page"("pageType");

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageRevision" ADD CONSTRAINT "PageRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
