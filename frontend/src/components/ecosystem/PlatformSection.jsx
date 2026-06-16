// ==========================================================================
// src/components/ecosystem/PlatformSection.jsx — Platform Card List
// ==========================================================================
// Purpose:
//   Renders a grid of cards for the platforms associated with a track's
//   ecosystem. Each card shows the platform name, type badge, URL link,
//   and active/inactive status. Clicking a card triggers onSelect so
//   EcosystemView can open the EntityModal for editing.
//
// Props:
//   platforms — array of PlatformResponse objects from the ecosystem
//   onSelect  — callback(platform) fired when a card is clicked
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Card)
//   - components/shared/StatusBadge → platform type badge + active/inactive indicator
//
// Relationship to backend:
//   - Displays data from PlatformResponse (backend/schemas/platform.py):
//     platform_id, name, type, url, is_active.
//   - No direct API calls; editing is handled by EcosystemView → EntityModal.
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → Platforms accordion section
// ==========================================================================
import React, { useMemo, useState } from 'react';
import { Table } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

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

export default function PlatformSection({ platforms, onSelect }) {
  if (!platforms || platforms.length === 0) {
    return <p className="text-muted small">No platforms linked via instructions.</p>;
  }

  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });

  const sortedPlatforms = useMemo(() => {
    if (!platforms) return [];
    return [...platforms].sort((a, b) => {
      const getValue = (item) => {
        switch (sort.key) {
          case 'name': return item.name?.toLowerCase() || '';
          case 'type': return item.type?.toLowerCase() || '';
          case 'url': return item.url?.toLowerCase() || '';
          case 'status': return item.is_active === false ? 0 : 1;
          default: return '';
        }
      };
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [platforms, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead className="table-light">
          <tr>
            <SortHeader label="Name" sortKey="name" currentSort={sort} onSort={toggleSort} />
            <SortHeader label="Type" sortKey="type" currentSort={sort} onSort={toggleSort} />
            <SortHeader label="URL" sortKey="url" currentSort={sort} onSort={toggleSort} />
            <SortHeader label="Status" sortKey="status" currentSort={sort} onSort={toggleSort} />
          </tr>
        </thead>
        <tbody>
          {sortedPlatforms.map((p) => (
            <tr
              key={p.platform_id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect && onSelect(p)}
            >
              <td className="fw-semibold">{p.name}</td>
              <td><StatusBadge type="platform" value={p.type} /></td>
              <td>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-info"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.url}
                  </a>
                ) : '—'}
              </td>
              <td>
                {p.is_active !== false
                  ? <span className="text-success">Active</span>
                  : <span className="text-danger">Inactive</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
