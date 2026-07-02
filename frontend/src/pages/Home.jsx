import { useState, useEffect } from 'react';
import { API_URL } from '../config.js';

function Home() {
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => setServicesError(true));
  }, []);

  return (
    <div className="page">
      <div className="content">
        <section className="hero-banner">
          <h1>Trusted home care for the people who matter most</h1>
          <p>
            Care24 connects families with verified nurses, attendants, and physiotherapists
            for in-home elderly care &mdash; browse profiles, book in minutes, and track every visit.
          </p>
        </section>

        <section className="services-section">
          <h2>Our services</h2>
          {servicesError && (
            <div className="status error">
              <div className="status-title">Couldn&apos;t load services</div>
              <p>Check that the backend is running and MONGO_URI is set correctly.</p>
            </div>
          )}
          {!servicesError && services.length === 0 && <p className="checking">Loading services&hellip;</p>}
          {services.length > 0 && (
            <div className="service-grid">
              {services.map((service) => (
                <div className="service-card" key={service._id}>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <span className="price">₹{service.basePrice}/hr</span>
                    <span className="qualification">{service.requiredQualification}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
