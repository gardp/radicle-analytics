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
import { Button, Table } from 'react-bootstrap';
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
      {(!actions || actions.length === 0) ? (
        <p className="text-muted small">No actions for this track.</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Status</th>
                <th>Instruction</th>
                <th>Due Date</th>
                <th style={{ width: '45%' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {(actions || []).map((a) => (
                <tr
                  key={a.action_id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelect && onSelect(a)}
                >
                  <td>
                    <div className="d-flex flex-column">
                      <StatusBadge type="action" value={a.status} />
                      {a.action_is_active === false && (
                        <span className="small text-danger mt-1">Inactive</span>
                      )}
                    </div>
                  </td>
                  <td className="fw-semibold">{a.instruction_id && instrMap[a.instruction_id] ? instrMap[a.instruction_id] : '—'}</td>
                  <td className="small text-muted">
                    {a.next_action_due_date
                      ? new Date(a.next_action_due_date).toLocaleString()
                      : '—'}
                  </td>
                  <td>
                    <div className="small text-muted" style={{ maxHeight: 72, overflow: 'hidden' }}>
                      {a.action_notes || '—'}
                    </div>
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
