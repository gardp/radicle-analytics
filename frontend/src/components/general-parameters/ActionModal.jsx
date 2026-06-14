// ==========================================================================
// src/components/general-parameters/ActionModal.jsx
//   — Create / Edit / Delete a "General Action" (track-agnostic Action)
// ==========================================================================
// Purpose:
//   Modal used exclusively from the "General Parameters" page to create,
//   edit, and delete *general* Actions — Actions whose `track_id` is NULL.
//   These exist as standalone, track-agnostic to-do items derived from a
//   global template Instruction.
//
//   General Actions intentionally have:
//     - track_id              = null  (track-agnostic)
//     - content_id            = null  (no specific content piece)
//     - dependency_action_id  = null  (no chain dependency)
//   These fields are forced to null on every payload sent from this modal,
//   regardless of any prior values, to enforce the "general" semantic.
//
// Props:
//   show             — boolean controlling modal visibility
//   onHide           — callback to close the modal
//   action           — ActionResponse to edit, or null for create mode
//   onSaved          — callback invoked after any successful mutation
//   isCreate         — boolean; when true, modal is in "create" mode
//   instructions     — array of all Instruction objects (used to populate the
//                      instruction_id <select>; passed in to avoid an extra
//                      round-trip since the parent page already has them).
//   platforms        — array of Platform objects (used to display the linked
//                      Instruction's Platform name in the read-only context
//                      panel above the form).
//   lockedInstructionId — optional UUID. When provided (e.g. when the modal
//                      is opened via the "Create Action" item in an
//                      Instruction row's kebab menu), the instruction_id
//                      field is pre-filled and rendered read-only so the
//                      user cannot reassign the new Action to a different
//                      Instruction.
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button, Spinner, Form)
//   - react-toastify (toast)
//   - components/shared/EntityForm → renders the editable Action fields
//   - api/actions → createAction, updateAction, deleteAction
//   - utils/constants → ACTION_STATUS_OPTIONS
//
// Relationship to backend:
//   - POST   /api/actions          → create action (track_id forced to null)
//   - PUT    /api/actions/:id      → update action
//   - DELETE /api/actions/:id      → delete action
//   See backend/api/actions.py and backend/schemas/action.py.
//
// Used by:
//   - components/general-parameters/GeneralParametersPage.jsx
//     → opened from the "+ Action" header button, the Instruction row
//       kebab "Create Action" item, and any General Action row in the
//       General Actions tab.
// ==========================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EntityForm from '../shared/EntityForm';
import { createAction, updateAction, deleteAction } from '../../api/actions';
import { ACTION_STATUS_OPTIONS } from '../../utils/constants';

