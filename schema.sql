


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."action_status_enum" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE "public"."action_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."engagement_phase_enum" AS ENUM (
    'awareness',
    'interest',
    'consideration',
    'intent',
    'evaluation',
    'purchase'
);


ALTER TYPE "public"."engagement_phase_enum" OWNER TO "postgres";


CREATE TYPE "public"."format_enum" AS ENUM (
    'mp3',
    'wav',
    'flac',
    'aiff',
    'other'
);


ALTER TYPE "public"."format_enum" OWNER TO "postgres";


CREATE TYPE "public"."frequency_type_enum" AS ENUM (
    'recurring',
    'one-time'
);


ALTER TYPE "public"."frequency_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_resource_category_enum" AS ENUM (
    'BOOK',
    'DOCUMENT',
    'GUIDE',
    'FRAMEWORK',
    'CASE_STUDY',
    'OTHER'
);


ALTER TYPE "public"."knowledge_resource_category_enum" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_resource_format_enum" AS ENUM (
    'PROMPT',
    'URL',
    'TEXT'
);


ALTER TYPE "public"."knowledge_resource_format_enum" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_resource_ingestion_method_enum" AS ENUM (
    'MANUAL'
);


ALTER TYPE "public"."knowledge_resource_ingestion_method_enum" OWNER TO "postgres";


CREATE TYPE "public"."media_type_enum" AS ENUM (
    'PHOTO',
    'VIDEO',
    'CAROUSEL',
    'TEXT',
    'GIF',
    'OTHER'
);


ALTER TYPE "public"."media_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."phase_enum" AS ENUM (
    'pre',
    'during',
    'post',
    'various'
);


ALTER TYPE "public"."phase_enum" OWNER TO "postgres";


CREATE TYPE "public"."platform_type" AS ENUM (
    'DISTRIBUTION',
    'ADMIN',
    'TOOL',
    'PROMOTION',
    'ANALYTICS'
);


ALTER TYPE "public"."platform_type" OWNER TO "postgres";


CREATE TYPE "public"."royalty_right_enum" AS ENUM (
    'Master',
    'Recording'
);


ALTER TYPE "public"."royalty_right_enum" OWNER TO "postgres";


CREATE TYPE "public"."royalty_type_enum" AS ENUM (
    'Mechanical',
    'Performance',
    'Synchronization',
    'Neighboring',
    'Reproduction',
    'Digital',
    'Physical'
);


ALTER TYPE "public"."royalty_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."time_period_enum" AS ENUM (
    'definite',
    'indefinite'
);


ALTER TYPE "public"."time_period_enum" OWNER TO "postgres";


CREATE TYPE "public"."verified_status" AS ENUM (
    'verified',
    'not_verified',
    'pending'
);


ALTER TYPE "public"."verified_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."action" (
    "action_id" "uuid" NOT NULL,
    "status" "public"."action_status_enum",
    "next_action_due_date" timestamp without time zone,
    "action_is_active" boolean,
    "action_notes" character varying,
    "feedback" "text",
    "content_id" "uuid",
    "dependency_action_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "instruction_id" "uuid" NOT NULL,
    "track_id" "uuid"
);


ALTER TABLE "public"."action" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."alembic_version" (
    "version_num" character varying(32) NOT NULL
);


ALTER TABLE "public"."alembic_version" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bluesky_content" (
    "content_id" "uuid" NOT NULL,
    "bluesky_content_url" character varying,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "bluesky_content_is_active" boolean,
    "bluesky_notes" character varying
);


ALTER TABLE "public"."bluesky_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content" (
    "content_id" "uuid" NOT NULL,
    "name" character varying,
    "type" character varying,
    "description" character varying,
    "url" character varying,
    "goals" character varying,
    "engagement_phase" "public"."engagement_phase_enum",
    "is_active" boolean,
    "notes" character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid"
);


ALTER TABLE "public"."content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."frequencies" (
    "frequency_id" "uuid" NOT NULL,
    "name" character varying,
    "description" character varying,
    "frequency_unit" character varying,
    "frequency_value" integer,
    "time_period" "public"."time_period_enum",
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "frequency_type" "public"."frequency_type_enum",
    "is_active" boolean,
    "notes" character varying,
    "instruction_id" "uuid"
);


ALTER TABLE "public"."frequencies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_accounts" (
    "account_id" "uuid" NOT NULL,
    "username" character varying,
    "profile_picture_url" character varying,
    "bio" character varying,
    "bio_url" character varying,
    "followers_count" integer,
    "following_count" integer,
    "total_media_count" integer,
    "account_type" character varying,
    "raw_payload" json
);


ALTER TABLE "public"."instagram_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_content" (
    "content_id" "uuid" NOT NULL,
    "post_type" "public"."media_type_enum",
    "caption" "text",
    "timestamp" timestamp without time zone,
    "permalink" character varying,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "saves_count" integer,
    "comments" json,
    "instagram_notes" character varying
);


