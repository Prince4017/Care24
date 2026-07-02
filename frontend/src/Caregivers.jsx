import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { API_URL } from '../config.js';

function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/caregivers`)
      .then((res) => res.json())
      .then(setCaregivers)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="page">
      <div className="content">
        <section className="services-section">
          <h2>Find a caregiver</h2>
          {error && <div className="status error"><p>Couldn&apos;t load caregivers.</p></div>}
          {!error && caregivers.length === 0 && (
            <p className="checking">No caregivers have completed their profile yet.</p>
          )}
          <div className="service-grid">
            {caregivers.map((c) => (
              <div className="service-card" key={c._id}>
                <h3>{c.user?.name}</h3>
                <p>{c.specialization} &middot; {c.qualification}</p>
                <p className="muted">{c.experienceYears || 0} yrs experience &middot; {(c.serviceAreas || []).join(', ')}</p>
                <div className="service-meta">
                  <span className="price">₹{c.hourlyRate}/hr</span>
                  {user?.role === 'family' ? (
                    <Link to={`/book/${c._id}`} className="nav-cta small-cta">Book</Link>
                  ) : !user ? (
                    <Link to="/login" className="nav-cta small-cta">Log in to book</Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Caregivers;
