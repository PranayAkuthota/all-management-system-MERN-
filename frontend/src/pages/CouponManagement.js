import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EMPTY = { code: '', discountType: 'percentage', discountValue: 10, minPurchase: 0, maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true };

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => {
    axios.get('/api/coupons').then(r => setCoupons(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (c) => {
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minPurchase: c.minPurchase, maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '', expiryDate: c.expiryDate?.substring(0, 10), isActive: c.isActive });
    setEditing(c._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase(), maxDiscount: form.maxDiscount || null, usageLimit: form.usageLimit || null };
      if (editing) {
        await axios.put(`/api/coupons/${editing}`, payload);
        toast.success('Coupon updated!');
      } else {
        await axios.post('/api/coupons', payload);
        toast.success('Coupon created!');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`/api/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (c) => {
    try {
      await axios.put(`/api/coupons/${c._id}`, { isActive: !c.isActive });
      toast.success(`Coupon ${!c.isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem', fontWeight: 700, color: 'white', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>🎓 LMS Admin</div>
        {[{to:'/admin',label:'📊 Dashboard'},{to:'/admin/users',label:'👥 Users'},{to:'/admin/courses',label:'📚 Courses'},{to:'/admin/payments',label:'💳 Payments'},{to:'/admin/coupons',label:'🎟️ Coupons'}].map(l=><Link key={l.to} to={l.to} className="sidebar-link">{l.label}</Link>)}
      </aside>
      <main className="admin-content">
        <div className="page-header">
          <h2 className="page-title">🎟️ Coupon Management</h2>
          <button className="btn btn-primary" onClick={openCreate}>+ Create Coupon</button>
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Code</th><th>Type</th><th>Discount</th><th>Min Purchase</th><th>Usage</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No coupons yet. Create one!</td></tr>
                  ) : coupons.map(c => (
                    <tr key={c._id}>
                      <td><strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{c.code}</strong></td>
                      <td style={{ textTransform: 'capitalize' }}>{c.discountType}</td>
                      <td><strong style={{ color: 'var(--success)' }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</strong></td>
                      <td>${c.minPurchase}</td>
                      <td>{c.usedCount}/{c.usageLimit || '∞'}</td>
                      <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <button className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => toggleActive(c)}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCoupon(c._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">{editing ? 'Edit Coupon' : 'Create New Coupon'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" disabled={!!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-control" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input className="form-control" type="number" min="0" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Purchase ($)</label>
                  <input className="form-control" type="number" min="0" value={form.minPurchase} onChange={e => setForm({ ...form, minPurchase: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Discount ($, optional)</label>
                  <input className="form-control" type="number" min="0" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No limit" />
                </div>
                <div className="form-group">
                  <label className="form-label">Usage Limit (optional)</label>
                  <input className="form-control" type="number" min="1" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Expiry Date</label>
                  <input className="form-control" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    <span className="form-label" style={{ margin: 0 }}>Active</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : (editing ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
