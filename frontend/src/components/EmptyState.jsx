const EmptyState = ({ title, description, action }) => (
  <div className="empty-state">
    <div className="empty-icon">📭</div>
    <h4>{title}</h4>
    <p>{description}</p>
    {action}
  </div>
);

export default EmptyState;







