import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, FlaskConical, ChevronDown } from 'lucide-react';
import { api } from '../api/client';
import { useDevices } from '../context/DeviceContext';
import StatCard from '../components/StatCard';
import TelemetryChart from '../components/TelemetryChart';
import './DashboardPage.css';

const INTERVALS = [
  { value: 'raw', label: 'Raw (24h)' },
  { value: 'hour', label: 'Hourly (7d)' },
  { value: 'day', label: 'Daily (90d)' },
];

export default function DashboardPage() {
  const { devices, selectedDevice, selectDevice } = useDevices();
  const [telemetry, setTelemetry] = useState(null);
  const [interval, setInterval] = useState('hour');
  const [loading, setLoading] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);
  const [showDeviceSelect, setShowDeviceSelect] = useState(false);

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [telData, cycles] = await Promise.all([
          api.getTelemetryHistory(selectedDevice.device_id, interval),
          api.listCycles(selectedDevice.device_id, 'active'),
        ]);
        setTelemetry(telData);
        setActiveCycle(cycles?.[0] || null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDevice, interval]);

  const latestReading = telemetry?.readings?.length
    ? telemetry.readings[telemetry.readings.length - 1]
    : null;

  const isRaw = interval === 'raw';
  const temp = latestReading ? (isRaw ? latestReading.temperature_c : latestReading.temperature_c_avg) : null;
  const humidity = latestReading ? (isRaw ? latestReading.humidity_pct : latestReading.humidity_pct_avg) : null;
  const co2 = latestReading ? (isRaw ? latestReading.co2_ppm : latestReading.co2_ppm_avg) : null;
  const ph = latestReading ? (isRaw ? latestReading.ph_level : latestReading.ph_level_avg) : null;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="dashboard-header-row">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Monitor your smart composter in real-time</p>
          </div>

          {devices.length > 0 && (
            <div className="device-selector" id="device-selector">
              <button
                className="device-selector-btn btn btn-secondary"
                onClick={() => setShowDeviceSelect(!showDeviceSelect)}
                aria-expanded={showDeviceSelect}
                aria-haspopup="listbox"
              >
                <span className="device-selector-dot" aria-hidden="true" />
                {selectedDevice?.display_name || 'Select Device'}
                <ChevronDown size={16} />
              </button>
              {showDeviceSelect && (
                <div className="device-selector-dropdown glass-card" role="listbox">
                  {devices.map((d) => (
                    <button
                      key={d.device_id}
                      className={`device-selector-option ${d.device_id === selectedDevice?.device_id ? 'active' : ''}`}
                      onClick={() => { selectDevice(d); setShowDeviceSelect(false); }}
                      role="option"
                      aria-selected={d.device_id === selectedDevice?.device_id}
                    >
                      {d.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!selectedDevice ? (
        <div className="empty-state glass-card">
          <div className="empty-state-icon"><Thermometer size={48} /></div>
          <h3>No Devices Paired</h3>
          <p>Pair your first Rawbin device using the mobile app to see data here.</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats-grid">
            <StatCard
              icon={Thermometer}
              label="Temperature"
              value={temp != null ? Number(temp).toFixed(1) : null}
              unit="°C"
              color="#ef4444"
              delay={0}
            />
            <StatCard
              icon={Droplets}
              label="Humidity"
              value={humidity != null ? Number(humidity).toFixed(1) : null}
              unit="%"
              color="#3b82f6"
              delay={1}
            />
            <StatCard
              icon={Wind}
              label="CO₂"
              value={co2 != null ? Math.round(co2) : null}
              unit="ppm"
              color="#f59e0b"
              delay={2}
            />
            <StatCard
              icon={FlaskConical}
              label="pH Level"
              value={ph != null ? Number(ph).toFixed(1) : null}
              unit=""
              color="#8b5cf6"
              delay={3}
            />
          </div>

          {/* Chart Section */}
          <div className="glass-card dashboard-chart-card animate-fade-in-up stagger-4">
            <div className="dashboard-chart-header">
              <h2 className="dashboard-section-title">Telemetry History</h2>
              <div className="interval-toggle" role="radiogroup" aria-label="Time interval">
                {INTERVALS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`interval-btn ${interval === opt.value ? 'interval-btn-active' : ''}`}
                    onClick={() => setInterval(opt.value)}
                    role="radio"
                    aria-checked={interval === opt.value}
                    id={`interval-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-md)' }} />
            ) : (
              <TelemetryChart
                data={telemetry?.readings || []}
                interval={interval}
                metrics={['temperature', 'humidity', 'co2']}
              />
            )}
          </div>

          {/* Active Cycle */}
          {activeCycle && (
            <div className="glass-card dashboard-cycle-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <h2 className="dashboard-section-title">Active Compost Cycle</h2>
              <div className="cycle-info-row">
                <div>
                  <span className="cycle-label">{activeCycle.label || 'Untitled Batch'}</span>
                  <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>ACTIVE</span>
                </div>
                <span className="cycle-date">Started {new Date(activeCycle.started_at).toLocaleDateString()}</span>
              </div>
              {activeCycle.notes && <p className="cycle-notes">{activeCycle.notes}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
