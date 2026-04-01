// ==========================================================================
// src/components/tracks/TracksPage.jsx — Track Listing Page
// ==========================================================================
// Purpose:
//   Displays a searchable grid of all tracks. Provides CRUD functionality:
//   create (via TrackCreateModal), edit (via TrackModal), and delete (via
//   ConfirmDeleteModal). Each track is rendered as a TrackCard. Clicking a
//   card navigates to /tracks/:trackId (TrackEcosystem page).
//
// Data flow:
//   1. On mount, fetches all tracks via GET /api/tracks (listTracks).
//   2. Search input filters tracks by passing ?search= to the backend.
//   3. Create/edit/delete operations call the respective API functions
//      and re-fetch the track list on success.
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Form, Button, Spinner)
//   - react-toastify (toast) — success/error notifications
//   - components/layout/PageContainer — page wrapper
//   - components/tracks/TrackCard — individual track card display
//   - components/tracks/TrackModal — edit track modal
//   - components/tracks/TrackCreateModal — create track modal
//   - components/shared/ConfirmDeleteModal — delete confirmation
//   - api/tracks → listTracks, deleteTrack
//
// Relationship to backend:
//   - GET /api/tracks (?search=)  → backend/api/tracks.py (list endpoint)
//   - DELETE /api/tracks/:id      → backend/api/tracks.py (cascades to all
//     child entities: content, instructions, actions, royalties, etc.)
//
// Used by:
//   - src/App.jsx → rendered on the "/tracks" route (protected)
// ==========================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PageContainer from '../layout/PageContainer';
// Track display card — navigates to ecosystem on click
import TrackCard from './TrackCard';
// Modal for editing an existing track
import TrackModal from './TrackModal';
// Modal for creating a new track
import TrackCreateModal from './TrackCreateModal';
// Reusable delete confirmation dialog
import ConfirmDeleteModal from '../shared/ConfirmDeleteModal';
// API functions for track CRUD
import { listTracks, deleteTrack } from '../../api/tracks';

export default function TracksPage() {
  // tracks — array of TrackResponse objects from the backend
  const [tracks, setTracks] = useState([]);
  // loading — true while the track list is being fetched
  const [loading, setLoading] = useState(true);
  // search — controlled input for filtering tracks by title/subtitle
  const [search, setSearch] = useState('');
  // showCreate — controls visibility of the TrackCreateModal
  const [showCreate, setShowCreate] = useState(false);
  // editTrack — when set to a track object, opens TrackModal for editing
  const [editTrack, setEditTrack] = useState(null);
  // deleteTarget — when set, opens ConfirmDeleteModal for that track
  const [deleteTarget, setDeleteTarget] = useState(null);

  // fetchTracks — calls GET /api/tracks with optional ?search= param.
  // Wrapped in useCallback so it can be a stable useEffect dependency.
  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await listTracks(params);
      setTracks(res.data);
    } catch {
      toast.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTrack(deleteTarget.track_id);
      toast.success('Track deleted');
      setDeleteTarget(null);
      fetchTracks();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <PageContainer>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="mb-0">Tracks</h4>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Search tracks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          <Button variant="primary" onClick={() => setShowCreate(true)}>+ Create Track</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No tracks found.</p>
          <Button variant="outline-primary" onClick={() => setShowCreate(true)}>Create your first track</Button>
        </div>
      ) : (
        <Row>
          {tracks.map((t) => (
            <Col md={4} key={t.track_id} className="mb-4">
              <TrackCard track={t} onEdit={setEditTrack} onDelete={setDeleteTarget} />
            </Col>
          ))}
        </Row>
      )}

      <TrackCreateModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchTracks(); }}
      />

      {editTrack && (
        <TrackModal
          show={!!editTrack}
          onHide={() => setEditTrack(null)}
          track={editTrack}
          onUpdated={() => { setEditTrack(null); fetchTracks(); }}
        />
      )}

      <ConfirmDeleteModal
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message="This will delete the track and ALL associated entities (content, instructions, actions, royalties). Are you sure?"
      />
    </PageContainer>
  );
}
