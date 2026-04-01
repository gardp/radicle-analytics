// ==========================================================================
// src/components/dashboard/RoyaltyIncomeCharts.jsx — Royalty & Income Charts
// ==========================================================================
// Purpose:
//   Renders three chart cards visualising royalty revenue data:
//     1. Revenue by Royalty Type (bar chart — Mechanical, Performance, etc.)
//     2. Revenue by Platform (pie chart — slices per platform)
//     3. Cumulative Income (area chart + bold total figure)
//
// Props:
//   data — object from GET /api/dashboard/royalty-income:
//          {
//            by_type:     { <royalty_type>: <amount> },
//            by_platform: { <platform_id>: <amount> },
//            grand_total: number
//          }
//
// Internal dependencies:
//   - react-bootstrap (Card, Col)
//   - recharts (BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
//     XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend)
//
// Relationship to backend:
//   - GET /api/dashboard/royalty-income (backend/api/dashboard.py)
//     Aggregates RoyaltyTransaction.amount grouped by Royalty.royalty (type)
//     and by Royalty's associated platform_id. grand_total is the sum of
//     all transactions in the selected period.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → receives royaltyData as prop
// ==========================================================================
import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

// Color palette for pie chart slices (one per platform)
const COLORS = ['#0d6efd', '#6610f2', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#fd7e14'];

export default function RoyaltyIncomeCharts({ data }) {
  if (!data) return null;

  // Bar chart: revenue per royalty type (e.g. Mechanical: $120, Performance: $80)
  const byTypeData = Object.entries(data.by_type || {}).map(([type, amount]) => ({
    name: type,
    value: amount,
  }));

  // Pie chart: revenue per platform (platform_id truncated for display)
  const byPlatformData = Object.entries(data.by_platform || {}).map(([pid, amount]) => ({
    name: pid.substring(0, 8) + '...',
    value: amount,
  }));

  // Area chart: single data-point showing cumulative grand total
  const cumulativeData = [{ name: 'Total', revenue: data.grand_total || 0 }];

  return (
    <>
      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Revenue by Royalty Type</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={10} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(v) => `$${v.toFixed(2)}`} />
                <Bar dataKey="value" fill="#198754" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Revenue by Platform</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byPlatformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                  {byPlatformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(v) => `$${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Cumulative Income</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} formatter={(v) => `$${v.toFixed(2)}`} />
                <Area type="monotone" dataKey="revenue" fill="#0d6efd" stroke="#0d6efd" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-center mt-2 mb-0 fs-5 fw-bold text-success">${(data.grand_total || 0).toFixed(2)}</p>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}
