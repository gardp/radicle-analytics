// ==========================================================================
// src/App.jsx — Root Application Component (Routing & Global Providers)
// ==========================================================================
// Purpose:
//   Top-level React component that assembles the entire application. It
//   provides three global concerns:
//     1. Client-side routing  (react-router-dom BrowserRouter)
//     2. Authentication state (AuthProvider context)
//     3. Toast notifications  (react-toastify ToastContainer)
//
// Route map (all protected routes require a valid auth token):
//   /login                → LoginPage          (public — redirects to / if logged in)
//   /                     → DashboardPage      (protected — analytics overview)
//   /tracks               → TracksPage         (protected — track listing + CRUD)
//   /tracks/:trackId      → TrackEcosystem     (protected — single track detail + ecosystem)
//   /general-parameters   → GeneralParametersPage (protected — template instructions & platforms)
//   *                     → redirects to /
//
// Internal dependencies:
//   - context/AuthContext          → AuthProvider & useAuth hook (token state)
//   - components/layout/AppNavbar  → top navigation bar (shown only when logged in)
//   - components/auth/LoginPage    → password-based login screen
//   - components/dashboard/DashboardPage → analytics dashboard with charts
//   - components/tracks/TracksPage       → track list + search + create/edit/delete
//   - components/tracks/TrackEcosystem   → single-track ecosystem detail view
//   - components/general-parameters/GeneralParametersPage → global instructions & platforms
//
// Used by:
//   - src/index.jsx  — rendered inside ReactDOM.createRoot as the root component
//
// Relationship to backend:
//   - No direct backend calls here. Auth state is managed by AuthContext which
//     stores the JWT token returned by POST /api/auth/login (backend/api/auth.py).
//     All child pages make their own API calls through the src/api/ modules.
// ==========================================================================

import React from 'react';
// BrowserRouter: enables client-side URL routing (HTML5 history API)
// Routes/Route: declarative route definitions
// Navigate: programmatic redirect component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// ToastContainer: global notification container — individual toasts are triggered
// via toast.success() / toast.error() calls throughout the app
import { ToastContainer } from 'react-toastify';
// AuthProvider: wraps the app to provide token state via React Context
// useAuth: hook to read isAuthenticated, token, loginUser, logout
import { AuthProvider, useAuth } from './context/AuthContext';
// Persistent top navbar — only rendered when the user is authenticated
import AppNavbar from './components/layout/AppNavbar';
// Page components — each corresponds to a route defined below
import LoginPage from './components/auth/LoginPage';
import DashboardPage from './components/dashboard/DashboardPage';
import TracksPage from './components/tracks/TracksPage';
import TrackEcosystem from './components/tracks/TrackEcosystem';
import GeneralParametersPage from './components/general-parameters/GeneralParametersPage';

// --------------------------------------------------------------------------
// ProtectedRoute — wrapper that enforces authentication on child routes.
// If the user has no valid token (isAuthenticated === false), they are
// redirected to /login. Otherwise the wrapped children are rendered normally.
// --------------------------------------------------------------------------
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// --------------------------------------------------------------------------
// AppRoutes — defines the full route table and renders the global navbar
// and toast container. Separated from App() so that useAuth() can be called
// inside the AuthProvider tree.
// --------------------------------------------------------------------------
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Show the navbar only when the user is logged in */}
      {isAuthenticated && <AppNavbar />}
      <Routes>
        {/* Public route — /login; auto-redirects authenticated users to dashboard */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        {/* Protected routes — each wrapped with ProtectedRoute for auth gating */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tracks" element={<ProtectedRoute><TracksPage /></ProtectedRoute>} />
        {/* Dynamic route — :trackId is read via useParams() in TrackEcosystem */}
        <Route path="/tracks/:trackId" element={<ProtectedRoute><TrackEcosystem /></ProtectedRoute>} />
        <Route path="/general-parameters" element={<ProtectedRoute><GeneralParametersPage /></ProtectedRoute>} />
        {/* Catch-all: redirect unknown paths to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Global toast notification container — bottom-right, dark theme, 3s auto-close */}
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
    </>
  );
}

// --------------------------------------------------------------------------
// App — the exported root component. Sets up:
//   1. BrowserRouter for client-side routing
//   2. AuthProvider for global authentication context
//   3. AppRoutes for the actual route definitions and layout
// --------------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
