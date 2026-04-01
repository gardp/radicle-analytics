// ==========================================================================
// src/components/dashboard/ContentPerformanceCharts.jsx — Content Engagement Charts
// ==========================================================================
// Purpose:
//   Visualises content performance analytics using four panels:
//     1. Engagement by Content Type (stacked bar chart — likes/shares/comments)
//     2. Top Performing Content (table of best-performing items)
//     3. Content Volume (bar chart of content count per type)
//     4. Engagement Distribution (pie chart of total engagement per type)
//
// Props:
//   data — object from GET /api/dashboard/content-performance:
//          {
//            by_type: { <content_type>: { likes, shares, comments, count } },
//            top_content: [ { name, likes, shares, comments } ],
//            total_count: number
//          }
//
// Internal dependencies:
//   - react-bootstrap (Card, Row, Col, Table)
//   - recharts (BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
//     CartesianGrid, Tooltip, ResponsiveContainer, Legend)
//
// Relationship to backend:
//   - GET /api/dashboard/content-performance (backend/api/dashboard.py)
//     Aggregates across the Content table (polymorphic) and counts
//     engagement metrics (likes_count, shares_count, comments_count)
//     grouped by Content.type.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → receives contentData as prop
// ==========================================================================
import React from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

// Color palette for the pie chart slices and bar chart fills
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

export default function ContentPerformanceCharts({ data }) {
  if (!data) return null;

  // --- Transform backend data into Recharts-compatible arrays ---

  // Stacked bar chart data: engagement (likes/shares/comments) per content type
  // Keys like "instagram_reel" are converted to "instagram reel" for display
  const byTypeData = Object.entries(data.by_type || {}).map(([k, v]) => ({
    name: k.replace(/_/g, ' '),
    likes: v.likes || 0,
    shares: v.shares || 0,
    comments: v.comments || 0,
  }));

  // Table data: top-performing content items ranked by total engagement
  const topContent = data.top_content || [];

  // Bar chart data: content volume (number of items) per content type
  const volumeData = Object.entries(data.by_type || {}).map(([k, v]) => ({
    name: k.replace(/_/g, ' '),
    count: v.count || 0,
  }));

  // Pie chart data: total engagement (likes+shares+comments) per content type
  const engDistribution = Object.entries(data.by_type || {}).map(([k, v]) => ({
    name: k.replace(/_/g, ' '),
    value: (v.likes || 0) + (v.shares || 0) + (v.comments || 0),
  }));

  return (
    <>
      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Engagement by Content Type</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={10} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Legend />
                <Bar dataKey="likes" fill="#0d6efd" stackId="a" />
                <Bar dataKey="shares" fill="#198754" stackId="a" />
                <Bar dataKey="comments" fill="#ffc107" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Top Performing Content</Card.Title>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              <Table size="sm" variant="dark" striped hover className="mb-0 small">
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Eng.</th></tr>
                </thead>
                <tbody>
                  {topContent.slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td className="text-truncate" style={{ maxWidth: 100 }}>{c.name || '—'}</td>
                      <td className="text-truncate" style={{ maxWidth: 80 }}>{c.type?.replace(/_/g, ' ')}</td>
                      <td>{c.total_engagement}</td>
                    </tr>
                  ))}
                  {topContent.length === 0 && (
                    <tr><td colSpan={3} className="text-muted text-center">No data</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Content Volume</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Bar dataKey="count" fill="#6610f2" name="Pieces" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Engagement Distribution</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={engDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                  {engDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}
