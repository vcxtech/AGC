-- Full article body for publications (rich HTML from CMS)
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "content" TEXT;
