-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('PENDING', 'PUBLISHED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('APPROVE', 'REJECT', 'OFFLINE', 'REVIVE', 'EDIT');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "iconEmoji" TEXT DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconUrl" TEXT DEFAULT '',
    "status" "ToolStatus" NOT NULL DEFAULT 'PENDING',
    "isClaw" BOOLEAN NOT NULL DEFAULT false,
    "hotScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "searchText" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT DEFAULT '',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolTag" (
    "toolId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ToolTag_pkey" PRIMARY KEY ("toolId","tagId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "operator" TEXT NOT NULL DEFAULT 'system',
    "note" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "outputSample" TEXT NOT NULL,
    "steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedToolSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskNote" TEXT DEFAULT '',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdSlot" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT DEFAULT '',
    "linkUrl" TEXT NOT NULL,
    "advertiser" TEXT NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxImprDay" INTEGER NOT NULL DEFAULT 10000,
    "maxImprUser" INTEGER NOT NULL DEFAULT 5,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiCallLog" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "ipHash" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX "Tool_status_idx" ON "Tool"("status");

-- CreateIndex
CREATE INDEX "Tool_categoryId_idx" ON "Tool"("categoryId");

-- CreateIndex
CREATE INDEX "Tool_isClaw_idx" ON "Tool"("isClaw");

-- CreateIndex
CREATE INDEX "Tool_hotScore_idx" ON "Tool"("hotScore" DESC);

-- CreateIndex
CREATE INDEX "Tool_updatedAt_idx" ON "Tool"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Tool_name_idx" ON "Tool"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_toolId_idx" ON "AuditLog"("toolId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "DailyCase_publishedAt_idx" ON "DailyCase"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "DailyCase_scenario_idx" ON "DailyCase"("scenario");

-- CreateIndex
CREATE UNIQUE INDEX "AdSlot_code_key" ON "AdSlot"("code");

-- CreateIndex
CREATE INDEX "Ad_slotId_idx" ON "Ad"("slotId");

-- CreateIndex
CREATE INDEX "Ad_status_idx" ON "Ad"("status");

-- CreateIndex
CREATE INDEX "Ad_startDate_endDate_idx" ON "Ad"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ApiCallLog_apiKey_idx" ON "ApiCallLog"("apiKey");

-- CreateIndex
CREATE INDEX "ApiCallLog_createdAt_idx" ON "ApiCallLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolTag" ADD CONSTRAINT "ToolTag_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolTag" ADD CONSTRAINT "ToolTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AdSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

