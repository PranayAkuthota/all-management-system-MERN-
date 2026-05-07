import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Learn<span>Hub</span></Link>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/courses">Courses</Link></li>
        {user && <li><Link to="/dashboard">My Learning</Link></li>}
        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <li><Link to="/admin">Admin</Link></li>
        )}
      </ul>
      <div className="navbar-user">
        {user ? (
          <>
            <span className={`user-badge ${user.role === 'admin' ? 'admin-badge' : ''}`}>
              {user.role.toUpperCase()}
            </span>
            <span style={{ fontWeight: 600 }}>{user.name}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
