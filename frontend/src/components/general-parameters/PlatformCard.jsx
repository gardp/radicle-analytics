// ==========================================================================
// src/components/general-parameters/PlatformCard.jsx — Platform Display Card
// ==========================================================================
// Purpose:
//   Renders a single platform as a clickable card in the General Parameters
//   page's Platforms tab. Displays name, type badge, clickable URL link,
//   and active/inactive status text. Hover adds a subtle glow effect.
//
// Props:
//   platform — PlatformResponse object from the backend
//   onClick  — callback(platform) to open PlatformModal for editing
//
// Internal dependencies:
//   - react-bootstrap (Card)
//   - components/shared/StatusBadge → platform type badge
//
// Relationship to backend:
//   - Displays data from PlatformResponse (backend/schemas/platform.py):
//     name, type, url, is_active.
//   - No direct API calls; editing handled by PlatformModal.
//
// Used by:
//   - components/general-parameters/GeneralParametersPage.jsx → Platforms tab
// ==========================================================================
import React from 'react';
import { Card } from 'react-bootstrap';
import StatusBadge from '../shared/StatusBadge';

export default function PlatformCard({ platform, onClick }) {
  return (
    <Card
      className="border-secondary h-100"
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(13,110,253,0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      onClick={() => onClick && onClick(platform)}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-1">
          <Card.Title className="fs-6 mb-0">{platform.name}</Card.Title>
          <StatusBadge type="platform" value={platform.type} />
        </div>
        {platform.url && (
          <a href={platform.url} target="_blank" rel="noreferrer" className="small text-info" onClick={e => e.stopPropagation()}>
            {platform.url}
          </a>
        )}
        <div className="mt-2">
          {platform.is_active === false ? (
            <span className="small text-danger">Inactive</span>
          ) : (
            <span className="small text-success">Active</span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
