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
import { Row, Col, Card, Button } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';
// PHASE_LABELS maps phase enum values ("pre","during","post","various") to display text
import { PHASE_LABELS } from '../../utils/constants';

export default function InstructionSection({ instructions, onSelect, onAdd }) {
  // Group instructions by their phase for sectioned display
  const grouped = {};
  (instructions || []).forEach((inst) => {
    const phase = inst.phase || 'various';
    if (!grouped[phase]) grouped[phase] = [];
    grouped[phase].push(inst);
  });

  // Render phases in a fixed order: Pre-release → During release → Post-release → Various
  const phases = ['pre', 'during', 'post', 'various'];

  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Instruction</Button>
        </div>
      )}
      {instructions && instructions.length === 0 && (
        <p className="text-muted small">No instructions for this track.</p>
      )}
      {phases.map((phase) => {
        const items = grouped[phase];
        if (!items || items.length === 0) return null;
        return (
          <div key={phase} className="mb-3">
            <h6 className="text-muted small fw-bold">{PHASE_LABELS[phase] || phase}</h6>
            <Row>
              {items.map((inst) => (
                <Col md={4} key={inst.instruction_id} className="mb-3">
                  <Card
                    className="border-secondary h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelect && onSelect(inst)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <Card.Title className="fs-6 mb-0">{inst.name || 'Untitled'}</Card.Title>
                        <StatusBadge type="phase" value={inst.phase} />
                      </div>
                      {inst.instructions && (
                        <p className="small text-muted mb-1" style={{ maxHeight: 60, overflow: 'hidden' }}>
                          {inst.instructions.substring(0, 120)}{inst.instructions.length > 120 ? '...' : ''}
                        </p>
                      )}
                      <div className="small text-muted">
                        {inst.is_active === false && <StatusBadge type="action" value="failed" />}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );
      })}
    </div>
  );
}
