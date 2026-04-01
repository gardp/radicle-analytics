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
import { Row, Col, Card, Button } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function ContentSection({ contents, onSelect, onAdd }) {
  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Content</Button>
        </div>
      )}
      {(!contents || contents.length === 0) && (
        <p className="text-muted small">No content for this track.</p>
      )}
      <Row>
        {(contents || []).map((c) => {
          const likes = c.likes_count || 0;
          const shares = c.shares_count || 0;
          const comments = c.comments_count || 0;
          return (
            <Col md={4} key={c.content_id} className="mb-3">
              <Card
                className="border-secondary h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect && onSelect(c)}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <Card.Title className="fs-6 mb-0">{c.name || 'Untitled'}</Card.Title>
                    <StatusBadge type="content" value={c.type} />
                  </div>
                  {c.engagement_phase && (
                    <span className="small text-muted text-capitalize">{c.engagement_phase}</span>
                  )}
                  <div className="d-flex gap-3 small text-muted mt-2">
                    <span>{likes} likes</span>
                    <span>{shares} shares</span>
                    <span>{comments} comments</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
