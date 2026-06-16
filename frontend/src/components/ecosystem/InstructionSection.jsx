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

export default function InstructionSection({ instructions, onSelect, onAdd }) {
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });

  const sortedInstructions = useMemo(() => {
    if (!instructions) return [];
    const getValue = (inst) => {
      switch (sort.key) {
        case 'name': return inst.name?.toLowerCase() || '';
        case 'body': return inst.instructions?.toLowerCase() || '';
        case 'phase': return inst.phase?.toLowerCase() || '';
        case 'status': return inst.is_active === false ? 0 : 1;
        default: return '';
      }
    };
    return [...instructions].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [instructions, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

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
                <SortHeader label="Name" sortKey="name" currentSort={sort} onSort={toggleSort} />
                <SortHeader
                  label="Instructions"
                  sortKey="body"
                  currentSort={sort}
                  onSort={toggleSort}
                  thStyle={{ width: '45%' }}
                />
                <SortHeader label="Phase" sortKey="phase" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Status" sortKey="status" currentSort={sort} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedInstructions.map((inst) => (
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
