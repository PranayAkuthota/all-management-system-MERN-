import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get('/api/courses').then(r => setCourses(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Learn <span>Smarter</span>,<br />Build Faster</h1>
          <p>A complete Learning Management System built with MERN Stack — manage users, courses, payments and coupons all in one place.</p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-secondary btn-lg">Browse Courses</Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>Get Started Free</Link>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="admin-grid" style={{ marginBottom: '3rem' }}>
            {[
              { icon: '👥', label: 'Users Management', desc: 'Register, manage roles and control access' },
              { icon: '📚', label: 'Course Management', desc: 'Create, publish and manage all courses' },
              { icon: '💳', label: 'Payment System', desc: 'Track transactions and revenue' },
              { icon: '🎟️', label: 'Coupon Management', desc: 'Discounts, promo codes and offers' },
            ].map((f, i) => (
              <div key={i} className="card card-hover" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{f.label}</div>
                <div style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {courses.length > 0 && (
            <>
              <div className="page-header">
                <h2 className="page-title">Featured Courses</h2>
                <Link to="/courses" className="btn btn-outline">View All</Link>
              </div>
              <div className="courses-grid">
                {courses.map(c => (
                  <Link to={`/courses/${c._id}`} key={c._id} style={{ textDecoration: 'none' }}>
                    <div className="course-card">
                      <div className="course-card-img">📘</div>
                      <div className="course-card-body">
                        <div className="course-card-title">{c.title}</div>
                        <div className="course-card-desc">{c.description}</div>
                        <div className="course-card-footer">
                          <span className={`course-price ${c.price === 0 ? 'free' : ''}`}>
                            {c.price === 0 ? 'FREE' : `$${c.price}`}
                          </span>
                          <span className="category-badge">{c.category}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
