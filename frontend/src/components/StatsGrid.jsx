const STAT_META = {
  total: { label: 'Total', accent: 'accent-primary' },
  pending: { label: 'Pending', accent: 'accent-warning' },
  in_progress: { label: 'In Progress', accent: 'accent-info' },
  resolved: { label: 'Resolved', accent: 'accent-success' },
  closed: { label: 'Closed', accent: 'accent-muted' },
};

const StatsGrid = ({ stats = {}, compact = false }) => {
  return (
    <div className={`stats-grid ${compact ? 'compact' : ''}`}>
      {Object.entries(STAT_META).map(([key, meta]) => (
        <div key={key} className={`stat-card ${meta.accent}`}>
          <p className="stat-label">{meta.label}</p>
          <p className="stat-value">{stats[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;







