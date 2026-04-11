import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user, onOpenModal, onSignOut }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Find a Sitter', action: () => onOpenModal?.('find') },
    { label: 'How It Works', action: null },
    { label: 'Become a Sitter', action: () => onOpenModal?.('become') },
    { label: 'About', action: null },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          height: scrolled ? '60px' : '80px',
          background: scrolled ? 'rgba(8,15,5,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(212,168,83,0.1)' : 'none',
          transition: 'height 0.3s ease, background 0.35s ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.45rem',
            fontWeight: 700,
            color: '#F5F0E8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🐾</span>
          Tru<span style={{ color: '#D4A853' }}>Paws</span>
        </div>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {navLinks.map((item) => (
            <motion.a
              key={item.label}
              onClick={item.action || undefined}
              whileHover={{ color: '#D4A853' }}
              style={{
                color: 'rgba(245,240,232,0.65)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: item.action ? 'pointer' : 'default',
                transition: 'color 0.2s',
              }}
            >
              {item.label}
            </motion.a>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'rgba(245,240,232,0.55)',
                }}
              >
                Hi,{' '}
                <strong style={{ color: '#F5F0E8' }}>
                  {user.name?.split(' ')[0]}
                </strong>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onSignOut}
                style={{
                  background: 'rgba(245,240,232,0.07)',
                  color: 'rgba(245,240,232,0.6)',
                  border: '1px solid rgba(245,240,232,0.14)',
                  borderRadius: '50px',
                  padding: '0.45rem 1.2rem',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Sign Out
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(212,168,83,0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenModal?.('find')}
              style={{
                background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '50px',
                padding: '0.55rem 1.5rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Get Started
            </motion.button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'none',
            flexDirection: 'column',
            gap: '5px',
            padding: '4px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={
                menuOpen
                  ? i === 0
                    ? { rotate: 45, y: 7 }
                    : i === 1
                    ? { opacity: 0, scaleX: 0 }
                    : { rotate: -45, y: -7 }
                  : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.22 }}
              style={{
                display: 'block',
                width: '24px',
                height: '2px',
                background: '#F5F0E8',
                borderRadius: '2px',
                transformOrigin: 'center',
              }}
            />
          ))}
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(8,15,5,0.97)',
              backdropFilter: 'blur(18px)',
              padding: '1.2rem 1.5rem 1.8rem',
              borderBottom: '1px solid rgba(212,168,83,0.12)',
            }}
          >
            {navLinks.map((item, i) => (
              <motion.a
                key={item.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setMenuOpen(false);
                  item.action?.();
                }}
                style={{
                  display: 'block',
                  padding: '0.85rem 0',
                  color: 'rgba(245,240,232,0.8)',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(245,240,232,0.06)',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </motion.a>
            ))}

            {user ? (
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.4)', fontWeight: 300 }}>
                  Signed in as <strong style={{ color: '#F5F0E8' }}>{user.name}</strong>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); onSignOut?.(); }}
                  style={{
                    background: 'rgba(245,240,232,0.07)',
                    color: 'rgba(245,240,232,0.7)',
                    border: '1px solid rgba(245,240,232,0.12)',
                    borderRadius: '50px',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); onOpenModal?.('find'); }}
                style={{
                  marginTop: '1.2rem',
                  width: '100%',
                  background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Get Started — It's Free
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
