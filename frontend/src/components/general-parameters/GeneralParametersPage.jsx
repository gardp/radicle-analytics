// ==========================================================================
// src/components/general-parameters/GeneralParametersPage.jsx
//   — Template Instructions & Platform Management Page
// ==========================================================================
// Purpose:
//   Management page for "General Parameters" — global template instructions
//   and platforms that are not tied to any specific track. Template
//   instructions (track_id = null) are automatically cloned into every new
//   track on creation. Platforms are shared across all tracks.
//
//   The page is split into two tabs:
//     1. Instructions — template instructions filtered by phase
//     2. Platforms — all platforms with CRUD capabilities
//
// Data flow:
//   1. On mount (and whenever the phase filter changes), fetches template
//      instructions via GET /api/instructions?track_id=null and all
//      platforms via GET /api/platforms in parallel.
//   2. Each entity card opens its dedicated modal for edit/create/delete.
//   3. After any mutation, fetchData() re-fetches both lists.
//
// Internal dependencies:
//   - react-bootstrap (Row, Col, Tab, Tabs, Spinner, Button)
//   - react-toastify (toast)
//   - components/layout/PageContainer → page wrapper
//   - components/dashboard/PeriodFilter (imported but not used in render — available)
//   - general-parameters/InstructionCard → template instruction card
//   - general-parameters/InstructionModal → create/edit/delete instruction + frequencies
//   - general-parameters/PlatformCard → platform card
//   - general-parameters/PlatformModal → create/edit/delete platform
//   - api/instructions → listInstructions
//   - api/platforms → listPlatforms
//   - utils/constants → PHASE_OPTIONS (for the phase filter dropdown)
//
// Relationship to backend:
//   - GET /api/instructions?track_id=null (&phase=)  → template instructions
//   - GET /api/platforms                              → all platforms
//   Backend routers: backend/api/instructions.py, backend/api/platforms.py
//
// Used by:
//   - src/App.jsx → rendered on the "/general-parameters" route (protected)
// ==========================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Tab, Tabs, Spinner, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PageContainer from '../layout/PageContainer';
import PeriodFilter from '../dashboard/PeriodFilter';
// Card components for displaying individual items in the grid
import InstructionCard from './InstructionCard';
import InstructionModal from './InstructionModal';
import PlatformCard from './PlatformCard';
import PlatformModal from './PlatformModal';
// API functions for fetching template instructions and platforms
import { listInstructions } from '../../api/instructions';
import { listPlatforms } from '../../api/platforms';
// PHASE_OPTIONS powers the phase filter dropdown
import { PHASE_OPTIONS } from '../../utils/constants';

export default function GeneralParametersPage() {
  // Data state
  const [instructions, setInstructions] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  // Phase filter — empty string means "all phases"
  const [phaseFilter, setPhaseFilter] = useState('');
  // Modal state — instruction edit/create
  const [instrModal, setInstrModal] = useState(null);
  const [instrCreate, setInstrCreate] = useState(false);
  // Modal state — platform edit/create
  const [platModal, setPlatModal] = useState(null);
  const [platCreate, setPlatCreate] = useState(false);

  // fetchData — loads template instructions (track_id="null" tells the backend
  // to return only template instructions not bound to any track) and all platforms.
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (phaseFilter) params.phase = phaseFilter;
      const [instrRes, platRes] = await Promise.all([
        listInstructions(params),
        listPlatforms(),
      ]);
      setInstructions(instrRes.data);
      console.log('instructions', instrRes.data);
      setPlatforms(platRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [phaseFilter]);

  // Re-fetch whenever the phase filter changes
  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <PageContainer>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="mb-0">General Parameters</h4>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            {PHASE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button variant="outline-primary" size="sm" onClick={() => setInstrCreate(true)}>+ Instruction</Button>
          <Button variant="outline-primary" size="sm" onClick={() => setPlatCreate(true)}>+ Platform</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Tabs defaultActiveKey="instructions" className="mb-4">
          <Tab eventKey="instructions" title={`Instructions (${instructions.length})`}>
            {instructions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No template instructions found.</p>
                <Button variant="outline-primary" onClick={() => setInstrCreate(true)}>Create your first template instruction</Button>
              </div>
            ) : (
              <Row>
                {instructions.map((inst) => (
                  <Col md={4} key={inst.instruction_id} className="mb-4">
                    <InstructionCard instruction={inst} onClick={setInstrModal} />
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          <Tab eventKey="platforms" title={`Platforms (${platforms.length})`}>
            {platforms.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No platforms found.</p>
                <Button variant="outline-primary" onClick={() => setPlatCreate(true)}>Create your first platform</Button>
              </div>
            ) : (
              <Row>
                {platforms.map((p) => (
                  <Col md={4} key={p.platform_id} className="mb-4">
                    <PlatformCard platform={p} onClick={setPlatModal} />
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>
      )}

      {instrModal && (
        <InstructionModal
          show={true}
          onHide={() => setInstrModal(null)}
          instruction={instrModal}
          onSaved={() => { setInstrModal(null); fetchData(); }}
        />
      )}

      {instrCreate && (
        <InstructionModal
          show={true}
          onHide={() => setInstrCreate(false)}
          instruction={null}
          isCreate
          onSaved={() => { setInstrCreate(false); fetchData(); }}
        />
      )}

      {platModal && (
        <PlatformModal
          show={true}
          onHide={() => setPlatModal(null)}
          platform={platModal}
          onSaved={() => { setPlatModal(null); fetchData(); }}
        />
      )}

      {platCreate && (
        <PlatformModal
          show={true}
          onHide={() => setPlatCreate(false)}
          platform={null}
          isCreate
          onSaved={() => { setPlatCreate(false); fetchData(); }}
        />
      )}
    </PageContainer>
  );
}
