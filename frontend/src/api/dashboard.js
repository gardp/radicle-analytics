// ==========================================================================
// src/api/dashboard.js — Dashboard Aggregation API Module
// ==========================================================================
// Purpose:
//   Provides functions for fetching pre-aggregated analytics data that
//   powers the Dashboard page charts. Unlike other API modules that perform
//   entity-level CRUD, these endpoints return computed summaries across
//   multiple tables (signals, content, royalties, actions, instructions).
//
// Backend endpoints (all in backend/api/dashboard.py):
//   GET /api/dashboard/platform-metrics     → aggregated signal metrics per platform
//     Query params: { period, track_id }
//     Response: { instagram: {...}, tiktok: {...}, twitter: {...} }
//
//   GET /api/dashboard/content-performance  → engagement stats grouped by content type
//     Query params: { period, track_id }
//     Response: { by_type: {...}, top_content: [...], total_count: N }
//
//   GET /api/dashboard/royalty-income       → revenue breakdown by type and platform
//     Query params: { period, track_id }
//     Response: { by_type: {...}, by_platform: {...}, grand_total: N }
//
//   GET /api/dashboard/action-pipeline      → action status distribution + deadlines
//     Query params: { period, track_id }
//     Response: { status_breakdown: {...}, by_phase: {...}, upcoming_deadlines: [...] }
//
//   GET /api/dashboard/notifications        → upcoming deadlines within 14 days
//     No params required
//     Response: [ { label, due_date, type }, ... ]
//
// Backend models/schemas:
//   - These endpoints aggregate across Track, Content, Platform, Royalty,
//     RoyaltyTransaction, Action, Instruction, and Signal tables.
//   - No dedicated Pydantic schemas; responses are ad-hoc dicts.
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → getPlatformMetrics,
//       getContentPerformance, getRoyaltyIncome, getActionPipeline
//   - components/dashboard/NotificationPanel.jsx → getNotifications
// ==========================================================================
import client from './client';

// getPlatformMetrics — fetches aggregated signal data per platform (Instagram, TikTok, Twitter)
// Params: { period: "30d", track_id: "<uuid>" (optional) }
export const getPlatformMetrics = (params) => client.get('/api/dashboard/platform-metrics', { params });
// getContentPerformance — fetches engagement stats (likes/shares/comments) grouped by content type
export const getContentPerformance = (params) => client.get('/api/dashboard/content-performance', { params });
// getRoyaltyIncome — fetches revenue totals broken down by royalty type and platform
export const getRoyaltyIncome = (params) => client.get('/api/dashboard/royalty-income', { params });
// getActionPipeline — fetches action status counts, phase distribution, and upcoming deadlines
export const getActionPipeline = (params) => client.get('/api/dashboard/action-pipeline', { params });
// getNotifications — fetches upcoming deadlines within the next 14 days (no params needed)
export const getNotifications = () => client.get('/api/dashboard/notifications');
