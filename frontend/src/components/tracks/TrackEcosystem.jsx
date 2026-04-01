// ==========================================================================
// src/components/tracks/TrackEcosystem.jsx — Single Track Detail + Ecosystem
// ==========================================================================
// Purpose:
//   Detail page for a single track, showing its metadata and the full
//   "ecosystem" — all related entities (platforms, instructions, content,
//   actions, royalties, success metrics) rendered by EcosystemView.
//   Reached via /tracks/:trackId route (trackId extracted with useParams).
//
// Data flow:
//   1. Reads :trackId from the URL via useParams().
//   2. Fetches track details (GET /api/tracks/:id) and ecosystem data
//      (GET /api/tracks/:id/ecosystem) in parallel on mount.
//   3. Passes the ecosystem data and trackId to EcosystemView for display.
//   4. "Edit Track" button opens TrackModal; on save, re-fetches data.
//
// Internal dependencies:
//   - react-router-dom (useParams, Link)
//   - react-bootstrap (Button, Spinner)
//   - react-toastify (toast)
//   - components/layout/PageContainer → page wrapper
//   - components/tracks/TrackModal → edit track modal
//   - components/ecosystem/EcosystemView → renders all ecosystem sections
//   - api/tracks → getTrack, getEcosystem
//
// Relationship to backend:
//   - GET /api/tracks/:id           → backend/api/tracks.py (TrackResponse)
//   - GET /api/tracks/:id/ecosystem → backend/api/tracks.py
//     Response: { platforms, instructions, contents, actions, royalties,
//                 success_metrics } — all entities belonging to this track.
//
// Used by:
//   - src/App.jsx → rendered on the "/tracks/:trackId" route (protected)
// ==========================================================================
import React, { useState, useEffect } from 'react';
// useParams extracts :trackId from the URL; Link provides back-navigation
import { useParams, Link } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PageContainer from '../layout/PageContainer';
// TrackModal for inline editing of the track's metadata
import TrackModal from './TrackModal';
// EcosystemView renders accordion sections for all related entities
import EcosystemView from '../ecosystem/EcosystemView';
// API functions: getTrack (single track) and getEcosystem (full entity tree)
import { getTrack, getEcosystem } from '../../api/tracks';

export default function TrackEcosystem() {
  // Extract the track UUID from the URL path parameter
  const { trackId } = useParams();
  // track — the TrackResponse object (title, format, bpm, etc.)
  const [track, setTrack] = useState(null);
  // ecosystem — { platforms, instructions, contents, actions, royalties, success_metrics }
  const [ecosystem, setEcosystem] = useState(null);
  const [loading, setLoading] = useState(true);
  // showEdit — controls visibility of the TrackModal for editing
  const [showEdit, setShowEdit] = useState(false);

  // fetchData — loads both the track and its ecosystem in parallel.
  // Called on mount and after any edit/create/delete operation via onRefresh.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [trackRes, ecoRes] = await Promise.all([
        getTrack(trackId),
        getEcosystem(trackId),
      ]);
      setTrack(trackRes.data);
      setEcosystem(ecoRes.data);
    } catch {
      toast.error('Failed to load track ecosystem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [trackId]);

  if (loading) {
    return <PageContainer><div className="text-center py-5"><Spinner animation="border" /></div></PageContainer>;
  }

  if (!track) {
    return <PageContainer><p className="text-muted">Track not found.</p></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <Link to="/tracks" className="text-muted small text-decoration-none">&larr; Back to Tracks</Link>
          <h4 className="mb-0 mt-1">{track.track_title || 'Untitled Track'}</h4>
          {track.version_subtitle && <span className="text-muted small">{track.version_subtitle}</span>}
        </div>
        <Button variant="outline-primary" onClick={() => setShowEdit(true)}>Edit Track</Button>
      </div>

      <EcosystemView ecosystem={ecosystem} trackId={trackId} onRefresh={fetchData} />

      {showEdit && (
        <TrackModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          track={track}
          onUpdated={() => { setShowEdit(false); fetchData(); }}
        />
      )}
    </PageContainer>
  );
}
