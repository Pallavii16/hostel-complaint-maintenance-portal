import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="auth-section">
    <div className="auth-card">
      <p className="eyebrow">Hmm...</p>
      <h1>We can’t find that page</h1>
      <p className="muted">
        The link might be broken or you may have typed the wrong address. Let’s get you back to a safe
        place.
      </p>
      <Link to="/" className="primary-button">
        Back to dashboard
      </Link>
    </div>
  </section>
);

export default NotFound;







