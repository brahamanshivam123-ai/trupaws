import React, { useState } from 'react';
import { supabase } from '../supabase';

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  color: '#2D5016',
  fontSize: '0.85rem',
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
};

const inputStyle = {
  width: '100%',
  background: '#fff',
  border: '1.5px solid rgba(45,80,22,0.2)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: '0.9rem',
  color: '#333',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
};

export default function BookingForm({ sitter, user, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function calcDays() {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  }

  const days = calcDays();
  const totalPrice = days * (sitter.rate || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!startDate || !endDate || days === 0) {
      setError('Please select a valid start and end date.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: dbError } = await supabase.from('bookings').insert({
      pet_owner_id: user.id,
      sitter_id: sitter.user_id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      notes,
      status: 'pending',
    });
    setLoading(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess(true);
      setTimeout(() => onSuccess(), 1600);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#F5F0E8',
          borderRadius: 20,
          padding: '36px 32px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 8px 48px rgba(45,80,22,0.25)',
          position: 'relative',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 18,
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#888',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🐾</div>
            <h2 style={{ color: '#2D5016', margin: '0 0 8px', fontFamily: "'Playfair Display', serif" }}>
              Request sent!
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              {sitter.display_name} will confirm your booking soon.
            </p>
          </div>
        ) : (
          <>
            <h2
              style={{
                margin: '0 0 4px',
                color: '#2D5016',
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.5rem',
              }}
            >
              Book {sitter.display_name}
            </h2>
            <p style={{ margin: '0 0 24px', color: '#888', fontSize: '0.88rem' }}>
              ${sitter.rate}/day
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Pet details, special instructions..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {days > 0 && (
                <div
                  style={{
                    background: 'rgba(45,80,22,0.07)',
                    border: '1px solid rgba(45,80,22,0.15)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#2D5016', fontSize: '0.9rem' }}>
                    {days} day{days !== 1 ? 's' : ''} × ${sitter.rate}/day
                  </span>
                  <span style={{ color: '#2D5016', fontWeight: 700, fontSize: '1.1rem' }}>
                    ${totalPrice}
                  </span>
                </div>
              )}

              {error && (
                <p style={{ color: '#c0392b', fontSize: '0.85rem', margin: '0 0 14px' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#2D5016',
                  color: '#F5F0E8',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {loading ? 'Sending…' : 'Send Booking Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
