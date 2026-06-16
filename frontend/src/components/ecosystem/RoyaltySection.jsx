// ==========================================================================
// src/components/ecosystem/RoyaltySection.jsx — Royalty Card List
// ==========================================================================
// Purpose:
//   Renders a grid of cards for the royalties belonging to a track's
//   ecosystem. Each card shows the royalty right (e.g. Master, Mechanical)
//   and type. Includes an "Add Royalty" button for creating new royalties.
//
// Props:
//   royalties — array of RoyaltyResponse objects from the ecosystem
//   onSelect  — callback(royalty) to open the edit modal
//   onAdd     — callback to open the create modal
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Card, Button)
//
// Relationship to backend:
//   - Displays data from RoyaltyResponse (backend/schemas/royalty.py):
//     royalty_id, right, royalty (type string).
//   - No direct API calls; CRUD handled by EcosystemView → EntityModal.
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → Royalties accordion section
// ==========================================================================
import React, { useMemo, useState } from 'react';
import { Button, Table } from 'react-bootstrap';

function SortHeader({ label, sortKey, currentSort, onSort }) {
  const active = currentSort.key === sortKey;
  const arrow = active ? (currentSort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  return (
    <th
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={() => onSort(sortKey)}
    >
      {label}{arrow}
    </th>
  );
}

export default function RoyaltySection({ royalties, onSelect, onAdd }) {
  const [sort, setSort] = useState({ key: 'right', dir: 'asc' });

  const sortedRoyalties = useMemo(() => {
    if (!royalties) return [];
    const getValue = (r) => {
      switch (sort.key) {
        case 'right': return r.right?.toLowerCase() || '';
        case 'type': return r.royalty?.toLowerCase() || '';
        default: return '';
      }
    };
    return [...royalties].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [royalties, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Royalty</Button>
        </div>
      )}
      {(!royalties || royalties.length === 0) ? (
        <p className="text-muted small">No royalties for this track.</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="table-light">
              <tr>
                <SortHeader label="Right" sortKey="right" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Type" sortKey="type" currentSort={sort} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedRoyalties.map((r) => (
                <tr
                  key={r.royalty_id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelect && onSelect(r)}
                >
                  <td className="fw-semibold">{r.right || 'Royalty'}</td>
                  <td className="text-muted">{r.royalty || '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
