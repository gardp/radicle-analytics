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
import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

export default function RoyaltySection({ royalties, onSelect, onAdd }) {
  return (
    <div>
      {onAdd && (
        <div className="mb-3">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>+ Add Royalty</Button>
        </div>
      )}
      {(!royalties || royalties.length === 0) && (
        <p className="text-muted small">No royalties for this track.</p>
      )}
      <Row>
        {(royalties || []).map((r) => (
          <Col md={4} key={r.royalty_id} className="mb-3">
            <Card
              className="border-secondary h-100"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect && onSelect(r)}
            >
              <Card.Body>
                <Card.Title className="fs-6">{r.right || 'Royalty'}</Card.Title>
                <span className="small text-muted">{r.royalty || '—'}</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
