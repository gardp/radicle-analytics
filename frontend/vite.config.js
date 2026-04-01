// ==========================================================================
// vite.config.js — Vite Build & Dev-Server Configuration
// ==========================================================================
// Purpose:
//   Configures Vite as the build tool and development server for the
//   Radicle Analytics React frontend. Vite provides fast HMR (Hot Module
//   Replacement) in development and optimized bundling for production.
//
// Key settings:
//   - @vitejs/plugin-react  — enables JSX transform & React Fast Refresh
//   - server.port = 3000    — dev server listens on http://localhost:3000
//
// Dependencies:
//   - vite (devDependency in package.json)
//   - @vitejs/plugin-react (devDependency in package.json)
//
// Used by:
//   - npm scripts in package.json: "dev", "build", "preview"
//   - index.html (Vite serves it as the SPA shell)
//
// Relationship to backend:
//   - The dev server runs on port 3000 while the FastAPI backend runs on
//     port 8000 (default). API calls are made via axios (src/api/client.js)
//     to VITE_API_URL, NOT through a Vite proxy — so CORS is handled by
//     the backend's CORSMiddleware in backend/app/main.py.
// ==========================================================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Enable the React plugin for JSX/TSX support and Fast Refresh during dev
  plugins: [react()],
  server: {
    // Dev server port — frontend is accessed at http://localhost:3000
    port: 3000,
  },
})
