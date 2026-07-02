import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'family', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="auth-card">
        <h2>Create an account</h2>
        {error && <div className="status error"><p>{error}</p></div>}
        <form onSubmit={handleSubmit}>
          <label>
            I am a
            <select value={form.role} onChange={update('role')}>
              <option value="family">Family member looking for care</option>
              <option value="caregiver">Caregiver offering services</option>
            </select>
          </label>
          <label>
            Full name
            <input type="text" value={form.name} onChange={update('name')} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={update('email')} required />
          </label>
          <label>
            Phone
            <input type="tel" value={form.phone} onChange={update('phone')} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={update('password')} required minLength={6} />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}

export default Register;
