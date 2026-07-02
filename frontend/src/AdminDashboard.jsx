import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

import { API_URL } from '../config.js';

function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const loadAll = useCallback(() => {
    const authHeaders = { Authorization: `Bearer ${token}` };
    fetch(`${API_URL}/admin/stats`, { headers: authHeaders }).then((r) => r.json()).then(setStats);
    fetch(`${API_URL}/admin/caregivers`, { headers: authHeaders }).then((r) => r.json()).then(setCaregivers);
    fetch(`${API_URL}/admin/users`, { headers: authHeaders }).then((r) => r.json()).then(setUsers);
    fetch(`${API_URL}/admin/bookings`, { headers: authHeaders }).then((r) => r.json()).then(setBookings);
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function toggleVerify(id, current) {
    setBusyId(id);
    try {
      await fetch(`${API_URL}/admin/caregivers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isVerified: !current })
      });
      loadAll();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <div className="content">
        <section className="status-card">
          <h2>Admin &mdash; {user?.name}</h2>
          <button onClick={logout} className="secondary-btn">Log out</button>
        </section>

        {stats && (
          <section className="dash-section">
            <h2>Overview</h2>
            <div className="stat-grid">
              <div className="stat-box"><strong>{stats.totalUsers}</strong><span>Total users</span></div>
              <div className="stat-box"><strong>{stats.totalFamilies}</strong><span>Families</span></div>
              <div className="stat-box"><strong>{stats.totalCaregiverUsers}</strong><span>Caregivers</span></div>
              <div className="stat-box"><strong>{stats.verifiedCaregivers}</strong><span>Verified</span></div>
              <div className="stat-box"><strong>{stats.totalBookings}</strong><span>Bookings</span></div>
            </div>
          </section>
        )}

        <section className="dash-section">
          <h2>Caregiver verification</h2>
          {caregivers.length === 0 && <p className="checking">No caregiver profiles yet.</p>}
          <div className="list-grid">
            {caregivers.map((c) => (
              <div className="list-card" key={c._id}>
                <h3>{c.user?.name}</h3>
                <p className="muted">{c.specialization} &middot; {c.qualification}</p>
                <span className={`badge ${c.isVerified ? 'badge-completed' : 'badge-pending'}`}>
                  {c.isVerified ? 'Verified' : 'Pending review'}
                </span>
                <div className="booking-actions">
                  <button className="tiny-btn" disabled={busyId === c._id} onClick={() => toggleVerify(c._id, c.isVerified)}>
                    {c.isVerified ? 'Revoke verification' : 'Verify'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-section">
          <h2>All users</h2>
          <div className="list-grid">
            {users.map((u) => (
              <div className="list-card" key={u._id}>
                <h3>{u.name}</h3>
                <p className="muted">{u.email}</p>
                <span className="badge badge-in-progress">{u.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-section">
          <h2>All bookings</h2>
          {bookings.length === 0 && <p className="checking">No bookings yet.</p>}
          <div className="list-grid">
            {bookings.map((b) => (
              <div className="list-card" key={b._id}>
                <h3>{b.service?.name}</h3>
                <p>{b.patient?.name} &middot; {b.caregiver?.user?.name}</p>
                <span className={`badge badge-${b.status}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
