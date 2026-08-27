import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      const from = location.state?.from;
      if (from) navigate(from, { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'STORE_OWNER') navigate('/owner/dashboard', { replace: true });
      else navigate('/stores', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="page-heading compact">
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in</h1>
        <p>Use the same login page for all three roles.</p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={submit} className="form-stack">
        <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={update} required /></label>
        <button className="button" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>

      <p className="form-footer">New here? <Link to="/register">Create a normal user account</Link></p>
    </section>
  );
}
