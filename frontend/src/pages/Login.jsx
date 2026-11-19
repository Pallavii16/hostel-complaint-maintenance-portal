import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const username = form.username.trim();
    const password = form.password.trim();

    // Check for empty fields first
    if (!username && !password) {
      setError('Please enter your username and password.');
      return false;
    }
    if (!username) {
      setError('Please enter your username.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }

    // Specific field validations
    if (username.length < 8) {
      setError('Username must be at least 8 characters long.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({
        username: form.username.trim(),
        password: form.password.trim(),
      });
      navigate(user.role === 'warden' ? '/warden' : '/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Access your workspace</h1>
          <p className="muted">
            Stay on top of every maintenance request with a single, modern dashboard.
          </p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#6366f1', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="muted text-center">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;

