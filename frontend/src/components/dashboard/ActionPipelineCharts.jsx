// ==========================================================================
// src/components/dashboard/ActionPipelineCharts.jsx — Action Pipeline Charts
// ==========================================================================
// Purpose:
//   Renders three cards visualising action/instruction pipeline data:
//     1. Action Status Distribution (pie chart — pending/in_progress/completed/failed)
//     2. Upcoming Deadlines (list of actions due soon with date badges)
//     3. Instructions by Phase (bar chart — pre/during/post/various)
//
// Props:
//   data — object from GET /api/dashboard/action-pipeline:
//          {
//            status_breakdown:    { <status>: <count> },
//            by_phase:            { <phase>: <count> },
//            upcoming_deadlines:  [ { notes, status, due_date } ]
//          }
//
// Internal dependencies:
//   - react-bootstrap (Card, Col, ListGroup, Badge)
//   - recharts (PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//     BarChart, Bar, XAxis, YAxis, CartesianGrid)
//   - utils/constants → ACTION_STATUS_VARIANTS (for deadline badge colors)
//
// Relationship to backend:
//   - GET /api/dashboard/action-pipeline (backend/api/dashboard.py)
//     Aggregates Action.status counts, Instruction phase counts, and
//     upcoming Action deadlines (next_action_due_date within 14 days).
//     status_breakdown keys match ActionStatus enum (backend models).
//     by_phase keys match Instruction.phase enum.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → receives actionData as prop
// ==========================================================================
import React from 'react';
import { Card, Col, ListGroup, Badge } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
// ACTION_STATUS_VARIANTS maps status → Bootstrap variant for deadline badges
import { ACTION_STATUS_VARIANTS } from '../../utils/constants';

// Hard-coded hex colors for pie chart slices (matching Bootstrap theme colors)
const STATUS_COLORS = { pending: '#ffc107', in_progress: '#0dcaf0', completed: '#198754', failed: '#dc3545' };
// Phase-specific colors for the "Instructions by Phase" bar chart
const PHASE_COLORS = { pre: '#0d6efd', during: '#6610f2', post: '#198754', various: '#ffc107' };

export default function ActionPipelineCharts({ data }) {
  if (!data) return null;

  // Pie chart data: action counts per status, with explicit color per slice
  const statusData = Object.entries(data.status_breakdown || {}).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count,
    color: STATUS_COLORS[status] || '#6c757d',
  }));

  // Bar chart data: instruction counts grouped by release phase
  const phaseData = Object.entries(data.by_phase || {}).map(([phase, count]) => ({
    name: phase,
    count,
  }));

  // List data: upcoming action deadlines (max 8 shown)
  const deadlines = data.upcoming_deadlines || [];

  return (
    <>
      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Action Status Distribution</Card.Title>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center mt-4">No action data</p>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Upcoming Deadlines</Card.Title>
            {deadlines.length > 0 ? (
              <ListGroup variant="flush" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {deadlines.slice(0, 8).map((d, i) => (
                  <ListGroup.Item key={i} className="d-flex justify-content-between bg-transparent px-0 py-1">
                    <span className="small text-truncate" style={{ maxWidth: '60%' }}>{d.notes || 'Action'}</span>
                    <Badge bg={ACTION_STATUS_VARIANTS[d.status] || 'secondary'} className="small">
                      {new Date(d.due_date).toLocaleDateString()}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted text-center mt-4">No upcoming deadlines</p>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Instructions by Phase</Card.Title>
            {phaseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={phaseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#aaa" fontSize={11} />
                  <YAxis stroke="#aaa" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                  <Bar dataKey="count" fill="#6610f2" name="Instructions">
                    {phaseData.map((entry, i) => (
                      <Cell key={i} fill={PHASE_COLORS[entry.name] || '#6c757d'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center mt-4">No instruction data</p>
            )}
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}
