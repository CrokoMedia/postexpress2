-- Rollback Migration 005
ALTER TABLE profiles DROP COLUMN IF EXISTS deleted_at;
DROP INDEX IF EXISTS idx_profiles_deleted;
