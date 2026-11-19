import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';

const initialState = {
  username: '',
  email: '',
  password: '',
  role: 'student',
  room_number: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const aggregatedErrors = useMemo(() => {
    // Show general error first, then other errors
    if (errors._general) {
      return errors._general;
    }
    return Object.entries(errors)
      .filter(([key]) => key !== '_general')
      .map(([, value]) => value)
      .filter(Boolean)
      .join(' ');
  }, [errors]);
  const errorMessage = apiError || aggregatedErrors;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev, [name]: '' };
      // Clear general error when user starts typing
      if (value.trim()) {
        delete next._general;
      }
      return next;
    });
    setApiError('');
  };

  const validate = () => {
    const nextErrors = {};
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const roomNumber = form.room_number.trim();

    // Check for empty fields first
    const emptyFields = [];
    if (!username) emptyFields.push('username');
    if (!email) emptyFields.push('email');
    if (!password) emptyFields.push('password');
    if (form.role === 'student' && !roomNumber) emptyFields.push('room number');

    if (emptyFields.length > 0) {
      nextErrors._general = 'Please fill all the details.';
      setErrors(nextErrors);
      return false;
    }

    // Specific field validations
    if (username.length < 8) {
      nextErrors.username = 'Username must be at least 8 characters long.';
    }
    if (!emailRegex.test(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }
    if (form.role === 'student' && roomNumber.length < 2) {
      nextErrors.room_number = 'Please enter a valid room number (e.g., A-204).';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await register({
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        room_number: form.role === 'student' ? form.room_number.trim() : '',
      });
      setSuccess('Registration successful. Redirecting to login…');
      setForm(initialState);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Fresh start</p>
          <h1>Create your account</h1>
          <p className="muted">
            Register as a student to raise issues or as the warden to track every request.
          </p>
        </div>

        <Alert type="error" message={errorMessage} onClose={() => { setErrors({}); setApiError(''); }} />
        <Alert type="success" message={success} onClose={() => setSuccess('')} />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Username
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-field">
            <p className="label">Role</p>
            <select className="select-control" name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="warden">Warden</option>
            </select>
          </div>

          {form.role === 'student' && (
            <label>
              Room number
              <input
                name="room_number"
                placeholder="E.g., A-204"
                value={form.room_number}
                onChange={handleChange}
                required
              />
            </label>
          )}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="muted text-center">
          Have credentials already? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

