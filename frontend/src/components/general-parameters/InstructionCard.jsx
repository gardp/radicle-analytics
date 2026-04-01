// ==========================================================================
// src/components/general-parameters/InstructionCard.jsx — Template Instruction Card
// ==========================================================================
// Purpose:
//   Renders a single template instruction as a clickable card in the
//   General Parameters page. Displays name, phase badge, truncated
//   instruction text, and an "Inactive" label when is_active is false.
//   Hover adds a subtle glow effect for visual feedback.
//
// Props:
//   instruction — InstructionResponse object (template, track_id=null)
//   onClick     — callback(instruction) to open InstructionModal for editing
//
// Internal dependencies:
//   - react-bootstrap (Card)
//   - components/shared/StatusBadge → phase badge
//
// Relationship to backend:
//   - Displays data from InstructionResponse (backend/schemas/instruction.py):
//     name, phase, instructions (text body), is_active.
//   - No direct API calls; editing handled by InstructionModal.
//
// Used by:
//   - components/general-parameters/GeneralParametersPage.jsx → Instructions tab
// ==========================================================================
import React from 'react';
import { Card } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function InstructionCard({ instruction, onClick }) {
  return (
    <Card
      className="border-secondary h-100"
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(13,110,253,0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      onClick={() => onClick && onClick(instruction)}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-1">
          <Card.Title className="fs-6 mb-0">{instruction.name || 'Untitled'}</Card.Title>
          <StatusBadge type="phase" value={instruction.phase} />
        </div>
        {instruction.instructions && (
          <p className="small text-muted mb-1 mt-2" style={{ maxHeight: 60, overflow: 'hidden' }}>
            {instruction.instructions.substring(0, 140)}{instruction.instructions.length > 140 ? '...' : ''}
          </p>
        )}
        <div className="mt-auto">
          {instruction.is_active === false && (
            <span className="small text-danger">Inactive</span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
