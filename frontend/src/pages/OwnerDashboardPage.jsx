import { useEffect, useMemo, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('submittedDesc');

  useEffect(() => {
    api.ownerDashboard().then((response) => setData(response.data)).catch((err) => setError(err.message));
  }, []);


  const sortedRatings = useMemo(() => {
    if (!data?.ratings) return [];
    return [...data.ratings].sort((a, b) => {
      if (sort === 'nameAsc') return a.name.localeCompare(b.name);
      if (sort === 'nameDesc') return b.name.localeCompare(a.name);
      if (sort === 'ratingAsc') return a.rating - b.rating;
      if (sort === 'ratingDesc') return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [data, sort]);

  return (
    <section>
      <div className="page-heading"><span className="eyebrow">Store Owner</span><h1>Owner dashboard</h1><p>Monitor your store's average rating and the users who submitted ratings.</p></div>
      <ErrorMessage message={error} />
      {!data ? <Loading label="Loading owner dashboard..." /> : (
        <>
          <div className="owner-summary">
            <div><span>Store</span><strong>{data.store.name}</strong><p>{data.store.address}</p></div>
            <div><span>Average rating</span><strong>★ {data.store.averageRating.toFixed(2)}</strong></div>
            <div><span>Submitted ratings</span><strong>{data.store.ratingCount}</strong></div>
          </div>
          <div className="panel rating-sort-panel"><label>Sort ratings<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="submittedDesc">Newest first</option><option value="nameAsc">Name A-Z</option><option value="nameDesc">Name Z-A</option><option value="ratingAsc">Rating low-high</option><option value="ratingDesc">Rating high-low</option></select></label></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Rating</th><th>Submitted</th><th>Updated</th></tr></thead>
              <tbody>
                {sortedRatings.map((rating) => <tr key={`${rating.userId}-${rating.createdAt}`}><td>{rating.name}</td><td>{rating.email}</td><td>★ {rating.rating}</td><td>{new Date(rating.createdAt).toLocaleString()}</td><td>{new Date(rating.updatedAt).toLocaleString()}</td></tr>)}
              </tbody>
            </table>
            {!data.ratings.length && <div className="empty-state">No ratings yet.</div>}
          </div>
        </>
      )}
    </section>
  );
}
