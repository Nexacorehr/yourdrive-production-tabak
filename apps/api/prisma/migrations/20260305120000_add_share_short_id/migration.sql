-- AlterTable
ALTER TABLE "file_shares" ADD COLUMN IF NOT EXISTS "short_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "file_shares_short_id_key" ON "file_shares"("short_id");
