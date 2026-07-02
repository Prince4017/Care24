import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="wordmark-link">Care24</Link>
      <div className="nav-links">
        <Link to="/caregivers">Find caregivers</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout} className="link-btn">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="nav-cta">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
