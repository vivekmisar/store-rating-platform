import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">StoreRate</Link>

        {user && (
          <>
            <nav className="nav-links">
              {user.role === 'USER' && <NavLink to="/stores">Stores</NavLink>}
              {user.role === 'ADMIN' && <NavLink to="/admin/dashboard">Admin</NavLink>}
              {user.role === 'STORE_OWNER' && <NavLink to="/owner/dashboard">Owner Dashboard</NavLink>}
              <NavLink to="/change-password">Change Password</NavLink>
            </nav>
            <div className="user-menu">
              <span>{user.name}</span>
              <span className="role-pill">{user.role}</span>
              <button className="button button-small button-ghost" onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}

        {!user && (
          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register" className="button button-small">Register</Link>
          </div>
        )}
      </header>

      <main className="container">{children}</main>
    </div>
  );
}
