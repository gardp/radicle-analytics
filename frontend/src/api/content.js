// ==========================================================================
// src/api/content.js — Content CRUD API Module
// ==========================================================================
// Purpose:
//   Provides functions for managing Content entities. Content represents
//   individual social-media posts, videos, or other creative assets
//   associated with a Track (e.g. an Instagram Reel, a YouTube Short).
//   Content is polymorphic in the backend — the "type" discriminator
//   determines which platform-specific fields are present.
//
// Backend endpoints (all in backend/api/content.py):
//   GET    /api/content          → list content (optional ?track_id= filter)
//   GET    /api/content/:id      → get a single content item by UUID
//   POST   /api/content          → create new content (body includes track_id)
//   PUT    /api/content/:id      → update existing content
//   DELETE /api/content/:id      → delete content
//
// Backend models/schemas:
//   - Content model (backend models) — polymorphic base with columns:
//     content_id, track_id (FK→Track), name, type, description, url,
//     engagement_phase, goals, is_active, likes_count, shares_count,
//     comments_count, notes, etc.
//   - ContentCreate / ContentUpdate / ContentResponse (backend/schemas/)
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → createContent, updateContent,
//       deleteContent (via inline handlers for the Content accordion section)
// ==========================================================================
import client from './client';

// listContent — GET /api/content; params may include { track_id: "<uuid>" }
export const listContent = (params) => client.get('/api/content', { params });
// getContent — GET /api/content/:id; returns a single ContentResponse
export const getContent = (id) => client.get(`/api/content/${id}`);
// createContent — POST /api/content; body is a ContentCreate payload (includes track_id)
export const createContent = (data) => client.post('/api/content', data);
// updateContent — PUT /api/content/:id; body is a ContentUpdate payload
export const updateContent = (id, data) => client.put(`/api/content/${id}`, data);
// deleteContent — DELETE /api/content/:id
export const deleteContent = (id) => client.delete(`/api/content/${id}`);
