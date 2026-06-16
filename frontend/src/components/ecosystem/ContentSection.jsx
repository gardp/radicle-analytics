// ==========================================================================
// src/components/ecosystem/ContentSection.jsx — Content Card List
// ==========================================================================
// Purpose:
//   Renders a grid of cards for the content items belonging to a track's
//   ecosystem. Each card shows the content name, type badge, engagement
//   phase, and engagement counts (likes/shares/comments). Includes an
//   "Add Content" button for creating new content items.
//
// Props:
//   contents — array of ContentResponse objects from the ecosystem
//   onSelect — callback(content) to open the edit modal
//   onAdd    — callback to open the create modal
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Card, Button)
//   - components/shared/StatusBadge → content type badge
//
// Relationship to backend:
//   - Displays data from ContentResponse (backend/schemas/content.py):
//     content_id, name, type, engagement_phase, likes_count, shares_count,
//     comments_count.
//   - No direct API calls; CRUD handled by EcosystemView → EntityModal.
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → Content accordion section
// ==========================================================================
import React, { useMemo, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
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

export default function ContentSection({ contents, onSelect, onAdd }) {
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });

  const sortedContents = useMemo(() => {
    if (!contents) return [];
    const getValue = (item) => {
      switch (sort.key) {
        case 'name': return item.name?.toLowerCase() || '';
        case 'type': return item.type?.toLowerCase() || '';
        case 'engagement_phase': return item.engagement_phase?.toLowerCase() || '';
        case 'stats': {
          const likes = item.likes_count || 0;
          const shares = item.shares_count || 0;
          const comments = item.comments_count || 0;
          return likes + shares + comments;
        }
        default: return '';
      }
    };
    return [...contents].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [contents, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Content</Button>
        </div>
      )}
      {(!contents || contents.length === 0) ? (
        <p className="text-muted small">No content for this track.</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="table-light">
              <tr>
                <SortHeader label="Name" sortKey="name" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Type" sortKey="type" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Engagement Phase" sortKey="engagement_phase" currentSort={sort} onSort={toggleSort} />
                <SortHeader label="Stats" sortKey="stats" currentSort={sort} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedContents.map((c) => {
                const likes = c.likes_count || 0;
                const shares = c.shares_count || 0;
                const comments = c.comments_count || 0;
                return (
                  <tr
                    key={c.content_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelect && onSelect(c)}
                  >
                    <td className="fw-semibold">{c.name || 'Untitled'}</td>
                    <td><StatusBadge type="content" value={c.type} /></td>
                    <td className="text-capitalize text-muted">{c.engagement_phase || '—'}</td>
                    <td className="small text-muted">
                      <span className="me-3">{likes} likes</span>
                      <span className="me-3">{shares} shares</span>
                      <span>{comments} comments</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
