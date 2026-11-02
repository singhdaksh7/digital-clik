-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "editorialStatus" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "publishAt" TIMESTAMP(3),
ADD COLUMN     "unpublishAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "PageBlock" ADD COLUMN     "globalBlockId" TEXT;

-- CreateTable
CREATE TABLE "GlobalBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "type" TEXT NOT NULL,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "content" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'STANDARD',
    "previewImage" TEXT,
    "blocksJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageComment" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotFoundLog" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "referrer" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "isIgnored" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotFoundLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmissionRecord" (
    "id" TEXT NOT NULL,
    "formName" TEXT NOT NULL,
    "pageSlug" TEXT,
    "data" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmissionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GlobalBlock_name_idx" ON "GlobalBlock"("name");

-- CreateIndex
CREATE INDEX "GlobalBlock_category_idx" ON "GlobalBlock"("category");

-- CreateIndex
CREATE UNIQUE INDEX "PageTemplate_name_key" ON "PageTemplate"("name");

-- CreateIndex
CREATE INDEX "PageTemplate_name_idx" ON "PageTemplate"("name");

-- CreateIndex
CREATE INDEX "PageComment_pageId_idx" ON "PageComment"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "NotFoundLog_path_key" ON "NotFoundLog"("path");

-- CreateIndex
CREATE INDEX "NotFoundLog_path_idx" ON "NotFoundLog"("path");

-- CreateIndex
CREATE INDEX "NotFoundLog_count_idx" ON "NotFoundLog"("count");

-- CreateIndex
CREATE INDEX "NotFoundLog_lastSeen_idx" ON "NotFoundLog"("lastSeen");

-- CreateIndex
CREATE INDEX "FormSubmissionRecord_formName_idx" ON "FormSubmissionRecord"("formName");

-- CreateIndex
CREATE INDEX "FormSubmissionRecord_status_idx" ON "FormSubmissionRecord"("status");

-- CreateIndex
CREATE INDEX "FormSubmissionRecord_createdAt_idx" ON "FormSubmissionRecord"("createdAt");

-- CreateIndex
CREATE INDEX "Page_deletedAt_idx" ON "Page"("deletedAt");

-- CreateIndex
CREATE INDEX "Page_publishAt_idx" ON "Page"("publishAt");

-- CreateIndex
CREATE INDEX "PageBlock_globalBlockId_idx" ON "PageBlock"("globalBlockId");

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_globalBlockId_fkey" FOREIGN KEY ("globalBlockId") REFERENCES "GlobalBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageComment" ADD CONSTRAINT "PageComment_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
