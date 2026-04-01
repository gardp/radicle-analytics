// ==========================================================================
// src/components/dashboard/DashboardPage.jsx — Main Analytics Dashboard
// ==========================================================================
// Purpose:
//   The landing page after login. Displays a comprehensive analytics overview
//   with four chart sections (Platform Metrics, Content Performance, Royalty
//   Income, Action Pipeline) plus an Upcoming Deadlines notification panel.
//   Users can filter data by time period and optionally by a specific track.
//
// Data flow:
//   1. On mount (and whenever period or trackId changes), four parallel API
//      calls fetch aggregated data from the backend dashboard endpoints.
//   2. Each API response is stored in local state and passed as props to
//      the corresponding chart component.
//   3. The NotificationPanel fetches its own data independently.
//
// Backend endpoints consumed (via src/api/dashboard.js):
//   GET /api/dashboard/platform-metrics     → PlatformMetricsCharts
//   GET /api/dashboard/content-performance  → ContentPerformanceCharts
//   GET /api/dashboard/royalty-income       → RoyaltyIncomeCharts
//   GET /api/dashboard/action-pipeline      → ActionPipelineCharts
//   GET /api/dashboard/notifications        → NotificationPanel (self-fetching)
//
// Internal dependencies:
//   - components/layout/PageContainer → page wrapper with navbar offset
//   - components/dashboard/PeriodFilter → time-range dropdown
//   - components/dashboard/TrackFilter → track selection dropdown
//   - components/dashboard/NotificationPanel → upcoming deadlines list
//   - components/dashboard/PlatformMetricsCharts → platform signal charts
//   - components/dashboard/ContentPerformanceCharts → content engagement charts
//   - components/dashboard/RoyaltyIncomeCharts → revenue charts
//   - components/dashboard/ActionPipelineCharts → action status/pipeline charts
//   - api/dashboard → getPlatformMetrics, getContentPerformance,
//       getRoyaltyIncome, getActionPipeline
//
// Used by:
//   - src/App.jsx → rendered on the "/" route (protected)
// ==========================================================================
import React, { useState, useEffect } from 'react';
import { Row, Spinner } from 'react-bootstrap';
import PageContainer from '../layout/PageContainer';
// Filter controls for the dashboard header
import PeriodFilter from './PeriodFilter';
import TrackFilter from './TrackFilter';
// Self-contained notification panel (fetches its own data)
import NotificationPanel from './NotificationPanel';
// Chart section components — each receives pre-fetched data as props
import PlatformMetricsCharts from './PlatformMetricsCharts';
import ContentPerformanceCharts from './ContentPerformanceCharts';
import RoyaltyIncomeCharts from './RoyaltyIncomeCharts';
import ActionPipelineCharts from './ActionPipelineCharts';
// API functions for fetching aggregated dashboard data
import { getPlatformMetrics, getContentPerformance, getRoyaltyIncome, getActionPipeline } from '../../api/dashboard';

export default function DashboardPage() {
  // Filter state — period defaults to "30d", trackId is null (all tracks)
  const [period, setPeriod] = useState('30d');
  const [trackId, setTrackId] = useState(null);
  // Loading state — true while any of the four API calls are in-flight
  const [loading, setLoading] = useState(true);
  // Data state — each holds the response from its respective dashboard endpoint
  const [platformData, setPlatformData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [royaltyData, setRoyaltyData] = useState(null);
  const [actionData, setActionData] = useState(null);

  // Fetch all four dashboard datasets whenever filters change.
  // Uses Promise.all to fire all requests in parallel for speed.
  // Individual .catch() handlers ensure one failure doesn't block the others.
  useEffect(() => {
    const params = { period };
    if (trackId) params.track_id = trackId;

    setLoading(true);
    Promise.all([
      getPlatformMetrics(params).then(r => setPlatformData(r.data)).catch(() => setPlatformData(null)),
      getContentPerformance(params).then(r => setContentData(r.data)).catch(() => setContentData(null)),
      getRoyaltyIncome(params).then(r => setRoyaltyData(r.data)).catch(() => setRoyaltyData(null)),
      getActionPipeline(params).then(r => setActionData(r.data)).catch(() => setActionData(null)),
    ]).finally(() => setLoading(false));
  }, [period, trackId]);

  return (
    <PageContainer>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="mb-0">Dashboard</h4>
        <div className="d-flex gap-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          <TrackFilter value={trackId} onChange={setTrackId} />
        </div>
      </div>

      <Row className="mb-4">
        <div className="col-md-12">
          <NotificationPanel />
        </div>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <h6 className="text-muted mb-3">Platform Metrics</h6>
          <Row>
            <PlatformMetricsCharts data={platformData} />
          </Row>

          <h6 className="text-muted mb-3">Content Performance</h6>
          <Row>
            <ContentPerformanceCharts data={contentData} />
          </Row>

          <h6 className="text-muted mb-3">Royalty / Income</h6>
          <Row>
            <RoyaltyIncomeCharts data={royaltyData} />
          </Row>

          <h6 className="text-muted mb-3">Action Pipeline</h6>
          <Row>
            <ActionPipelineCharts data={actionData} />
          </Row>
        </>
      )}
    </PageContainer>
  );
}
