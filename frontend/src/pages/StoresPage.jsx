import { useEffect, useMemo, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

export default function StoresPage() {
  const [filters, setFilters] = useState({ name: '', address: '', sortBy: 'name', order: 'asc', page: '1', limit: '12' });
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyStore, setBusyStore] = useState(null);
  const [ratingValues, setRatingValues] = useState({});

  const query = useMemo(() => ({ ...filters }), [filters]);

  async function loadStores() {
    setLoading(true);
    setError('');
    try {
      const response = await api.stores(query);
      setItems(response.data.items);
      setPagination(response.data.pagination);
      setRatingValues((current) => {
        const next = { ...current };
        response.data.items.forEach((store) => { next[store.id] = store.userRating ?? 0; });
        return next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, [filters]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: '1' }));
  }

  async function submitRating(store) {
    const rating = Number(ratingValues[store.id]);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError('Choose a rating from 1 to 5.');
      return;
    }

    setBusyStore(store.id);
    setError('');
    try {
      if (store.userRatingId === null) {
        await api.createRating({ storeId: store.id, rating });
      } else {
        await api.updateRating(store.userRatingId, { storeId: store.id, rating });
      }
      await loadStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyStore(null);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">Stores</span>
        <h1>Browse stores</h1>
        <p>Find stores and submit your rating.</p>
      </div>

      <div className="filter-panel">
        <input name="name" value={filters.name} onChange={updateFilter} placeholder="Search store name" />
        <input name="address" value={filters.address} onChange={updateFilter} placeholder="Search address" />
        <select name="sortBy" value={filters.sortBy} onChange={updateFilter}>
          <option value="name">Sort by name</option>
          <option value="rating">Sort by rating</option>
          <option value="address">Sort by address</option>
        </select>
        <select name="order" value={filters.order} onChange={updateFilter}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {loading ? <Loading label="Loading stores..." /> : (
        <>
          <div className="card-grid">
            {items.map((store) => (
              <article className="store-card" key={store.id}>
                <div className="store-card-top">
                  <div>
                    <h2>{store.name}</h2>
                    <p>{store.address}</p>
                  </div>
                  <div className="rating-badge">★ {store.overallRating.toFixed(2)}</div>
                </div>
                <div className="muted">{store.ratingCount} submitted rating{store.ratingCount === 1 ? '' : 's'}</div>
                <div className="rating-form">
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isFilled = value <= Number(ratingValues[store.id] || 0);
                      return (
                        <span
                          key={value}
                          onClick={() => setRatingValues((current) => ({ ...current, [store.id]: value }))}
                          style={{
                            cursor: 'pointer',
                            fontSize: '1.6rem',
                            color: isFilled ? '#fbbf24' : '#e2e8f0',
                            transition: 'color 0.2s'
                          }}
                        >
                          ★
                        </span>
                      );
                    })}
                  </div>
                  <button 
                    className="button button-small" 
                    onClick={() => submitRating(store)} 
                    disabled={busyStore === store.id || !ratingValues[store.id]}
                  >
                    {busyStore === store.id ? 'Saving...' : 'Submit'}
                  </button>
                </div>
                <p className="your-rating">Your current rating: <strong>{store.userRating ?? 'Not rated yet'}</strong></p>
              </article>
            ))}
          </div>
          {!items.length && <div className="empty-state">No stores matched your search.</div>}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: String(pagination.page - 1) }))}>Previous</button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters((current) => ({ ...current, page: String(pagination.page + 1) }))}>Next</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
