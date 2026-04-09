import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          background: scrolled ? 'rgba(13,27,8,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(212,168,83,0.12)' : 'none',
          transition: 'height 0.3s ease, background 0.3s ease, backdrop-filter 0.3s ease',
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
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>🐾</span>
          Tru<span style={{ color: '#D4A853' }}>Paws</span>
        </div>

        {/* Desktop links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
          }}
          className="nav-desktop"
        >
          {['Find a Sitter', 'How It Works', 'Become a Sitter', 'About'].map((item) => (
            <motion.a
              key={item}
              whileHover={{ color: '#D4A853' }}
              style={{
                color: 'rgba(245,240,232,0.7)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(212,168,83,0.4)' }}
            whileTap={{ scale: 0.96 }}
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
            Sign In
          </motion.button>
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
                    ? { opacity: 0 }
                    : { rotate: -45, y: -7 }
                  : { rotate: 0, y: 0, opacity: 1 }
              }
              style={{
                display: 'block',
                width: '24px',
                height: '2px',
                background: '#F5F0E8',
                borderRadius: '2px',
              }}
            />
          ))}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(13,27,8,0.97)',
              backdropFilter: 'blur(16px)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
              borderBottom: '1px solid rgba(212,168,83,0.15)',
            }}
          >
            {['Find a Sitter', 'How It Works', 'Become a Sitter', 'About'].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.9rem 0',
                  color: 'rgba(245,240,232,0.85)',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(245,240,232,0.08)',
                  cursor: 'pointer',
                }}
              >
                {item}
              </motion.a>
            ))}
            <button
              style={{
                marginTop: '1.2rem',
                background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '50px',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Sign In
            </button>
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