ALTER TABLE "public"."instagram_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_hashtags" (
    "insight_id" "uuid" NOT NULL,
    "hashtag" character varying,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."instagram_hashtags" OWNER TO "postgres";


COMMENT ON COLUMN "public"."instagram_hashtags"."hashtag" IS 'The hashtag used in the post';



COMMENT ON COLUMN "public"."instagram_hashtags"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."instagram_media_insights" (
    "insight_id" "uuid" NOT NULL,
    "caption" character varying,
    "media_id" character varying,
    "media_type" character varying,
    "media_url" character varying,
    "permalink" character varying,
    "reach" integer,
    "impressions_count" integer,
    "saved" integer,
    "reels_plays" integer,
    "ig_reels_avg_watch_time" interval,
    "ig_reels_skip_rate" integer,
    "crossposted_views" integer,
    "views" integer,
    "likes" integer,
    "shares" integer,
    "total_interactions" integer,
    "navigation" integer,
    "story_navigation_action_type" json,
    "plays" integer,
    "profile_activity" integer,
    "action_type" json,
    "impressions" integer,
    "engagement_count" integer,
    "comments_count" integer,
    "replies" integer,
    "comments" json,
    "follower_growth" integer,
    "profile_links_taps" integer,
    "audience_demographics" json,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."instagram_media_insights" OWNER TO "postgres";


COMMENT ON COLUMN "public"."instagram_media_insights"."total_interactions" IS 'Number of likes, saves, comments, and shares on the reel, minus the number of unlikes, unsaves, and deleted comments';



COMMENT ON COLUMN "public"."instagram_media_insights"."navigation" IS 'This is the total number of actions taken from your story. These are made up of metrics like exited, forward, back and next story.';



COMMENT ON COLUMN "public"."instagram_media_insights"."story_navigation_action_type" IS 'Break down results by navigation action taken by the viewer upon viewing the media within the native app';



COMMENT ON COLUMN "public"."instagram_media_insights"."plays" IS 'Number of times the reels starts to play after an impression is already counted.';



COMMENT ON COLUMN "public"."instagram_media_insights"."profile_activity" IS 'The number of actions people take when they visit your profile after engaging with your post';



COMMENT ON COLUMN "public"."instagram_media_insights"."action_type" IS 'The type of action taken by the user';



COMMENT ON COLUMN "public"."instagram_media_insights"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."instagram_profile_insights" (
    "insight_id" "uuid" NOT NULL,
    "reach" integer,
    "impressions_count" integer,
    "profile_views_count" integer,
    "medica_count" integer,
    "follower_growth" integer,
    "profile_links_taps" integer,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."instagram_profile_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_reel" (
    "content_id" "uuid" NOT NULL,
    "instagram_reel_url" character varying,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "saves_count" integer,
    "instagram_reel_is_active" boolean,
    "instagram_reel_notes" character varying
);


ALTER TABLE "public"."instagram_reel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_story" (
    "content_id" "uuid" NOT NULL,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "instagram_story_is_active" boolean,
    "instagram_story_notes" character varying
);


ALTER TABLE "public"."instagram_story" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instructions" (
    "instruction_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying,
    "description" character varying,
    "instructions" "text",
    "goals" character varying,
    "is_active" boolean,
    "notes" character varying,
    "platform_id" "uuid",
    "dependency_instruction_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "phase" "public"."phase_enum",
    "source" character varying,
    "source_media" character varying
);


ALTER TABLE "public"."instructions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."instructions"."source" IS 'Source url of the instruction';



COMMENT ON COLUMN "public"."instructions"."source_media" IS 'Source media of the instruction';



CREATE TABLE IF NOT EXISTS "public"."knowledge_resource_chunks" (
    "chunk_id" "uuid" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "chunk_index" integer NOT NULL,
    "chunk_text" "text" NOT NULL,
    "token_count" integer,
    "embedding_provider" character varying,
    "embedding_model" character varying,
    "embedding_dimensions" integer,
    "embedding_reference" character varying,
    "retrieval_metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone
);


ALTER TABLE "public"."knowledge_resource_chunks" OWNER TO "postgres";


COMMENT ON COLUMN "public"."knowledge_resource_chunks"."embedding_reference" IS 'External vector ID/reference if vectors are stored outside this table.';



COMMENT ON COLUMN "public"."knowledge_resource_chunks"."retrieval_metadata" IS 'Chunk-level retrieval metadata (e.g., section, heading, page range).';



CREATE TABLE IF NOT EXISTS "public"."knowledge_resources" (
    "resource_id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "canonical_key" character varying NOT NULL,
    "version" integer NOT NULL,
    "parent_resource_id" "uuid",
    "title" character varying NOT NULL,
    "summary" "text",
    "category" "public"."knowledge_resource_category_enum" NOT NULL,
    "resource_format" "public"."knowledge_resource_format_enum" NOT NULL,
    "ingestion_method" "public"."knowledge_resource_ingestion_method_enum" NOT NULL,
    "source_url" character varying,
    "author" character varying,
    "publisher" character varying,
    "language" character varying,
    "tags" "jsonb" NOT NULL,
    "raw_text" "text",
    "retrieval_metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone
);


ALTER TABLE "public"."knowledge_resources" OWNER TO "postgres";


COMMENT ON COLUMN "public"."knowledge_resources"."workspace_id" IS 'Workspace scope; future change may convert this to a foreign key.';



COMMENT ON COLUMN "public"."knowledge_resources"."canonical_key" IS 'Stable identifier used to group immutable versions of the same resource.';



COMMENT ON COLUMN "public"."knowledge_resources"."tags" IS 'JSON array of tags. Example: ["seo", "retention", "positioning"]';



COMMENT ON COLUMN "public"."knowledge_resources"."raw_text" IS 'Canonical text representation for URL/text/prompt resources.';



COMMENT ON COLUMN "public"."knowledge_resources"."retrieval_metadata" IS 'Flexible metadata for future strategy mapping and retrieval filters.';



CREATE TABLE IF NOT EXISTS "public"."platforms" (
    "platform_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying,
    "type" "public"."platform_type",
    "description" character varying,
    "url" character varying,
    "account_data" character varying,
    "updated_at" timestamp without time zone,
    "is_active" boolean,
    "notes" character varying,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."platforms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reddit_content" (
    "content_id" "uuid" NOT NULL,
    "reddit_content_url" character varying,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "reddit_content_is_active" boolean,
    "reddit_notes" character varying
);


ALTER TABLE "public"."reddit_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."royalties" (
    "royalty_id" "uuid" NOT NULL,
    "right" "public"."royalty_right_enum",
    "royalty" "public"."royalty_type_enum",
    "platform_id" "uuid",
    "track_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone
);


ALTER TABLE "public"."royalties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."royalty_transactions" (
    "royalty_transaction_id" "uuid" NOT NULL,
    "amount" numeric(12,2),
    "currency" character varying,
    "royalty_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone
);


ALTER TABLE "public"."royalty_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."success_metrics" (
    "success_metrics_id" "uuid" NOT NULL,
    "success_metrics_name" character varying,
    "success_metrics_description" character varying,
    "target_value" integer,
    "target_value_unit" character varying,
    "success_metrics_is_active" boolean,
    "success_metrics_notes" character varying,
    "content_id" "uuid"
);


