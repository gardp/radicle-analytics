// ==========================================================================
// src/components/tracks/TrackCard.jsx — Single Track Display Card
// ==========================================================================
// Purpose:
//   Renders an individual track as a clickable Bootstrap Card in the
//   TracksPage grid. Displays title, subtitle, release date, genres, BPM,
//   key, and format badge. Clicking the card body navigates to the track's
//   ecosystem detail page (/tracks/:trackId). Edit and Delete buttons in
//   the card footer trigger callbacks to the parent (TracksPage).
//
// Props:
//   track    — TrackResponse object from the backend
//   onEdit   — callback(track) to open TrackModal for editing
//   onDelete — callback(track) to open ConfirmDeleteModal
//
// Internal dependencies:
//   - react-bootstrap (Card, Button)
//   - react-router-dom (useNavigate)
//   - components/shared/StatusBadge → renders the format badge (e.g. "MP3")
//
// Relationship to backend:
//   - No direct API calls. Displays data from the TrackResponse schema
//     (backend/schemas/track.py): track_title, version_subtitle, format,
//     release_date, genres (array), bpm, key.
//   - Navigates to /tracks/:track_id which triggers TrackEcosystem to
//     fetch detailed data via GET /api/tracks/:id and GET /api/tracks/:id/ecosystem.
//
// Used by:
//   - components/tracks/TracksPage.jsx → rendered in a grid for each track
// ==========================================================================
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// StatusBadge renders the track format as a dark-themed uppercase badge
import StatusBadge from '../shared/StatusBadge';

export default function TrackCard({ track, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <Card
      className="border-secondary h-100 track-card"
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(13,110,253,0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      onClick={() => navigate(`/tracks/${track.track_id}`)}
    >
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="fs-6 mb-0">{track.track_title || 'Untitled Track'}</Card.Title>
          <StatusBadge type="format" value={track.format} />
        </div>
        {track.version_subtitle && (
          <Card.Subtitle className="text-muted small mb-2">{track.version_subtitle}</Card.Subtitle>
        )}
        <div className="small text-muted mb-2">
          {track.release_date && <span>Released: {new Date(track.release_date).toLocaleDateString()}</span>}
        </div>
        <div className="mb-2">
          {track.genres && track.genres.length > 0 && (
            <span className="small text-muted">{track.genres.join(', ')}</span>
          )}
        </div>
        <div className="d-flex gap-2 small text-muted mt-auto">
          {track.bpm && <span>BPM: {track.bpm}</span>}
          {track.key && <span>Key: {track.key}</span>}
        </div>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-end gap-2 bg-transparent border-secondary">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit(track); }}
        >
          Edit
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onDelete(track); }}
        >
          Delete
        </Button>
      </Card.Footer>
    </Card>
  );
}
