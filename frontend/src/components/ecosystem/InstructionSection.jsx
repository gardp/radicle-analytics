// ==========================================================================
// src/components/ecosystem/InstructionSection.jsx — Instruction Card List
// ==========================================================================
// Purpose:
//   Renders instructions for a track grouped by release phase (Pre, During,
//   Post, Various). Each instruction is shown as a clickable card displaying
//   name, phase badge, truncated instruction text, and inactive indicator.
//   Includes an "Add Instruction" button for creating new instructions.
//
// Props:
//   instructions — array of InstructionResponse objects from the ecosystem
//   onSelect     — callback(instruction) to open the edit modal
//   onAdd        — callback to open the create modal
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Card, Button)
//   - components/shared/StatusBadge → phase badge + inactive indicator
//   - utils/constants → PHASE_LABELS (maps phase enum to display labels)
//
// Relationship to backend:
//   - Displays data from InstructionResponse (backend/schemas/instruction.py):
//     instruction_id, name, instructions (text), phase, is_active.
//   - No direct API calls; CRUD is handled by EcosystemView → EntityModal.
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → Instructions accordion section
// ==========================================================================
import React from 'react';
import { Button, Table } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function InstructionSection({ instructions, onSelect, onAdd }) {
  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Instruction</Button>
        </div>
      )}
      {(!instructions || instructions.length === 0) ? (
        <p className="text-muted small">No instructions for this track.</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th style={{ width: '45%' }}>Instructions</th>
                <th>Phase</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {instructions.map((inst) => (
                <tr
                  key={inst.instruction_id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelect && onSelect(inst)}
                >
                  <td className="fw-semibold">{inst.name || 'Untitled'}</td>
                  <td>
                    <div className="small text-muted" style={{ maxHeight: 72, overflow: 'hidden' }}>
                      {inst.instructions || '—'}
                    </div>
                  </td>
                  <td><StatusBadge type="phase" value={inst.phase} /></td>
                  <td>
                    {inst.is_active === false
                      ? <span className="text-danger">Inactive</span>
                      : <span className="text-success">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
