// ==========================================================================
// src/components/dashboard/PlatformMetricsCharts.jsx — Platform Signal Charts
// ==========================================================================
// Purpose:
//   Renders four bar-chart cards visualising aggregated platform signal
//   metrics: Follower Growth, Impressions by Platform, Profile Views, and
//   Engagement Comparison. Data comes from the backend's platform-metrics
//   dashboard endpoint, pre-fetched by DashboardPage.
//
// Props:
//   data — object from GET /api/dashboard/platform-metrics response:
//          { instagram: { impressions, reach, follower_growth, profile_views, ... },
//            tiktok:    { followers, likes, ... },
//            twitter:   { impressions, ... } }
//          Returns null render if data is null (still loading or error).
//
// Charts rendered (each in a Bootstrap Card within a Col md={4}):
//   1. Follower Growth       — Instagram vs TikTok follower growth (BarChart)
//   2. Impressions by Platform — Instagram, TikTok, Twitter impressions (BarChart)
//   3. Profile Views          — Instagram profile views (BarChart)
//   4. Engagement Comparison  — Likes vs Reach across platforms (BarChart + Legend)
//
// Internal dependencies:
//   - react-bootstrap (Card, Row, Col)
//   - recharts (BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//     ResponsiveContainer, Legend)
//
// Relationship to backend:
//   - GET /api/dashboard/platform-metrics (backend/api/dashboard.py)
//     Aggregates data from Instagram, TikTok, Twitter signal tables.
//     Each platform key contains metric fields matching the signal model columns.
//
// Used by:
//   - components/dashboard/DashboardPage.jsx → receives platformData as prop
// ==========================================================================
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PlatformMetricsCharts({ data }) {
  // Return nothing while data is loading or if the endpoint returned an error
  if (!data) return null;

  // Transform the backend response into Recharts-compatible data arrays.
  // Each array represents a different chart's dataset.

  // Impressions & reach comparison across all three platforms
  const barData = [
    { name: 'Instagram', impressions: data.instagram?.impressions || 0, reach: data.instagram?.reach || 0 },
    { name: 'TikTok', impressions: 0, reach: 0, followers: data.tiktok?.followers || 0 },
    { name: 'Twitter/X', impressions: data.twitter?.impressions || 0, reach: 0 },
  ];

  // Follower growth comparison (Instagram follower_growth vs TikTok followers)
  const growthData = [
    { name: 'Instagram', value: data.instagram?.follower_growth || 0 },
    { name: 'TikTok', value: data.tiktok?.followers || 0 },
  ];

  // Profile views — currently only Instagram provides this metric
  const profileViewsData = [
    { name: 'Instagram', views: data.instagram?.profile_views || 0 },
  ];

  // Engagement (likes + reach) comparison between Instagram and TikTok
  const engagementData = [
    { name: 'Instagram', likes: data.tiktok?.likes || 0, reach: data.instagram?.reach || 0 },
    { name: 'TikTok', likes: data.tiktok?.likes || 0, reach: 0 },
  ];

  return (
    <>
      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Follower Growth</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Bar dataKey="value" fill="#0d6efd" name="Growth" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Impressions by Platform</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Bar dataKey="impressions" fill="#6610f2" name="Impressions" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Profile Views</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={profileViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Bar dataKey="views" fill="#198754" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4} className="mb-4">
        <Card className="border-secondary h-100">
          <Card.Body>
            <Card.Title className="fs-6">Engagement Comparison</Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Legend />
                <Bar dataKey="likes" fill="#ffc107" name="Likes" />
                <Bar dataKey="reach" fill="#0dcaf0" name="Reach" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}
