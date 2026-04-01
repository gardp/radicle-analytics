// ==========================================================================
// src/components/general-parameters/InstructionModal.jsx
//   — Create / Edit / Delete Template Instruction + Frequencies
// ==========================================================================
// Purpose:
//   Full-featured modal for managing a single template instruction and its
//   child Frequency entities. In create mode (isCreate=true), the modal
//   creates a new instruction with track_id=null (template). In edit mode,
//   it also displays an inline Frequency management section where the user
//   can add, edit, and delete frequencies.
//
// Props:
//   show        — boolean controlling modal visibility
//   onHide      — callback to close the modal
//   instruction — InstructionResponse to edit, or null for create mode
//   onSaved     — callback invoked after any successful mutation
//   isCreate    — boolean; when true, modal is in "create" mode
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button, Spinner, Row, Col, Form, Card)
//   - react-toastify (toast)
//   - components/shared/EntityForm → renders instruction and frequency forms
//   - api/instructions → createInstruction, updateInstruction, deleteInstruction,
//       listFrequencies, createFrequency, updateFrequency, deleteFrequency
//   - api/platforms → listPlatforms (populates platform_id dropdown)
//   - utils/constants → PHASE_OPTIONS, FREQUENCY_TYPE_OPTIONS, TIME_PERIOD_OPTIONS
//
// Relationship to backend:
//   - POST   /api/instructions           → create template instruction
//   - PUT    /api/instructions/:id        → update instruction
//   - DELETE /api/instructions/:id        → delete instruction
//   - GET    /api/instructions/:id/frequencies    → list frequencies
//   - POST   /api/instructions/:id/frequencies    → create frequency
//   - PUT    /api/instructions/frequencies/:id    → update frequency
//   - DELETE /api/instructions/frequencies/:id    → delete frequency
//   - GET    /api/platforms               → populate platform dropdown
//
// Used by:
//   - components/general-parameters/GeneralParametersPage.jsx
//     → opened for both create and edit of template instructions
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Row, Col, Form, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EntityForm from '../shared/EntityForm';
// Full instruction + frequency CRUD API functions
import { updateInstruction, createInstruction, deleteInstruction, listFrequencies, createFrequency, updateFrequency, deleteFrequency } from '../../api/instructions';
// listPlatforms populates the platform_id dropdown in the instruction form
import { listPlatforms } from '../../api/platforms';
import { PHASE_OPTIONS, FREQUENCY_TYPE_OPTIONS, TIME_PERIOD_OPTIONS } from '../../utils/constants';

// --------------------------------------------------------------------------
// FREQUENCY_FIELDS — field definitions for the inline Frequency form.
// Keys map to FrequencyCreate/FrequencyUpdate schema fields (backend).
// --------------------------------------------------------------------------
const FREQUENCY_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'frequency_unit', label: 'Unit (hours/days/weeks)', type: 'text' },
  { key: 'frequency_value', label: 'Value', type: 'number' },
  { key: 'time_period', label: 'Time Period', type: 'select', options: TIME_PERIOD_OPTIONS },
  { key: 'start_date', label: 'Start Date', type: 'datetime' },
  { key: 'end_date', label: 'End Date', type: 'datetime' },
  { key: 'frequency_type', label: 'Frequency Type', type: 'select', options: FREQUENCY_TYPE_OPTIONS },
  { key: 'is_active', label: 'Active', type: 'switch' },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
];

