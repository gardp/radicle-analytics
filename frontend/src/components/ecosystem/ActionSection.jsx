// ==========================================================================
// src/components/ecosystem/ActionSection.jsx — Action Card List
// ==========================================================================
// Purpose:
//   Renders a grid of cards for the actions belonging to a track's
//   ecosystem. Each card shows the action status badge, due date, and
//   truncated notes. Includes an "Add Action" button for creating new
//   actions linked to one of the track's content items.
//
// Props:
//   actions  — array of ActionResponse objects from the ecosystem
//   onSelect — callback(action) to open the edit modal
//   onAdd    — callback to open the create modal
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Card, Button)
//   - components/shared/StatusBadge → action status badge (pending/in_progress/…)
//
// Relationship to backend:
//   - Displays data from ActionResponse (backend/schemas/action.py):
//     action_id, status, next_action_due_date, action_notes.
//   - No direct API calls; CRUD handled by EcosystemView → EntityModal.
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → Actions accordion section
// ==========================================================================
import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function ActionSection({ actions, instructions, onSelect, onAdd }) {
  // Build a lookup map so each action card can display its instruction name
  const instrMap = {};
  (instructions || []).forEach((i) => { instrMap[i.instruction_id] = i.name || 'Untitled'; });

  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Action</Button>
        </div>
      )}
      {(!actions || actions.length === 0) && (
        <p className="text-muted small">No actions for this track.</p>
      )}
      <Row>
        {(actions || []).map((a) => (
          <Col md={4} key={a.action_id} className="mb-3">
            <Card
              className="border-secondary h-100"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect && onSelect(a)}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <StatusBadge type="action" value={a.status} />
                  {a.next_action_due_date && (
                    <span className="small text-muted">Due: {new Date(a.next_action_due_date).toLocaleDateString()}</span>
                  )}
                </div>
                {a.instruction_id && instrMap[a.instruction_id] && (
                  <p className="small fw-semibold mb-1 mt-1">{instrMap[a.instruction_id]}</p>
                )}
                {a.action_notes && (
                  <p className="small text-muted mb-0 mt-1" style={{ maxHeight: 50, overflow: 'hidden' }}>
                    {a.action_notes.substring(0, 100)}{a.action_notes.length > 100 ? '...' : ''}
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
