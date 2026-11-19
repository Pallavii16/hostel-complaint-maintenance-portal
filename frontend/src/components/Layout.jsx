import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileDrawer from './ProfileDrawer';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Student', path: '/student', roles: ['student'] },
  { label: 'Warden', path: '/warden', roles: ['warden'] },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="brand">
            <span className="brand-icon">🏨</span>
            <div>
              <p className="brand-title">Hostel Portal</p>
              <p className="brand-subtitle">Complaints & Maintenance</p>
            </div>
          </Link>

          <div className="header-actions">
            {user ? (
              <>
                <nav className="header-nav">
                  {navItems
                    .filter((item) => item.roles.includes(user.role))
                    .map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                      >
                        {item.label} Dashboard
                      </Link>
                    ))}
                </nav>
                <div className="user-pill">
                  <button className="profile-button" onClick={() => setProfileOpen(true)}>
                    {user.profile_photo_url ? (
                      <img src={user.profile_photo_url} alt="Avatar" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </button>
                  <div>
                    <p className="user-name">{user.username}</p>
                    <p className="user-role">{user.role}</p>
                  </div>
                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="ghost-button">
                  Login
                </Link>
                <Link to="/register" className="primary-button">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="page-container">{children}</div>
      </main>
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default Layout;

