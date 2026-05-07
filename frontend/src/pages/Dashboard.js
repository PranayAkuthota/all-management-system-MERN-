import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      axios.get('/api/users/profile'),
      axios.get('/api/payments/my')
    ]).then(([pRes, payRes]) => {
      setProfile(pRes.data);
      setPayments(payRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSaved = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.discountAmount || 0), 0);

  return (
    <div className="page-section">
      <div className="container">
        <div className="page-header">
          <h2 className="page-title">My Dashboard</h2>
          <span style={{ color: 'var(--gray)' }}>Welcome back, <strong>{user?.name}</strong>!</span>
        </div>

        {/* Stats */}
        <div className="admin-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{profile?.enrolledCourses?.length || 0}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{payments.filter(p => p.status === 'completed').length}</div>
            <div className="stat-label">Completed Payments</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-value">${totalSpent.toFixed(2)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          {totalSaved > 0 && (
            <div className="stat-card cyan">
              <div className="stat-value">${totalSaved.toFixed(2)}</div>
              <div className="stat-label">Total Saved (Coupons)</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* My Courses */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>📚 My Courses</h3>
              <Link to="/courses" className="btn btn-outline btn-sm">Browse More</Link>
            </div>
            {!profile?.enrolledCourses?.length ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📘</div>
                <p>You have not enrolled in any courses yet.</p>
                <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Browse Courses</Link>
              </div>
            ) : (
              profile.enrolledCourses.map(c => (
                <div key={c._id} style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                      <span className="category-badge" style={{ fontSize: '0.72rem' }}>{c.category}</span>
                      <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{c.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                  <Link to={`/courses/${c._id}`} className="btn btn-outline btn-sm">View</Link>
                </div>
              ))
            )}
          </div>

          {/* Payment History */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>💳 Payment History</h3>
              <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{payments.length} transactions</span>
            </div>
            {!payments.length ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💸</div>
                <p>No payments yet.</p>
              </div>
            ) : (
              <>
                {payments.map(p => (
                  <div key={p._id} style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', maxWidth: '65%', lineHeight: 1.3 }}>{p.course?.title}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>${p.amount.toFixed(2)}</div>
                        {p.discountAmount > 0 && (
                          <div style={{ color: 'var(--success)', fontSize: '0.75rem' }}>saved ${p.discountAmount.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span style={{ color: 'var(--gray)', fontSize: '0.78rem', textTransform: 'capitalize' }}>· {p.paymentMethod}</span>
                      </div>
                      <span className={`badge ${p.status === 'completed' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {p.status === 'completed' ? '✅ Completed' : p.status === 'pending' ? '⏳ Pending' : '❌ Failed'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Total row */}
                <div style={{ padding: '0.875rem 0', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total Spent</span>
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>${totalSpent.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
