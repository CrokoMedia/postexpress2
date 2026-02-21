-- MIGRATION 009: Add voice cloning support to profiles
-- Stores ElevenLabs cloned voice ID for creators who clone their voice

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cloned_voice_id TEXT;

COMMENT ON COLUMN profiles.cloned_voice_id
  IS 'ElevenLabs voice_id for creator cloned voice (Instant Voice Clone). NULL = no cloned voice.';
