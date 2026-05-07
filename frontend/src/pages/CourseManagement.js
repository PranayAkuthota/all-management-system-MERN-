import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EMPTY_FORM = { title: '', description: '', category: 'Web Development', price: 0, isPublished: false };
const CATEGORIES = ['Web Development', 'Data Science', 'Mobile', 'Design', 'DevOps', 'Business'];

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCourses = () => {
    axios.get('/api/courses/all').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCourses(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ title: c.title, description: c.description, category: c.category, price: c.price, isPublished: c.isPublished }); setEditing(c._id); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/api/courses/${editing}`, form);
        toast.success('Course updated!');
      } else {
        await axios.post('/api/courses', form);
        toast.success('Course created!');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem', fontWeight: 700, color: 'white', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>🎓 LMS Admin</div>
        {[{to:'/admin',label:'📊 Dashboard'},{to:'/admin/users',label:'👥 Users'},{to:'/admin/courses',label:'📚 Courses'},{to:'/admin/payments',label:'💳 Payments'},{to:'/admin/coupons',label:'🎟️ Coupons'}].map(l=><Link key={l.to} to={l.to} className="sidebar-link">{l.label}</Link>)}
      </aside>
      <main className="admin-content">
        <div className="page-header">
          <h2 className="page-title">📚 Course Management</h2>
          <button className="btn btn-primary" onClick={openCreate}>+ New Course</button>
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Price</th><th>Instructor</th><th>Students</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.title}</strong></td>
                      <td><span className="category-badge">{c.category}</span></td>
                      <td>{c.price === 0 ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span> : `$${c.price}`}</td>
                      <td>{c.instructor?.name}</td>
                      <td>{c.enrolledStudents?.length || 0}</td>
                      <td><span className={`badge ${c.isPublished ? 'badge-success' : 'badge-warning'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c._id)}>Del</button>
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
                <h3 className="modal-title">{editing ? 'Edit Course' : 'Create New Course'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete React.js Bootcamp" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what students will learn..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input className="form-control" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                  <span className="form-label" style={{ margin: 0 }}>Publish immediately</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : (editing ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
