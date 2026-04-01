// ==========================================================================
// src/components/layout/AppNavbar.jsx — Top Navigation Bar
// ==========================================================================
// Purpose:
//   Renders the persistent top navigation bar shown on every authenticated
//   page. Contains the brand name, navigation links (Dashboard, Tracks,
//   General Parameters), a "+ Create Track" quick-action button, and a
//   Logout button. Fixed to the top of the viewport via Bootstrap's
//   fixed="top" prop.
//
// Features:
//   - Active-link highlighting based on current URL path (useLocation)
//   - Inline TrackCreateModal for quick track creation from any page
//   - Logout triggers AuthContext.logout() and redirects to /login
//
// Props:
//   onTrackCreated — optional callback invoked after a track is created
//                    from the navbar's create modal (currently unused by
//                    parent App.jsx but available for future wiring)
//
// Internal dependencies:
//   - react-bootstrap (Navbar, Nav, Container, Button)
//   - react-router-dom (Link, useNavigate, useLocation)
//   - context/AuthContext → useAuth().logout
//   - components/tracks/TrackCreateModal → inline create modal
//
// Relationship to backend:
//   - No direct API calls. Logout clears the JWT token stored by
//     AuthContext. Track creation is delegated to TrackCreateModal
//     which calls POST /api/tracks via src/api/tracks.js.
//
// Used by:
//   - src/App.jsx (AppRoutes) — conditionally rendered when authenticated
// ==========================================================================
import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// useAuth provides logout() to clear the JWT and sign the user out
import { useAuth } from '../../context/AuthContext';
// Embedded modal for creating a new track directly from the navbar
import TrackCreateModal from '../tracks/TrackCreateModal';

export default function AppNavbar({ onTrackCreated }) {
  // Pull logout from AuthContext to clear the JWT on sign-out
  const { logout } = useAuth();
  const navigate = useNavigate();
  // useLocation gives access to current pathname for active-link highlighting
  const location = useLocation();
  // Controls visibility of the inline TrackCreateModal
  const [showCreate, setShowCreate] = useState(false);

  // handleLogout — clears auth state via context and navigates to /login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="border-bottom border-secondary">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold">Radicle Analytics</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" active={location.pathname === '/'}>Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/tracks" active={location.pathname.startsWith('/tracks')}>Tracks</Nav.Link>
              <Nav.Link as={Link} to="/general-parameters" active={location.pathname === '/general-parameters'}>General Parameters</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-light" size="sm" onClick={() => setShowCreate(true)}>
                + Create Track
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <TrackCreateModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={(track) => {
          setShowCreate(false);
          if (onTrackCreated) onTrackCreated(track);
        }}
      />
    </>
  );
}
