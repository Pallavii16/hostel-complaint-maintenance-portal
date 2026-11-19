import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import api from '../api/client';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [resetUrl, setResetUrl] = useState('');

  const handleChange = (event) => {
    setIdentifier(event.target.value);
    setError('');
    setSuccess('');
  };

  const validate = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Please enter your username or email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setResetToken(null);
    setResetUrl('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/forgot-password', {
        username: identifier.trim(),
        email: identifier.trim(),
      });
      
      // In development, show the token
      // In production, remove this and just show success message
      if (response.token) {
        setResetToken(response.token);
        setResetUrl(response.reset_url);
        setSuccess(
          'Password reset link has been generated. Use the link below to reset your password. ' +
          '(In production, this would be sent via email)'
        );
      } else {
        setSuccess(
          'If an account exists with that username or email, a password reset link has been sent.'
        );
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Reset password</p>
          <h1>Forgot your password?</h1>
          <p className="muted">
            Enter your username or email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} onClose={() => setSuccess('')} />

        {resetToken && (
          <div className="info-box" style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#4338ca' }}>
              Development Mode: Reset Token
            </p>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#475569' }}>
              Click the link below or copy the token to reset your password:
            </p>
            <Link 
              to={`/reset-password?token=${resetToken}`}
              style={{
                display: 'block',
                color: '#6366f1',
                textDecoration: 'underline',
                marginBottom: '0.5rem',
                wordBreak: 'break-all',
              }}
            >
              {resetUrl}
            </Link>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>
              Token: {resetToken}
            </p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Username or Email
            <input
              name="identifier"
              type="text"
              value={identifier}
              onChange={handleChange}
              placeholder="Enter your username or email"
              autoComplete="username"
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="muted text-center">
          Remember your password? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;







