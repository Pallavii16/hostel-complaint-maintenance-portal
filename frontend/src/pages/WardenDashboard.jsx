import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import Alert from '../components/Alert';
import LoadingScreen from '../components/LoadingScreen';
import StatsGrid from '../components/StatsGrid';
import { PriorityBadge, StatusBadge } from '../components/Badge';

const STATUS_FILTERS = [
  { value: 'all', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const WardenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', category: 'all' });
  const [loading, setLoading] = useState(true);
  const [drawerComplaint, setDrawerComplaint] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState({});
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.category !== 'all') params.append('category', filters.category);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [filters]);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/complaints${queryString}`);
      setComplaints(data.complaints);
      setGlobalStats(data.globalStats || data.stats);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    return () => {
      if (resolutionPreview) {
        URL.revokeObjectURL(resolutionPreview);
      }
    };
  }, [resolutionPreview]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openDrawer = (complaint) => {
    setDrawerComplaint(complaint);
    setDrawerErrors({});
    setResolutionPhoto(null);
    setResolutionPreview('');
  };

  const closeDrawer = () => {
    setDrawerComplaint(null);
    setDrawerErrors({});
    setResolutionPhoto(null);
    setResolutionPreview('');
  };

  const handleDrawerChange = (event) => {
    const { name, value } = event.target;
    setDrawerComplaint((prev) => ({ ...prev, [name]: value }));
    setDrawerErrors((prev) => ({ ...prev, [name]: '' }));
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

  const handleResolutionFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setResolutionPhoto(null);
      setResolutionPreview('');
      setDrawerErrors((prev) => ({ ...prev, resolution_photo: '' }));
      return;
    }
    const validationMessage = validateFile(file);
    if (validationMessage) {
      setDrawerErrors((prev) => ({ ...prev, resolution_photo: validationMessage }));
      return;
    }
    setResolutionPhoto(file);
    setResolutionPreview(URL.createObjectURL(file));
    setDrawerErrors((prev) => ({ ...prev, resolution_photo: '' }));
  };

  const validateDrawer = () => {
    const nextErrors = {};
    if (!drawerComplaint?.status) {
      nextErrors.status = 'Please select a status for this complaint.';
    }
    // File validation (optional field)
    const fileError = validateFile(resolutionPhoto);
    if (fileError) {
      nextErrors.resolution_photo = fileError;
    }
    setDrawerErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError('Please fix the errors above before saving.');
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!drawerComplaint) return;
    if (!validateDrawer()) return;

    setUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = new FormData();
      payload.append('status', drawerComplaint.status);
      payload.append('warden_notes', drawerComplaint.warden_notes || '');
      if (resolutionPhoto) {
        payload.append('resolution_photo', resolutionPhoto);
      }

      await api.put(`/complaints/${drawerComplaint.id}`, payload);
      setSuccessMessage('Complaint updated successfully.');
      closeDrawer();
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Fetching hostel-wide overview..." />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Warden control room</p>
          <h1>Monitor, prioritise, and resolve every complaint</h1>
        </div>
        <button className="ghost-button" onClick={fetchComplaints}>
          Refresh
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />

      <StatsGrid stats={globalStats} />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Active complaints</h2>
            <p className="muted">Use filters to focus on what needs your attention.</p>
          </div>
          <div className="filters">
            <select
              className="select-control select-control--status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="select-control select-control--status"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Student</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>#{complaint.id}</td>
                  <td>{complaint.title}</td>
                  <td>
                    <div className="student-cell">
                      <p>{complaint.student?.username}</p>
                      <span className="muted small">{complaint.student?.room_number}</span>
                    </div>
                  </td>
                  <td>{complaint.category}</td>
                  <td>
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td>
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="ghost-button" onClick={() => openDrawer(complaint)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={`drawer ${drawerComplaint ? 'open' : ''}`}>
        <div className="drawer-content">
          <div className="drawer-header">
            <div>
              <p className="eyebrow">Update complaint</p>
              <h2>#{drawerComplaint?.id} — {drawerComplaint?.title}</h2>
            </div>
            <button className="ghost-button" onClick={closeDrawer}>
              Close
            </button>
          </div>

          {drawerComplaint && (
            <form className="stacked-form" onSubmit={handleUpdate}>
              <p className="complaint-description">{drawerComplaint.description}</p>

              {(drawerComplaint.issue_photo_url || drawerComplaint.resolution_photo_url) && (
                <div className="complaint-images">
                  {drawerComplaint.issue_photo_url && (
                    <button
                      type="button"
                      className="image-thumb"
                      onClick={() =>
                        setLightboxImage({ src: drawerComplaint.issue_photo_url, label: 'Student evidence' })
                      }
                    >
                      <img src={drawerComplaint.issue_photo_url} alt="Issue" className="complaint-image" />
                    </button>
                  )}
                  {drawerComplaint.resolution_photo_url && !resolutionPreview && (
                    <button
                      type="button"
                      className="image-thumb"
                      onClick={() =>
                        setLightboxImage({
                          src: drawerComplaint.resolution_photo_url,
                          label: 'Resolution proof',
                        })
                      }
                    >
                      <img
                        src={drawerComplaint.resolution_photo_url}
                        alt="Resolution"
                        className="complaint-image"
                      />
                    </button>
                  )}
                </div>
              )}

              <label>
                Status
                <select
                  className="select-control select-control--status"
                  name="status"
                  value={drawerComplaint.status}
                  onChange={handleDrawerChange}
                >
                  {STATUS_FILTERS.filter((option) => option.value !== 'all').map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {drawerErrors.status && <span className="field-error">{drawerErrors.status}</span>}
              </label>

              <label>
                Progress notes
                <textarea
                  name="warden_notes"
                  value={drawerComplaint.warden_notes || ''}
                  onChange={handleDrawerChange}
                  rows="5"
                  placeholder="Share updates, vendor ETAs, or closing notes."
                />
              </label>

              <div className="file-upload">
                <p className="label">Resolution photo (optional)</p>
                <input type="file" accept="image/*" onChange={handleResolutionFileChange} />
                {drawerErrors.resolution_photo && (
                  <span className="field-error">{drawerErrors.resolution_photo}</span>
                )}
                <div className="preview-grid">
                  {resolutionPreview && <img src={resolutionPreview} alt="Resolution preview" />}
                </div>
              </div>

              <button type="submit" className="primary-button" disabled={updating}>
                {updating ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}
        </div>
      </div>
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

export default WardenDashboard;

