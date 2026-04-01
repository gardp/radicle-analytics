// ==========================================================================
// src/api/instructions.js — Instruction + Frequency CRUD API Module
// ==========================================================================
// Purpose:
//   Provides functions for managing Instruction entities and their child
//   Frequency entities. Instructions are directives attached to a Track
//   (or template instructions with track_id=null for General Parameters).
//   Each instruction can have multiple Frequencies that define scheduling.
//
// Backend endpoints — Instructions (backend/api/instructions.py):
//   GET    /api/instructions              → list (optional ?track_id=, ?phase= filters)
//   GET    /api/instructions/:id          → get single instruction by UUID
//   POST   /api/instructions              → create instruction
//   PUT    /api/instructions/:id          → update instruction
//   DELETE /api/instructions/:id          → delete instruction
//
// Backend endpoints — Frequencies (nested under instructions):
//   GET    /api/instructions/:id/frequencies     → list frequencies for an instruction
//   POST   /api/instructions/:id/frequencies     → create a frequency
//   PUT    /api/instructions/frequencies/:id     → update a frequency by its own UUID
//   DELETE /api/instructions/frequencies/:id     → delete a frequency
//
// Backend models/schemas:
//   - Instruction model — columns: instruction_id, track_id (FK→Track, nullable),
//     name, description, instructions, source, source_media, phase, goals,
//     platform_id (FK→Platform), content_id (FK→Content), is_active, notes
//   - Frequency model — columns: frequency_id, instruction_id (FK→Instruction),
//     name, description, frequency_unit, frequency_value, time_period,
//     start_date, end_date, frequency_type, is_active, notes
//   - InstructionCreate / InstructionUpdate / InstructionResponse
//   - FrequencyCreate / FrequencyUpdate / FrequencyResponse
//
// Internal dependencies:
//   - ./client (src/api/client.js) — pre-configured axios instance
//
// Used by:
//   - components/ecosystem/EcosystemView.jsx → createInstruction, updateInstruction,
//       deleteInstruction (track-level instruction management)
//   - components/general-parameters/GeneralParametersPage.jsx → listInstructions
//   - components/general-parameters/InstructionModal.jsx → createInstruction,
//       updateInstruction, deleteInstruction, listFrequencies, createFrequency,
//       updateFrequency, deleteFrequency
// ==========================================================================
import client from './client';

// --- Instruction CRUD ---
// listInstructions — GET /api/instructions; params: { track_id, phase }
// When track_id="null", returns template (General Parameter) instructions only.
export const listInstructions = (params) => client.get('/api/instructions', { params });
// getInstruction — GET /api/instructions/:id
export const getInstruction = (id) => client.get(`/api/instructions/${id}`);
// createInstruction — POST /api/instructions; body is InstructionCreate
export const createInstruction = (data) => client.post('/api/instructions', data);
// updateInstruction — PUT /api/instructions/:id; body is InstructionUpdate
export const updateInstruction = (id, data) => client.put(`/api/instructions/${id}`, data);
// deleteInstruction — DELETE /api/instructions/:id
export const deleteInstruction = (id) => client.delete(`/api/instructions/${id}`);

// --- Frequency CRUD (child of Instruction) ---
// listFrequencies — GET /api/instructions/:instructionId/frequencies
export const listFrequencies = (instructionId) => client.get(`/api/instructions/${instructionId}/frequencies`);
// createFrequency — POST /api/instructions/:instructionId/frequencies
export const createFrequency = (instructionId, data) => client.post(`/api/instructions/${instructionId}/frequencies`, data);
// updateFrequency — PUT /api/instructions/frequencies/:id (flat route for frequency updates)
export const updateFrequency = (id, data) => client.put(`/api/instructions/frequencies/${id}`, data);
// deleteFrequency — DELETE /api/instructions/frequencies/:id
export const deleteFrequency = (id) => client.delete(`/api/instructions/frequencies/${id}`);