ALTER TABLE "public"."success_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."thread_content" (
    "content_id" "uuid" NOT NULL,
    "thread_content_url" character varying,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "saves_count" integer,
    "thread_content_is_active" boolean,
    "thread_notes" character varying
);


ALTER TABLE "public"."thread_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiktok_accounts" (
    "account_id" "uuid" NOT NULL,
    "username" character varying,
    "bio" character varying,
    "profile_image_url" character varying,
    "pinned_post_id" json,
    "post_count" integer,
    "list_count" integer,
    "followers_count" integer,
    "following_count" integer,
    "verified_status" "public"."verified_status",
    "account_type" character varying,
    "raw_payload" json
);


ALTER TABLE "public"."tiktok_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiktok_media_insights" (
    "insight_id" "uuid" NOT NULL,
    "media_id" character varying,
    "cover_image_url" character varying,
    "video_description" character varying,
    "duration" interval,
    "title" character varying,
    "like_count" integer,
    "comment_count" integer,
    "share_count" integer,
    "views_count" integer,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."tiktok_media_insights" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tiktok_media_insights"."media_id" IS 'The ID of the TikTok media';



COMMENT ON COLUMN "public"."tiktok_media_insights"."cover_image_url" IS 'A CDN link for the video''s cover image. ';



COMMENT ON COLUMN "public"."tiktok_media_insights"."video_description" IS 'The description of the video.';



COMMENT ON COLUMN "public"."tiktok_media_insights"."duration" IS 'The duration of the video in seconds.';



COMMENT ON COLUMN "public"."tiktok_media_insights"."title" IS 'The title of the video.';



COMMENT ON COLUMN "public"."tiktok_media_insights"."like_count" IS 'The number of likes the video has received.';



COMMENT ON COLUMN "public"."tiktok_media_insights"."comment_count" IS 'The number of comments the video has received.';



COMMENT ON COLUMN "public"."tiktok_media_insights"."share_count" IS 'The number of shares the video has received.';



COMMENT ON COLUMN "public"."tiktok_media_insights"."views_count" IS 'The number of views the video has received.';



CREATE TABLE IF NOT EXISTS "public"."tiktok_profile_insights" (
    "insight_id" "uuid" NOT NULL,
    "avatar_url" character varying,
    "bio_description" character varying,
    "profile_deep_link" character varying,
    "username" character varying,
    "followers_count" integer,
    "following_count" integer,
    "likes_count" integer,
    "videos_count" integer,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."tiktok_profile_insights" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tiktok_profile_insights"."avatar_url" IS 'The URL of the TikTok profile avatar';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."bio_description" IS 'The bio description of the TikTok profile';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."profile_deep_link" IS 'The link to user''s TikTok profile page';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."username" IS 'The username of the TikTok profile';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."followers_count" IS 'The number of followers the profile has.';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."following_count" IS 'The number of accounts the profile is following.';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."likes_count" IS 'The number of likes the profile has.';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."videos_count" IS 'The number of videos the profile has.';



COMMENT ON COLUMN "public"."tiktok_profile_insights"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."track" (
    "track_id" "uuid" NOT NULL,
    "track_description" "text",
    "track_notes" character varying,
    "track_title" character varying,
    "format" "public"."format_enum",
    "bitrate" integer,
    "sample_rate" integer,
    "version_subtitle" character varying,
    "release_date" timestamp without time zone,
    "isrc" character varying,
    "iwc" character varying,
    "upc" character varying,
    "lyrics" "text",
    "bpm" integer,
    "key" character varying,
    "genres" json,
    "duration_seconds" integer,
    "moods" json,
    "keyword_tags" json,
    "track_file_path" character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone
);


ALTER TABLE "public"."track" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."twitter_accounts" (
    "account_id" "uuid" NOT NULL,
    "username" character varying,
    "bio" character varying,
    "profile_image_url" character varying,
    "pinned_post_id" json,
    "post_count" integer,
    "list_count" integer,
    "followers_count" integer,
    "following_count" integer,
    "verified_status" "public"."verified_status",
    "account_type" character varying,
    "raw_payload" json
);


ALTER TABLE "public"."twitter_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."twitter_x_content" (
    "content_id" "uuid" NOT NULL,
    "twitter_x_content_url" character varying,
    "likes_count" integer,
    "shares_count" integer,
    "comments_count" integer,
    "twitter_x_content_is_active" boolean,
    "twitter_x_notes" character varying
);


ALTER TABLE "public"."twitter_x_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."twitter_x_content_insights" (
    "insight_id" "uuid" NOT NULL,
    "content" json,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."twitter_x_content_insights" OWNER TO "postgres";


COMMENT ON COLUMN "public"."twitter_x_content_insights"."content" IS 'The content of the post';



COMMENT ON COLUMN "public"."twitter_x_content_insights"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."twitter_x_mentions" (
    "insight_id" "uuid" NOT NULL,
    "mentions" json,
    "owner" json,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."twitter_x_mentions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."twitter_x_mentions"."mentions" IS 'The mentions in the post';



COMMENT ON COLUMN "public"."twitter_x_mentions"."owner" IS 'The owner of the post';



COMMENT ON COLUMN "public"."twitter_x_mentions"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."twitter_x_public_metrics" (
    "insight_id" "uuid" NOT NULL,
    "retweet_count" integer,
    "reply_count" integer,
    "like_count" integer,
    "quote_count" integer,
    "bookmark_count" integer,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."twitter_x_public_metrics" OWNER TO "postgres";


COMMENT ON COLUMN "public"."twitter_x_public_metrics"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."twitter_x_user_metrics" (
    "insight_id" "uuid" NOT NULL,
    "impressions" integer,
    "engagements" json,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."twitter_x_user_metrics" OWNER TO "postgres";


COMMENT ON COLUMN "public"."twitter_x_user_metrics"."impressions" IS 'The number of impressions of the post';



COMMENT ON COLUMN "public"."twitter_x_user_metrics"."engagements" IS 'The engagements of the post';



COMMENT ON COLUMN "public"."twitter_x_user_metrics"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."youtube_accounts" (
    "account_id" "uuid" NOT NULL,
    "username" character varying,
    "bio" character varying,
    "profile_image_url" character varying,
    "pinned_post_id" json,
    "post_count" integer,
    "list_count" integer,
    "followers_count" integer,
    "following_count" integer,
    "verified_status" "public"."verified_status",
    "account_type" character varying,
    "raw_payload" json
);


ALTER TABLE "public"."youtube_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youtube_channel_reports" (
    "report_id" "uuid" NOT NULL,
    "dimensions" character varying[],
    "filters" character varying[],
    "result" json,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."youtube_channel_reports" OWNER TO "postgres";


COMMENT ON COLUMN "public"."youtube_channel_reports"."dimensions" IS 'The dimension of the report';



COMMENT ON COLUMN "public"."youtube_channel_reports"."filters" IS 'The filters of the report';



COMMENT ON COLUMN "public"."youtube_channel_reports"."result" IS 'The result of the report';



COMMENT ON COLUMN "public"."youtube_channel_reports"."raw_payload" IS 'Data returned from the api';



CREATE TABLE IF NOT EXISTS "public"."youtube_content" (
    "content_id" "uuid" NOT NULL,
    "youtube_content_url" character varying,
    "views_count" integer,
    "likes_count" integer,
    "comments_count" integer,
    "youtube_content_is_active" boolean,
    "youtube_notes" character varying,
    "youtube_content_id" character varying
);


ALTER TABLE "public"."youtube_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youtube_short" (
    "content_id" "uuid" NOT NULL,
    "youtube_short_url" character varying,
    "youtube_short_is_active" boolean,
    "youtube_short_notes" character varying
);


ALTER TABLE "public"."youtube_short" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."youtube_video_reports" (
    "report_id" "uuid" NOT NULL,
    "dimensions" character varying[],
    "filters" character varying[],
    "result" json,
    "raw_payload" json,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone,
    "track_id" "uuid",
    "content_id" "uuid",
    "platform_id" "uuid"
);


ALTER TABLE "public"."youtube_video_reports" OWNER TO "postgres";


COMMENT ON COLUMN "public"."youtube_video_reports"."dimensions" IS 'The dimension of the report';



COMMENT ON COLUMN "public"."youtube_video_reports"."filters" IS 'The filters of the report';



COMMENT ON COLUMN "public"."youtube_video_reports"."result" IS 'The result of the report';



COMMENT ON COLUMN "public"."youtube_video_reports"."raw_payload" IS 'Data returned from the api';



ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "action_pkey" PRIMARY KEY ("action_id");



ALTER TABLE ONLY "public"."alembic_version"
    ADD CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num");



ALTER TABLE ONLY "public"."bluesky_content"
    ADD CONSTRAINT "bluesky_content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."content"
    ADD CONSTRAINT "content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."frequencies"
    ADD CONSTRAINT "frequencies_pkey" PRIMARY KEY ("frequency_id");



ALTER TABLE ONLY "public"."instagram_accounts"
    ADD CONSTRAINT "instagram_accounts_pkey" PRIMARY KEY ("account_id");



ALTER TABLE ONLY "public"."instagram_content"
    ADD CONSTRAINT "instagram_content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."instagram_hashtags"
    ADD CONSTRAINT "instagram_hashtags_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."instagram_media_insights"
    ADD CONSTRAINT "instagram_media_insights_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."instagram_profile_insights"
    ADD CONSTRAINT "instagram_profile_insights_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."instagram_reel"
    ADD CONSTRAINT "instagram_reel_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."instagram_story"
    ADD CONSTRAINT "instagram_story_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_pkey" PRIMARY KEY ("instruction_id");



ALTER TABLE ONLY "public"."knowledge_resource_chunks"
    ADD CONSTRAINT "knowledge_resource_chunks_pkey" PRIMARY KEY ("chunk_id");



ALTER TABLE ONLY "public"."knowledge_resources"
    ADD CONSTRAINT "knowledge_resources_pkey" PRIMARY KEY ("resource_id");



ALTER TABLE ONLY "public"."platforms"
    ADD CONSTRAINT "platforms_pkey" PRIMARY KEY ("platform_id");



ALTER TABLE ONLY "public"."reddit_content"
    ADD CONSTRAINT "reddit_content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."royalties"
    ADD CONSTRAINT "royalties_pkey" PRIMARY KEY ("royalty_id");



ALTER TABLE ONLY "public"."royalty_transactions"
    ADD CONSTRAINT "royalty_transactions_pkey" PRIMARY KEY ("royalty_transaction_id");



ALTER TABLE ONLY "public"."success_metrics"
    ADD CONSTRAINT "success_metrics_pkey" PRIMARY KEY ("success_metrics_id");



ALTER TABLE ONLY "public"."thread_content"
    ADD CONSTRAINT "thread_content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."tiktok_accounts"
    ADD CONSTRAINT "tiktok_accounts_pkey" PRIMARY KEY ("account_id");



ALTER TABLE ONLY "public"."tiktok_media_insights"
    ADD CONSTRAINT "tiktok_media_insights_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."tiktok_profile_insights"
    ADD CONSTRAINT "tiktok_profile_insights_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."track"
    ADD CONSTRAINT "track_pkey" PRIMARY KEY ("track_id");



ALTER TABLE ONLY "public"."twitter_accounts"
    ADD CONSTRAINT "twitter_accounts_pkey" PRIMARY KEY ("account_id");



ALTER TABLE ONLY "public"."twitter_x_content_insights"
    ADD CONSTRAINT "twitter_x_content_insights_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."twitter_x_content"
    ADD CONSTRAINT "twitter_x_content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."twitter_x_mentions"
    ADD CONSTRAINT "twitter_x_mentions_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."twitter_x_public_metrics"
    ADD CONSTRAINT "twitter_x_public_metrics_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."twitter_x_user_metrics"
    ADD CONSTRAINT "twitter_x_user_metrics_pkey" PRIMARY KEY ("insight_id");



ALTER TABLE ONLY "public"."knowledge_resource_chunks"
    ADD CONSTRAINT "uq_knowledge_resource_chunk_index" UNIQUE ("resource_id", "chunk_index");



ALTER TABLE ONLY "public"."knowledge_resources"
    ADD CONSTRAINT "uq_knowledge_resource_workspace_key_version" UNIQUE ("workspace_id", "canonical_key", "version");



ALTER TABLE ONLY "public"."youtube_accounts"
    ADD CONSTRAINT "youtube_accounts_pkey" PRIMARY KEY ("account_id");



ALTER TABLE ONLY "public"."youtube_channel_reports"
    ADD CONSTRAINT "youtube_channel_reports_pkey" PRIMARY KEY ("report_id");



ALTER TABLE ONLY "public"."youtube_content"
    ADD CONSTRAINT "youtube_content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."youtube_content"
    ADD CONSTRAINT "youtube_content_youtube_content_id_key" UNIQUE ("youtube_content_id");



ALTER TABLE ONLY "public"."youtube_short"
    ADD CONSTRAINT "youtube_short_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."youtube_video_reports"
    ADD CONSTRAINT "youtube_video_reports_pkey" PRIMARY KEY ("report_id");



CREATE INDEX "ix_action_action_id" ON "public"."action" USING "btree" ("action_id");



CREATE INDEX "ix_content_content_id" ON "public"."content" USING "btree" ("content_id");



CREATE INDEX "ix_frequencies_frequency_id" ON "public"."frequencies" USING "btree" ("frequency_id");



CREATE INDEX "ix_instructions_instruction_id" ON "public"."instructions" USING "btree" ("instruction_id");



CREATE INDEX "ix_knowledge_resource_chunks_chunk_id" ON "public"."knowledge_resource_chunks" USING "btree" ("chunk_id");



CREATE INDEX "ix_knowledge_resource_chunks_resource_id" ON "public"."knowledge_resource_chunks" USING "btree" ("resource_id");



CREATE INDEX "ix_knowledge_resources_resource_id" ON "public"."knowledge_resources" USING "btree" ("resource_id");



CREATE UNIQUE INDEX "ix_platforms_name" ON "public"."platforms" USING "btree" ("name");



CREATE INDEX "ix_platforms_platform_id" ON "public"."platforms" USING "btree" ("platform_id");



CREATE INDEX "ix_success_metrics_success_metrics_id" ON "public"."success_metrics" USING "btree" ("success_metrics_id");



CREATE INDEX "ix_track_track_id" ON "public"."track" USING "btree" ("track_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."action" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."content" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."instagram_hashtags" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."instagram_media_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."instagram_profile_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."instructions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."knowledge_resource_chunks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."knowledge_resources" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."platforms" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."royalties" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."royalty_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."tiktok_media_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."tiktok_profile_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."track" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."twitter_x_content_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."twitter_x_mentions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."twitter_x_public_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."twitter_x_user_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."youtube_channel_reports" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."youtube_video_reports" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "action_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "action_dependency_action_id_fkey" FOREIGN KEY ("dependency_action_id") REFERENCES "public"."action"("action_id");



ALTER TABLE ONLY "public"."bluesky_content"
    ADD CONSTRAINT "bluesky_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."content"
    ADD CONSTRAINT "content_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "fk_action_instruction_id" FOREIGN KEY ("instruction_id") REFERENCES "public"."instructions"("instruction_id");



ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "fk_action_track_id" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."frequencies"
    ADD CONSTRAINT "frequencies_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "public"."instructions"("instruction_id");



ALTER TABLE ONLY "public"."instagram_accounts"
    ADD CONSTRAINT "instagram_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."instagram_content"
    ADD CONSTRAINT "instagram_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."instagram_hashtags"
    ADD CONSTRAINT "instagram_hashtags_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."instagram_hashtags"
    ADD CONSTRAINT "instagram_hashtags_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."instagram_hashtags"
    ADD CONSTRAINT "instagram_hashtags_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."instagram_media_insights"
    ADD CONSTRAINT "instagram_media_insights_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."instagram_media_insights"
    ADD CONSTRAINT "instagram_media_insights_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."instagram_media_insights"
    ADD CONSTRAINT "instagram_media_insights_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."instagram_profile_insights"
    ADD CONSTRAINT "instagram_profile_insights_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."instagram_profile_insights"
    ADD CONSTRAINT "instagram_profile_insights_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."instagram_profile_insights"
    ADD CONSTRAINT "instagram_profile_insights_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."instagram_reel"
    ADD CONSTRAINT "instagram_reel_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."instagram_story"
    ADD CONSTRAINT "instagram_story_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_dependency_instruction_id_fkey" FOREIGN KEY ("dependency_instruction_id") REFERENCES "public"."instructions"("instruction_id");



ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."knowledge_resource_chunks"
    ADD CONSTRAINT "knowledge_resource_chunks_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."knowledge_resources"("resource_id");



ALTER TABLE ONLY "public"."knowledge_resources"
    ADD CONSTRAINT "knowledge_resources_parent_resource_id_fkey" FOREIGN KEY ("parent_resource_id") REFERENCES "public"."knowledge_resources"("resource_id");



ALTER TABLE ONLY "public"."reddit_content"
    ADD CONSTRAINT "reddit_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."royalties"
    ADD CONSTRAINT "royalties_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."royalties"
    ADD CONSTRAINT "royalties_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."royalty_transactions"
    ADD CONSTRAINT "royalty_transactions_royalty_id_fkey" FOREIGN KEY ("royalty_id") REFERENCES "public"."royalties"("royalty_id");



ALTER TABLE ONLY "public"."success_metrics"
    ADD CONSTRAINT "success_metrics_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."thread_content"
    ADD CONSTRAINT "thread_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."tiktok_accounts"
    ADD CONSTRAINT "tiktok_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."tiktok_media_insights"
    ADD CONSTRAINT "tiktok_media_insights_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."tiktok_media_insights"
    ADD CONSTRAINT "tiktok_media_insights_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."tiktok_media_insights"
    ADD CONSTRAINT "tiktok_media_insights_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."tiktok_profile_insights"
    ADD CONSTRAINT "tiktok_profile_insights_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."tiktok_profile_insights"
    ADD CONSTRAINT "tiktok_profile_insights_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."tiktok_profile_insights"
    ADD CONSTRAINT "tiktok_profile_insights_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."twitter_accounts"
    ADD CONSTRAINT "twitter_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."twitter_x_content"
    ADD CONSTRAINT "twitter_x_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."twitter_x_content_insights"
    ADD CONSTRAINT "twitter_x_content_insights_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."twitter_x_content_insights"
    ADD CONSTRAINT "twitter_x_content_insights_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."twitter_x_content_insights"
    ADD CONSTRAINT "twitter_x_content_insights_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."twitter_x_mentions"
    ADD CONSTRAINT "twitter_x_mentions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."twitter_x_mentions"
    ADD CONSTRAINT "twitter_x_mentions_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."twitter_x_mentions"
    ADD CONSTRAINT "twitter_x_mentions_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."twitter_x_public_metrics"
    ADD CONSTRAINT "twitter_x_public_metrics_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."twitter_x_public_metrics"
    ADD CONSTRAINT "twitter_x_public_metrics_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."twitter_x_public_metrics"
    ADD CONSTRAINT "twitter_x_public_metrics_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."twitter_x_user_metrics"
    ADD CONSTRAINT "twitter_x_user_metrics_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."twitter_x_user_metrics"
    ADD CONSTRAINT "twitter_x_user_metrics_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."twitter_x_user_metrics"
    ADD CONSTRAINT "twitter_x_user_metrics_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."youtube_accounts"
    ADD CONSTRAINT "youtube_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."youtube_channel_reports"
    ADD CONSTRAINT "youtube_channel_reports_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."youtube_channel_reports"
    ADD CONSTRAINT "youtube_channel_reports_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."youtube_channel_reports"
    ADD CONSTRAINT "youtube_channel_reports_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");



ALTER TABLE ONLY "public"."youtube_content"
    ADD CONSTRAINT "youtube_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."youtube_short"
    ADD CONSTRAINT "youtube_short_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."youtube_video_reports"
    ADD CONSTRAINT "youtube_video_reports_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id");



ALTER TABLE ONLY "public"."youtube_video_reports"
    ADD CONSTRAINT "youtube_video_reports_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("platform_id");



ALTER TABLE ONLY "public"."youtube_video_reports"
    ADD CONSTRAINT "youtube_video_reports_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."track"("track_id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."action" TO "anon";
GRANT ALL ON TABLE "public"."action" TO "authenticated";
GRANT ALL ON TABLE "public"."action" TO "service_role";



GRANT ALL ON TABLE "public"."alembic_version" TO "anon";
GRANT ALL ON TABLE "public"."alembic_version" TO "authenticated";
GRANT ALL ON TABLE "public"."alembic_version" TO "service_role";



GRANT ALL ON TABLE "public"."bluesky_content" TO "anon";
GRANT ALL ON TABLE "public"."bluesky_content" TO "authenticated";
GRANT ALL ON TABLE "public"."bluesky_content" TO "service_role";



GRANT ALL ON TABLE "public"."content" TO "anon";
GRANT ALL ON TABLE "public"."content" TO "authenticated";
GRANT ALL ON TABLE "public"."content" TO "service_role";



GRANT ALL ON TABLE "public"."frequencies" TO "anon";
GRANT ALL ON TABLE "public"."frequencies" TO "authenticated";
GRANT ALL ON TABLE "public"."frequencies" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_accounts" TO "anon";
GRANT ALL ON TABLE "public"."instagram_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_content" TO "anon";
GRANT ALL ON TABLE "public"."instagram_content" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_content" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_hashtags" TO "anon";
GRANT ALL ON TABLE "public"."instagram_hashtags" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_hashtags" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_media_insights" TO "anon";
GRANT ALL ON TABLE "public"."instagram_media_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_media_insights" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_profile_insights" TO "anon";
GRANT ALL ON TABLE "public"."instagram_profile_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_profile_insights" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_reel" TO "anon";
GRANT ALL ON TABLE "public"."instagram_reel" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_reel" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_story" TO "anon";
GRANT ALL ON TABLE "public"."instagram_story" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_story" TO "service_role";



GRANT ALL ON TABLE "public"."instructions" TO "anon";
GRANT ALL ON TABLE "public"."instructions" TO "authenticated";
GRANT ALL ON TABLE "public"."instructions" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_resource_chunks" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_resource_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_resource_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_resources" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_resources" TO "service_role";



GRANT ALL ON TABLE "public"."platforms" TO "anon";
GRANT ALL ON TABLE "public"."platforms" TO "authenticated";
GRANT ALL ON TABLE "public"."platforms" TO "service_role";



GRANT ALL ON TABLE "public"."reddit_content" TO "anon";
GRANT ALL ON TABLE "public"."reddit_content" TO "authenticated";
GRANT ALL ON TABLE "public"."reddit_content" TO "service_role";



GRANT ALL ON TABLE "public"."royalties" TO "anon";
GRANT ALL ON TABLE "public"."royalties" TO "authenticated";
GRANT ALL ON TABLE "public"."royalties" TO "service_role";



GRANT ALL ON TABLE "public"."royalty_transactions" TO "anon";
GRANT ALL ON TABLE "public"."royalty_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."royalty_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."success_metrics" TO "anon";
GRANT ALL ON TABLE "public"."success_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."success_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."thread_content" TO "anon";
GRANT ALL ON TABLE "public"."thread_content" TO "authenticated";
GRANT ALL ON TABLE "public"."thread_content" TO "service_role";



GRANT ALL ON TABLE "public"."tiktok_accounts" TO "anon";
GRANT ALL ON TABLE "public"."tiktok_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."tiktok_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."tiktok_media_insights" TO "anon";
GRANT ALL ON TABLE "public"."tiktok_media_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."tiktok_media_insights" TO "service_role";



GRANT ALL ON TABLE "public"."tiktok_profile_insights" TO "anon";
GRANT ALL ON TABLE "public"."tiktok_profile_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."tiktok_profile_insights" TO "service_role";



GRANT ALL ON TABLE "public"."track" TO "anon";
GRANT ALL ON TABLE "public"."track" TO "authenticated";
GRANT ALL ON TABLE "public"."track" TO "service_role";



GRANT ALL ON TABLE "public"."twitter_accounts" TO "anon";
GRANT ALL ON TABLE "public"."twitter_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."twitter_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."twitter_x_content" TO "anon";
GRANT ALL ON TABLE "public"."twitter_x_content" TO "authenticated";
GRANT ALL ON TABLE "public"."twitter_x_content" TO "service_role";



GRANT ALL ON TABLE "public"."twitter_x_content_insights" TO "anon";
GRANT ALL ON TABLE "public"."twitter_x_content_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."twitter_x_content_insights" TO "service_role";



GRANT ALL ON TABLE "public"."twitter_x_mentions" TO "anon";
GRANT ALL ON TABLE "public"."twitter_x_mentions" TO "authenticated";
GRANT ALL ON TABLE "public"."twitter_x_mentions" TO "service_role";



GRANT ALL ON TABLE "public"."twitter_x_public_metrics" TO "anon";
GRANT ALL ON TABLE "public"."twitter_x_public_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."twitter_x_public_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."twitter_x_user_metrics" TO "anon";
GRANT ALL ON TABLE "public"."twitter_x_user_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."twitter_x_user_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_accounts" TO "anon";
GRANT ALL ON TABLE "public"."youtube_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_channel_reports" TO "anon";
GRANT ALL ON TABLE "public"."youtube_channel_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_channel_reports" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_content" TO "anon";
GRANT ALL ON TABLE "public"."youtube_content" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_content" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_short" TO "anon";
GRANT ALL ON TABLE "public"."youtube_short" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_short" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_video_reports" TO "anon";
GRANT ALL ON TABLE "public"."youtube_video_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_video_reports" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































