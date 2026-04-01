// ==========================================================================
// src/components/dashboard/TrackFilter.jsx — Track Selection Dropdown
// ==========================================================================
// Purpose:
//   Renders a dropdown populated with all tracks from the backend, allowing
//   the user to filter dashboard data for a specific track or view all
//   tracks combined. On mount, fetches the full track list via
//   GET /api/tracks.
//
// Props:
//   value    — currently selected track_id (UUID string) or null for "All"
//   onChange — callback receiving the selected track_id or null
//
// Internal dependencies:
//   - react-bootstrap (Form)
//   - api/tracks → listTracks (GET /api/tracks)
//
// Relationship to backend:
//   - Fetches track list from GET /api/tracks (backend/api/tracks.py)
//     to populate the dropdown options (track_id + track_title).
//   - The selected track_id is passed as ?track_id= to dashboard endpoints
//     by the parent DashboardPage.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → controls the track filter
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
// listTracks fetches all tracks from GET /api/tracks
import { listTracks } from '../../api/tracks';

export default function TrackFilter({ value, onChange }) {
  // Local state holding the list of tracks for dropdown options
  const [tracks, setTracks] = useState([]);

  // Fetch all tracks on mount to populate the dropdown.
  // Silently catches errors (dropdown will just show "All Tracks").
  useEffect(() => {
    listTracks().then((res) => setTracks(res.data)).catch(() => {});
  }, []);

  return (
    <Form.Select value={value || ''} onChange={(e) => onChange(e.target.value || null)} style={{ width: 'auto' }}>
      {/* Default option: no track filter (all tracks combined) */}
      <option value="">All Tracks</option>
      {/* One option per track, keyed by track_id (UUID) */}
      {tracks.map((t) => (
        <option key={t.track_id} value={t.track_id}>{t.track_title || 'Untitled'}</option>
      ))}
    </Form.Select>
  );
}
