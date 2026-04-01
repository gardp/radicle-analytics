// ==========================================================================
// src/components/ecosystem/EntityModal.jsx — Generic Entity Create/Edit Modal
// ==========================================================================
// Purpose:
//   A reusable modal that can create or edit any entity type (instruction,
//   content, action, royalty, platform). The parent (EcosystemView) passes
//   in the field definitions, initial values, and save/delete callbacks —
//   this component simply manages the form state and delegates rendering
//   to EntityForm.
//
// Props:
//   show          — boolean controlling modal visibility
//   onHide        — callback to close the modal
//   title         — modal header text (e.g. "Edit Instruction", "Add Action")
//   fields        — field definition array passed to EntityForm
//   initialValues — object to pre-populate the form (empty for create)
//   onSave        — async callback(values) called on "Save" click;
//                   the parent handles the actual API call
//   onDelete      — optional callback for the "Delete" button;
//                   when present, a red Delete button appears in the footer
//   saveLabel     — optional override for the save button text (default "Save")
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button, Spinner)
//   - react-toastify (toast)
//   - components/shared/EntityForm → renders the dynamic form
//
// Relationship to backend:
//   - No direct API calls. The parent component (EcosystemView) wires
//     onSave to the appropriate create/update API function and onDelete
//     to open ConfirmDeleteModal → delete API function.
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → opened for all entity types
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EntityForm from '../shared/EntityForm';

export default function EntityModal({ show, onHide, title, fields, initialValues, onSave, onDelete, saveLabel }) {
  // Local form state — seeded from initialValues on open
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // Reset form values when the modal opens with new initialValues
  useEffect(() => {
    if (initialValues) setValues({ ...initialValues });
    else setValues({});
  }, [initialValues]);

  // handleSave — delegates to the parent's onSave callback and closes the modal
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(values);
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EntityForm fields={fields} values={values} onChange={setValues} />
      </Modal.Body>
      <Modal.Footer>
        {onDelete && (
          <Button variant="outline-danger" className="me-auto" onClick={onDelete}>Delete</Button>
        )}
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : (saveLabel || 'Save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
