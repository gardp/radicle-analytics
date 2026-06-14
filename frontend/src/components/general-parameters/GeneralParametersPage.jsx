// ==========================================================================
// src/components/general-parameters/GeneralParametersPage.jsx
//   — Template Instructions & Platform Management Page
// ==========================================================================
// Purpose:
//   Management page for "General Parameters" — global template instructions,
//   platforms, and track-agnostic "General Actions" that are not tied to any
//   specific track. Platforms are shared across all tracks. General Actions
//   are Actions whose track_id IS NULL — they are derived from a global
//   template Instruction but are not bound to a particular track.
//
//   The page is split into three tabs:
//     1. Instructions    — template instructions filtered by phase
//     2. Platforms       — all platforms with CRUD capabilities
//     3. General Actions — actions where track_id IS NULL, full CRUD
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
//   - general-parameters/ActionModal → create/edit/delete general action
//   - components/shared/StatusBadge → action status / phase / platform-type badges
//   - api/instructions → listInstructions
//   - api/platforms → listPlatforms
//   - api/actions → listActions, deleteAction, updateAction
//   - utils/constants → PHASE_OPTIONS (for the phase filter dropdown)
//
// Relationship to backend:
//   - GET /api/instructions (&phase=)                 → template instructions
//   - GET /api/platforms                              → all platforms
//   - GET /api/actions?track_is_null=true             → general actions only
//   Backend routers: backend/api/instructions.py, backend/api/platforms.py,
//   backend/api/actions.py
//
// Used by:
//   - src/App.jsx → rendered on the "/general-parameters" route (protected)
// ==========================================================================
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tab, Tabs, Spinner, Button, Table, Form, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PageContainer from '../layout/PageContainer';
import InstructionModal from './InstructionModal';
import PlatformModal from './PlatformModal';
import ActionModal from './ActionModal';
import StatusBadge from '../shared/StatusBadge';
import { listInstructions, deleteInstruction, updateInstruction } from '../../api/instructions';
import { listPlatforms, deletePlatform, updatePlatform } from '../../api/platforms';
import { listActions, deleteAction, updateAction } from '../../api/actions';
import { PHASE_OPTIONS } from '../../utils/constants';

// ---------------------------------------------------------------------------
// SortHeader — clickable column header with ascending/descending arrow indicator
// ---------------------------------------------------------------------------
function SortHeader({ label, sortKey, currentSort, onSort, thStyle }) {
  const active = currentSort.key === sortKey;
  const arrow = active ? (currentSort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  return (
    <th
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...thStyle,
      }}
      onClick={() => onSort(sortKey)}
    >
      {label}{arrow}
    </th>
  );
}

