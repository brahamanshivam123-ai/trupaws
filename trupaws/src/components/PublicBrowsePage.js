import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const LOCATIONS = [
  'Salmon Arm', 'Sicamous', 'Chase', 'Enderby', 'Armstrong',
  'Sorrento', 'Tappen', 'Blind Bay', 'Celista', 'Anglemont',
  'Falkland', 'Grindrod',
];

// Deterministic avatar colour from name
const AVATAR_COLOURS = ['#1C3A1C', '#1A3228', '#243A18', '#1A2840', '#2A1C38'];
function avatarColour(name = '') {
  return AVATAR_COLOURS[name.charCodeAt(0) % AVATAR_COLOURS.length];
}
function initials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

/* ── Single sitter card ── */
function SitterCard({ sitter, index, onContact }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.42), ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(212,168,83,0.22)' : 'rgba(212,168,83,0.09)'}`,
        borderRadius: '18px',
        padding: '1.6rem 1.4rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'background 0.2s, border-color 0.2s',
        cursor: 'default',
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          flexShrink: 0,
          background: avatarColour(sitter.name),
          border: '2px solid rgba(212,168,83,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#D4A853',
          userSelect: 'none',
        }}>
          {initials(sitter.name)}
        </div>
        <div>
          <div style={{
            fontWeight: 600,
            fontSize: '1rem',
            color: '#F5F0E8',
            fontFamily: "'Inter', sans-serif",
          }}>
            {sitter.name}
          </div>
          {sitter.location && (
            <div style={{
              fontSize: '0.74rem',
              color: 'rgba(245,240,232,0.38)',
              marginTop: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.28rem',
            }}>
              <span style={{ fontSize: '0.78rem' }}>📍</span>
              {sitter.location}
            </div>
          )}
        </div>

        {/* Verified badge */}
        <div style={{
          marginLeft: 'auto',
          flexShrink: 0,
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.22)',
          borderRadius: '100px',
          padding: '0.22rem 0.6rem',
          fontSize: '0.62rem',
          fontWeight: 600,
          color: 'rgba(34,197,94,0.8)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          ✓ Verified
        </div>
      </div>

      {/* Bio */}
      <div style={{
        fontSize: '0.86rem',
        color: 'rgba(245,240,232,0.42)',
        lineHeight: 1.7,
        fontWeight: 300,
        flexGrow: 1,
      }}>
        {sitter.bio ||
          'Trusted local pet sitter in the Shuswap community, dedicated to keeping your furry family members happy and safe.'}
      </div>

      {/* Service tags — placeholder until sitters fill their profiles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {['Dog sitting', 'Home visits', 'Daily walks'].map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: '0.7rem',
              padding: '0.25rem 0.65rem',
              background: 'rgba(212,168,83,0.07)',
              border: '1px solid rgba(212,168,83,0.14)',
              borderRadius: '100px',
              color: 'rgba(212,168,83,0.7)',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Contact CTA */}
      <motion.button
        onClick={() => onContact(sitter)}
        whileHover={{ scale: 1.025, boxShadow: '0 6px 28px rgba(212,168,83,0.32)' }}
        whileTap={{ scale: 0.975 }}
        style={{
          background: 'linear-gradient(135deg, #D4A853, #B8892E)',
          color: '#1A1A1A',
          border: 'none',
          borderRadius: '50px',
          padding: '0.72rem 1rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.01em',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}
      >
        Contact {sitter.name?.split(' ')[0] || 'Sitter'}
        <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>→</span>
      </motion.button>
    </motion.div>
  );
}

