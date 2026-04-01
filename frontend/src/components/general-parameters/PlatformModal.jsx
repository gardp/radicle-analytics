// ==========================================================================
// src/components/general-parameters/PlatformModal.jsx
//   — Create / Edit / Delete Platform Modal
// ==========================================================================
// Purpose:
//   Modal for managing a single platform entity. Supports create, edit,
//   and delete modes. The form dynamically extends with account-specific
//   fields (username, bio, followers, etc.) when the platform is a social
//   media type (instagram, twitter, tiktok, youtube).
//
// Props:
//   show      — boolean controlling modal visibility
//   onHide    — callback to close the modal
//   platform  — PlatformResponse to edit, or null for create mode
//   onSaved   — callback invoked after any successful mutation
//   isCreate  — boolean; when true, modal is in "create" mode
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button, Spinner)
//   - react-toastify (toast)
//   - components/shared/EntityForm → renders the dynamic form
//   - api/platforms → createPlatform, updatePlatform, deletePlatform
//
// Relationship to backend:
//   - POST   /api/platforms      → create platform (PlatformCreate schema)
//   - PUT    /api/platforms/:id  → update platform (PlatformUpdate schema)
//   - DELETE /api/platforms/:id  → delete platform
//   Backend router: backend/api/platforms.py
//   Backend model: Platform (polymorphic — type discriminator determines
//   which subclass fields are available).
//
// Used by:
//   - components/general-parameters/GeneralParametersPage.jsx
//     → opened for both create and edit of platforms
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EntityForm from '../shared/EntityForm';
// Platform CRUD API functions
import { updatePlatform, createPlatform, deletePlatform } from '../../api/platforms';

// --------------------------------------------------------------------------
// BASE_FIELDS — core platform fields shown for all platform types.
// Keys map to PlatformCreate/PlatformUpdate schema fields.
// --------------------------------------------------------------------------
const BASE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'type', label: 'Type', type: 'select', options: ['distribution', 'admin', 'tool', 'promotion', 'analytics'] },
  { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  { key: 'url', label: 'URL', type: 'text' },
  { key: 'is_active', label: 'Active', type: 'switch' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

// --------------------------------------------------------------------------
// ACCOUNT_FIELDS — additional fields shown only for social-media platform
// types (instagram, twitter, tiktok, youtube). These map to polymorphic
// subclass columns in the backend Platform model.
// --------------------------------------------------------------------------
const ACCOUNT_FIELDS = [
  { key: 'username', label: 'Username', type: 'text' },
  { key: 'bio', label: 'Bio', type: 'textarea', fullWidth: true },
  { key: 'followers_count', label: 'Followers', type: 'number' },
  { key: 'following_count', label: 'Following', type: 'number' },
  { key: 'profile_image_url', label: 'Profile Image URL', type: 'text' },
];

export default function PlatformModal({ show, onHide, platform, onSaved, isCreate }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // Seed form values from the existing platform, or set defaults for create
  useEffect(() => {
    if (platform) setValues({ ...platform });
    else setValues({ is_active: true });
  }, [platform]);

  // Conditionally extend the form with account fields for social-media platforms
  const hasAccountData = values.account_data && ['instagram', 'twitter', 'tiktok', 'youtube'].includes(values.account_data);
  const fields = hasAccountData ? [...BASE_FIELDS, ...ACCOUNT_FIELDS] : BASE_FIELDS;

  // handleSave — creates or updates the platform depending on isCreate
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCreate) {
        await createPlatform(values);
        toast.success('Platform created');
      } else {
        await updatePlatform(platform.platform_id, values);
        toast.success('Platform updated');
      }
      if (onSaved) onSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlatform(platform.platform_id);
      toast.success('Platform deleted');
      if (onSaved) onSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{isCreate ? 'Create Platform' : 'Edit Platform'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EntityForm fields={fields} values={values} onChange={setValues} />
      </Modal.Body>
      <Modal.Footer>
        {!isCreate && (
          <Button variant="outline-danger" className="me-auto" onClick={handleDelete}>Delete</Button>
        )}
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : (isCreate ? 'Create' : 'Save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
