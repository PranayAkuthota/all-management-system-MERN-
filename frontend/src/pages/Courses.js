import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Mobile', 'Design', 'DevOps', 'Business'];

const COURSE_EMOJI = { 'Web Development': '💻', 'Data Science': '📊', 'Mobile': '📱', 'Design': '🎨', 'DevOps': '⚙️', 'Business': '💼' };

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    axios.get('/api/courses', { params })
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    if (user) {
      axios.get('/api/users/profile').then(r => {
        setEnrolledIds((r.data.enrolledCourses || []).map(c => c._id || c));
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="page-section">
      <div className="container">
        <div className="page-header">
          <h2 className="page-title">All Courses</h2>
          <span style={{ color: 'var(--gray)' }}>{courses.length} courses available</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-control" style={{ maxWidth: 300 }} placeholder="🔍 Search courses..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3>No courses found</h3>
            <p style={{ color: 'var(--gray)' }}>Try a different search or category</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(c => {
              const isEnrolled = enrolledIds.includes(c._id);
              return (
                <Link to={`/courses/${c._id}`} key={c._id} style={{ textDecoration: 'none' }}>
                  <div className="course-card" style={{ position: 'relative' }}>
                    {isEnrolled && (
                      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: 'var(--success)', color: 'white', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                        ✅ Enrolled
                      </div>
                    )}
                    <div className="course-card-img" style={{ fontSize: '2.5rem', position: 'relative' }}>
                      {COURSE_EMOJI[c.category] || '📘'}
                    </div>
                    <div className="course-card-body">
                      <div className="course-card-title">{c.title}</div>
                      <div className="course-card-desc">{c.description}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                        <span>👨‍🏫 {c.instructor?.name}</span>
                        <span>👥 {c.enrolledStudents?.length || 0}</span>
                      </div>
                      <div className="course-card-footer">
                        <span className={`course-price ${c.price === 0 ? 'free' : ''}`}>
                          {c.price === 0 ? 'FREE' : `$${c.price}`}
                        </span>
                        <span className="category-badge">{c.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
