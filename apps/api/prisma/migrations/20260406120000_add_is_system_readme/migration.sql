-- Welcome README: excluded from storage quota; protected from delete/rename/move-from-root.
ALTER TABLE "user_files" ADD COLUMN IF NOT EXISTS "is_system_readme" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "recycle_bin" ADD COLUMN IF NOT EXISTS "is_system_readme" BOOLEAN NOT NULL DEFAULT false;