// ---------------------------------------------------------------------------
// KebabMenu — three-dot dropdown with Edit / Delete actions per row
// ---------------------------------------------------------------------------
// KebabMenu accepts an optional `extraItems` array of { label, onClick,
// className? } objects which are rendered between Edit and Delete. This
// lets the Instructions row reuse the same kebab while injecting the
// "Create Action" entry without duplicating the component.
function KebabMenu({ onEdit, onDelete, extraItems = [] }) {
  return (
    <Dropdown align="end" onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle
        variant="link"
        size="sm"
        className="text-muted p-0 border-0"
        style={{ fontSize: '1.25rem', lineHeight: 1, textDecoration: 'none' }}
      >
        ⋮
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
        {extraItems.map((it, idx) => (
          <Dropdown.Item key={idx} onClick={it.onClick} className={it.className}>
            {it.label}
          </Dropdown.Item>
        ))}
        <Dropdown.Item onClick={onDelete} className="text-danger">Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

// --------------------------------------------------------------------------
// truncate — shorten a string to `max` characters and append an ellipsis.
// Used for the Instruction Description column in the General Actions table
// where the spec mandates a 50-character preview with "…".
// --------------------------------------------------------------------------
function truncate(str, max = 50) {
  if (!str) return '—';
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

// --------------------------------------------------------------------------
// formatDateTime — render an ISO datetime string in a compact human form.
// Used by the Action Next Due Date column. Returns '—' when value is empty.
// --------------------------------------------------------------------------
function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function GeneralParametersPage() {
  const clampedMultilineCellStyle = {
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
  };

  // Data state
  const [instructions, setInstructions] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  // actions — only those with track_id IS NULL (the General Actions list).
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [phaseFilter, setPhaseFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state — { key: string|null, dir: 'asc'|'desc' }
  const [instrSort, setInstrSort] = useState({ key: null, dir: 'asc' });
  const [platSort, setPlatSort] = useState({ key: null, dir: 'asc' });
  const [actionSort, setActionSort] = useState({ key: null, dir: 'asc' });

  // Bulk selection (Sets of IDs)
  const [selectedInstrIds, setSelectedInstrIds] = useState(new Set());
  const [selectedPlatIds, setSelectedPlatIds] = useState(new Set());
  const [selectedActionIds, setSelectedActionIds] = useState(new Set());

  // Modal state — instruction edit/create
  const [instrModal, setInstrModal] = useState(null);
  const [instrCreate, setInstrCreate] = useState(false);
  // Modal state — platform edit/create
  const [platModal, setPlatModal] = useState(null);
  const [platCreate, setPlatCreate] = useState(false);
  // Modal state — action edit / create / create-from-instruction
  // actionModal      → action being edited (or null)
  // actionCreate     → boolean: create modal open with no instruction locked
  // actionFromInstr  → instruction_id (UUID string) when the create modal
  //                    was opened from an Instruction row's kebab. The
  //                    instruction_id field is then locked in the modal.
  const [actionModal, setActionModal] = useState(null);
  const [actionCreate, setActionCreate] = useState(false);
  const [actionFromInstr, setActionFromInstr] = useState(null);

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------
  // fetchData — loads instructions, platforms, AND general actions in
  // parallel. The General Actions tab needs both the actions list and the
  // instructions+platforms maps to resolve display columns (Instruction
  // Name/Description, Platform Name) without an extra round-trip.
  // The phase filter is applied to instructions on the backend; for the
  // General Actions tab the phase filter is applied client-side via the
  // resolved instruction lookup (see filteredActions below).
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (phaseFilter) params.phase = phaseFilter;
      const [instrRes, platRes, actionsRes] = await Promise.all([
        listInstructions(params),
        listPlatforms(),
        // track_is_null=true → backend returns ONLY actions with no track.
        listActions({ track_is_null: true }),
      ]);
      setInstructions(instrRes.data);
      setPlatforms(platRes.data);
      setActions(actionsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [phaseFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Clear selections when underlying data changes
  useEffect(() => {
    setSelectedInstrIds(new Set());
    setSelectedPlatIds(new Set());
    setSelectedActionIds(new Set());
  }, [instructions, platforms, actions]);

  // -----------------------------------------------------------------------
  // Platform lookup map  (instruction rows show platform name)
  // -----------------------------------------------------------------------
  const platformMap = useMemo(() => {
    const map = {};
    platforms.forEach((p) => { map[p.platform_id] = p.name; });
    return map;
  }, [platforms]);

  // Instruction lookup map — resolves an instruction_id to the full
  // Instruction object so the General Actions table can display the
  // associated Instruction Name, Instruction Description, and Platform
  // (via the instruction's platform_id → platformMap chain).
  const instructionMap = useMemo(() => {
    const map = {};
    instructions.forEach((i) => { map[i.instruction_id] = i; });
    return map;
  }, [instructions]);

  // -----------------------------------------------------------------------
  // Generic sort helper
  // -----------------------------------------------------------------------
  const sortData = (data, sort, resolvers = {}) => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const resolver = resolvers[sort.key];
      let va = resolver ? resolver(a) : a[sort.key];
      let vb = resolver ? resolver(b) : b[sort.key];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      va = va ?? '';
      vb = vb ?? '';
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // -----------------------------------------------------------------------
  // Filtered + sorted instructions
  // -----------------------------------------------------------------------
  const filteredInstructions = useMemo(() => {
    let data = instructions;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((i) =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.instructions || '').toLowerCase().includes(q) ||
        (platformMap[i.platform_id] || '').toLowerCase().includes(q) ||
        (i.phase || '').toLowerCase().includes(q)
      );
    }
    return sortData(data, instrSort, {
      platform: (i) => platformMap[i.platform_id] || '',
    });
  }, [instructions, searchTerm, instrSort, platformMap]);

  // -----------------------------------------------------------------------
  // Filtered + sorted general actions
  // -----------------------------------------------------------------------
  // Filtering pipeline:
  //   1. Apply phaseFilter via the linked Instruction's phase. We do this
  //      client-side because actions don't carry phase directly — phase is
  //      a property of the parent Instruction.
  //   2. Apply searchTerm across the user-visible columns: Instruction
  //      Name/Description, Platform Name, Status, Notes, Feedback.
  //   3. Sort using the shared sortData helper. Resolvers translate the
  //      column key into the actual sort value (e.g. instruction_name
  //      walks Action → Instruction → name).
  const filteredActions = useMemo(() => {
    let data = actions;

    if (phaseFilter) {
      data = data.filter((a) => {
        const inst = instructionMap[a.instruction_id];
        return inst?.phase === phaseFilter;
      });
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((a) => {
        const inst = instructionMap[a.instruction_id] || {};
        const platformName = platformMap[inst.platform_id] || '';
        return (
          (inst.name || '').toLowerCase().includes(q) ||
          (inst.description || '').toLowerCase().includes(q) ||
          platformName.toLowerCase().includes(q) ||
          (a.status || '').toLowerCase().includes(q) ||
          (a.action_notes || '').toLowerCase().includes(q) ||
          (a.feedback || '').toLowerCase().includes(q)
        );
      });
    }

    return sortData(data, actionSort, {
      instruction_name: (a) => instructionMap[a.instruction_id]?.name || '',
      instruction_description: (a) => instructionMap[a.instruction_id]?.description || '',
      platform: (a) => platformMap[instructionMap[a.instruction_id]?.platform_id] || '',
      next_action_due_date: (a) => a.next_action_due_date || '',
    });
  }, [actions, phaseFilter, searchTerm, instructionMap, platformMap, actionSort]);

  // -----------------------------------------------------------------------
  // Filtered + sorted platforms
  // -----------------------------------------------------------------------
  const filteredPlatforms = useMemo(() => {
    let data = platforms;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (p.url || '').toLowerCase().includes(q)
      );
    }
    return sortData(data, platSort);
  }, [platforms, searchTerm, platSort]);

  // -----------------------------------------------------------------------
  // Sort toggle handlers
  // -----------------------------------------------------------------------
  const toggleInstrSort = (key) => {
    setInstrSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };
  const togglePlatSort = (key) => {
    setPlatSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };
  const toggleActionSort = (key) => {
    setActionSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  // -----------------------------------------------------------------------
  // Bulk selection helpers
  // -----------------------------------------------------------------------
  const toggleInstrSelect = (id) => {
    setSelectedInstrIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAllInstr = () => {
    if (selectedInstrIds.size === filteredInstructions.length) {
      setSelectedInstrIds(new Set());
    } else {
      setSelectedInstrIds(new Set(filteredInstructions.map((i) => i.instruction_id)));
    }
  };
  const togglePlatSelect = (id) => {
    setSelectedPlatIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAllPlat = () => {
    if (selectedPlatIds.size === filteredPlatforms.length) {
      setSelectedPlatIds(new Set());
    } else {
      setSelectedPlatIds(new Set(filteredPlatforms.map((p) => p.platform_id)));
    }
  };
  const toggleActionSelect = (id) => {
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAllAction = () => {
    if (selectedActionIds.size === filteredActions.length) {
      setSelectedActionIds(new Set());
    } else {
      setSelectedActionIds(new Set(filteredActions.map((a) => a.action_id)));
    }
  };

  // -----------------------------------------------------------------------
  // Bulk operations
  // -----------------------------------------------------------------------
  const handleBulkDeleteInstr = async () => {
    if (!window.confirm(`Delete ${selectedInstrIds.size} instruction(s)?`)) return;
    try {
      await Promise.all([...selectedInstrIds].map((id) => deleteInstruction(id)));
      toast.success(`${selectedInstrIds.size} instruction(s) deleted`);
      fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };
  const handleBulkToggleInstr = async (activate) => {
    try {
      await Promise.all([...selectedInstrIds].map((id) => updateInstruction(id, { is_active: activate })));
      toast.success(`${selectedInstrIds.size} instruction(s) ${activate ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch { toast.error('Bulk update failed'); }
  };
  const handleBulkDeletePlat = async () => {
    if (!window.confirm(`Delete ${selectedPlatIds.size} platform(s)?`)) return;
    try {
      await Promise.all([...selectedPlatIds].map((id) => deletePlatform(id)));
      toast.success(`${selectedPlatIds.size} platform(s) deleted`);
      fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };
  const handleBulkTogglePlat = async (activate) => {
    try {
      await Promise.all([...selectedPlatIds].map((id) => updatePlatform(id, { is_active: activate })));
      toast.success(`${selectedPlatIds.size} platform(s) ${activate ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch { toast.error('Bulk update failed'); }
  };
  // Bulk delete / activate-deactivate for general actions, mirroring the
  // Instructions and Platforms patterns above.
  const handleBulkDeleteAction = async () => {
    if (!window.confirm(`Delete ${selectedActionIds.size} action(s)?`)) return;
    try {
      await Promise.all([...selectedActionIds].map((id) => deleteAction(id)));
      toast.success(`${selectedActionIds.size} action(s) deleted`);
      fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };
  const handleBulkToggleAction = async (activate) => {
    try {
      await Promise.all(
        [...selectedActionIds].map((id) => updateAction(id, { action_is_active: activate }))
      );
      toast.success(`${selectedActionIds.size} action(s) ${activate ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch { toast.error('Bulk update failed'); }
  };

  // -----------------------------------------------------------------------
  // Single-row delete (kebab menu)
  // -----------------------------------------------------------------------
  const handleDeleteInstr = async (id) => {
    if (!window.confirm('Delete this instruction?')) return;
    try {
      await deleteInstruction(id);
      toast.success('Instruction deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };
  const handleDeletePlat = async (id) => {
    if (!window.confirm('Delete this platform?')) return;
    try {
      await deletePlatform(id);
      toast.success('Platform deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };
  const handleDeleteAction = async (id) => {
    if (!window.confirm('Delete this action?')) return;
    try {
      await deleteAction(id);
      toast.success('Action deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <PageContainer>
      {/* ---------- Header bar ---------- */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="mb-0">General Parameters</h4>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Form.Control
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 220 }}
            size="sm"
          />
          <select
            className="form-select form-select-sm"
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
          <Button variant="outline-primary" size="sm" onClick={() => setActionCreate(true)}>+ Action</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Tabs defaultActiveKey="instructions" className="mb-4">
          {/* ==================== INSTRUCTIONS TAB ==================== */}
          <Tab eventKey="instructions" title={`Instructions (${filteredInstructions.length})`}>
            {/* Bulk actions bar */}
            {selectedInstrIds.size > 0 && (
              <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded border">
                <span className="small fw-bold">{selectedInstrIds.size} selected</span>
                <Button variant="outline-success" size="sm" onClick={() => handleBulkToggleInstr(true)}>Activate</Button>
                <Button variant="outline-warning" size="sm" onClick={() => handleBulkToggleInstr(false)}>Deactivate</Button>
                <Button variant="outline-danger" size="sm" onClick={handleBulkDeleteInstr}>Delete</Button>
                <Button variant="link" size="sm" onClick={() => setSelectedInstrIds(new Set())}>Clear</Button>
              </div>
            )}

            {filteredInstructions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No template instructions found.</p>
                <Button variant="outline-primary" onClick={() => setInstrCreate(true)}>Create your first template instruction</Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle" style={{ tableLayout: 'fixed' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedInstrIds.size === filteredInstructions.length && filteredInstructions.length > 0}
                          onChange={toggleAllInstr}
                        />
                      </th>
                      <SortHeader label="Name" sortKey="name" currentSort={instrSort} onSort={toggleInstrSort} />
                      <SortHeader
                        label="Description"
                        sortKey="description"
                        currentSort={instrSort}
                        onSort={toggleInstrSort}
                        thStyle={{ width: '30%' }}
                      />
                      <th style={{ width: '30%' }}>Instructions</th>
                      <SortHeader label="Phase" sortKey="phase" currentSort={instrSort} onSort={toggleInstrSort} />
                      <SortHeader label="Platform" sortKey="platform" currentSort={instrSort} onSort={toggleInstrSort} />
                      <SortHeader label="Active" sortKey="is_active" currentSort={instrSort} onSort={toggleInstrSort} />
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstructions.map((inst) => (
                      <tr
                        key={inst.instruction_id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setInstrModal(inst)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <Form.Check
                            type="checkbox"
                            checked={selectedInstrIds.has(inst.instruction_id)}
                            onChange={() => toggleInstrSelect(inst.instruction_id)}
                          />
                        </td>
                        <td className="fw-semibold">{inst.name || 'Untitled'}</td>
                        <td style={{ width: '30%' }}>
                          <div style={clampedMultilineCellStyle} title={inst.description || '—'}>
                            {inst.description || '—'}
                          </div>
                        </td>
                        <td style={{ width: '30%' }}>
                          <div style={clampedMultilineCellStyle} title={inst.instructions || '—'}>
                            {inst.instructions || '—'}
                          </div>
                        </td>
                        <td><StatusBadge type="phase" value={inst.phase} /></td>
                        <td>{platformMap[inst.platform_id] || '—'}</td>
                        <td>
                          {inst.is_active !== false
                            ? <span className="text-success">Active</span>
                            : <span className="text-danger">Inactive</span>}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <KebabMenu
                            onEdit={() => setInstrModal(inst)}
                            onDelete={() => handleDeleteInstr(inst.instruction_id)}
                            extraItems={[
                              {
                                label: 'Create Action',
                                onClick: () => setActionFromInstr(inst.instruction_id),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>

          {/* ==================== PLATFORMS TAB ==================== */}
          <Tab eventKey="platforms" title={`Platforms (${filteredPlatforms.length})`}>
            {/* Bulk actions bar */}
            {selectedPlatIds.size > 0 && (
              <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded border">
                <span className="small fw-bold">{selectedPlatIds.size} selected</span>
                <Button variant="outline-success" size="sm" onClick={() => handleBulkTogglePlat(true)}>Activate</Button>
                <Button variant="outline-warning" size="sm" onClick={() => handleBulkTogglePlat(false)}>Deactivate</Button>
                <Button variant="outline-danger" size="sm" onClick={handleBulkDeletePlat}>Delete</Button>
                <Button variant="link" size="sm" onClick={() => setSelectedPlatIds(new Set())}>Clear</Button>
              </div>
            )}

            {filteredPlatforms.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No platforms found.</p>
                <Button variant="outline-primary" onClick={() => setPlatCreate(true)}>Create your first platform</Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedPlatIds.size === filteredPlatforms.length && filteredPlatforms.length > 0}
                          onChange={toggleAllPlat}
                        />
                      </th>
                      <SortHeader label="Name" sortKey="name" currentSort={platSort} onSort={togglePlatSort} />
                      <SortHeader label="Type" sortKey="type" currentSort={platSort} onSort={togglePlatSort} />
                      <SortHeader label="URL" sortKey="url" currentSort={platSort} onSort={togglePlatSort} />
                      <SortHeader label="Active" sortKey="is_active" currentSort={platSort} onSort={togglePlatSort} />
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlatforms.map((p) => (
                      <tr
                        key={p.platform_id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setPlatModal(p)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <Form.Check
                            type="checkbox"
                            checked={selectedPlatIds.has(p.platform_id)}
                            onChange={() => togglePlatSelect(p.platform_id)}
                          />
                        </td>
                        <td className="fw-semibold">{p.name}</td>
                        <td><StatusBadge type="platform" value={p.type} /></td>
                        <td>
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noreferrer" className="text-info" onClick={(e) => e.stopPropagation()}>
                              {p.url}
                            </a>
                          ) : '—'}
                        </td>
                        <td>
                          {p.is_active !== false
                            ? <span className="text-success">Active</span>
                            : <span className="text-danger">Inactive</span>}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <KebabMenu
                            onEdit={() => setPlatModal(p)}
                            onDelete={() => handleDeletePlat(p.platform_id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>

          {/* ==================== GENERAL ACTIONS TAB ====================
              Layout intentionally mirrors the Instructions tab above:
                - Same bulk-action bar pattern
                - Same Table / SortHeader / KebabMenu primitives
                - Same row-click → open edit modal interaction
              Columns (per spec): Status, Active, Instruction Name,
              Instruction Description (50-char truncate), Platform Name,
              Next Due Date. All values are resolved via instructionMap +
              platformMap so no extra API calls are needed.
          ====================================================== */}
          <Tab eventKey="actions" title={`General Actions (${filteredActions.length})`}>
            {/* Bulk actions bar (same pattern as Instructions) */}
            {selectedActionIds.size > 0 && (
              <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded border">
                <span className="small fw-bold">{selectedActionIds.size} selected</span>
                <Button variant="outline-success" size="sm" onClick={() => handleBulkToggleAction(true)}>Activate</Button>
                <Button variant="outline-warning" size="sm" onClick={() => handleBulkToggleAction(false)}>Deactivate</Button>
                <Button variant="outline-danger" size="sm" onClick={handleBulkDeleteAction}>Delete</Button>
                <Button variant="link" size="sm" onClick={() => setSelectedActionIds(new Set())}>Clear</Button>
              </div>
            )}

            {filteredActions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No general actions found.</p>
                <Button variant="outline-primary" onClick={() => setActionCreate(true)}>Create your first general action</Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle" style={{ tableLayout: 'fixed' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedActionIds.size === filteredActions.length && filteredActions.length > 0}
                          onChange={toggleAllAction}
                        />
                      </th>
                      <SortHeader label="Status" sortKey="status" currentSort={actionSort} onSort={toggleActionSort} />
                      <SortHeader label="Active" sortKey="action_is_active" currentSort={actionSort} onSort={toggleActionSort} />
                      <SortHeader label="Instruction Name" sortKey="instruction_name" currentSort={actionSort} onSort={toggleActionSort} />
                      <SortHeader
                        label="Instruction Description"
                        sortKey="instruction_description"
                        currentSort={actionSort}
                        onSort={toggleActionSort}
                        thStyle={{ width: '25%' }}
                      />
                      <SortHeader label="Platform" sortKey="platform" currentSort={actionSort} onSort={toggleActionSort} />
                      <SortHeader label="Next Due Date" sortKey="next_action_due_date" currentSort={actionSort} onSort={toggleActionSort} />
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActions.map((a) => {
                      // Resolve linked Instruction (for Name / Description /
                      // Platform) from the in-memory map. Defaults to an
                      // empty object so the cells render '—' gracefully.
                      const inst = instructionMap[a.instruction_id] || {};
                      const platformName = platformMap[inst.platform_id] || '—';
                      return (
                        <tr
                          key={a.action_id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setActionModal(a)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <Form.Check
                              type="checkbox"
                              checked={selectedActionIds.has(a.action_id)}
                              onChange={() => toggleActionSelect(a.action_id)}
                            />
                          </td>
                          <td><StatusBadge type="action" value={a.status} /></td>
                          <td>
                            {a.action_is_active !== false
                              ? <span className="text-success">Active</span>
                              : <span className="text-danger">Inactive</span>}
                          </td>
                          <td className="fw-semibold">{inst.name || '—'}</td>
                          <td style={{ width: '25%' }} title={inst.description || '—'}>
                            {/* 50-char truncated preview per spec; full text
                                available via the row's title attribute. */}
                            {truncate(inst.description, 50)}
                          </td>
                          <td>{platformName}</td>
                          <td>{formatDateTime(a.next_action_due_date)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <KebabMenu
                              onEdit={() => setActionModal(a)}
                              onDelete={() => handleDeleteAction(a.action_id)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>
        </Tabs>
      )}

      {/* ==================== MODALS ==================== */}
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

      {/* ---------- General Action modals ----------
          Three trigger paths share a single ActionModal component:
            1. actionModal               → editing an existing action
            2. actionCreate              → creating with a free instruction picker
            3. actionFromInstr (UUID)    → creating with the instruction_id
                                            locked (came from Instructions kebab)
          The `instructions` and `platforms` arrays are passed through so
          the modal can populate its dropdown and read-only context panel
          without making additional API calls.
      */}
      {actionModal && (
        <ActionModal
          show={true}
          onHide={() => setActionModal(null)}
          action={actionModal}
          instructions={instructions}
          platforms={platforms}
          onSaved={() => { setActionModal(null); fetchData(); }}
        />
      )}

      {actionCreate && (
        <ActionModal
          show={true}
          onHide={() => setActionCreate(false)}
          action={null}
          isCreate
          instructions={instructions}
          platforms={platforms}
          onSaved={() => { setActionCreate(false); fetchData(); }}
        />
      )}

      {actionFromInstr && (
        <ActionModal
          show={true}
          onHide={() => setActionFromInstr(null)}
          action={null}
          isCreate
          instructions={instructions}
          platforms={platforms}
          lockedInstructionId={actionFromInstr}
          onSaved={() => { setActionFromInstr(null); fetchData(); }}
        />
      )}
    </PageContainer>
  );
}
