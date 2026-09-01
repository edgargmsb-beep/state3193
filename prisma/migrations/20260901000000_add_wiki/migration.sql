-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "canManageWiki" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WikiCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WikiCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiArticle" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiArticle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WikiCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- This app only ever connects via Prisma over a direct Postgres connection
-- (the "postgres" role, which owns these tables). Enabling RLS with no
-- policies blocks anonymous access through Supabase's public REST API,
-- matching the rest of the tables in this database.
ALTER TABLE "WikiCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WikiArticle" ENABLE ROW LEVEL SECURITY;
