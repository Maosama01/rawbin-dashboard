import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, unit, color = 'var(--color-accent)', className = '', delay = 0 }) {
  return (
    <div
      className={`stat-card glass-card glass-card-interactive animate-fade-in-up ${className}`}
      style={{ '--stat-color': color, animationDelay: `${delay * 0.08}s` }}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon" aria-hidden="true">
          {Icon && <Icon size={20} />}
        </div>
        <span className="stat-card-label">{label}</span>
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value ?? '—'}</span>
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
    </div>
  );
}
