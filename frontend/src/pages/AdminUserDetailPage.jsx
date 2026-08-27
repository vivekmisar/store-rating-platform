import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminUser(id)
      .then((response) => setUser(response.data))
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">Admin / User detail</span>
        <h1>User details</h1>
        <p>Complete account information available to the system administrator.</p>
      </div>

      <Link to="/admin/users" className="button button-secondary button-small back-link">← Back to users</Link>
      <ErrorMessage message={error} />
      {!user && !error ? <Loading label="Loading user..." /> : user && (
        <div className="detail-card">
          <div><span>ID</span><strong>{user.id}</strong></div>
          <div><span>Name</span><strong>{user.name}</strong></div>
          <div><span>Email</span><strong>{user.email}</strong></div>
          <div><span>Address</span><strong>{user.address}</strong></div>
          <div><span>Role</span><strong><span className="role-pill">{user.role}</span></strong></div>
          {user.role === 'STORE_OWNER' && (
            <div className="detail-wide">
              <span>Store</span>
              {user.store ? (
                <div className="owner-detail-store">
                  <strong>{user.store.name}</strong>
                  <p>{user.store.email} · {user.store.address}</p>
                  <p>Average rating: ★ {user.store.averageRating.toFixed(2)}</p>
                </div>
              ) : <strong>No store assigned</strong>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
