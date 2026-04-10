import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({ scrollY }) {
  const taglineRef = useRef();

  useEffect(() => {
    // Parallax on scroll
    const onScroll = () => {
      if (taglineRef.current) {
        gsap.set(taglineRef.current, { y: window.scrollY * 0.25, opacity: 1 - window.scrollY / 600 });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 1.5rem',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {/* Radial vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(13,27,8,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div ref={taglineRef} style={{ position: 'relative', zIndex: 2 }}>
        {/* Region badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(212,168,83,0.15)',
            border: '1px solid rgba(212,168,83,0.35)',
            borderRadius: '100px',
            padding: '0.35rem 1rem',
            marginBottom: '1.8rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#D4A853',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: '1rem' }}>🌲</span>
          Shuswap Region, BC
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1.08,
            color: '#F5F0E8',
            marginBottom: '1.4rem',
            maxWidth: '780px',
            textShadow: '0 2px 40px rgba(0,0,0,0.6)',
          }}
        >
          Trusted Pet Care,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #D4A853 0%, #F5C842 50%, #D4A853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Close to Home
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(245,240,232,0.75)',
            lineHeight: 1.65,
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
            fontWeight: 300,
          }}
        >
          Premium pet sitters and house sitters in Salmon Arm, Sicamous & surrounding
          Shuswap communities — neighbours you can trust.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            pointerEvents: 'auto',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(212,168,83,0.5)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'linear-gradient(135deg, #D4A853, #B8892E)',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '50px',
              padding: '0.9rem 2.2rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Find a Sitter
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(245,240,232,0.12)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'rgba(245,240,232,0.07)',
              color: '#F5F0E8',
              border: '1.5px solid rgba(245,240,232,0.3)',
              borderRadius: '50px',
              padding: '0.9rem 2.2rem',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Become a Sitter
          </motion.button>
        </motion.div>
      </div>

    </section>
  );
}
