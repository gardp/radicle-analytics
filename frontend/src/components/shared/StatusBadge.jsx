// ==========================================================================
// src/components/shared/StatusBadge.jsx — Colored Badge for Entity Statuses
// ==========================================================================
// Purpose:
//   Renders a Bootstrap Badge whose color and label are determined by the
//   entity type and raw enum value from the backend. This centralises the
//   mapping from backend enum strings (e.g. "in_progress", "distribution")
//   to user-friendly labels and Bootstrap color variants.
//
// Supported types:
//   "action"   → uses ACTION_STATUS_VARIANTS / ACTION_STATUS_LABELS
//   "phase"    → uses PHASE_LABELS, always "info" (cyan) variant
//   "platform" → uses PLATFORM_TYPE_VARIANTS / PLATFORM_TYPE_LABELS
//   "content"  → always "primary" (blue), underscores replaced with spaces
//   "format"   → always "dark", value uppercased (e.g. "mp3" → "MP3")
//
// Props:
//   type  — string, one of the supported types above
//   value — raw enum string from the backend (e.g. "pending", "pre", "tool")
//
// Internal dependencies:
//   - react-bootstrap (Badge)
//   - utils/constants → ACTION_STATUS_VARIANTS, ACTION_STATUS_LABELS,
//       PHASE_LABELS, PLATFORM_TYPE_VARIANTS, PLATFORM_TYPE_LABELS
//
// Relationship to backend:
//   - The `value` prop matches database enum values:
//     Action.status, Instruction.phase, Platform.type, Content.type, Track.format
//
// Used by:
//   - components/tracks/TrackCard.jsx             → format badge
//   - components/ecosystem/PlatformSection.jsx    → platform type + active badges
//   - components/ecosystem/InstructionSection.jsx → phase badge + inactive indicator
//   - components/ecosystem/ContentSection.jsx     → content type badge
//   - components/ecosystem/ActionSection.jsx      → action status badge
//   - components/general-parameters/InstructionCard.jsx → phase badge
//   - components/general-parameters/PlatformCard.jsx    → platform type badge
// ==========================================================================
import React from 'react';
import Badge from 'react-bootstrap/Badge';
// Import constant mappings that translate backend enum values to display labels and colors
import {
  ACTION_STATUS_VARIANTS,
  ACTION_STATUS_LABELS,
  PHASE_LABELS,
  PLATFORM_TYPE_VARIANTS,
  PLATFORM_TYPE_LABELS,
} from '../../utils/constants';

// --------------------------------------------------------------------------
// StatusBadge — renders a color-coded Bootstrap Badge for any entity status.
// Returns null if value is falsy (nothing to display).
// --------------------------------------------------------------------------
export default function StatusBadge({ type, value }) {
  if (!value) return null;

  // Default to gray ("secondary") if the type/value combination is unrecognized
  let variant = 'secondary';
  let label = value;

  // Select the appropriate color variant and human-readable label
  // based on the entity type
  if (type === 'action') {
    // Action statuses: pending (yellow), in_progress (cyan), completed (green), failed (red)
    variant = ACTION_STATUS_VARIANTS[value] || 'secondary';
    label = ACTION_STATUS_LABELS[value] || value;
  } else if (type === 'phase') {
    // Instruction phases: pre, during, post, various — all rendered in cyan
    variant = 'info';
    label = PHASE_LABELS[value] || value;
  } else if (type === 'platform') {
    // Platform types: distribution (blue), admin (gray), tool (cyan), etc.
    variant = PLATFORM_TYPE_VARIANTS[value] || 'secondary';
    label = PLATFORM_TYPE_LABELS[value] || value;
  } else if (type === 'content') {
    // Content types: always blue; underscores in the DB value become spaces
    variant = 'primary';
    label = value.replace(/_/g, ' ');
  } else if (type === 'format') {
    // Track audio formats: shown in dark badge, uppercased (e.g. "flac" → "FLAC")
    variant = 'dark';
    label = value.toUpperCase();
  }

  return <Badge bg={variant} className="text-capitalize">{label}</Badge>;
}
