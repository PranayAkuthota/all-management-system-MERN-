import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/payments'),
      axios.get('/api/payments/stats')
    ]).then(([pRes, sRes]) => {
      setPayments(pRes.data);
      setStats(sRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem', fontWeight: 700, color: 'white', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>🎓 LMS Admin</div>
        {[{to:'/admin',label:'📊 Dashboard'},{to:'/admin/users',label:'👥 Users'},{to:'/admin/courses',label:'📚 Courses'},{to:'/admin/payments',label:'💳 Payments'},{to:'/admin/coupons',label:'🎟️ Coupons'}].map(l=><Link key={l.to} to={l.to} className="sidebar-link">{l.label}</Link>)}
      </aside>
      <main className="admin-content">
        <div className="page-header">
          <h2 className="page-title">💳 Payment Management</h2>
        </div>

        <div className="admin-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card green">
            <div className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalPayments || 0}</div>
            <div className="stat-label">Completed Payments</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">All Transactions</div>
          </div>
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Transaction ID</th><th>Student</th><th>Course</th><th>Amount</th><th>Coupon</th><th>Method</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No payments yet</td></tr>
                  ) : payments.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.transactionId?.substring(0, 12)}...</td>
                      <td>{p.user?.name}<br /><small style={{ color: 'var(--gray)' }}>{p.user?.email}</small></td>
                      <td>{p.course?.title}</td>
                      <td>
                        <strong>${p.amount.toFixed(2)}</strong>
                        {p.discountAmount > 0 && <div style={{ color: 'var(--success)', fontSize: '0.8rem' }}>-${p.discountAmount.toFixed(2)} off</div>}
                      </td>
                      <td>{p.couponApplied ? <span className="badge badge-info">{p.couponApplied.code}</span> : '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.paymentMethod}</td>
                      <td><span className={`badge ${p.status === 'completed' ? 'badge-success' : p.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>{p.status}</span></td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
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