export default function ActionModal({
  show,
  onHide,
  action,
  onSaved,
  isCreate,
  instructions = [],
  platforms = [],
  lockedInstructionId = null,
}) {
  // Local form state — keys correspond to ActionCreate/ActionUpdate fields.
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // ----------------------------------------------------------------------
  // Seed form values whenever the action prop or create-mode flag changes.
  // In create mode we default action_is_active=true and status="pending".
  // If a lockedInstructionId is provided (kebab "Create Action" entry on an
  // Instruction row), pre-fill instruction_id so the user only has to fill
  // in the Action details.
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (action) {
      setValues({ ...action });
    } else {
      setValues({
        action_is_active: true,
        status: 'pending',
        instruction_id: lockedInstructionId || '',
      });
    }
  }, [action, lockedInstructionId, isCreate]);

  // ----------------------------------------------------------------------
  // Lookup helpers — resolve names from id without re-fetching.
  // Built lazily via useMemo so they only recompute when inputs change.
  // ----------------------------------------------------------------------
  const instructionMap = useMemo(() => {
    const m = {};
    instructions.forEach((i) => { m[i.instruction_id] = i; });
    return m;
  }, [instructions]);

  const platformMap = useMemo(() => {
    const m = {};
    platforms.forEach((p) => { m[p.platform_id] = p.name; });
    return m;
  }, [platforms]);

  // The Instruction currently linked to the action being edited/created
  // (resolved from form state). Used to render the read-only context panel
  // above the form (Instruction Name / Description / Platform).
  const linkedInstruction = values.instruction_id
    ? instructionMap[values.instruction_id]
    : null;

  // ----------------------------------------------------------------------
  // actionFields — declarative field schema for EntityForm.
  // Note: instruction_id is rendered OUTSIDE EntityForm (above) when it is
  // locked, otherwise it's the first select here.
  // ----------------------------------------------------------------------
  const actionFields = [
    // Only include the instruction_id select when NOT locked. When locked
    // it is rendered as a read-only label above the form.
    ...(!lockedInstructionId
      ? [{
          key: 'instruction_id',
          label: 'Instruction',
          type: 'select',
          options: instructions.map((i) => ({
            value: i.instruction_id,
            label: i.description || '(Untitled)',
          })),
        }]
      : []),
    { key: 'status', label: 'Status', type: 'select', options: ACTION_STATUS_OPTIONS },
    { key: 'next_action_due_date', label: 'Next Due Date', type: 'datetime' },
    { key: 'action_is_active', label: 'Active', type: 'switch' },
    { key: 'action_notes', label: 'Notes', type: 'textarea', fullWidth: true },
    { key: 'feedback', label: 'Feedback', type: 'textarea', fullWidth: true },
  ];

  // ----------------------------------------------------------------------
  // buildPayload — assemble the ActionCreate/ActionUpdate body.
  // Always force track_id, content_id, dependency_action_id to null so a
  // General Action can never accidentally be bound to a track / content /
  // dependency, even if the underlying state somehow contained one.
  // ----------------------------------------------------------------------
  const buildPayload = () => ({
    ...values,
    track_id: null,
    content_id: null,
    dependency_action_id: null,
  });

  // ----------------------------------------------------------------------
  // handleSave — create or update the action depending on isCreate flag.
  // Validates that instruction_id is present (it is required by the backend
  // ActionBase schema). On success, invokes onSaved() then closes the modal.
  // ----------------------------------------------------------------------
  const handleSave = async () => {
    if (!values.instruction_id) {
      toast.error('Instruction is required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isCreate) {
        await createAction(payload);
        toast.success('Action created');
      } else {
        await updateAction(action.action_id, payload);
        toast.success('Action updated');
      }
      if (onSaved) onSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------------
  // handleDelete — DELETE /api/actions/:id, with a window.confirm guard
  // matching the parent page's existing single-row delete pattern.
  // ----------------------------------------------------------------------
  const handleDelete = async () => {
    if (!window.confirm('Delete this action?')) return;
    try {
      await deleteAction(action.action_id);
      toast.success('Action deleted');
      if (onSaved) onSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{isCreate ? 'Create General Action' : 'Edit General Action'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* ------------------------------------------------------------------
            Read-only context panel: shows the linked Instruction's Name,
            Description, and Platform name. This satisfies the requirement
            that each Action displays its corresponding Instruction Name /
            Description / Platform Name (sourced from the Instruction).
            When in create mode without a linked instruction yet, the panel
            shows placeholder dashes that update live as the user picks an
            instruction from the dropdown below.
        ------------------------------------------------------------------ */}
        {(lockedInstructionId || linkedInstruction) && (
          <div className="mb-3 p-3 bg-light border rounded">
            <div className="row small">
              <div className="col-md-6 mb-2">
                <div className="text-muted">Instruction Name</div>
                <div className="fw-semibold">{linkedInstruction?.name || '—'}</div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="text-muted">Platform</div>
                <div className="fw-semibold">
                  {platformMap[linkedInstruction?.platform_id] || '—'}
                </div>
              </div>
              <div className="col-12">
                <div className="text-muted">Instruction Description</div>
                <div>{linkedInstruction?.description || '—'}</div>
              </div>
            </div>
            {lockedInstructionId && (
              <div className="text-muted small mt-2">
                This action is being created from the Instruction above and
                cannot be reassigned. Track is intentionally left empty
                because this is a General Action.
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------
            Editable Action fields. EntityForm renders a 2-column responsive
            grid based on the actionFields schema declared above.
        ------------------------------------------------------------------ */}
        <EntityForm fields={actionFields} values={values} onChange={setValues} />
      </Modal.Body>
      <Modal.Footer>
        {!isCreate && (
          <Button variant="outline-danger" className="me-auto" onClick={handleDelete}>
            Delete
          </Button>
        )}
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : (isCreate ? 'Create' : 'Save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
