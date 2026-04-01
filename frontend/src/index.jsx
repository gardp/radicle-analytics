// ==========================================================================
// src/index.jsx — React Application Bootstrap / Mount Point
// ==========================================================================
// Purpose:
//   This is the very first JavaScript file executed by the browser (loaded
//   from index.html via <script type="module">). It creates the React root,
//   imports global CSS, and mounts the top-level <App /> component into the
//   DOM node with id="root".
//
// What happens here:
//   1. Global CSS is imported (Bootstrap 5 dark theme + react-toastify styles).
//   2. ReactDOM.createRoot attaches React to the #root div in index.html.
//   3. <React.StrictMode> wraps the app to surface potential problems during
//      development (double-invokes effects, warns about deprecated APIs).
//   4. <App /> is the root component that sets up routing and auth context.
//
// Dependencies (npm packages):
//   - react, react-dom         — core React library
//   - bootstrap                — CSS framework (dark theme enabled in index.html)
//   - react-toastify           — toast notification styles
//
// Internal dependencies:
//   - ./App (src/App.jsx)      — root component with routing & auth context
//
// Used by:
//   - index.html               — loaded as the entry <script> module
// ==========================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
// Global CSS: Bootstrap 5 styles (dark theme set via data-bs-theme="dark" in index.html)
import 'bootstrap/dist/css/bootstrap.min.css';
// Global CSS: react-toastify notification styles (ToastContainer rendered in App.jsx)
import 'react-toastify/dist/ReactToastify.css';
// Root application component — contains BrowserRouter, AuthProvider, and all routes
import App from './App';

// Mount React into the #root DOM element defined in index.html.
// StrictMode enables additional development warnings and double-renders
// to help catch side-effect bugs early.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
