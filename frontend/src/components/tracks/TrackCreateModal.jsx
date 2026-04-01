// ==========================================================================
// src/components/tracks/TrackCreateModal.jsx — Create New Track Modal
// ==========================================================================
// Purpose:
//   Modal dialog for creating a new track. Uses EntityForm with a predefined
//   TRACK_FIELDS array to render all track-related form inputs. On save,
//   calls POST /api/tracks which also clones General Parameter template
//   instructions into the new track on the backend side.
//
// Props:
//   show      — boolean controlling modal visibility
//   onHide    — callback to close the modal
//   onCreated — callback(trackData) invoked after successful creation;
//               parent uses this to refresh the track list
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button, Spinner)
//   - react-toastify (toast)
//   - components/shared/EntityForm → dynamic form renderer
//   - api/tracks → createTrack (POST /api/tracks)
//   - utils/constants → FORMAT_OPTIONS (for format select dropdown)
//
// Relationship to backend:
//   - POST /api/tracks (backend/api/tracks.py)
//     Request body: TrackCreate schema fields (track_title, format, bpm, etc.)
//     Response: newly created TrackResponse (includes track_id UUID)
//     Side effect: backend auto-clones all template instructions (track_id=null)
//     into the new track's instruction set.
//
// Used by:
//   - components/tracks/TracksPage.jsx → "Create Track" button
//   - components/layout/AppNavbar.jsx  → "+ Create Track" navbar button
// ==========================================================================
import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
// EntityForm dynamically renders form fields from the TRACK_FIELDS definition
import EntityForm from '../shared/EntityForm';
// createTrack calls POST /api/tracks
import { createTrack } from '../../api/tracks';
// FORMAT_OPTIONS provides the audio format select choices (mp3, wav, flac, etc.)
import { FORMAT_OPTIONS } from '../../utils/constants';

// --------------------------------------------------------------------------
// TRACK_FIELDS — field definitions passed to EntityForm.
// Each entry maps to a column in the Track model (backend/schemas/track.py).
// The "key" matches the backend schema field name exactly.
// "tags" type fields produce arrays for PostgreSQL ARRAY columns.
// --------------------------------------------------------------------------
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

export default function TrackCreateModal({ show, onHide, onCreated }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await createTrack(values);
      toast.success('Track created! General Parameter instructions cloned.');
      setValues({});
      if (onCreated) onCreated(res.data);
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create track');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Create New Track</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EntityForm fields={TRACK_FIELDS} values={values} onChange={setValues} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : 'Create Track'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
