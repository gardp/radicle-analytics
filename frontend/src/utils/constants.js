// ==========================================================================
// src/utils/constants.js — Shared Constants & Enum Mappings
// ==========================================================================
// Purpose:
//   Central repository for all application-wide constants, enum option
//   arrays, and display-label / Bootstrap-variant mappings. Keeping these
//   in one file ensures consistency between forms, badges, filters, and
//   charts across the entire frontend.
//
// How these map to the backend:
//   The string values defined here correspond directly to enum values and
//   column choices stored in the PostgreSQL database and validated by the
//   FastAPI Pydantic schemas in backend/schemas/. For example:
//     - PHASE_OPTIONS values ("pre", "during", "post", "various") match the
//       Instruction.phase column (backend/api/instructions.py).
//     - ACTION_STATUS_* keys match Action.status (backend/api/actions.py,
//       backend models Action model).
//     - CONTENT_TYPE_OPTIONS values match Content.type (backend/api/content.py,
//       backend models Content polymorphic model).
//     - PLATFORM_TYPE_* keys match Platform.type (backend/api/platforms.py,
//       backend models Platform polymorphic model).
//     - ROYALTY_RIGHT_OPTIONS / ROYALTY_TYPE_OPTIONS match Royalty.right and
//       Royalty.royalty columns (backend/api/royalties.py, Royalty model).
//     - FORMAT_OPTIONS match Track.format (backend/api/tracks.py, Track model).
//     - FREQUENCY_TYPE_OPTIONS / TIME_PERIOD_OPTIONS match Frequency model
//       columns (backend/api/instructions.py frequencies sub-routes).
//
// Used by (frontend consumers):
//   - components/dashboard/PeriodFilter.jsx       → PERIOD_OPTIONS
//   - components/dashboard/ActionPipelineCharts.jsx → ACTION_STATUS_VARIANTS
//   - components/dashboard/TrackFilter.jsx         → (indirectly, track data)
//   - components/shared/StatusBadge.jsx            → ACTION_STATUS_VARIANTS,
//       ACTION_STATUS_LABELS, PHASE_LABELS, PLATFORM_TYPE_VARIANTS,
//       PLATFORM_TYPE_LABELS
//   - components/ecosystem/EcosystemView.jsx       → PHASE_OPTIONS,
//       ENGAGEMENT_PHASE_OPTIONS, CONTENT_TYPE_OPTIONS, ROYALTY_RIGHT_OPTIONS,
//       ROYALTY_TYPE_OPTIONS, FREQUENCY_TYPE_OPTIONS, TIME_PERIOD_OPTIONS
//   - components/ecosystem/InstructionSection.jsx  → PHASE_LABELS
//   - components/tracks/TrackCreateModal.jsx       → FORMAT_OPTIONS
//   - components/tracks/TrackModal.jsx             → FORMAT_OPTIONS
//   - components/general-parameters/GeneralParametersPage.jsx → PHASE_OPTIONS
//   - components/general-parameters/InstructionModal.jsx → PHASE_OPTIONS,
//       FREQUENCY_TYPE_OPTIONS, TIME_PERIOD_OPTIONS
// ==========================================================================

// --------------------------------------------------------------------------
// Dashboard period filter options — sent as the "period" query param to all
// GET /api/dashboard/* endpoints. The backend parses these strings to
// calculate date ranges for aggregating metrics.
// --------------------------------------------------------------------------
export const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '180d', label: 'Last 6 months' },
  { value: '365d', label: 'Last 365 days' },
  { value: 'all', label: 'All time' },
];

// --------------------------------------------------------------------------
// Instruction phase options — used in dropdowns for creating / editing
// instructions. The empty-string option ("All Phases") is used as a
// filter wildcard on the General Parameters page and is NOT sent to the
// backend when creating an instruction.
// Maps to: Instruction.phase column (backend Instruction model)
// --------------------------------------------------------------------------
export const PHASE_OPTIONS = [
  { value: '', label: 'All Phases' },
  { value: 'pre', label: 'Pre-Release' },
  { value: 'during', label: 'During Release' },
  { value: 'post', label: 'Post-Release' },
  { value: 'various', label: 'Various' },
];

// --------------------------------------------------------------------------
// Phase display labels — maps phase enum keys to human-readable strings.
// Used by StatusBadge (type="phase") and InstructionSection group headings.
// --------------------------------------------------------------------------
export const PHASE_LABELS = {
  pre: 'Pre-Release',
  during: 'During Release',
  post: 'Post-Release',
  various: 'Various',
};

