import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('card');
  const [step, setStep] = useState('review');
  const [paymentResult, setPaymentResult] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    axios.get('/api/courses/' + id).then(r => setCourse(r.data)).catch(() => navigate('/courses'));
  }, [id, navigate]);

  const validateCoupon = async () => {
    setCouponError('');
    setCouponData(null);
    try {
      const { data } = await axios.post('/api/coupons/validate', { code: couponCode, amount: course.price });
      setCouponData(data);
      toast.success('Coupon applied! You save $' + data.discountAmount.toFixed(2));
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const removeCoupon = () => { setCouponCode(''); setCouponData(null); setCouponError(''); };

  const handleMarkCompleted = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/payments/checkout', {
        courseId: id,
        couponCode: couponCode || undefined,
        paymentMethod: payMethod,
        status: 'completed',
      });
      setPaymentResult(data);
      setStep('success');
      toast.success('Payment successful! You are now enrolled.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  if (!course) return <div className="loading-page"><div className="spinner" /></div>;

  const finalAmount = couponData ? couponData.finalAmount : course.price;
  const discount = couponData ? couponData.discountAmount : 0;

  if (step === 'success') {
    return (
      <div className="page-section">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', marginBottom: '0.75rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
              You are now enrolled in <strong>{course.title}</strong>. Go to your dashboard to start learning.
            </p>
            <div className="card" style={{ background: 'var(--light)', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray)' }}>Transaction ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700 }}>{paymentResult?.transactionId?.substring(0, 18)}...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray)' }}>Amount Paid</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>${finalAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--gray)' }}>You Saved</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray)' }}>Status</span>
                <span className="badge badge-success">Completed</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>My Dashboard</button>
              <button className="btn btn-outline" onClick={() => navigate('/courses')}>Browse More</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'pay') {
    return (
      <div className="page-section">
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 className="page-title" style={{ marginBottom: '1.5rem' }}>Complete Payment</h2>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>Order Summary</h3>
              <span className="badge badge-info">{payMethod.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gray)' }}>{course.title}</span>
              <span>${course.price.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', color: 'var(--success)' }}>
                <span>Coupon ({couponData.coupon.code})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 800, fontSize: '1.15rem' }}>
              <span>Total Due</span>
              <span style={{ color: 'var(--primary)' }}>${finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {payMethod === 'card' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>💳 Card Details</h3>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-control" placeholder="4242 4242 4242 4242" maxLength={19}
                  value={cardDetails.number}
                  onChange={e => { const v = e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim(); setCardDetails({...cardDetails, number: v}); }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiry (MM/YY)</label>
                  <input className="form-control" placeholder="MM/YY" maxLength={5} value={cardDetails.expiry}
                    onChange={e => { let v=e.target.value.replace(/\D/g,''); if(v.length>=2) v=v.slice(0,2)+'/'+v.slice(2); setCardDetails({...cardDetails, expiry: v.slice(0,5)}); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input className="form-control" placeholder="•••" maxLength={3} type="password"
                    value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g,'')})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input className="form-control" placeholder="John Doe" value={cardDetails.name}
                  onChange={e => setCardDetails({...cardDetails, name: e.target.value})} />
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.82rem', color: '#92400e' }}>
                🧪 <strong>Demo mode</strong> — Any card details work. Simulated payment for assessment.
              </div>
            </div>
          )}
          {payMethod === 'upi' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📱 UPI Payment</h3>
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <input className="form-control" placeholder="yourname@upi" />
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.82rem', color: '#92400e' }}>
                🧪 <strong>Demo mode</strong> — Any UPI ID works. Simulated payment for assessment.
              </div>
            </div>
          )}
          {payMethod === 'paypal' && (
            <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🅿</div>
              <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>Click Confirm to simulate PayPal payment.</p>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.82rem', color: '#92400e' }}>
                🧪 <strong>Demo mode</strong> — Simulated payment for assessment.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setStep('review')}>← Back</button>
            <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={handleMarkCompleted} disabled={loading}>
              {loading ? <><span className="spinner" /> Processing...</> : <>✅ Confirm & Complete Payment — ${finalAmount.toFixed(2)}</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h2 className="page-title" style={{ marginBottom: '1.5rem' }}>Checkout</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
                {course.category === 'Web Development' ? '💻' : course.category === 'Data Science' ? '📊' : course.category === 'Mobile' ? '📱' : course.category === 'Design' ? '🎨' : '📘'}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{course.title}</div>
                <div style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>by {course.instructor?.name}</div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--gray)' }}>
                  <span>📖 {course.lessons?.length || 0} lessons</span>
                  <span>👥 {course.enrolledStudents?.length || 0} enrolled</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>💳 Payment Method</h3>
              {[{id:'card',icon:'💳',label:'Credit / Debit Card',sub:'Visa, Mastercard, RuPay'},{id:'upi',icon:'📱',label:'UPI',sub:'GPay, PhonePe, Paytm'},{id:'paypal',icon:'🅿',label:'PayPal',sub:'International payments'}].map(m => (
                <label key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)', border: `2px solid ${payMethod===m.id?'var(--primary)':'var(--border)'}`, background: payMethod===m.id?'#eff6ff':'transparent', marginBottom: '0.5rem', transition: 'all 0.15s' }}>
                  <input type="radio" value={m.id} checked={payMethod===m.id} onChange={() => setPayMethod(m.id)} />
                  <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                  <div><div style={{ fontWeight: 600 }}>{m.label}</div><div style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{m.sub}</div></div>
                </label>
              ))}
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🎟️ Apply Coupon</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="form-control" placeholder="Enter coupon code" value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); if(couponData) removeCoupon(); setCouponError(''); }}
                  disabled={!!couponData} />
                {couponData
                  ? <button className="btn btn-danger" onClick={removeCoupon}>Remove</button>
                  : <button className="btn btn-secondary" onClick={validateCoupon} disabled={!couponCode}>Apply</button>}
              </div>
              {couponError && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{couponError}</div>}
              {couponData && <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>✅ <strong>{couponData.coupon.code}</strong> — saving ${couponData.discountAmount.toFixed(2)}</div>}
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--gray)' }}>
                Available codes: <strong>SAVE10</strong> · <strong>SAVE20</strong> · <strong>FLAT5</strong> · <strong>WELCOME</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--gray)' }}>Course Price</span>
              <span>${course.price.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', color: 'var(--success)', fontSize: '0.9rem' }}>
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem 0', fontWeight: 800, fontSize: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${finalAmount.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={() => setStep('pay')}>
              Proceed to Pay →
            </button>
            <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.78rem', marginBottom: '1rem' }}>🔒 30-day money-back guarantee</p>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>
              <div style={{ marginBottom: '0.35rem' }}>✔ Lifetime access</div>
              <div style={{ marginBottom: '0.35rem' }}>✔ All devices</div>
              <div>✔ Certificate included</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
