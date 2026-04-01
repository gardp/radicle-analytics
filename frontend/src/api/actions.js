// ==========================================================================
// src/api/actions.js — Action CRUD API Module
// ==========================================================================
// Purpose:
//   Provides functions for managing Action entities. Actions represent
//   tasks or to-do items linked to a Content item within a Track's
//   ecosystem (e.g. "post the Instagram reel", "follow up on feedback").
//   Each action carries a status (pending, in_progress, completed, failed),
//   an optional due date, and notes/feedback fields.
//
// Backend endpoints (all in backend/api/actions.py):
//   GET    /api/actions          → list actions (optional query params)
//   GET    /api/actions/:id      → get a single action by UUID
//   POST   /api/actions          → create a new action (body includes content_id)
//   PUT    /api/actions/:id      → update an existing action
//   DELETE /api/actions/:id      → delete an action
//
// Backend models/schemas:
//   - Action model (backend models) — columns: action_id, content_id (FK→Content),
//     status (ActionStatus enum: pending/in_progress/completed/failed),
//     next_action_due_date, action_is_active, action_notes, feedback,
//     dependency_action_id (FK→Action, self-referential)
//   - ActionCreate / ActionUpdate / ActionResponse (backend/schemas/action.py)
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → createAction, updateAction,
//       deleteAction (via inline handlers for the Actions accordion section)
// ==========================================================================
import client from './client';

// listActions — GET /api/actions; returns array of ActionResponse objects
export const listActions = (params) => client.get('/api/actions', { params });
// getAction — GET /api/actions/:id; returns a single ActionResponse
export const getAction = (id) => client.get(`/api/actions/${id}`);
// createAction — POST /api/actions; body is an ActionCreate payload (includes content_id)
export const createAction = (data) => client.post('/api/actions', data);
// updateAction — PUT /api/actions/:id; body is an ActionUpdate payload
export const updateAction = (id, data) => client.put(`/api/actions/${id}`, data);
// deleteAction — DELETE /api/actions/:id
export const deleteAction = (id) => client.delete(`/api/actions/${id}`);
