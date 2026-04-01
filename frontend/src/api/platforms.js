// ==========================================================================
// src/api/platforms.js — Platform CRUD API Module
// ==========================================================================
// Purpose:
//   Provides functions for managing Platform entities. Platforms represent
//   external services (Spotify, Instagram, TikTok, etc.) that a track is
//   distributed to or managed through. Platforms are polymorphic in the
//   backend — different types (distribution, admin, tool, promotion,
//   analytics) may carry different metadata fields.
//
// Backend endpoints (all in backend/api/platforms.py):
//   GET    /api/platforms          → list all platforms (optional query params)
//   GET    /api/platforms/:id      → get a single platform by UUID
//   POST   /api/platforms          → create a new platform
//   PUT    /api/platforms/:id      → update an existing platform
//   DELETE /api/platforms/:id      → delete a platform
//
// Backend models/schemas:
//   - Platform model (backend models) — polymorphic base with columns:
//     platform_id, name, type, description, url, is_active, notes, etc.
//   - PlatformCreate / PlatformUpdate / PlatformResponse (backend/schemas/)
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/general-parameters/GeneralParametersPage.jsx → listPlatforms
//   - components/general-parameters/PlatformModal.jsx → createPlatform,
//       updatePlatform, deletePlatform
//   - components/general-parameters/InstructionModal.jsx → listPlatforms
//       (populates platform dropdown in instruction form)
//   - components/ecosystem/EcosystemView.jsx → updatePlatform
// ==========================================================================
import client from './client';

// listPlatforms — GET /api/platforms; returns array of PlatformResponse objects
export const listPlatforms = (params) => client.get('/api/platforms', { params });
// getPlatform — GET /api/platforms/:id; returns a single PlatformResponse
export const getPlatform = (id) => client.get(`/api/platforms/${id}`);
// createPlatform — POST /api/platforms; body is a PlatformCreate payload
export const createPlatform = (data) => client.post('/api/platforms', data);
// updatePlatform — PUT /api/platforms/:id; body is a PlatformUpdate payload
export const updatePlatform = (id, data) => client.put(`/api/platforms/${id}`, data);
// deletePlatform — DELETE /api/platforms/:id
export const deletePlatform = (id) => client.delete(`/api/platforms/${id}`);