/* ── Loading skeleton ── */
function LoadingState() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
      gap: '1.4rem',
    }}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          style={{
            height: '280px',
            borderRadius: '18px',
            background: 'rgba(245,240,232,0.04)',
            border: '1px solid rgba(245,240,232,0.06)',
            animation: `pulse ${1.4 + n * 0.1}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ hasFilter, onClearFilter }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 1.5rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.35 }}>🐾</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.3rem',
        fontWeight: 700,
        color: 'rgba(245,240,232,0.5)',
        marginBottom: '0.6rem',
      }}>
        {hasFilter ? 'No sitters in that area yet' : 'No sitters listed yet'}
      </div>
      <p style={{
        fontSize: '0.85rem',
        color: 'rgba(245,240,232,0.28)',
        lineHeight: 1.7,
        maxWidth: '320px',
        fontWeight: 300,
        marginBottom: hasFilter ? '1.5rem' : 0,
      }}>
        {hasFilter
          ? 'Try browsing all areas or check back soon as more sitters join.'
          : 'Sitters are joining every week. Check back soon — or become the first sitter in your area.'}
      </p>
      {hasFilter && (
        <motion.button
          onClick={onClearFilter}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(212,168,83,0.3)',
            borderRadius: '50px',
            padding: '0.6rem 1.4rem',
            color: '#D4A853',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Show all areas
        </motion.button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Main export
════════════════════════════════════════ */
export default function PublicBrowsePage({ onClose, onContact }) {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, location, bio, role')
        .eq('role', 'sitter')
        .order('name', { ascending: true });

      if (!error && data) setSitters(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredSitters = locationFilter
    ? sitters.filter((s) => s.location === locationFilter)
    : sitters;

  // Only show locations that have at least one sitter
  const availableLocations = LOCATIONS.filter((loc) =>
    sitters.some((s) => s.location === loc)
  );

  return (
    <>
      <style>{`
        @keyframes pulse {
          from { opacity: 0.4; }
          to   { opacity: 0.7; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: '#080F05',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* ── Sticky header ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(8,15,5,0.96)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(212,168,83,0.1)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          {/* Logo / title */}
          <div
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <span style={{ fontSize: '1.4rem' }}>🐾</span>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.05rem',
              color: '#D4A853',
            }}>
              TruPaws
            </div>
          </div>

          {/* Title */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '0.95rem',
            color: 'rgba(245,240,232,0.55)',
            flexShrink: 0,
          }}>
            · Browse Local Sitters
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Location filter */}
          {availableLocations.length > 1 && (
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                background: locationFilter ? 'rgba(212,168,83,0.1)' : 'rgba(245,240,232,0.05)',
                border: `1px solid ${locationFilter ? 'rgba(212,168,83,0.3)' : 'rgba(245,240,232,0.1)'}`,
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                color: locationFilter ? '#D4A853' : 'rgba(245,240,232,0.45)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <option value="" style={{ background: '#0A1A09', color: '#F5F0E8' }}>All areas</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} style={{ background: '#0A1A09', color: '#F5F0E8' }}>
                  {loc}
                </option>
              ))}
            </select>
          )}

          {/* Close */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.08, background: 'rgba(245,240,232,0.1)' }}
            whileTap={{ scale: 0.92 }}
            style={{
              background: 'rgba(245,240,232,0.06)',
              border: '1px solid rgba(245,240,232,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              flexShrink: 0,
              cursor: 'pointer',
              color: 'rgba(245,240,232,0.55)',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </motion.button>
        </div>

        {/* ── Page content ── */}
        <div style={{
          flex: 1,
          padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.2rem, 5vw, 4rem)',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}>

          {/* Hero line */}
          {!loading && sitters.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 700,
                color: '#F5F0E8',
                marginBottom: '0.5rem',
                lineHeight: 1.15,
              }}>
                {locationFilter ? `Sitters in ${locationFilter}` : 'Local Sitters Near You'}
              </h1>
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(245,240,232,0.32)',
                fontWeight: 300,
              }}>
                {filteredSitters.length} verified sitter{filteredSitters.length !== 1 ? 's' : ''} · No signup needed to browse
              </p>
            </div>
          )}

          {loading ? (
            <LoadingState />
          ) : filteredSitters.length === 0 ? (
            <EmptyState
              hasFilter={!!locationFilter}
              onClearFilter={() => setLocationFilter('')}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 265px), 1fr))',
              gap: '1.4rem',
            }}>
              {filteredSitters.map((sitter, i) => (
                <SitterCard
                  key={sitter.id}
                  sitter={sitter}
                  index={i}
                  onContact={onContact}
                />
              ))}
            </div>
          )}
        </div>

        {/* Subtle bottom note */}
        {!loading && sitters.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            borderTop: '1px solid rgba(245,240,232,0.05)',
            fontSize: '0.76rem',
            color: 'rgba(245,240,232,0.2)',
            fontWeight: 300,
          }}>
            Browsing is always free · Sign up only when you're ready to connect
          </div>
        )}
      </motion.div>
    </>
  );
}
