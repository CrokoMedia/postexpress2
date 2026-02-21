-- MIGRATION 008: Add reel_videos_json to content_suggestions
-- Stores Remotion-generated MP4 video metadata (separate from text-based reels_json)
ALTER TABLE content_suggestions
  ADD COLUMN IF NOT EXISTS reel_videos_json JSONB;

COMMENT ON COLUMN content_suggestions.reel_videos_json
  IS 'Metadata de videos MP4 gerados via Remotion: {videos: [{carouselIndex, title, videoUrl, cloudinaryPublicId, duration, totalSlides}], generated_at}';
