// ==========================================================================
// src/components/shared/ConfirmDeleteModal.jsx — Reusable Delete Confirmation
// ==========================================================================
// Purpose:
//   A generic confirmation dialog shown before any destructive delete
//   operation. Prevents accidental deletion by requiring the user to
//   explicitly click "Delete" or dismiss the modal.
//
// Props:
//   show      — boolean, controls modal visibility
//   onHide    — callback to close the modal without deleting
//   onConfirm — callback executed when the user clicks "Delete";
//               the parent is responsible for calling the actual API delete
//   message   — optional custom message; defaults to generic prompt
//
// Internal dependencies:
//   - react-bootstrap (Modal, Button)
//
// Relationship to backend:
//   - No direct API calls. The parent component wires onConfirm to the
//     appropriate delete function (e.g. deleteTrack, deleteInstruction,
//     deletePlatform, deleteContent, deleteAction, deleteRoyalty) which
//     calls DELETE on the corresponding backend endpoint.
//
// Used by:
//   - components/tracks/TracksPage.jsx       → confirm track deletion
//   - components/ecosystem/EcosystemView.jsx → confirm entity deletion
//     (instructions, content, actions, royalties)
// ==========================================================================
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

// ConfirmDeleteModal — centered modal with Cancel / Delete buttons.
// The parent controls visibility via show/onHide and handles the actual
// delete logic in onConfirm.
export default function ConfirmDeleteModal({ show, onHide, onConfirm, message }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      {/* Display a custom warning message or a generic default */}
      <Modal.Body>{message || 'Are you sure you want to delete this item?'}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
        {/* Danger-colored button to visually reinforce the destructive action */}
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </Modal.Footer>
    </Modal>
  );
}
