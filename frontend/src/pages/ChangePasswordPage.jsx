import { useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { api } from '../services/api.js';
import { validatePassword, validationMessage } from '../utils/validation.js';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!validatePassword(form.newPassword)) return setError(validationMessage('password'));
    setLoading(true);
    try {
      await api.changePassword(form);
      setForm({ currentPassword: '', newPassword: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="page-heading compact"><span className="eyebrow">Account</span><h1>Change password</h1></div>
      {message && <div className="alert alert-success">{message}</div>}
      <ErrorMessage message={error} />
      <form className="form-stack" onSubmit={submit}>
        <label>Current password<input type="password" name="currentPassword" value={form.currentPassword} onChange={update} required /></label>
        <label>New password<input type="password" name="newPassword" value={form.newPassword} onChange={update} required /></label>
        <button className="button" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
      </form>
    </section>
  );
}
