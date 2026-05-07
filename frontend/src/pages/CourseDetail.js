import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    axios.get(`/api/courses/${id}`)
      .then(r => {
        setCourse(r.data);
        if (user) setEnrolled(r.data.enrolledStudents?.includes(user._id));
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!course) return null;

  return (
    <div className="page-section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          <div>
            <span className="category-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{course.category}</span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', marginBottom: '1rem' }}>{course.title}</h1>
            <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{course.description}</p>
            <div style={{ display: 'flex', gap: '2rem', color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <span>👨‍🏫 {course.instructor?.name}</span>
              <span>👥 {course.enrolledStudents?.length || 0} students</span>
              <span>📖 {course.lessons?.length || 0} lessons</span>
            </div>

            {course.lessons?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Course Curriculum</h3>
                {course.lessons.map((lesson, i) => (
                  <div key={i} style={{ padding: '0.875rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ background: 'var(--light)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                      {lesson.duration > 0 && <div style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{lesson.duration} mins</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
              {course.price === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `$${course.price}`}
            </div>
            {enrolled ? (
              <div>
                <div className="alert alert-success">✅ You are enrolled in this course!</div>
                <button className="btn btn-success" style={{ width: '100%' }}>Continue Learning</button>
              </div>
            ) : user ? (
              course.price === 0 ? (
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                  onClick={() => axios.post(`/api/courses/${id}/enroll`).then(() => setEnrolled(true))}>
                  Enroll for Free
                </button>
              ) : (
                <Link to={`/checkout/${id}`} className="btn btn-primary btn-lg" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
                  Buy Now — ${course.price}
                </Link>
              )
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
                Login to Enroll
              </Link>
            )}
            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray)' }}>
              <div style={{ marginBottom: '0.5rem' }}>✔ Full lifetime access</div>
              <div style={{ marginBottom: '0.5rem' }}>✔ Access on all devices</div>
              <div>✔ Certificate of completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
