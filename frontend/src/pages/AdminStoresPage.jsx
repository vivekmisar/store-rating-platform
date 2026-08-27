import { useEffect, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';
import { validateAddress, validateEmail, validateName, validationMessage } from '../utils/validation.js';

const emptyStore = { name: '', email: '', address: '', ownerId: '' };

export default function AdminStoresPage() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', sortBy: 'name', order: 'asc', page: '1', limit: '10' });
  const [data, setData] = useState({ items: [], pagination: null });
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState(emptyStore);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadStores() {
    setLoading(true);
    try {
      const response = await api.adminStores(filters);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOwners() {
    try {
      const response = await api.adminUsers({ role: 'STORE_OWNER', limit: '100', page: '1', sortBy: 'name', order: 'asc' });
      setOwners(response.data.items);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadStores(); }, [filters]);
  useEffect(() => { loadOwners(); }, []);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: '1' }));
  }

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function createStore(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!validateName(form.name)) return setError(validationMessage('name'));
    if (!validateEmail(form.email)) return setError(validationMessage('email'));
    if (!validateAddress(form.address)) return setError(validationMessage('address'));
    setCreating(true);
    try {
      await api.createAdminStore(form);
      setForm(emptyStore);
      setSuccess('Store created successfully.');
      await Promise.all([loadStores(), loadOwners()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section>
      <div className="page-heading"><span className="eyebrow">Admin / Stores</span><h1>Stores</h1><p>Create stores, optionally assign a store owner, and inspect average ratings.</p></div>
      {success && <div className="alert alert-success">{success}</div>}
      <ErrorMessage message={error} />

      <div className="panel">
        <h2>Create store</h2>
        <form className="form-grid" onSubmit={createStore}>
          <input name="name" value={form.name} onChange={updateForm} placeholder="Store name (20-60 chars)" required />
          <input name="email" type="email" value={form.email} onChange={updateForm} placeholder="Store email" required />
          <input name="address" value={form.address} onChange={updateForm} placeholder="Store address" required />
          <select name="ownerId" value={form.ownerId} onChange={updateForm}>
            <option value="">No owner assigned</option>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>)}
          </select>
          <button className="button" disabled={creating}>{creating ? 'Creating...' : 'Create store'}</button>
        </form>
        {!owners.length && <p className="muted">Create a STORE_OWNER from the Users section before assigning one here.</p>}
      </div>

      <div className="filter-panel">
        <input name="name" value={filters.name} onChange={updateFilter} placeholder="Filter name" />
        <input name="email" value={filters.email} onChange={updateFilter} placeholder="Filter email" />
        <input name="address" value={filters.address} onChange={updateFilter} placeholder="Filter address" />
        <select name="sortBy" value={filters.sortBy} onChange={updateFilter}><option value="name">Name</option><option value="email">Email</option><option value="rating">Rating</option><option value="address">Address</option></select>
        <select name="order" value={filters.order} onChange={updateFilter}><option value="asc">ASC</option><option value="desc">DESC</option></select>
      </div>

      {loading ? <Loading label="Loading stores..." /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Owner</th><th>Rating</th></tr></thead>
            <tbody>
              {data.items.map((store) => <tr key={store.id}><td>{store.name}</td><td>{store.email}</td><td>{store.address}</td><td>{store.ownerName || 'Unassigned'}</td><td>★ {store.averageRating.toFixed(2)} ({store.ratingCount})</td></tr>)}
            </tbody>
          </table>
          {!data.items.length && <div className="empty-state">No stores found.</div>}
        </div>
      )}

      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="pagination"><button disabled={data.pagination.page <= 1} onClick={() => setFilters((c) => ({ ...c, page: String(data.pagination.page - 1) }))}>Previous</button><span>Page {data.pagination.page} of {data.pagination.totalPages}</span><button disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => setFilters((c) => ({ ...c, page: String(data.pagination.page + 1) }))}>Next</button></div>
      )}
    </section>
  );
}
