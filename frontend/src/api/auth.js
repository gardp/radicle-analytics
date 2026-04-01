// ==========================================================================
// src/api/auth.js — Authentication API Module
// ==========================================================================
// Purpose:
//   Exposes the login function that sends the user's password to the
//   backend authentication endpoint. This is the only public (no-token)
//   API call in the application.
//
// Backend endpoint:
//   POST /api/auth/login  →  backend/api/auth.py
//     Request body:  { "password": "<string>" }
//     Response body: { "token": "<JWT string>" }
//     The backend validates the password against the APP_PASSWORD env var
//     and returns a signed JWT using APP_TOKEN_SECRET.
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/auth/LoginPage.jsx — calls login(password) on form submit,
//     then passes the returned token to AuthContext.loginUser().
// ==========================================================================
import client from './client';

// login — sends the password to POST /api/auth/login.
// Returns an axios response; the JWT is at res.data.token.
export const login = (password) => client.post('/api/auth/login', { password });
