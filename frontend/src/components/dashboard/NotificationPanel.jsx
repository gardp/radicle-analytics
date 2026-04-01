// ==========================================================================
// src/components/dashboard/NotificationPanel.jsx — Upcoming Deadlines Panel
// ==========================================================================
// Purpose:
//   Self-contained component that fetches and displays upcoming deadlines
//   (actions due within 14 days) at the top of the Dashboard page. Each
//   notification shows a label and a color-coded date badge.
//
// Data flow:
//   1. On mount, calls GET /api/dashboard/notifications (src/api/dashboard.js).
//   2. Backend (backend/api/dashboard.py) queries actions with due dates
//      in the next 14 days and returns an array of { label, due_date, type }.
//   3. Items are displayed in a ListGroup; max 10 shown.
//   4. If no items, a "No upcoming deadlines" message is shown instead.
//
// Internal dependencies:
//   - react-bootstrap (Card, ListGroup, Badge)
//   - api/dashboard → getNotifications
//
// Relationship to backend:
//   - GET /api/dashboard/notifications (backend/api/dashboard.py)
//     Response: [ { label: string, due_date: ISO string, type: string } ]
//     type is "action_deadline" or similar — determines badge color.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → rendered at the top of the page
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
// getNotifications — fetches upcoming deadlines from GET /api/dashboard/notifications
import { getNotifications } from '../../api/dashboard';

export default function NotificationPanel() {
  // Holds the array of notification items from the backend
  const [items, setItems] = useState([]);

  // Fetch notifications once on mount; silently ignores errors
  useEffect(() => {
    getNotifications().then((res) => setItems(res.data)).catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <Card className="border-secondary mb-3">
        <Card.Body>
          <Card.Title className="fs-6">Upcoming Deadlines</Card.Title>
          <p className="text-muted mb-0">No upcoming deadlines in the next 14 days.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-secondary mb-3">
      <Card.Body>
        <Card.Title className="fs-6">Upcoming Deadlines</Card.Title>
      </Card.Body>
      <ListGroup variant="flush">
        {items.slice(0, 10).map((n, i) => (
          <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center bg-transparent">
            <span className="small">{n.label}</span>
            <Badge bg={n.type === 'action_deadline' ? 'warning' : 'info'} className="small">
              {new Date(n.due_date).toLocaleDateString()}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}
