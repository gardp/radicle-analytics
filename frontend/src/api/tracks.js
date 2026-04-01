// ==========================================================================
// src/api/tracks.js — Track CRUD + Ecosystem API Module
// ==========================================================================
// Purpose:
//   Provides functions for managing Track entities and retrieving the full
//   "ecosystem" (all related entities) for a single track.
//
// Backend endpoints (all in backend/api/tracks.py):
//   GET    /api/tracks              → list all tracks (optional ?search= query param)
//   GET    /api/tracks/:id          → get a single track by UUID
//   POST   /api/tracks              → create a new track (clones General Parameter instructions)
//   PUT    /api/tracks/:id          → update an existing track
//   DELETE /api/tracks/:id          → delete a track and all associated entities
//   GET    /api/tracks/:id/ecosystem → returns { platforms, instructions, contents,
//                                      actions, royalties, success_metrics } for the track
//
// Backend models/schemas:
//   - Track model (backend models) — columns: track_id, track_title,
//     version_subtitle, format, release_date, bpm, key, genres, etc.
//   - TrackCreate / TrackUpdate / TrackResponse (backend/schemas/track.py)
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/tracks/TracksPage.jsx      → listTracks, deleteTrack
//   - components/tracks/TrackCreateModal.jsx → createTrack
//   - components/tracks/TrackModal.jsx       → updateTrack
//   - components/tracks/TrackEcosystem.jsx   → getTrack, getEcosystem
//   - components/dashboard/TrackFilter.jsx   → listTracks (populates dropdown)
// ==========================================================================
import client from './client';

// listTracks — GET /api/tracks; params may include { search: "..." }
export const listTracks = (params) => client.get('/api/tracks', { params });
// getTrack — GET /api/tracks/:id; returns a single TrackResponse
export const getTrack = (id) => client.get(`/api/tracks/${id}`);
// createTrack — POST /api/tracks; body is a TrackCreate payload
export const createTrack = (data) => client.post('/api/tracks', data);
// updateTrack — PUT /api/tracks/:id; body is a TrackUpdate payload
export const updateTrack = (id, data) => client.put(`/api/tracks/${id}`, data);
// deleteTrack — DELETE /api/tracks/:id; cascades to all child entities
export const deleteTrack = (id) => client.delete(`/api/tracks/${id}`);
// getEcosystem — GET /api/tracks/:id/ecosystem; returns the full related entity tree
export const getEcosystem = (id) => client.get(`/api/tracks/${id}/ecosystem`);
