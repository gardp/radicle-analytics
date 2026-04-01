// ==========================================================================
// src/components/dashboard/PeriodFilter.jsx — Time-Period Dropdown Filter
// ==========================================================================
// Purpose:
//   Renders a dropdown that lets the user select a time period for
//   filtering dashboard analytics data (e.g. "Last 7 days", "Last 30 days").
//   The selected value is passed as the "period" query param to all
//   GET /api/dashboard/* backend endpoints.
//
// Props:
//   value    — current selected period string (e.g. "30d")
//   onChange — callback receiving the new period string on selection change
//
// Internal dependencies:
//   - react-bootstrap (Form)
//   - utils/constants → PERIOD_OPTIONS (array of { value, label } objects)
//
// Relationship to backend:
//   - The selected period value is sent as ?period=<value> to the dashboard
//     endpoints. The backend (backend/api/dashboard.py) parses this string
//     to calculate date range boundaries for aggregation queries.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → controls the period filter
// ==========================================================================
import React from 'react';
import { Form } from 'react-bootstrap';
// PERIOD_OPTIONS defines the available time windows for dashboard filtering
import { PERIOD_OPTIONS } from '../../utils/constants';

// PeriodFilter — controlled dropdown; value/onChange pattern from parent.
export default function PeriodFilter({ value, onChange }) {
  return (
    <Form.Select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 'auto' }}>
      {PERIOD_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Form.Select>
  );
}
