import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';

const SERVICES_MAP = {
  dog_walking: '🐕 Dog Walking',
  house_sitting: '🏠 House Sitting',
  overnight: '🌙 Overnight',
  drop_in: '📍 Drop-in Visits',
  cat_sitting: '🐱 Cat Sitting',
};

export default function SitterProfile({ user, onOpenModal, onGoHome, onGoBrowse, onGoDashboard }) {
  const { id } = useParams();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from('sitter_profiles')
      .select('*')
      .eq('user_id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setSitter(data);
        setLoading(false);
      });
  }, [id]);

  function handleContact() {
    if (!user) {
      onOpenModal('find');
    } else {
      onGoDashboard();
    }
  }

  const containerStyle = {
    background: '#F5F0E8',
    minHeight: '100vh',
    paddingBottom: 60,
    fontFamily: "'Inter', sans-serif",
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #2D5016 0%, #3d6b1f 100%)',
    padding: '20px 24px 40px',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <button type="button" onClick={onGoBrowse} style={backBtnStyle}>← Back to Browse</button>
        </div>
        <p style={{ textAlign: 'center', color: '#2D5016', padding: 40 }}>Loading...</p>
      </div>
    );
  }

  if (notFound || !sitter) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <button type="button" onClick={onGoBrowse} style={backBtnStyle}>← Back to Browse</button>
        </div>
        <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>Sitter not found.</p>
      </div>
    );
  }

  const services = Array.isArray(sitter.services) ? sitter.services : [];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ marginBottom: 24 }}>
          <button type="button" onClick={onGoBrowse} style={backBtnStyle}>← Back to Browse</button>
        </div>
      </div>

      {/* Profile card */}
      <div style={{ maxWidth: 700, margin: '-30px auto 0', padding: '0 20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 32px rgba(45,80,22,0.12)',
        }}>
          {/* Photo */}
          <div style={{
            height: 260,
            background: sitter.photo_url
              ? `url(${sitter.photo_url}) center/cover`
              : 'linear-gradient(135deg, #2D5016, #D4A853)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {!sitter.photo_url && <span style={{ fontSize: 72 }}>🐾</span>}
          </div>

          {/* Body */}
          <div style={{ padding: '28px 32px 36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, color: '#2D5016', fontSize: '1.8rem', fontWeight: 700 }}>
                  {sitter.display_name || 'Sitter'}
                </h1>
                {sitter.location && (
                  <p style={{ margin: '6px 0 0', color: '#888', fontSize: '0.9rem' }}>
                    📍 {sitter.location}
                  </p>
                )}
              </div>
              {sitter.rate && (
                <span style={{
                  background: '#D4A853', color: '#fff', borderRadius: 10,
                  padding: '6px 16px', fontSize: '1rem', fontWeight: 700,
                }}>
                  ${sitter.rate}/day
                </span>
              )}
            </div>

            {sitter.bio && (
              <p style={{ margin: '20px 0', color: '#444', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {sitter.bio}
              </p>
            )}

            {services.length > 0 && (
              <div>
                <p style={{ margin: '0 0 10px', color: '#2D5016', fontWeight: 600, fontSize: '0.9rem' }}>
                  Services offered
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services.map(s => (
                    <span key={s} style={{
                      background: '#F5F0E8', color: '#2D5016', border: '1px solid #2D5016',
                      borderRadius: 20, padding: '4px 14px', fontSize: '0.85rem', fontWeight: 500,
                    }}>
                      {SERVICES_MAP[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleContact}
              style={{
                marginTop: 32,
                background: '#2D5016', color: '#F5F0E8', border: 'none', borderRadius: 12,
                padding: '14px 0', width: '100%', fontSize: '1rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Contact Sitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const backBtnStyle = {
  background: 'rgba(245,240,232,0.15)',
  border: 'none',
  borderRadius: 8,
  color: '#F5F0E8',
  padding: '6px 14px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};
