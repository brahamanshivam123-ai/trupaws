import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import SitterMap from '../components/SitterMap';

const SERVICES_MAP = {
  dog_walking: '🐕 Dog Walking',
  house_sitting: '🏠 House Sitting',
  overnight: '🌙 Overnight',
  drop_in: '📍 Drop-in Visits',
  cat_sitting: '🐱 Cat Sitting',
};

// Public browse page — no login required to view sitters.
// onOpenModal is only called when an unauthenticated user clicks Contact Sitter.
export default function BrowseSitters({ user, onOpenModal, onGoHome, onGoDashboard }) {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch runs on mount only. No auth check — publicly readable.
  useEffect(() => {
    supabase
      .from('sitter_profiles')
      .select('*, profiles(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setSitters(data);
        setLoading(false);
      });
  }, []);

  // Only called from the Contact button click handler — never on load.
  function handleContact(sitterUserId) {
    if (user == null) {
      onOpenModal('find');
    } else {
      onGoDashboard();
    }
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', padding: '0 0 60px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2D5016 0%, #3d6b1f 100%)',
        padding: '20px 24px 40px',
      }}>
        {/* Back row — separate from animated title to avoid stacking conflicts */}
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={onGoHome}
            style={{
              background: 'rgba(245,240,232,0.15)', border: 'none', borderRadius: 8,
              color: '#F5F0E8', padding: '6px 14px', fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            ← Back
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#F5F0E8', fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            Find a Trusted Sitter Near You
          </h1>
          <p style={{ color: '#D4A853', marginTop: 10, fontSize: '1.05rem', marginBottom: 0 }}>
            Salmon Arm · Sicamous · Shuswap BC
          </p>
        </div>
      </div>

      {/* Sitter grid */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        {!loading && sitters.some((s) => s.location || (s.lat && s.lng)) && (
          <SitterMap sitters={sitters} />
        )}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#2D5016' }}>Loading sitters...</p>
        ) : sitters.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No sitters listed yet — check back soon!</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {sitters.map((sitter, i) => (
              <SitterCard
                key={sitter.id}
                sitter={sitter}
                index={i}
                onContact={() => handleContact(sitter.id)}
                onViewProfile={() => navigate(`/sitter/${sitter.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SitterCard({ sitter, index, onContact, onViewProfile }) {
  const services = Array.isArray(sitter.services) ? sitter.services : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(45,80,22,0.10)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo */}
      <div style={{
        height: 180,
        background: sitter.photo_url
          ? `url(${sitter.photo_url}) center/cover`
          : 'linear-gradient(135deg, #2D5016, #D4A853)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {!sitter.photo_url && <span style={{ fontSize: 56 }}>🐾</span>}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0, color: '#2D5016', fontSize: '1.15rem' }}>
            {sitter.profiles?.name || sitter.display_name || 'Sitter'}
          </h3>
          {sitter.rate && (
            <span style={{
              background: '#D4A853', color: '#fff', borderRadius: 8,
              padding: '3px 10px', fontSize: '0.85rem', fontWeight: 600,
            }}>
              ${sitter.rate}/day
            </span>
          )}
        </div>

        {sitter.location && (
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>
            📍 {sitter.location}
          </p>
        )}

        {sitter.bio && (
          <p style={{
            margin: '12px 0', color: '#444', fontSize: '0.9rem', lineHeight: 1.5, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {sitter.bio}
          </p>
        )}

        {services.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {services.map(s => (
              <span key={s} style={{
                background: '#F5F0E8', color: '#2D5016', border: '1px solid #2D5016',
                borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 500,
              }}>
                {SERVICES_MAP[s] || s}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button
            type="button"
            onClick={onViewProfile}
            style={{
              background: 'transparent', color: '#2D5016', border: '1.5px solid #2D5016',
              borderRadius: 10, padding: '11px 0', flex: 1, fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View Profile
          </button>
          <button
            type="button"
            onClick={onContact}
            style={{
              background: '#2D5016', color: '#F5F0E8', border: 'none', borderRadius: 10,
              padding: '11px 0', flex: 1, fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Contact
          </button>
        </div>
      </div>
    </motion.div>
  );
}
