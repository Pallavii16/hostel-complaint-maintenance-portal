export const StatusBadge = ({ status = 'pending' }) => {
  const label = status.replace('_', ' ');
  return <span className={`badge status ${status}`}>{label}</span>;
};

export const PriorityBadge = ({ priority = 'medium' }) => (
  <span className={`badge priority ${priority}`}>{priority}</span>
);

