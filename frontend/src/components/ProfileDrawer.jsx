import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import Alert from './Alert';
import { useAuth } from '../contexts/AuthContext';

const ProfileDrawer = ({ open, onClose }) => {
  const { user, refreshSession } = useAuth();
  const [roomNumber, setRoomNumber] = useState(user?.room_number || '');
  const [preview, setPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setRoomNumber(user?.room_number || '');
    setPreview('');
    setPhotoFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [user, open]);

  if (!open || !user) return null;

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPhotoFile(null);
      setPreview('');
      return;
    }
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = new FormData();
      if (user.role === 'student') {
        payload.append('room_number', roomNumber || '');
      }
      if (photoFile) {
        payload.append('profile_photo', photoFile);
      }

      await api.put('/profile', payload);
      await refreshSession();
      setPhotoFile(null);
      setPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer open profile-drawer" onClick={onClose}>
      <div className="drawer-content" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>{user.username}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close profile drawer">
            ×
          </button>
        </div>

        <div className="profile-avatar">
          {preview ? (
            <img src={preview} alt="Profile preview" />
          ) : user.profile_photo_url ? (
            <img src={user.profile_photo_url} alt="Profile avatar" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} autoScroll={false} />
        <Alert type="success" message={success} onClose={() => setSuccess('')} autoScroll={false} />

        <form className="stacked-form" onSubmit={handleSave}>
          <label>
            Email
            <input value={user.email} disabled />
          </label>

          <label>
            Role
            <input value={user.role} disabled />
          </label>

          {user.role === 'student' && (
            <label>
              Room number
              <input
                value={roomNumber}
                onChange={(event) => setRoomNumber(event.target.value)}
                placeholder="E.g., A-204"
              />
            </label>
          )}

          <div className="file-upload">
            <p className="label">Profile photo</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileDrawer;

