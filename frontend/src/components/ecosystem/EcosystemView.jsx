// ==========================================================================
// src/components/ecosystem/EcosystemView.jsx — Track Ecosystem Accordion
// ==========================================================================
// Purpose:
//   The core component for displaying and managing all entities that belong
//   to a single track. Renders a Bootstrap Accordion with six sections:
//     0. Platforms      — list of linked platforms (edit only, no create here)
//     1. Instructions   — track-specific instructions (create / edit / delete)
//     2. Content        — social-media content items (create / edit / delete)
//     3. Actions        — task items linked to content (create / edit / delete)
//     4. Royalties      — revenue streams for the track (create / edit / delete)
//     5. Success Metrics — read-only list of success criteria
//
//   Each section delegates its card rendering to a dedicated *Section
//   component and uses a shared EntityModal for create/edit forms.
//
// Props:
//   ecosystem — object from GET /api/tracks/:id/ecosystem containing arrays:
//               { platforms, instructions, contents, actions, royalties, success_metrics }
//   trackId   — UUID string of the current track (used when creating child entities)
//   onRefresh — callback to re-fetch the ecosystem data after any mutation
//
// Entity CRUD pattern:
//   - Select (click) a card → opens EntityModal in edit mode (onSave = update API)
//   - "Add" button          → opens EntityModal in create mode (onSave = create API)
//   - "Delete" in modal     → opens ConfirmDeleteModal → calls delete API on confirm
//   - All mutations call onRefresh() to re-fetch the ecosystem from the backend.
//
// Internal dependencies:
//   - react-bootstrap (Accordion, Card)
//   - react-toastify (toast)
//   - ecosystem/PlatformSection, InstructionSection, ContentSection,
//     ActionSection, RoyaltySection → card renderers for each entity type
//   - ecosystem/EntityModal → generic create/edit modal
//   - shared/ConfirmDeleteModal → delete confirmation dialog
//   - api/instructions → createInstruction, updateInstruction, deleteInstruction
//   - api/content      → createContent, updateContent, deleteContent
//   - api/actions      → createAction, updateAction, deleteAction
//   - api/royalties    → createRoyalty, updateRoyalty, deleteRoyalty
//   - api/platforms    → updatePlatform
//   - utils/constants  → PHASE_OPTIONS, ENGAGEMENT_PHASE_OPTIONS,
//     CONTENT_TYPE_OPTIONS, ROYALTY_RIGHT_OPTIONS, ROYALTY_TYPE_OPTIONS
//
// Relationship to backend:
//   - Reads ecosystem data fetched by TrackEcosystem via GET /api/tracks/:id/ecosystem.
//   - Create/update/delete calls go to the respective entity endpoints:
//     POST/PUT/DELETE /api/instructions, /api/content, /api/actions,
//     /api/royalties, PUT /api/platforms (backend/api/*.py).
//
// Used by:
//   - components/tracks/TrackEcosystem.jsx → rendered below the track header
// ==========================================================================
import React, { useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
// Section components — each renders a list of entity cards
import PlatformSection from './PlatformSection';
import InstructionSection from './InstructionSection';
import ContentSection from './ContentSection';
import ActionSection from './ActionSection';
import RoyaltySection from './RoyaltySection';
// Generic modal for creating/editing any entity type
import EntityModal from './EntityModal';
// Reusable delete confirmation dialog
import ConfirmDeleteModal from '../shared/ConfirmDeleteModal';
// API functions for entity CRUD operations
import { updateInstruction } from '../../api/instructions';
import { updateContent, createContent, deleteContent } from '../../api/content';
import { updateAction, createAction, deleteAction } from '../../api/actions';
import { updateRoyalty, createRoyalty, deleteRoyalty } from '../../api/royalties';
import { updatePlatform } from '../../api/platforms';
// Constants for form field option dropdowns
import {
  PHASE_OPTIONS, ENGAGEMENT_PHASE_OPTIONS, CONTENT_TYPE_OPTIONS,
  ROYALTY_RIGHT_OPTIONS, ROYALTY_TYPE_OPTIONS, FREQUENCY_TYPE_OPTIONS, TIME_PERIOD_OPTIONS,
} from '../../utils/constants';

// --------------------------------------------------------------------------
// Field definitions for each entity type. Keys match backend schema fields.
// These arrays are passed to EntityModal → EntityForm for dynamic rendering.
// --------------------------------------------------------------------------

// Instruction fields — maps to InstructionCreate/InstructionUpdate schemas
const INSTRUCTION_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'instructions', label: 'Instructions', type: 'textarea', fullWidth: true },
  { key: 'source', label: 'Source', type: 'text' },
  { key: 'source_media', label: 'Source Media', type: 'text' },
  { key: 'phase', label: 'Phase', type: 'select', options: PHASE_OPTIONS.filter(o => o.value) },
  { key: 'goals', label: 'Goals', type: 'text' },
  { key: 'is_active', label: 'Active', type: 'switch' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

// Content fields — maps to ContentCreate/ContentUpdate schemas
const CONTENT_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'type', label: 'Content Type', type: 'select', options: CONTENT_TYPE_OPTIONS },
  { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  { key: 'url', label: 'URL', type: 'text' },
  { key: 'engagement_phase', label: 'Engagement Phase', type: 'select', options: ENGAGEMENT_PHASE_OPTIONS },
  { key: 'goals', label: 'Goals', type: 'text' },
  { key: 'is_active', label: 'Active', type: 'switch' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

// Action fields — maps to ActionCreate/ActionUpdate schemas
const ACTION_FIELDS = [
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'failed'] },
  { key: 'next_action_due_date', label: 'Due Date', type: 'datetime' },
  { key: 'action_is_active', label: 'Active', type: 'switch' },
  { key: 'action_notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { key: 'feedback', label: 'Feedback', type: 'textarea', fullWidth: true },
];

// Royalty fields — maps to RoyaltyCreate/RoyaltyUpdate schemas
const ROYALTY_FIELDS = [
  { key: 'right', label: 'Right', type: 'select', options: ROYALTY_RIGHT_OPTIONS },
  { key: 'royalty', label: 'Royalty Type', type: 'select', options: ROYALTY_TYPE_OPTIONS },
];

// Platform fields — maps to PlatformUpdate schema (edit-only in ecosystem)
const PLATFORM_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'type', label: 'Type', type: 'select', options: ['distribution', 'admin', 'tool', 'promotion', 'analytics'] },
  { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  { key: 'url', label: 'URL', type: 'text' },
  { key: 'is_active', label: 'Active', type: 'switch' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

export default function EcosystemView({ ecosystem, trackId, onRefresh }) {
  // modal — when set, EntityModal opens with the provided config object:
  //   { title, fields, initialValues, onSave, onDelete?, saveLabel? }
  const [modal, setModal] = useState(null);
  // deleteModal — when set, ConfirmDeleteModal opens; holds { id, deleteFn }
  const [deleteModal, setDeleteModal] = useState(null);

  if (!ecosystem) return null;

  // openModal / closeModal — simple state toggles for the EntityModal
  const openModal = (config) => setModal(config);
  const closeModal = () => setModal(null);

  // handleDeleteConfirm — called when the user confirms deletion in
  // ConfirmDeleteModal. Invokes the stored deleteFn (e.g. deleteInstruction)
  // with the entity's UUID, then refreshes the ecosystem.
  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    try {
      await deleteModal.deleteFn(deleteModal.id);
      toast.success('Deleted successfully');
      setDeleteModal(null);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <>
      <Accordion defaultActiveKey={['0', '1', '2', '3', '4', '5']} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Platforms ({ecosystem.platforms?.length || 0})</Accordion.Header>
          <Accordion.Body>
            <PlatformSection
              platforms={ecosystem.platforms}
              onSelect={(p) => openModal({
                title: 'Edit Platform',
                fields: PLATFORM_FIELDS,
                initialValues: p,
                onSave: async (vals) => { await updatePlatform(p.platform_id, vals); toast.success('Platform updated'); onRefresh(); },
              })}
            />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>Instructions ({ecosystem.instructions?.length || 0})</Accordion.Header>
          <Accordion.Body>
            <InstructionSection
              instructions={ecosystem.instructions}
              onSelect={(inst) => openModal({
                title: 'View Instruction',
                fields: INSTRUCTION_FIELDS,
                initialValues: inst,
                onSave: async (vals) => { await updateInstruction(inst.instruction_id, vals); toast.success('Instruction updated'); onRefresh(); },
              })}
            />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>Content ({ecosystem.contents?.length || 0})</Accordion.Header>
          <Accordion.Body>
            <ContentSection
              contents={ecosystem.contents}
              onSelect={(c) => openModal({
                title: 'Edit Content',
                fields: CONTENT_FIELDS,
                initialValues: c,
                onSave: async (vals) => { await updateContent(c.content_id, vals); toast.success('Content updated'); onRefresh(); },
                onDelete: () => { closeModal(); setDeleteModal({ id: c.content_id, deleteFn: deleteContent }); },
              })}
              onAdd={() => openModal({
                title: 'Add Content',
                fields: CONTENT_FIELDS,
                initialValues: { track_id: trackId, is_active: true },
                onSave: async (vals) => { await createContent({ ...vals, track_id: trackId }); toast.success('Content created'); onRefresh(); },
                saveLabel: 'Create',
              })}
            />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>Actions ({ecosystem.actions?.length || 0})</Accordion.Header>
          <Accordion.Body>
            <ActionSection
              actions={ecosystem.actions}
              instructions={ecosystem.instructions}
              onSelect={(a) => openModal({
                title: 'Edit Action',
                fields: ACTION_FIELDS,
                initialValues: a,
                onSave: async (vals) => { await updateAction(a.action_id, vals); toast.success('Action updated'); onRefresh(); },
                onDelete: () => { closeModal(); setDeleteModal({ id: a.action_id, deleteFn: deleteAction }); },
              })}
              onAdd={() => openModal({
                title: 'Add Action',
                fields: [
                  { key: 'instruction_id', label: 'Instruction (required)', type: 'select', options: (ecosystem.instructions || []).map(i => ({ value: i.instruction_id, label: i.name || 'Untitled' })) },
                  { key: 'content_id', label: 'Content (optional)', type: 'select', options: [{ value: '', label: '— None —' }, ...(ecosystem.contents || []).map(c => ({ value: c.content_id, label: c.name || c.type }))] },
                  ...ACTION_FIELDS,
                ],
                initialValues: { action_is_active: true, status: 'pending' },
                onSave: async (vals) => { const payload = { ...vals, track_id: trackId }; if (!payload.content_id) delete payload.content_id; await createAction(payload); toast.success('Action created'); onRefresh(); },
                saveLabel: 'Create',
              })}
            />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>Royalties ({ecosystem.royalties?.length || 0})</Accordion.Header>
          <Accordion.Body>
            <RoyaltySection
              royalties={ecosystem.royalties}
              onSelect={(r) => openModal({
                title: 'Edit Royalty',
                fields: ROYALTY_FIELDS,
                initialValues: r,
                onSave: async (vals) => { await updateRoyalty(r.royalty_id, vals); toast.success('Royalty updated'); onRefresh(); },
                onDelete: () => { closeModal(); setDeleteModal({ id: r.royalty_id, deleteFn: deleteRoyalty }); },
              })}
              onAdd={() => openModal({
                title: 'Add Royalty',
                fields: ROYALTY_FIELDS,
                initialValues: { track_id: trackId },
                onSave: async (vals) => { await createRoyalty({ ...vals, track_id: trackId }); toast.success('Royalty created'); onRefresh(); },
                saveLabel: 'Create',
              })}
            />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>Success Metrics ({ecosystem.success_metrics?.length || 0})</Accordion.Header>
          <Accordion.Body>
            {(!ecosystem.success_metrics || ecosystem.success_metrics.length === 0) ? (
              <p className="text-muted small">No success metrics defined.</p>
            ) : (
              <ul className="list-unstyled">
                {ecosystem.success_metrics.map((m) => (
                  <li key={m.success_metrics_id} className="mb-2">
                    <strong>{m.success_metrics_name}</strong>
                    {m.target_value && <span className="text-muted small ms-2">Target: {m.target_value} {m.target_value_unit || ''}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {modal && (
        <EntityModal
          show={true}
          onHide={closeModal}
          title={modal.title}
          fields={modal.fields}
          initialValues={modal.initialValues}
          onSave={modal.onSave}
          onDelete={modal.onDelete}
          saveLabel={modal.saveLabel}
        />
      )}

      <ConfirmDeleteModal
        show={!!deleteModal}
        onHide={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this item?"
      />
    </>
  );
}
