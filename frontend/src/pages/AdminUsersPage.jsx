import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';
import { validateAddress, validateEmail, validateName, validatePassword, validationMessage } from '../utils/validation.js';

const emptyForm = { name: '', email: '', address: '', password: '', role: 'USER' };

export default function AdminUsersPage() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '', sortBy: 'name', order: 'asc', page: '1', limit: '10' });
  const [data, setData] = useState({ items: [], pagination: null });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.adminUsers(filters);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: '1' }));
  }

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function createUser(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!validateName(form.name)) return setError(validationMessage('name'));
    if (!validateEmail(form.email)) return setError(validationMessage('email'));
    if (!validateAddress(form.address)) return setError(validationMessage('address'));
    if (!validatePassword(form.password)) return setError(validationMessage('password'));
    setCreating(true);
    try {
      await api.createAdminUser(form);
      setForm(emptyForm);
      setSuccess('User created successfully.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section>
      <div className="page-heading"><span className="eyebrow">Admin / Users</span><h1>Users</h1><p>Filter normal, admin and store-owner accounts. Store owner details include their store rating.</p></div>
      {success && <div className="alert alert-success">{success}</div>}
      <ErrorMessage message={error} />

      <div className="panel">
        <h2>Create user</h2>
        <form className="form-grid" onSubmit={createUser}>
          <input name="name" value={form.name} onChange={updateForm} placeholder="Name (20-60 chars)" required />
          <input name="email" type="email" value={form.email} onChange={updateForm} placeholder="Email" required />
          <input name="address" value={form.address} onChange={updateForm} placeholder="Address" required />
          <input name="password" type="password" value={form.password} onChange={updateForm} placeholder="Password" required />
          <select name="role" value={form.role} onChange={updateForm}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </select>
          <button className="button" disabled={creating}>{creating ? 'Creating...' : 'Create user'}</button>
        </form>
      </div>

      <div className="filter-panel">
        <input name="name" value={filters.name} onChange={updateFilter} placeholder="Filter name" />
        <input name="email" value={filters.email} onChange={updateFilter} placeholder="Filter email" />
        <input name="address" value={filters.address} onChange={updateFilter} placeholder="Filter address" />
        <select name="role" value={filters.role} onChange={updateFilter}>
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
        </select>
        <select name="sortBy" value={filters.sortBy} onChange={updateFilter}><option value="name">Name</option><option value="email">Email</option><option value="role">Role</option><option value="address">Address</option></select>
        <select name="order" value={filters.order} onChange={updateFilter}><option value="asc">ASC</option><option value="desc">DESC</option></select>
      </div>

      {loading ? <Loading label="Loading users..." /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th><th>Store / Rating</th></tr></thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user.id}>
                  <td><Link className="table-link" to={`/admin/users/${user.id}`}>{user.name}</Link></td><td>{user.email}</td><td>{user.address}</td><td><span className="role-pill">{user.role}</span></td>
                  <td>{user.role === 'STORE_OWNER' ? user.store ? `${user.store.name} · ★ ${user.store.averageRating.toFixed(2)}` : 'No store assigned' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.items.length && <div className="empty-state">No users found.</div>}
        </div>
      )}

      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="pagination"><button disabled={data.pagination.page <= 1} onClick={() => setFilters((c) => ({ ...c, page: String(data.pagination.page - 1) }))}>Previous</button><span>Page {data.pagination.page} of {data.pagination.totalPages}</span><button disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => setFilters((c) => ({ ...c, page: String(data.pagination.page + 1) }))}>Next</button></div>
      )}
    </section>
  );
}
