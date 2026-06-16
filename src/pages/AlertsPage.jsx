import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Filter } from 'lucide-react';
import { api } from '../api/client';
import { useDevices } from '../context/DeviceContext';
import { format } from 'date-fns';
import './AlertsPage.css';

const SEVERITIES = ['', 'WARNING', 'CRITICAL'];
const METRICS = ['', 'temperature_c', 'humidity_pct', 'co2_ppm', 'ph_level'];

export default function AlertsPage() {
  const { selectedDevice } = useDevices();
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [severity, setSeverity] = useState('');
  const [metric, setMetric] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 20;

  useEffect(() => {
    if (!selectedDevice) return;
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const data = await api.listAlerts(selectedDevice.device_id, {
          limit,
          offset,
          severity: severity || undefined,
          metric: metric || undefined,
        });
        setAlerts(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [selectedDevice, offset, severity, metric]);

  if (!selectedDevice) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-state-icon"><Bell size={48} /></div>
        <h3>No Device Selected</h3>
        <p>Select a device from the Dashboard to view its alerts.</p>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h1 className="page-title">Alert History</h1>
        <p className="page-subtitle">{selectedDevice.display_name} — {total} total alerts</p>
      </div>

      {/* Filters */}
      <div className="alerts-filters glass-card animate-fade-in-up">
        <Filter size={16} className="alerts-filter-icon" />
        <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
          <label className="input-label" htmlFor="severity-filter">Severity</label>
          <select
            id="severity-filter"
            className="input-field"
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setOffset(0); }}
          >
            <option value="">All</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
          <label className="input-label" htmlFor="metric-filter">Metric</label>
          <select
            id="metric-filter"
            className="input-field"
            value={metric}
            onChange={(e) => { setMetric(e.target.value); setOffset(0); }}
          >
            <option value="">All</option>
            <option value="temperature_c">Temperature</option>
            <option value="humidity_pct">Humidity</option>
            <option value="co2_ppm">CO₂</option>
            <option value="ph_level">pH</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card alerts-table-card animate-fade-in-up stagger-1">
        {loading ? (
          <div style={{ padding: 'var(--space-xl)' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={40} style={{ opacity: 0.3 }} />
            <p>No alerts found with current filters.</p>
          </div>
        ) : (
          <table className="data-table" id="alerts-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Metric</th>
                <th>Value</th>
                <th>Threshold</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className={`badge ${a.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td>{a.metric}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(a.value).toFixed(1)}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(a.threshold).toFixed(1)}</td>
                  <td>{a.message}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{format(new Date(a.created_at), 'MMM d, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="alerts-pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              id="alerts-prev-btn"
            >
              Previous
            </button>
            <span className="alerts-pagination-info">
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              id="alerts-next-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
