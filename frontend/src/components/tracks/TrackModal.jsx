// ==========================================================================
// src/components/tracks/TrackModal.jsx — Edit Existing Track Modal
// ==========================================================================
// Purpose:
//   Modal dialog for editing an existing track. Pre-populates EntityForm
//   with the track's current data and calls PUT /api/tracks/:id on save.
//   Uses the same TRACK_FIELDS definition as TrackCreateModal for
//   consistency.
//
// Props:
//   show      — boolean controlling modal visibility
//   onHide    — callback to close the modal
//   track     — TrackResponse object to edit (pre-populates the form)
//   onUpdated — callback(trackData) invoked after successful update;
//               parent uses this to refresh track data
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button, Spinner)
//   - react-toastify (toast)
//   - components/shared/EntityForm → dynamic form renderer
//   - api/tracks → updateTrack (PUT /api/tracks/:id)
//   - utils/constants → FORMAT_OPTIONS
//
// Relationship to backend:
//   - PUT /api/tracks/:id (backend/api/tracks.py)
//     Request body: TrackUpdate schema fields
//     Response: updated TrackResponse
//
// Used by:
//   - components/tracks/TracksPage.jsx   → edit button on TrackCard
//   - components/tracks/TrackEcosystem.jsx → "Edit Track" button
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EntityForm from '../shared/EntityForm';
// updateTrack calls PUT /api/tracks/:id
import { updateTrack } from '../../api/tracks';
import { FORMAT_OPTIONS } from '../../utils/constants';

// TRACK_FIELDS — same field definitions as TrackCreateModal.
// Each key corresponds to a Track model column in the backend.
const TRACK_FIELDS = [
  { key: 'track_title', label: 'Title', type: 'text' },
  { key: 'version_subtitle', label: 'Version / Subtitle', type: 'text' },
  { key: 'track_description', label: 'Description', type: 'textarea', fullWidth: true },
  { key: 'format', label: 'Format', type: 'select', options: FORMAT_OPTIONS },
  { key: 'release_date', label: 'Release Date', type: 'datetime' },
  { key: 'bpm', label: 'BPM', type: 'number' },
  { key: 'key', label: 'Key', type: 'text' },
  { key: 'bitrate', label: 'Bitrate', type: 'number' },
  { key: 'sample_rate', label: 'Sample Rate', type: 'number' },
  { key: 'duration_seconds', label: 'Duration (s)', type: 'number' },
  { key: 'isrc', label: 'ISRC', type: 'text' },
  { key: 'iwc', label: 'IWC', type: 'text' },
  { key: 'upc', label: 'UPC', type: 'text' },
  { key: 'genres', label: 'Genres', type: 'tags' },
  { key: 'moods', label: 'Moods', type: 'tags' },
  { key: 'keyword_tags', label: 'Tags', type: 'tags' },
  { key: 'lyrics', label: 'Lyrics', type: 'textarea', fullWidth: true },
  { key: 'track_notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { key: 'track_file_path', label: 'File Path', type: 'text', fullWidth: true },
];

export default function TrackModal({ show, onHide, track, onUpdated }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-populate form with the existing track's data when the modal opens
  useEffect(() => {
    if (track) setValues({ ...track });
  }, [track]);

  // handleSave — sends the updated values to PUT /api/tracks/:id
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateTrack(track.track_id, values);
      toast.success('Track updated');
      if (onUpdated) onUpdated(res.data);
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update track');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Edit Track</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EntityForm fields={TRACK_FIELDS} values={values} onChange={setValues} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
