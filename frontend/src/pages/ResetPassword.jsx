import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert';
import api from '../api/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const nextErrors = {};
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!password) {
      nextErrors.password = 'Please enter a new password.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!validate()) {
      setError('Please fix the errors above before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reset-password', {
        token: token,
        password: form.password.trim(),
      });
      
      setSuccess('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired. Please request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <section className="auth-section">
        <div className="auth-card">
          <div>
            <p className="eyebrow">Reset password</p>
            <h1>Invalid reset link</h1>
            <p className="muted">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <Link to="/forgot-password" className="primary-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Request new reset link
          </Link>

          <p className="muted text-center" style={{ marginTop: '1rem' }}>
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Reset password</p>
          <h1>Create new password</h1>
          <p className="muted">
            Enter your new password below. Make sure it's at least 6 characters long.
          </p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} onClose={() => setSuccess('')} />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            New Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <label>
            Confirm Password
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </label>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="muted text-center">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  );
};

export default ResetPassword;







