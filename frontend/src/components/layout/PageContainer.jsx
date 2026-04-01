// ==========================================================================
// src/components/layout/PageContainer.jsx — Page Content Wrapper
// ==========================================================================
// Purpose:
//   A simple layout wrapper that adds consistent padding and a top margin
//   to page content so it doesn't overlap with the fixed-position AppNavbar
//   (which is ~56px tall; the 70px margin provides safe clearance).
//
// Props:
//   children — the page content to render inside the container
//
// Internal dependencies:
//   - react-bootstrap (Container)
//
// Used by:
//   - components/dashboard/DashboardPage.jsx
//   - components/tracks/TracksPage.jsx
//   - components/tracks/TrackEcosystem.jsx
//   - components/general-parameters/GeneralParametersPage.jsx
// ==========================================================================
import React from 'react';
import { Container } from 'react-bootstrap';

// PageContainer — wraps all page content with a fluid Bootstrap Container.
// marginTop: 70px offsets the fixed-top AppNavbar so content is not hidden.
// py-4 adds vertical padding for breathing room.
export default function PageContainer({ children }) {
  return (
    <Container fluid className="py-4" style={{ marginTop: '70px' }}>
      {children}
    </Container>
  );
}
