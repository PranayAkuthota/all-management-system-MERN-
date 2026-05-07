import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, revenue: 0, payments: 0 });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/users'),
      axios.get('/api/courses/all'),
      axios.get('/api/payments/stats')
    ]).then(([uRes, cRes, pRes]) => {
      setStats({
        users: uRes.data.length,
        courses: cRes.data.length,
        revenue: pRes.data.totalRevenue,
        payments: pRes.data.totalPayments
      });
      setRecentPayments(pRes.data.recentPayments || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem', fontWeight: 700, color: 'white', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          🎓 LMS Admin
        </div>
        {[
          { to: '/admin', label: '📊 Dashboard' },
          { to: '/admin/users', label: '👥 Users' },
          { to: '/admin/courses', label: '📚 Courses' },
          { to: '/admin/payments', label: '💳 Payments' },
          { to: '/admin/coupons', label: '🎟️ Coupons' },
        ].map(l => <Link key={l.to} to={l.to} className="sidebar-link">{l.label}</Link>)}
      </aside>

      <main className="admin-content">
        <div className="page-header">
          <h2 className="page-title">Admin Dashboard</h2>
        </div>

        <div className="admin-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-value">{stats.courses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">${stats.revenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-value">{stats.payments}</div>
            <div className="stat-label">Total Payments</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: 'View, edit roles, delete users' },
            { to: '/admin/courses', icon: '📚', label: 'Manage Courses', desc: 'Create and edit course content' },
            { to: '/admin/payments', icon: '💳', label: 'Manage Payments', desc: 'View all transactions' },
            { to: '/admin/coupons', icon: '🎟️', label: 'Manage Coupons', desc: 'Create and manage discounts' },
          ].map(item => (
            <Link to={item.to} key={item.to} style={{ textDecoration: 'none' }}>
              <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentPayments.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Payments</h3>
            <div className="table-container">
              <table>
                <thead><tr><th>User</th><th>Course</th><th>Amount</th></tr></thead>
                <tbody>
                  {recentPayments.map(p => (
                    <tr key={p._id}>
                      <td>{p.user?.name}</td>
                      <td>{p.course?.title}</td>
                      <td><strong>${p.amount}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
