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
import { Button, Table } from 'react-bootstrap';

export default function RoyaltySection({ royalties, onSelect, onAdd }) {
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
                <th>Right</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {(royalties || []).map((r) => (
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
