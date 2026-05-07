import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    axios.get('/api/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    try {
      await axios.put(`/api/users/${id}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem', fontWeight: 700, color: 'white', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>🎓 LMS Admin</div>
        {[{to:'/admin',label:'📊 Dashboard'},{to:'/admin/users',label:'👥 Users'},{to:'/admin/courses',label:'📚 Courses'},{to:'/admin/payments',label:'💳 Payments'},{to:'/admin/coupons',label:'🎟️ Coupons'}].map(l=><Link key={l.to} to={l.to} className="sidebar-link">{l.label}</Link>)}
      </aside>
      <main className="admin-content">
        <div className="page-header">
          <h2 className="page-title">👥 User Management</h2>
          <span style={{ color: 'var(--gray)' }}>{users.length} users total</span>
        </div>

        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Enrolled</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <select className="form-control" style={{ padding: '4px 8px', width: 'auto', fontSize: '0.85rem' }}
                          value={u.role} onChange={e => changeRole(u._id, e.target.value)}>
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{u.enrolledCourses?.length || 0} courses</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>Delete</button>
                      </td>
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
