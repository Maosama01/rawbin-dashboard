import { useState, useEffect } from 'react';
import { Settings, Save, UserPlus, Trash2, Shield } from 'lucide-react';
import { api } from '../api/client';
import { useDevices } from '../context/DeviceContext';
import './DeviceSettingsPage.css';

export default function DeviceSettingsPage() {
  const { selectedDevice } = useDevices();
  const [config, setConfig] = useState(null);
  const [members, setMembers] = useState([]);
  const [shareEmail, setShareEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Threshold form state
  const [tempMax, setTempMax] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [co2Max, setCo2Max] = useState('');
  const [humMin, setHumMin] = useState('');
  const [humMax, setHumMax] = useState('');
  const [phMin, setPhMin] = useState('');
  const [phMax, setPhMax] = useState('');

  useEffect(() => {
    if (!selectedDevice) return;
    fetchSettings();
  }, [selectedDevice]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [cfg, mem] = await Promise.all([
        api.getDeviceConfig(selectedDevice.device_id),
        api.listMembers(selectedDevice.device_id),
      ]);
      setConfig(cfg);
      setMembers(mem);
      setTempMax(cfg.temperature_c_max ?? '');
      setTempMin(cfg.temperature_c_min ?? '');
      setCo2Max(cfg.co2_ppm_max ?? '');
      setHumMin(cfg.humidity_pct_min ?? '');
      setHumMax(cfg.humidity_pct_max ?? '');
      setPhMin(cfg.ph_min ?? '');
      setPhMax(cfg.ph_max ?? '');
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await api.updateDeviceConfig(selectedDevice.device_id, {
        temperature_c_max: parseFloat(tempMax) || null,
        temperature_c_min: parseFloat(tempMin) || null,
        co2_ppm_max: parseFloat(co2Max) || null,
        humidity_pct_min: parseFloat(humMin) || null,
        humidity_pct_max: parseFloat(humMax) || null,
        ph_min: parseFloat(phMin) || null,
        ph_max: parseFloat(phMax) || null,
      });
      setSaveMsg('Thresholds saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmail) return;
    try {
      const updated = await api.shareDevice(selectedDevice.device_id, shareEmail);
      setMembers(updated);
      setShareEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.removeMember(selectedDevice.device_id, userId);
      setMembers(members.filter((m) => m.user_id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!selectedDevice) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-state-icon"><Settings size={48} /></div>
        <h3>No Device Selected</h3>
        <p>Select a device from the Dashboard first.</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Device Settings</h1>
        <p className="page-subtitle">{selectedDevice.display_name}</p>
      </div>

      <div className="content-grid-2">
        {/* Device Info + Thresholds */}
        <div>
          {/* Device Info Card */}
          <div className="glass-card settings-card animate-fade-in-up">
            <h2 className="dashboard-section-title">Device Info</h2>
            <div className="settings-info-grid">
              <div className="settings-info-item">
                <span className="settings-info-label">Hardware UID</span>
                <span className="settings-info-value">{selectedDevice.hardware_uid}</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Status</span>
                <span className={`badge ${selectedDevice.is_paired ? 'badge-success' : 'badge-warning'}`}>
                  {selectedDevice.is_paired ? 'PAIRED' : 'UNPAIRED'}
                </span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Display Name</span>
                <span className="settings-info-value">{selectedDevice.display_name}</span>
              </div>
            </div>
          </div>

          {/* Thresholds Card */}
          <form className="glass-card settings-card animate-fade-in-up stagger-1" onSubmit={handleSaveConfig}>
            <h2 className="dashboard-section-title">Alert Thresholds</h2>
            <p className="settings-threshold-desc">Configure when the system should trigger alerts.</p>

            <div className="settings-threshold-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="temp-min">Temp Min (°C)</label>
                <input id="temp-min" type="number" step="0.1" className="input-field" value={tempMin} onChange={(e) => setTempMin(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="temp-max">Temp Max (°C)</label>
                <input id="temp-max" type="number" step="0.1" className="input-field" value={tempMax} onChange={(e) => setTempMax(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="hum-min">Humidity Min (%)</label>
                <input id="hum-min" type="number" step="0.1" className="input-field" value={humMin} onChange={(e) => setHumMin(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="hum-max">Humidity Max (%)</label>
                <input id="hum-max" type="number" step="0.1" className="input-field" value={humMax} onChange={(e) => setHumMax(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="co2-max">CO₂ Max (ppm)</label>
                <input id="co2-max" type="number" step="1" className="input-field" value={co2Max} onChange={(e) => setCo2Max(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="ph-min">pH Min</label>
                <input id="ph-min" type="number" step="0.1" className="input-field" value={phMin} onChange={(e) => setPhMin(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="ph-max">pH Max</label>
                <input id="ph-max" type="number" step="0.1" className="input-field" value={phMax} onChange={(e) => setPhMax(e.target.value)} />
              </div>
            </div>

            <div className="settings-save-row">
              <button type="submit" className="btn btn-primary" disabled={saving} id="save-config-btn">
                <Save size={16} />
                {saving ? 'Saving…' : 'Save Thresholds'}
              </button>
              {saveMsg && <span className="settings-save-msg">{saveMsg}</span>}
            </div>
          </form>
        </div>

        {/* Members Column */}
        <div>
          <div className="glass-card settings-card animate-fade-in-up stagger-2">
            <div className="compost-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 className="dashboard-section-title">Device Members</h2>
              <Shield size={18} style={{ color: 'var(--color-text-muted)' }} />
            </div>

            {/* Share form */}
            <div className="settings-share-form">
              <input
                type="email"
                className="input-field"
                placeholder="user@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                id="share-email-input"
              />
              <button className="btn btn-primary btn-sm" onClick={handleShare} id="share-device-btn">
                <UserPlus size={14} /> Share
              </button>
            </div>

            {/* Member list */}
            <div className="settings-member-list">
              {members.map((m) => (
                <div key={m.user_id} className="settings-member-item">
                  <div className="settings-member-avatar">
                    {m.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="settings-member-info">
                    <span className="settings-member-name">{m.display_name}</span>
                    <span className="settings-member-email">{m.email}</span>
                  </div>
                  {members.length > 1 && (
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={() => handleRemoveMember(m.user_id)}
                      aria-label={`Remove ${m.display_name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
