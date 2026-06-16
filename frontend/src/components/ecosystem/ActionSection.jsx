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
import React, { useMemo, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

function SortHeader({ label, sortKey, currentSort, onSort, thStyle }) {
  const active = currentSort.key === sortKey;
  const arrow = active ? (currentSort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  return (
    <th
      style={{ cursor: 'pointer', userSelect: 'none', ...thStyle }}
      onClick={() => onSort(sortKey)}
    >
      {label}{arrow}
    </th>
  );
}

export default function ActionSection({ actions, instructions, onSelect, onAdd }) {
  // Build a lookup map so each action card can display its instruction name
  const instrMap = {};
  (instructions || []).forEach((i) => { instrMap[i.instruction_id] = i.name || 'Untitled'; });

  const [sort, setSort] = useState({ key: 'status', dir: 'asc' });

  const sortedActions = useMemo(() => {
    if (!actions) return [];
    const getValue = (action) => {
      switch (sort.key) {
        case 'status': return action.status?.toLowerCase() || '';
        case 'instruction': return (instrMap[action.instruction_id] || '').toLowerCase();
        case 'due': return action.next_action_due_date ? new Date(action.next_action_due_date).getTime() : 0;
        case 'notes': return action.action_notes?.toLowerCase() || '';
        default: return '';
      }
    };
    return [...actions].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [actions, instrMap, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

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
                <SortHeader label="Status" sortKey="status" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Instruction" sortKey="instruction" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Due Date" sortKey="due" currentSort={sort} onSort={toggleSort} />
                <SortHeader
                  label="Notes"
                  sortKey="notes"
                  currentSort={sort}
                  onSort={toggleSort}
                  thStyle={{ width: '45%' }}
                />
              </tr>
            </thead>
            <tbody>
              {sortedActions.map((a) => (
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
