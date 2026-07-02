import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import BookingCard from '../components/BookingCard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

import { API_URL } from '../config.js';

function Dashboard() {
  const { user, token, logout } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'caregiver') return <CaregiverDashboard token={token} user={user} logout={logout} />;
  return <FamilyDashboard token={token} user={user} logout={logout} />;
}

function FamilyDashboard({ token, user, logout }) {
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ name: '', age: '', medicalNeeds: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    fetch(`${API_URL}/patients/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setPatients);
    fetch(`${API_URL}/bookings/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setBookings);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  async function addPatient(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add patient');
      setForm({ name: '', age: '', medicalNeeds: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="content">
        <section className="status-card">
          <h2>Welcome, {user?.name}</h2>
          <p>Logged in as <strong>family</strong>. <Link to="/caregivers">Browse caregivers &rarr;</Link></p>
          <button onClick={logout} className="secondary-btn">Log out</button>
        </section>

        <section className="dash-section">
          <h2>My patients</h2>
          {patients.length === 0 && <p className="checking">No patient profiles yet &mdash; add one below.</p>}
          <div className="list-grid">
            {patients.map((p) => (
              <div className="list-card" key={p._id}>
                <h3>{p.name}</h3>
                <p>{p.age} years old</p>
                {p.medicalNeeds && <p className="muted">{p.medicalNeeds}</p>}
              </div>
            ))}
          </div>
          {error && <div className="status error"><p>{error}</p></div>}
          <form onSubmit={addPatient} className="inline-form">
            <input placeholder="Patient name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            <input placeholder="Medical needs (optional)" value={form.medicalNeeds} onChange={(e) => setForm({ ...form, medicalNeeds: e.target.value })} />
            <button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add patient'}</button>
          </form>
        </section>

        <section className="dash-section">
          <h2>My bookings</h2>
          {bookings.length === 0 && <p className="checking">No bookings yet.</p>}
          <div className="list-grid">
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} token={token} canManage={false} onUpdate={loadData} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CaregiverDashboard({ token, user, logout }) {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ qualification: '', specialization: 'Elderly Attendant', experienceYears: '', hourlyRate: '', serviceAreas: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    fetch(`${API_URL}/caregivers/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setProfile(data);
          setForm({
            qualification: data.qualification || '',
            specialization: data.specialization || 'Elderly Attendant',
            experienceYears: data.experienceYears || '',
            hourlyRate: data.hourlyRate || '',
            serviceAreas: (data.serviceAreas || []).join(', ')
          });
        }
      });
    fetch(`${API_URL}/bookings/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setBookings);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/caregivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save profile');
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="content">
        <section className="status-card">
          <h2>Welcome, {user?.name}</h2>
          <p>Logged in as <strong>caregiver</strong>.</p>
          <button onClick={logout} className="secondary-btn">Log out</button>
        </section>

        <section className="dash-section">
          <h2>{profile ? 'My profile' : 'Complete your profile'}</h2>
          {!profile && <p className="checking">Families can&apos;t find you until you fill this in.</p>}
          {error && <div className="status error"><p>{error}</p></div>}
          <form onSubmit={saveProfile} className="stacked-form">
            <label>
              Specialization
              <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
                <option>Nursing Care</option>
                <option>Elderly Attendant</option>
                <option>Physiotherapy</option>
                <option>Post-Hospital Care</option>
              </select>
            </label>
            <label>
              Qualification
              <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. Registered Nurse (GNM)" required />
            </label>
            <label>
              Years of experience
              <input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
            </label>
            <label>
              Hourly rate (₹)
              <input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} required />
            </label>
            <label>
              Service areas (comma separated)
              <input value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} placeholder="e.g. Sonipat, Delhi" />
            </label>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
          </form>
        </section>

        <section className="dash-section">
          <h2>My bookings</h2>
          {bookings.length === 0 && <p className="checking">No bookings assigned yet.</p>}
          <div className="list-grid">
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} token={token} canManage={true} onUpdate={loadData} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
