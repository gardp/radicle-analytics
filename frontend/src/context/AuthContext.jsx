// ==========================================================================
// src/context/AuthContext.jsx — Global Authentication State (React Context)
// ==========================================================================
// Purpose:
//   Provides application-wide authentication state via React Context. Stores
//   the JWT bearer token in both React state and localStorage so that the
//   session survives page reloads. Exposes helper functions to log in (store
//   a new token) and log out (clear the token).
//
// Exported members:
//   - AuthProvider  (component) — wraps the component tree to provide auth
//   - useAuth       (hook)      — returns { token, isAuthenticated, loginUser, logout }
//
// Context value shape:
//   {
//     token: string | null,       // raw JWT string, or null if logged out
//     isAuthenticated: boolean,   // convenience flag derived from !!token
//     loginUser: (token) => void, // stores token in state + localStorage
//     logout: () => void,         // clears token from state + localStorage
//   }
//
// Relationship to backend:
//   - The token is obtained from POST /api/auth/login (backend/api/auth.py)
//     which validates APP_PASSWORD and returns a signed JWT using APP_TOKEN_SECRET.
//   - The token is attached to every outgoing HTTP request by the axios
//     request interceptor in src/api/client.js (Authorization: Bearer <token>).
//   - If the backend returns a 401, the response interceptor in client.js
//     removes the token from localStorage and redirects to /login.
//
// Internal dependencies:
//   - React (createContext, useContext, useState, useCallback)
//
// Used by:
//   - src/App.jsx                → wraps the app with <AuthProvider>
//   - src/App.jsx (ProtectedRoute, AppRoutes) → useAuth() for route guarding
//   - components/auth/LoginPage.jsx           → useAuth().loginUser to store token
//   - components/layout/AppNavbar.jsx         → useAuth().logout for sign-out
// ==========================================================================
import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the React Context with null default — consumers must be inside AuthProvider
const AuthContext = createContext(null);

// --------------------------------------------------------------------------
// AuthProvider — wraps the component tree and manages the JWT token.
// On initial mount, reads any previously-stored token from localStorage
// so that the user stays logged in across page refreshes.
// --------------------------------------------------------------------------
export function AuthProvider({ children }) {
  // Lazy initializer: read token from localStorage on first render only
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // loginUser — called by LoginPage after a successful POST /api/auth/login.
  // Persists the JWT to localStorage (survives refresh) and updates React state.
  const loginUser = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }, []);

  // logout — called by AppNavbar's logout button.
  // Removes the JWT from localStorage and clears React state, which causes
  // ProtectedRoute in App.jsx to redirect the user to /login.
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------------------------------
// useAuth — convenience hook for consuming the AuthContext.
// Throws if called outside of <AuthProvider> to catch wiring mistakes early.
// Returns: { token, isAuthenticated, loginUser, logout }
// --------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
