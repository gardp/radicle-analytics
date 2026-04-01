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
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function PlatformSection({ platforms, onSelect }) {
  if (!platforms || platforms.length === 0) {
    return <p className="text-muted small">No platforms linked via instructions.</p>;
  }

  return (
    <Row>
      {platforms.map((p) => (
        <Col md={4} key={p.platform_id} className="mb-3">
          <Card
            className="border-secondary h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect && onSelect(p)}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <Card.Title className="fs-6">{p.name}</Card.Title>
                <StatusBadge type="platform" value={p.type} />
              </div>
              {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="small text-info" onClick={e => e.stopPropagation()}>{p.url}</a>}
              <div className="mt-1">
                <StatusBadge type="action" value={p.is_active ? 'completed' : 'failed'} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