// --------------------------------------------------------------------------
// Action status display labels — human-readable names for action statuses.
// Maps to: Action.status column (backend Action model)
// Used by: StatusBadge (type="action")
// --------------------------------------------------------------------------
export const ACTION_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
};

// --------------------------------------------------------------------------
// Action status → Bootstrap Badge variant mapping.
// Determines the color of status badges rendered by StatusBadge component.
// Also used directly by ActionPipelineCharts for deadline badge colors.
// --------------------------------------------------------------------------
export const ACTION_STATUS_VARIANTS = {
  pending: 'warning',      // yellow
  in_progress: 'info',     // cyan
  completed: 'success',    // green
  failed: 'danger',        // red
};

// --------------------------------------------------------------------------
// Platform type display labels — human-readable names for platform types.
// Maps to: Platform.type column (backend Platform polymorphic model)
// Used by: StatusBadge (type="platform")
// --------------------------------------------------------------------------
export const PLATFORM_TYPE_LABELS = {
  distribution: 'Distribution',
  admin: 'Admin',
  tool: 'Tool',
  promotion: 'Promotion',
  analytics: 'Analytics',
};

// --------------------------------------------------------------------------
// Platform type → Bootstrap Badge variant mapping.
// Determines the color of platform-type badges in StatusBadge and cards.
// --------------------------------------------------------------------------
export const PLATFORM_TYPE_VARIANTS = {
  distribution: 'primary',    // blue
  admin: 'secondary',         // gray
  tool: 'info',               // cyan
  promotion: 'success',       // green
  analytics: 'warning',       // yellow
};

// --------------------------------------------------------------------------
// Content engagement phase options — simple string array used in Content
// creation/edit forms (EntityForm select field). Represents the marketing
// funnel stage a piece of content targets.
// Maps to: Content.engagement_phase column (backend Content model)
// --------------------------------------------------------------------------
export const ENGAGEMENT_PHASE_OPTIONS = [
  'awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase',
];

// --------------------------------------------------------------------------
// Track audio format options — used in TrackCreateModal and TrackModal
// form select fields for Track.format.
// Maps to: Track.format column (backend Track model)
// --------------------------------------------------------------------------
export const FORMAT_OPTIONS = ['mp3', 'wav', 'flac', 'aiff', 'other'];

// --------------------------------------------------------------------------
// Content type options — used in Content creation/edit forms. Each value
// corresponds to a specific social media content format.
// Maps to: Content.type column (backend Content polymorphic model —
// discriminates between InstagramPost, TwitterXPost, etc.)
// --------------------------------------------------------------------------
export const CONTENT_TYPE_OPTIONS = [
  { value: 'instagram_post', label: 'Instagram Post' },
  { value: 'instagram_story', label: 'Instagram Story' },
  { value: 'instagram_reel', label: 'Instagram Reel' },
  { value: 'twitter_x_post', label: 'Twitter/X Post' },
  { value: 'reddit_post', label: 'Reddit Post' },
  { value: 'thread_post', label: 'Thread Post' },
  { value: 'bluesky_post', label: 'Bluesky Post' },
  { value: 'youtube_video', label: 'YouTube Video' },
  { value: 'youtube_short', label: 'YouTube Short' },
];

// --------------------------------------------------------------------------
// Royalty right options — used in Royalty creation/edit forms.
// Maps to: Royalty.right column (backend Royalty model)
// --------------------------------------------------------------------------
export const ROYALTY_RIGHT_OPTIONS = ['Master', 'Recording'];

// --------------------------------------------------------------------------
// Royalty type options — used in Royalty creation/edit forms.
// Maps to: Royalty.royalty column (backend Royalty model)
// --------------------------------------------------------------------------
export const ROYALTY_TYPE_OPTIONS = [
  'Mechanical', 'Performance', 'Synchronization', 'Neighboring',
  'Reproduction', 'Digital', 'Physical',
];

// --------------------------------------------------------------------------
// Frequency scheduling options — used in InstructionModal frequency forms.
// Maps to: Frequency.frequency_type and Frequency.time_period columns
// (backend Frequency model, managed under instructions sub-routes)
// --------------------------------------------------------------------------
export const FREQUENCY_TYPE_OPTIONS = ['recurring', 'one-time'];
export const TIME_PERIOD_OPTIONS = ['definite', 'indefinite'];
