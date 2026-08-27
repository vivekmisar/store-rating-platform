import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateAddress, validateEmail, validateName, validatePassword, validationMessage } from '../utils/validation.js';

const initialForm = { name: '', email: '', address: '', password: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (!validateName(form.name)) return setError(validationMessage('name'));
    if (!validateEmail(form.email)) return setError(validationMessage('email'));
    if (!validateAddress(form.address)) return setError(validationMessage('address'));
    if (!validatePassword(form.password)) return setError(validationMessage('password'));

    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'USER' ? '/stores' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card wide">
      <div className="page-heading compact">
        <span className="eyebrow">Normal user registration</span>
        <h1>Create your account</h1>
        <p>New public registrations always receive the USER role.</p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={submit} className="form-stack">
        <label>Full name<input name="name" value={form.name} onChange={update} placeholder="At least 20 characters" required /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
        <label>Address<textarea name="address" value={form.address} onChange={update} rows="4" maxLength="400" required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="8-16 chars, uppercase + special" required /></label>
        <button className="button" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>

      <p className="form-footer">Already registered? <Link to="/login">Sign in</Link></p>
    </section>
  );
}
