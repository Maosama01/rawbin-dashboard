import { useState, useEffect } from 'react';
import { Leaf, Plus, Archive, Scale, StickyNote } from 'lucide-react';
import { api } from '../api/client';
import { useDevices } from '../context/DeviceContext';
import { format } from 'date-fns';
import './CompostPage.css';

const WASTE_TYPES = ['food_scraps', 'yard_waste', 'paper', 'sawdust', 'manure', 'other'];

export default function CompostPage() {
  const { selectedDevice } = useDevices();
  const [cycles, setCycles] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [showWasteForm, setShowWasteForm] = useState(false);
  const [cycleLabel, setCycleLabel] = useState('');
  const [cycleNotes, setCycleNotes] = useState('');
  const [wasteType, setWasteType] = useState('food_scraps');
  const [wasteWeight, setWasteWeight] = useState('');
  const [wasteNotes, setWasteNotes] = useState('');

  useEffect(() => {
    if (!selectedDevice) return;
    fetchData();
  }, [selectedDevice]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, w] = await Promise.all([
        api.listCycles(selectedDevice.device_id),
        api.listWasteLogs(selectedDevice.device_id),
      ]);
      setCycles(c);
      setWasteLogs(w.items || []);
    } catch (err) {
      console.error('Failed to fetch compost data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      await api.createCycle(selectedDevice.device_id, { label: cycleLabel, notes: cycleNotes });
      setCycleLabel('');
      setCycleNotes('');
      setShowNewCycle(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteCycle = async (cycleId) => {
    try {
      await api.updateCycle(cycleId, { status: 'completed' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCureCycle = async (cycleId) => {
    try {
      await api.updateCycle(cycleId, { status: 'curing' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddWaste = async (e) => {
    e.preventDefault();
    try {
      await api.createWasteLog(selectedDevice.device_id, {
        waste_type: wasteType,
        weight_kg: parseFloat(wasteWeight) || null,
        notes: wasteNotes || null,
      });
      setWasteWeight('');
      setWasteNotes('');
      setShowWasteForm(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!selectedDevice) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-state-icon"><Leaf size={48} /></div>
        <h3>No Device Selected</h3>
        <p>Select a device from the Dashboard to manage compost cycles.</p>
      </div>
    );
  }

  const activeCycle = cycles.find((c) => c.status === 'active');
  const pastCycles = cycles.filter((c) => c.status !== 'active');

  return (
    <div className="compost-page">
      <div className="page-header">
        <h1 className="page-title">Compost Management</h1>
        <p className="page-subtitle">{selectedDevice.display_name}</p>
      </div>

      <div className="content-grid-2">
        {/* Cycles Column */}
        <div>
          <div className="compost-section-header">
            <h2 className="dashboard-section-title">Compost Cycles</h2>
            {!activeCycle && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowNewCycle(true)} id="new-cycle-btn">
                <Plus size={14} /> New Cycle
              </button>
            )}
          </div>

          {showNewCycle && (
            <form className="glass-card compost-form animate-fade-in" onSubmit={handleCreateCycle}>
              <div className="input-group">
                <label className="input-label" htmlFor="cycle-label">Batch Name</label>
                <input id="cycle-label" className="input-field" placeholder="e.g. Summer Batch #3" value={cycleLabel} onChange={(e) => setCycleLabel(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="cycle-notes">Notes</label>
                <input id="cycle-notes" className="input-field" placeholder="Optional notes" value={cycleNotes} onChange={(e) => setCycleNotes(e.target.value)} />
              </div>
              <div className="compost-form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Start Cycle</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewCycle(false)}>Cancel</button>
              </div>
            </form>
          )}

          {activeCycle && (
            <div className="glass-card compost-active-cycle animate-fade-in-up">
              <div className="compost-cycle-header">
                <Leaf size={18} className="compost-cycle-icon" />
                <span className="badge badge-success">ACTIVE</span>
              </div>
              <h3 className="compost-cycle-name">{activeCycle.label || 'Untitled Batch'}</h3>
              <p className="compost-cycle-date">Started {format(new Date(activeCycle.started_at), 'MMM d, yyyy')}</p>
              {activeCycle.notes && <p className="compost-cycle-notes">{activeCycle.notes}</p>}
              <div className="compost-cycle-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleCureCycle(activeCycle.id)}>Move to Curing</button>
                <button className="btn btn-primary btn-sm" onClick={() => handleCompleteCycle(activeCycle.id)}>Complete</button>
              </div>
            </div>
          )}

          {pastCycles.map((c) => (
            <div key={c.id} className="glass-card compost-past-cycle">
              <div className="compost-cycle-header">
                <Archive size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span className={`badge ${c.status === 'curing' ? 'badge-warning' : 'badge-info'}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              <h4 className="compost-cycle-name-sm">{c.label || 'Untitled'}</h4>
              <p className="compost-cycle-date">
                {format(new Date(c.started_at), 'MMM d')}
                {c.ended_at && ` — ${format(new Date(c.ended_at), 'MMM d, yyyy')}`}
              </p>
              {c.status === 'curing' && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => handleCompleteCycle(c.id)}>
                  Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Waste Logs Column */}
        <div>
          <div className="compost-section-header">
            <h2 className="dashboard-section-title">Waste Logs</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowWasteForm(true)} id="add-waste-btn">
              <Plus size={14} /> Log Waste
            </button>
          </div>

          {showWasteForm && (
            <form className="glass-card compost-form animate-fade-in" onSubmit={handleAddWaste}>
              <div className="input-group">
                <label className="input-label" htmlFor="waste-type">Type</label>
                <select id="waste-type" className="input-field" value={wasteType} onChange={(e) => setWasteType(e.target.value)}>
                  {WASTE_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="waste-weight">Weight (kg)</label>
                <input id="waste-weight" type="number" step="0.1" className="input-field" placeholder="e.g. 2.5" value={wasteWeight} onChange={(e) => setWasteWeight(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="waste-notes">Notes</label>
                <input id="waste-notes" className="input-field" placeholder="Optional" value={wasteNotes} onChange={(e) => setWasteNotes(e.target.value)} />
              </div>
              <div className="compost-form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Add Log</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWasteForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {wasteLogs.length === 0 ? (
            <div className="glass-card empty-state" style={{ marginTop: 'var(--space-md)' }}>
              <Scale size={36} style={{ opacity: 0.3 }} />
              <p>No waste logged yet.</p>
            </div>
          ) : (
            <div className="waste-log-list">
              {wasteLogs.map((w) => (
                <div key={w.id} className="glass-card waste-log-item">
                  <div className="waste-log-header">
                    <span className="badge badge-success">{w.waste_type.replace('_', ' ')}</span>
                    <span className="waste-log-date">{format(new Date(w.logged_at), 'MMM d, HH:mm')}</span>
                  </div>
                  {w.weight_kg && <p className="waste-log-weight">{w.weight_kg} kg</p>}
                  {w.notes && <p className="waste-log-notes">{w.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
