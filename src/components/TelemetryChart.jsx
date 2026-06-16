import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import './TelemetryChart.css';

const METRIC_CONFIG = {
  temperature: { key: 'temperature_c_avg', rawKey: 'temperature_c', color: '#ef4444', label: 'Temperature (°C)' },
  humidity: { key: 'humidity_pct_avg', rawKey: 'humidity_pct', color: '#3b82f6', label: 'Humidity (%)' },
  co2: { key: 'co2_ppm_avg', rawKey: 'co2_ppm', color: '#f59e0b', label: 'CO₂ (ppm)' },
  ph: { key: 'ph_level_avg', rawKey: 'ph_level', color: '#8b5cf6', label: 'pH Level' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card">
      <p className="chart-tooltip-time">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.name}: <strong>{Number(entry.value).toFixed(1)}</strong>
        </p>
      ))}
    </div>
  );
}

export default function TelemetryChart({ data = [], interval = 'hour', metrics = ['temperature', 'humidity'], height = 320 }) {
  if (!data.length) {
    return (
      <div className="chart-empty">
        <p>No telemetry data available for this time range.</p>
      </div>
    );
  }

  const isRaw = interval === 'raw';

  const chartData = data.map((point) => {
    const time = point.bucket || point.time;
    const formatted = time ? format(new Date(time), interval === 'day' ? 'MMM d' : 'HH:mm') : '';
    const entry = { time: formatted };
    metrics.forEach((m) => {
      const cfg = METRIC_CONFIG[m];
      entry[cfg.label] = point[isRaw ? cfg.rawKey : cfg.key];
    });
    return entry;
  });

  return (
    <div className="chart-container animate-fade-in">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {metrics.map((m) => {
              const cfg = METRIC_CONFIG[m];
              return (
                <linearGradient key={m} id={`gradient-${m}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {metrics.map((m) => {
            const cfg = METRIC_CONFIG[m];
            return (
              <Area
                key={m}
                type="monotone"
                dataKey={cfg.label}
                stroke={cfg.color}
                strokeWidth={2}
                fill={`url(#gradient-${m})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
