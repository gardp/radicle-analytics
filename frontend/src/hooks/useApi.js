// ==========================================================================
// src/hooks/useApi.js — Generic API Call Hook
// ==========================================================================
// Purpose:
//   A reusable React hook that wraps any async API function from the
//   src/api/ modules and manages its loading / data / error lifecycle.
//   Eliminates boilerplate useState + useEffect patterns that would
//   otherwise be repeated in every component that fetches data.
//
// Parameters:
//   apiFn     — an async function from src/api/* (e.g. listTracks, getPlatformMetrics)
//   params    — default params to pass to apiFn (optional, default null)
//   immediate — if true (default), the API call fires on mount automatically;
//               if false, the caller must invoke execute() manually.
//
// Returns:
//   { data, loading, error, execute, setData }
//     data    — the response payload (res.data from axios), or null
//     loading — boolean, true while the request is in-flight
//     error   — string error message from the backend (detail field) or JS error
//     execute — function to (re-)trigger the API call; accepts optional overrideParams
//     setData — raw state setter, useful for optimistic updates in the UI
//
// Relationship to backend:
//   - This hook does not call the backend directly. It delegates to whichever
//     apiFn is passed in, which in turn uses the axios client (src/api/client.js)
//     that attaches the JWT token and targets the FastAPI backend.
//   - Error handling extracts `detail` from FastAPI's standard error response
//     format ({ "detail": "..." }), falling back to the JS error message.
//
// Internal dependencies:
//   - React (useState, useEffect, useCallback)
//
// Used by:
//   - Can be used by any component that needs to fetch data from the backend.
//     Provides a standardized { data, loading, error } pattern.
// ==========================================================================
import { useState, useEffect, useCallback } from 'react';

// --------------------------------------------------------------------------
// useApi — generic hook for calling any async API function.
//
// Usage example:
//   const { data: tracks, loading, error, execute: refresh } = useApi(listTracks);
//   // `tracks` will be populated on mount; call refresh() to re-fetch.
//
//   const { execute: doCreate } = useApi(createTrack, null, false);
//   // Won't fire on mount; call doCreate(payload) explicitly.
// --------------------------------------------------------------------------
export default function useApi(apiFn, params = null, immediate = true) {
  // data   — holds the parsed response body (axios res.data)
  const [data, setData] = useState(null);
  // loading — true while an HTTP request is in progress
  const [loading, setLoading] = useState(false);
  // error  — stores the error message string if the request fails
  const [error, setError] = useState(null);

  // execute — triggers (or re-triggers) the API call.
  // Accepts optional overrideParams that replace the default params.
  // Returns the response data on success; throws on failure so callers
  // can chain .catch() or try/catch if they need custom error handling.
  const execute = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(overrideParams ?? params);
      setData(res.data);
      return res.data;
    } catch (err) {
      // Extract the FastAPI "detail" error message, or fall back to JS error
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn, params]);

  // Auto-fetch on mount when immediate is true (the default behavior).
  // When immediate is false the hook stays idle until execute() is called.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}