export default function InstructionModal({ show, onHide, instruction, onSaved, isCreate }) {
  // Form state for the instruction fields
  const [values, setValues] = useState({});
  // All platforms from the backend — used to populate the platform_id dropdown
  const [platforms, setPlatforms] = useState([]);
  // Frequencies belonging to this instruction (edit mode only)
  const [frequencies, setFrequencies] = useState([]);
  // When set, shows an inline frequency create/edit form below the frequency list
  const [freqForm, setFreqForm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch all platforms on mount for the platform_id dropdown
  useEffect(() => {
    listPlatforms().then(r => setPlatforms(r.data)).catch(() => {});
  }, []);

  // Seed form values and load frequencies when the instruction prop changes
  useEffect(() => {
    if (instruction) {
      setValues({ ...instruction });
      // Load frequencies for existing instructions
      if (instruction.instruction_id) {
        listFrequencies(instruction.instruction_id).then(r => setFrequencies(r.data)).catch(() => {});
      }
    } else {
      // Create mode defaults
      setValues({ is_active: true });
      setFrequencies([]);
    }
  }, [instruction]);

  // instrFields — dynamically built because the platform_id dropdown options
  // depend on the platforms state (fetched on mount).
  const instrFields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'instructions', label: 'Instructions', type: 'textarea', fullWidth: true },
    { key: 'source', label: 'Source', type: 'text' },
    { key: 'source_media', label: 'Source Media', type: 'text' },
    { key: 'phase', label: 'Phase', type: 'select', options: PHASE_OPTIONS.filter(o => o.value) },
    { key: 'goals', label: 'Goals', type: 'text' },
    { key: 'platform_id', label: 'Platform', type: 'select', options: platforms.map(p => ({ value: p.platform_id, label: p.name })) },
    { key: 'is_active', label: 'Active', type: 'switch' },
    { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  ];

  // handleSave — creates or updates the instruction depending on isCreate flag
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCreate) {
        await createInstruction(values);
        toast.success('Instruction created');
      } else {
        await updateInstruction(instruction.instruction_id, values);
        toast.success('Instruction updated');
      }
      if (onSaved) onSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // handleDelete — deletes the instruction via DELETE /api/instructions/:id
  const handleDelete = async () => {
    try {
      await deleteInstruction(instruction.instruction_id);
      toast.success('Instruction deleted');
      if (onSaved) onSaved();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  // handleSaveFreq — creates or updates a frequency depending on whether
  // freqVals.frequency_id exists. Re-fetches frequencies list after success.
  const handleSaveFreq = async (freqVals) => {
    try {
      if (freqVals.frequency_id) {
        await updateFrequency(freqVals.frequency_id, freqVals);
        toast.success('Frequency updated');
      } else {
        await createFrequency(instruction.instruction_id, { ...freqVals, instruction_id: instruction.instruction_id });
        toast.success('Frequency created');
      }
      const res = await listFrequencies(instruction.instruction_id);
      setFrequencies(res.data);
      setFreqForm(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Frequency save failed');
    }
  };

  // handleDeleteFreq — deletes a frequency and re-fetches the list
  const handleDeleteFreq = async (id) => {
    try {
      await deleteFrequency(id);
      toast.success('Frequency deleted');
      const res = await listFrequencies(instruction.instruction_id);
      setFrequencies(res.data);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{isCreate ? 'Create Instruction' : 'Edit Instruction'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EntityForm fields={instrFields} values={values} onChange={setValues} />

        {!isCreate && instruction?.instruction_id && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Frequencies</h6>
              <Button variant="outline-primary" size="sm" onClick={() => setFreqForm({ is_active: true })}>+ Add</Button>
            </div>
            {frequencies.length === 0 && !freqForm && (
              <p className="text-muted small">No frequencies defined.</p>
            )}
            {frequencies.map((f) => (
              <Card key={f.frequency_id} className="border-secondary mb-2">
                <Card.Body className="py-2 px-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small">{f.name || 'Frequency'} — {f.frequency_value} {f.frequency_unit} ({f.frequency_type})</span>
                    <div className="d-flex gap-1">
                      <Button variant="outline-primary" size="sm" onClick={() => setFreqForm({ ...f })}>Edit</Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFreq(f.frequency_id)}>Del</Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
            {freqForm && (
              <Card className="border-info mt-2">
                <Card.Body>
                  <EntityForm fields={FREQUENCY_FIELDS} values={freqForm} onChange={setFreqForm} />
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <Button variant="outline-secondary" size="sm" onClick={() => setFreqForm(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveFreq(freqForm)}>
                      {freqForm.frequency_id ? 'Update' : 'Create'} Frequency
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
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
