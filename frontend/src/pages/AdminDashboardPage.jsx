import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminDashboard().then((response) => setStats(response.data)).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <div className="page-heading"><span className="eyebrow">System Administrator</span><h1>Admin dashboard</h1><p>Platform-wide overview and management shortcuts.</p></div>
      <ErrorMessage message={error} />
      {!stats ? <Loading label="Loading dashboard..." /> : (
        <>
          <div className="stats-grid">
            <div className="stat-card"><span>Total users</span><strong>{stats.totalUsers}</strong></div>
            <div className="stat-card"><span>Total stores</span><strong>{stats.totalStores}</strong></div>
            <div className="stat-card"><span>Total ratings</span><strong>{stats.totalRatings}</strong></div>
          </div>
          <div className="quick-links">
            <Link to="/admin/users" className="quick-link"><strong>Manage users</strong><span>Create accounts, filter and inspect roles.</span></Link>
            <Link to="/admin/stores" className="quick-link"><strong>Manage stores</strong><span>Create stores, assign owners and inspect ratings.</span></Link>
          </div>
        </>
      )}
    </section>
  );
}
