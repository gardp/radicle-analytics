// ==========================================================================
// src/api/royalties.js — Royalty + Transaction CRUD API Module
// ==========================================================================
// Purpose:
//   Provides functions for managing Royalty entities and their child
//   RoyaltyTransaction entities. A Royalty defines a revenue stream for a
//   Track (e.g. Master / Mechanical), and Transactions record individual
//   payments against that royalty.
//
// Backend endpoints — Royalties (backend/api/royalties.py):
//   GET    /api/royalties              → list royalties (optional ?track_id= filter)
//   GET    /api/royalties/:id          → get single royalty by UUID
//   POST   /api/royalties              → create royalty (body includes track_id)
//   PUT    /api/royalties/:id          → update royalty
//   DELETE /api/royalties/:id          → delete royalty
//
// Backend endpoints — Transactions (nested under royalties):
//   GET    /api/royalties/:id/transactions     → list transactions for a royalty
//   POST   /api/royalties/:id/transactions     → create a transaction
//   PUT    /api/royalties/transactions/:id     → update a transaction
//   DELETE /api/royalties/transactions/:id     → delete a transaction
//
// Backend models/schemas:
//   - Royalty model — columns: royalty_id, track_id (FK→Track), right, royalty
//   - RoyaltyTransaction model — columns: transaction_id, royalty_id (FK→Royalty),
//     amount, date, notes, etc.
//   - RoyaltyCreate / RoyaltyUpdate / RoyaltyResponse
//   - RoyaltyTransactionCreate / RoyaltyTransactionUpdate / RoyaltyTransactionResponse
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → createRoyalty, updateRoyalty,
//       deleteRoyalty (via inline handlers for the Royalties accordion section)
// ==========================================================================
import client from './client';

// --- Royalty CRUD ---
// listRoyalties — GET /api/royalties; params may include { track_id: "<uuid>" }
export const listRoyalties = (params) => client.get('/api/royalties', { params });
// getRoyalty — GET /api/royalties/:id
export const getRoyalty = (id) => client.get(`/api/royalties/${id}`);
// createRoyalty — POST /api/royalties; body is a RoyaltyCreate payload (includes track_id)
export const createRoyalty = (data) => client.post('/api/royalties', data);
// updateRoyalty — PUT /api/royalties/:id; body is a RoyaltyUpdate payload
export const updateRoyalty = (id, data) => client.put(`/api/royalties/${id}`, data);
// deleteRoyalty — DELETE /api/royalties/:id
export const deleteRoyalty = (id) => client.delete(`/api/royalties/${id}`);

// --- RoyaltyTransaction CRUD (child of Royalty) ---
// listTransactions — GET /api/royalties/:royaltyId/transactions
export const listTransactions = (royaltyId) => client.get(`/api/royalties/${royaltyId}/transactions`);
// createTransaction — POST /api/royalties/:royaltyId/transactions
export const createTransaction = (royaltyId, data) => client.post(`/api/royalties/${royaltyId}/transactions`, data);
// updateTransaction — PUT /api/royalties/transactions/:id (flat route)
export const updateTransaction = (id, data) => client.put(`/api/royalties/transactions/${id}`, data);
// deleteTransaction — DELETE /api/royalties/transactions/:id
export const deleteTransaction = (id) => client.delete(`/api/royalties/transactions/${id}`);
