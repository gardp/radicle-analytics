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
import React from 'react';
import { Button, Table } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function ContentSection({ contents, onSelect, onAdd }) {
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
                <th>Name</th>
                <th>Type</th>
                <th>Engagement Phase</th>
                <th>Stats</th>
              </tr>
            </thead>
            <tbody>
              {(contents || []).map((c) => {
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
