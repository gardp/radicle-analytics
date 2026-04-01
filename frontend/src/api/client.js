// ==========================================================================
// src/api/client.js — Axios HTTP Client (Central Backend Gateway)
// ==========================================================================
// Purpose:
//   Creates and configures a single axios instance that ALL API modules
//   (auth, tracks, platforms, content, instructions, actions, royalties,
//   signals, dashboard) use to communicate with the FastAPI backend.
//   This is the ONLY file that knows the backend base URL.
//
// Key responsibilities:
//   1. Base URL — reads VITE_API_URL from .env (falls back to localhost:8000)
//   2. Auth header injection — request interceptor attaches the JWT token
//      stored in localStorage as an Authorization: Bearer header.
//   3. 401 auto-logout — response interceptor detects expired/invalid tokens,
//      clears localStorage, and redirects to /login.
//
// Relationship to backend:
//   - Every HTTP request to the FastAPI server flows through this client.
//   - The backend expects a Bearer token in the Authorization header for all
//     protected endpoints (everything except POST /api/auth/login).
//   - On 401, the backend signals that the token is invalid or expired;
//     the interceptor here handles the client-side cleanup.
//   - CORS is handled by the backend's CORSMiddleware (backend/app/main.py).
//
// Internal dependencies:
//   - axios (npm package)
//   - VITE_API_URL env variable (see .env.example)
//
// Used by:
//   - src/api/auth.js          — login endpoint
//   - src/api/tracks.js        — track CRUD + ecosystem
//   - src/api/platforms.js      — platform CRUD
//   - src/api/content.js        — content CRUD
//   - src/api/instructions.js   — instruction + frequency CRUD
//   - src/api/actions.js        — action CRUD
//   - src/api/royalties.js      — royalty + transaction CRUD
//   - src/api/signals.js        — signal CRUD (registry-based)
//   - src/api/dashboard.js      — dashboard aggregation endpoints
// ==========================================================================
import axios from 'axios';

// Create a pre-configured axios instance pointing at the FastAPI backend.
// VITE_API_URL is set in .env / .env.local (see .env.example).
// Defaults to http://localhost:8000 for local development.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// --------------------------------------------------------------------------
// Request interceptor — attaches the JWT Bearer token to every outgoing
// request. The token is stored in localStorage by AuthContext.loginUser()
// after a successful login. If no token exists the header is simply omitted,
// which is fine for the public /api/auth/login endpoint.
// --------------------------------------------------------------------------
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------------------------------------------------------------------------
// Response interceptor — handles global error conditions.
// On a 401 (Unauthorized) response from the backend:
//   1. Clears the invalid token from localStorage
//   2. Hard-redirects the browser to /login (bypasses React Router)
// All other errors are re-thrown so individual callers can handle them
// (e.g. showing toast messages with the backend's "detail" message).
// --------------------------------------------------------------------------
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
