import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import StatsGrid from '../components/StatsGrid';
import { PriorityBadge, StatusBadge } from '../components/Badge';

const CATEGORY_OPTIONS = ['Plumbing', 'Electrical', 'Cleaning', 'Furniture', 'Internet', 'Security', 'Other'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const STATUS_FILTERS = [
  { value: 'all', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const initialFormState = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const StudentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [issuePhoto, setIssuePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/complaints');
      setComplaints(data.complaints);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    // Clear general error when user starts typing
    if (value.trim() && error) {
      setError('');
    }
  };

  const validateFile = (file) => {
    if (!file) return '';
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file (PNG, JPG, JPEG, GIF, WEBP, or BMP).';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image size must be less than 5MB. Please choose a smaller file.';
    }
    return '';
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setIssuePhoto(null);
      setPhotoPreview('');
      setFormErrors((prev) => ({ ...prev, issue_photo: '' }));
      return;
    }
    const validationMessage = validateFile(file);
    if (validationMessage) {
      setFormErrors((prev) => ({ ...prev, issue_photo: validationMessage }));
      return;
    }
    setIssuePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFormErrors((prev) => ({ ...prev, issue_photo: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const title = form.title.trim();
    const description = form.description.trim();

    // Check for empty required fields first
    const emptyFields = [];
    if (!title) emptyFields.push('title');
    if (!form.category) emptyFields.push('category');
    if (!form.priority) emptyFields.push('priority');
    if (!description) emptyFields.push('description');

    if (emptyFields.length > 0) {
      setError('Please fill all the details.');
      // Set individual field errors too
      if (!title) nextErrors.title = 'Please enter a title for your complaint.';
      if (!form.category) nextErrors.category = 'Please select a category.';
      if (!form.priority) nextErrors.priority = 'Please choose a priority level.';
      if (!description) nextErrors.description = 'Please describe the issue.';
      setFormErrors(nextErrors);
      return false;
    }

    // Specific field validations
    if (title.length < 5) {
      nextErrors.title = 'Title must be at least 5 characters long.';
    }
    if (description.length < 20) {
      nextErrors.description = 'Please provide more details (at least 20 characters).';
    }
    
    // File validation (optional field)
    const fileError = validateFile(issuePhoto);
    if (fileError) {
      nextErrors.issue_photo = fileError;
    }
    
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError('Please fix the errors above before submitting.');
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', form.title.trim());
      payload.append('description', form.description.trim());
      payload.append('category', form.category);
      payload.append('priority', form.priority);
      if (issuePhoto) {
        payload.append('issue_photo', issuePhoto);
      }

      await api.post('/complaints', payload);
      setForm(initialFormState);
      setIssuePhoto(null);
      setPhotoPreview('');
      setSuccessMessage('Complaint submitted. We will update you soon.');
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints =
    statusFilter === 'all'
      ? complaints
      : complaints.filter((complaint) => complaint.status === statusFilter);

  const toggleForm = () => {
    const next = !showForm;
    setShowForm(next);
    if (next) {
      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your complaints..." />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student workspace</p>
        </div>
        <div className="filters">
          {!showForm && (
            <select
              className="select-control select-control--status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <button type="button" className="primary-button" onClick={toggleForm}>
            {showForm ? 'Close form' : 'Log a new complaint'}
          </button>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />

      {showForm ? (
          <section className="panel form-panel" ref={formRef}>
            <div className="panel-header">
              <div>
                <h2>Log a new complaint</h2>
                <p className="muted">Share context so the maintenance team can act faster.</p>
              </div>
            </div>

            <form className="stacked-form" onSubmit={handleSubmit}>
              <label>
              Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Water leakage in room A-204"
                  required
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </label>

              <label>
              Category
              <select
                className="select-control"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {formErrors.category && <span className="field-error">{formErrors.category}</span>}
              </label>

              <label>
              Priority
              <select
                className="select-control"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
              >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {formErrors.priority && <span className="field-error">{formErrors.priority}</span>}
              </label>

              <label>
              Description
                <textarea
                  name="description"
                  rows="5"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide timelines, severity, and any temporary fixes tried."
                  required
                />
                {formErrors.description && (
                  <span className="field-error">{formErrors.description}</span>
                )}
              </label>

              <div className="file-upload">
                <p className="label">Attach photo (optional)</p>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {formErrors.issue_photo && (
                  <span className="field-error">{formErrors.issue_photo}</span>
                )}
                {photoPreview && (
                  <div className="preview-grid">
                    <img src={photoPreview} alt="Preview" />
                  </div>
                )}
              </div>

              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit complaint'}
              </button>
            </form>
          </section>
      ) : (
        <>
          <StatsGrid stats={stats} />

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>My complaints</h2>
                <p className="muted">Latest updates appear on top.</p>
              </div>
            </div>

            {filteredComplaints.length === 0 ? (
              <EmptyState
                title="No complaints yet"
                description={
                  complaints.length === 0
                    ? 'Use the log button above to submit your first issue.'
                    : 'No complaints match this filter.'
                }
              />
            ) : (
              <div className="complaint-list">
                {filteredComplaints.map((complaint) => (
                  <article key={complaint.id} className="complaint-card">
                    <div className="complaint-card__header">
                      <div>
                        <p className="complaint-id">#{complaint.id}</p>
                        <h3>{complaint.title}</h3>
                      </div>
                      <div className="badge-stack">
                        <StatusBadge status={complaint.status} />
                        <PriorityBadge priority={complaint.priority} />
                      </div>
                    </div>
                    <p className="complaint-description">{complaint.description}</p>
                    <div className="complaint-meta">
                      <span>Category: {complaint.category}</span>
                      <span>
                        Created: {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {(complaint.issue_photo_url || complaint.resolution_photo_url) && (
                      <div className="complaint-images">
                        {complaint.issue_photo_url && (
                          <div>
                            <p className="muted small">My evidence</p>
                            <button
                              type="button"
                              className="image-thumb"
                              onClick={() =>
                                setLightboxImage({
                                  src: complaint.issue_photo_url,
                                  label: 'My evidence',
                                })
                              }
                            >
                              <img
                                src={complaint.issue_photo_url}
                                alt="Issue upload"
                                className="complaint-image"
                              />
                            </button>
                          </div>
                        )}
                        {complaint.resolution_photo_url && (
                          <div>
                            <p className="muted small">Warden proof</p>
                            <button
                              type="button"
                              className="image-thumb"
                              onClick={() =>
                                setLightboxImage({
                                  src: complaint.resolution_photo_url,
                                  label: 'Warden proof',
                                })
                              }
                            >
                              <img
                                src={complaint.resolution_photo_url}
                                alt="Resolution upload"
                                className="complaint-image"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {complaint.warden_notes && (
                      <div className="note">
                        <p className="note-label">Warden update</p>
                        <p>{complaint.warden_notes}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
              ×
            </button>
            {lightboxImage.label && <p className="muted small">{lightboxImage.label}</p>}
            <img src={lightboxImage.src} alt={lightboxImage.label || 'Evidence'} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

