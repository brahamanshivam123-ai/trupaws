import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({ onFindSitter, onBecomeSitter }) {
  return (
    <>
      <style>{`
        @keyframes gradientDrift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 1; }
          50%       { transform: translateY(-28px) scale(1.06); opacity: 0.8; }
        }
        @keyframes floatOrbReverse {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50%       { transform: translateY(22px) scale(0.95); opacity: 0.5; }
        }
        @keyframes heroScrollHint {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50%       { opacity: 0.9; transform: translateY(6px); }
        }
      `}</style>

      <section
        style={{
          position: 'relative',
          height: '100vh',
          minHeight: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 1.5rem',
          overflow: 'hidden',
          /* Animated dark forest gradient */
          background: 'linear-gradient(-45deg, #071505, #0A1F0A, #0E2A0E, #081A06, #0D2408)',
          backgroundSize: '400% 400%',
          animation: 'gradientDrift 20s ease infinite',
        }}
      >
        {/* Ambient orb — top left */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '8%',
            width: '520px',
            height: '520px',
            background: 'radial-gradient(circle, rgba(45,80,22,0.32) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'floatOrb 14s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        {/* Ambient orb — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '8%',
            right: '6%',
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(212,168,83,0.09) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'floatOrbReverse 18s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        {/* Ambient orb — center right */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(20,60,15,0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'floatOrb 10s ease-in-out infinite 3s',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(245,240,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        {/* Top-edge vignette */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '160px',
            background: 'linear-gradient(to bottom, rgba(7,21,5,0.6), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
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
              background: 'rgba(212,168,83,0.1)',
              border: '1px solid rgba(212,168,83,0.28)',
              borderRadius: '100px',
              padding: '0.4rem 1.1rem',
              marginBottom: '1.8rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#D4A853',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>🌲</span>
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
              lineHeight: 1.06,
              color: '#F5F0E8',
              marginBottom: '1.4rem',
              maxWidth: '800px',
              textShadow: '0 2px 60px rgba(0,0,0,0.5)',
            }}
          >
            Trusted Pet Care,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #D4A853 0%, #F5C842 45%, #C9952A 100%)',
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
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(245,240,232,0.68)',
              lineHeight: 1.7,
              maxWidth: '520px',
              margin: '0 auto 2.8rem',
              fontWeight: 300,
            }}
          >
            Premium pet sitters in Salmon Arm, Sicamous & surrounding Shuswap
            communities — neighbours you can trust.
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
            }}
          >
            <motion.button
              onClick={onFindSitter}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.55)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '50px',
                padding: '1rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 20px rgba(212,168,83,0.25)',
              }}
            >
              Find a Sitter
            </motion.button>
            <motion.button
              onClick={onBecomeSitter}
              whileHover={{ scale: 1.05, background: 'rgba(245,240,232,0.13)', borderColor: 'rgba(245,240,232,0.5)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'rgba(245,240,232,0.07)',
                color: '#F5F0E8',
                border: '1.5px solid rgba(245,240,232,0.28)',
                borderRadius: '50px',
                padding: '1rem 2.5rem',
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

          {/* Trust micro-copy */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            {['✓ Free to join', '✓ Verified sitters', '✓ Local community'].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: '0.78rem',
                  color: 'rgba(245,240,232,0.4)',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                }}
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Bottom scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            animation: 'heroScrollHint 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, transparent, rgba(212,168,83,0.5))',
            }}
          />
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(212,168,83,0.5)',
            }}
          />
        </div>

        {/* Bottom-edge fade into next section */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: 'linear-gradient(to bottom, transparent, #0D1B08)',
            pointerEvents: 'none',
          }}
        />
      </section>
    </>
  );
}
