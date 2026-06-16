import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, Leaf, Settings, LogOut, Recycle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/compost', icon: Leaf, label: 'Compost' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Recycle size={24} />
          </div>
          <div>
            <h1 className="sidebar-brand">Rawbin</h1>
            <span className="sidebar-version">IoT Dashboard</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            id={`nav-${label.toLowerCase()}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.display_name || 'User'}</span>
            <span className="sidebar-user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
