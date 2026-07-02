import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

import { API_URL } from '../config.js';

function BookingForm() {
  const { caregiverId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [caregiver, setCaregiver] = useState(null);
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', serviceId: '', scheduleType: 'hourly', startDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/caregivers`)
      .then((res) => res.json())
      .then((list) => setCaregiver(list.find((c) => c._id === caregiverId)));
    fetch(`${API_URL}/services`)
      .then((res) => res.json())
      .then(setServices);
    fetch(`${API_URL}/patients/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setPatients);
  }, [caregiverId, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, caregiverId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (patients.length === 0) {
    return (
      <div className="page">
        <div className="auth-card">
          <h2>Add a patient first</h2>
          <p>You need at least one patient profile before booking. Add one from your dashboard.</p>
          <Link to="/dashboard" className="nav-cta">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="auth-card">
        <h2>Book {caregiver?.user?.name || 'caregiver'}</h2>
        {error && <div className="status error"><p>{error}</p></div>}
        {done && <div className="status ok"><p>Booked! Redirecting to your dashboard&hellip;</p></div>}
        {!done && (
          <form onSubmit={handleSubmit}>
            <label>
              Patient
              <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                <option value="">Select a patient</option>
                {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Service
              <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} required>
                <option value="">Select a service</option>
                {services.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
            <label>
              Schedule
              <select value={form.scheduleType} onChange={(e) => setForm({ ...form, scheduleType: e.target.value })}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="long-term">Long-term</option>
              </select>
            </label>
            <label>
              Start date
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </label>
            <button type="submit" disabled={saving}>{saving ? 'Booking…' : 'Confirm booking'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingForm;
