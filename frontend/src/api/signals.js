// ==========================================================================
// src/api/signals.js — Signal CRUD API Module (Registry-Based)
// ==========================================================================
// Purpose:
//   Provides generic CRUD functions for Signal entities. The backend uses a
//   registry-based pattern — the signalType path segment determines which
//   signal table is targeted (e.g. "instagram", "tiktok", "twitter").
//   This allows a single set of functions to manage all signal types.
//
// Backend endpoints (backend/api/signals.py — registry-based router):
//   GET    /api/signals/:signalType          → list signals of a given type
//   GET    /api/signals/:signalType/:id      → get single signal by UUID
//   POST   /api/signals/:signalType          → create signal
//   PUT    /api/signals/:signalType/:id      → update signal
//   DELETE /api/signals/:signalType/:id      → delete signal
//
// Backend models/schemas:
//   - Multiple signal tables (one per platform): each has FKs to
//     track_id, content_id, platform_id and platform-specific metric columns
//     (e.g. impressions, reach, followers for Instagram; likes, views for TikTok)
//   - Signal schemas are generated dynamically by the registry in the backend
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - Currently available for any component that needs to read/write signal
//     data. The dashboard charts consume aggregated signal data via the
//     /api/dashboard/* endpoints instead of calling these directly.
// ==========================================================================
import client from './client';

// listSignals — GET /api/signals/:signalType; signalType e.g. "instagram", "tiktok"
export const listSignals = (signalType, params) => client.get(`/api/signals/${signalType}`, { params });
// getSignal — GET /api/signals/:signalType/:id
export const getSignal = (signalType, id) => client.get(`/api/signals/${signalType}/${id}`);
// createSignal — POST /api/signals/:signalType; body varies by signal type
export const createSignal = (signalType, data) => client.post(`/api/signals/${signalType}`, data);
// updateSignal — PUT /api/signals/:signalType/:id
export const updateSignal = (signalType, id, data) => client.put(`/api/signals/${signalType}/${id}`, data);
// deleteSignal — DELETE /api/signals/:signalType/:id
export const deleteSignal = (signalType, id) => client.delete(`/api/signals/${signalType}/${id}`);
