// ==========================================================================
// src/components/shared/EntityForm.jsx — Dynamic Form Builder
// ==========================================================================
// Purpose:
//   A data-driven form component that renders form fields from a declarative
//   field-definition array. This eliminates the need to write custom form
//   JSX for every entity type — the same component is used for Tracks,
//   Instructions, Content, Actions, Royalties, Platforms, and Frequencies.
//
// How it works:
//   The parent passes a `fields` array where each entry describes one form
//   field: { key, label, type, options?, fullWidth? }. EntityForm iterates
//   over this array and renders the appropriate Bootstrap form control for
//   each field type.
//
// Supported field types:
//   "text"     → <Form.Control type="text">
//   "number"   → <Form.Control type="number"> (coerces to Number)
//   "textarea" → <Form.Control as="textarea" rows={3}>
//   "select"   → <Form.Select> with options (string[] or {value,label}[])
//   "switch"   → <Form.Check type="switch"> (boolean toggle)
//   "date"     → <Form.Control type="date"> (appends T00:00:00 for backend)
//   "datetime" → <Form.Control type="datetime-local">
//   "tags"     → <Form.Control type="text"> with comma-separated parsing
//                 (converts "a, b, c" → ["a","b","c"] for backend array fields)
//
// Props:
//   fields   — array of field definitions (see above)
//   values   — object holding current form values keyed by field.key
//   onChange — callback receiving the updated values object on any change
//
// Internal dependencies:
//   - react-bootstrap (Form, Row, Col)
//
// Relationship to backend:
//   - The field keys correspond to backend model/schema field names
//     (e.g. "track_title" → Track.track_title, "status" → Action.status).
//   - Values are sent as-is in the JSON body of POST/PUT API calls.
//   - The "tags" type produces JS arrays which map to PostgreSQL ARRAY
//     columns (e.g. Track.genres, Track.moods, Track.keyword_tags).
//
// Used by:
//   - components/tracks/TrackCreateModal.jsx  → track creation form
//   - components/tracks/TrackModal.jsx         → track edit form
//   - components/ecosystem/EntityModal.jsx     → generic entity edit/create
//   - components/general-parameters/InstructionModal.jsx → instruction + frequency forms
//   - components/general-parameters/PlatformModal.jsx    → platform form
// ==========================================================================
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

// --------------------------------------------------------------------------
// EntityForm — renders a responsive two-column grid of form fields.
// Fields with fullWidth: true span the entire row (Col md={12}).
// --------------------------------------------------------------------------
export default function EntityForm({ fields, values, onChange }) {
  // handleChange — immutably updates a single key in the values object
  // and propagates the new object up to the parent via onChange.
  const handleChange = (key, val) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <Row>
      {fields.map((f) => (
        <Col md={f.fullWidth ? 12 : 6} key={f.key} className="mb-3">
          <Form.Group>
            <Form.Label>{f.label}</Form.Label>
            {f.type === 'select' ? (
              <Form.Select
                value={values[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value || null)}
              >
                <option value="">-- Select --</option>
                {(f.options || []).map((opt) => (
                  <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                    {typeof opt === 'string' ? opt : opt.label}
                  </option>
                ))}
              </Form.Select>
            ) : f.type === 'textarea' ? (
              <Form.Control
                as="textarea"
                rows={3}
                value={values[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            ) : f.type === 'switch' ? (
              <Form.Check
                type="switch"
                checked={values[f.key] ?? false}
                onChange={(e) => handleChange(f.key, e.target.checked)}
                label={values[f.key] ? 'Active' : 'Inactive'}
              />
            ) : f.type === 'date' ? (
              <Form.Control
                type="date"
                value={values[f.key] ? values[f.key].substring(0, 10) : ''}
                onChange={(e) => handleChange(f.key, e.target.value ? e.target.value + 'T00:00:00' : null)}
              />
            ) : f.type === 'datetime' ? (
              <Form.Control
                type="datetime-local"
                value={values[f.key] ? values[f.key].substring(0, 16) : ''}
                onChange={(e) => handleChange(f.key, e.target.value || null)}
              />
            ) : f.type === 'number' ? (
              <Form.Control
                type="number"
                value={values[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value ? Number(e.target.value) : null)}
              />
            ) : f.type === 'tags' ? (
              <Form.Control
                type="text"
                placeholder="Comma-separated values"
                value={Array.isArray(values[f.key]) ? values[f.key].join(', ') : (values[f.key] ?? '')}
                onChange={(e) => handleChange(f.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
            ) : (
              <Form.Control
                type="text"
                value={values[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            )}
          </Form.Group>
        </Col>
      ))}
    </Row>
  );
}
