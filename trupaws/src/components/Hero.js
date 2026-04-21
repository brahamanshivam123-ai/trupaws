import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG    = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&q=80';
const HOW_IMG     = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&q=80';
const FIND_IMG    = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80';

const HOW_STEPS = [
  {
    number: '01',
    title: 'Find a local sitter',
    desc:  'Browse verified sitters in your Shuswap neighbourhood. Filter by service, availability, and community reviews.',
  },
  {
    number: '02',
    title: 'Meet & Greet',
    desc:  'Connect directly, ask questions, and arrange a casual meet-and-greet so your pet feels at ease before you leave.',
  },
  {
    number: '03',
    title: 'Enjoy peace of mind',
    desc:  'Daily photo updates from a neighbour who lives close by. Relax completely, knowing your pet is in loving hands.',
  },
];

const TRUST_STATS = [
  { icon: '🏆', stat: "Salmon Arm's #1", label: 'pet platform' },
  { icon: '✓',  stat: 'Verified local',  label: 'sitters only'  },
  { icon: '🌲', stat: 'Neighbours',       label: 'you can trust' },
];

/* ── How It Works — step card ── */
function HowStep({ step, index }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: index * 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: '1 1 240px',
        maxWidth: '300px',
        textAlign: 'center',
        padding: '2rem 1.5rem 2.2rem',
        background: 'rgba(4,14,4,0.72)',
        border: '1px solid rgba(212,168,83,0.14)',
        borderRadius: '16px',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Large faded step number */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '4.5rem',
        fontWeight: 700,
        color: 'rgba(212,168,83,0.18)',
        lineHeight: 1,
        marginBottom: '0.5rem',
        userSelect: 'none',
      }}>
        {step.number}
      </div>

      {/* Gold rule */}
      <div style={{
        width: '36px',
        height: '2px',
        background: 'linear-gradient(90deg, #D4A853, #F5C842)',
        margin: '0 auto 1rem',
        borderRadius: '2px',
      }} />

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.3rem',
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: '0.7rem',
        lineHeight: 1.2,
      }}>
        {step.title}
      </h3>

      <p style={{
        fontSize: '0.9rem',
        color: 'rgba(245,240,232,0.55)',
        lineHeight: 1.75,
        fontWeight: 300,
      }}>
        {step.desc}
      </p>
    </motion.div>
  );
}

/* ── Trust stat card ── */
function TrustCard({ item, index }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: '1 1 200px',
        maxWidth: '280px',
        textAlign: 'center',
        padding: '2.4rem 1.8rem 2.6rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,168,83,0.12)',
        borderRadius: '16px',
      }}
    >
      <div style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: 1 }}>
        {item.icon}
      </div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
        fontWeight: 700,
        color: '#D4A853',
        lineHeight: 1.1,
        marginBottom: '0.3rem',
      }}>
        {item.stat}
      </div>
      <div style={{
        fontSize: '0.88rem',
        color: 'rgba(245,240,232,0.45)',
        fontWeight: 300,
        letterSpacing: '0.04em',
      }}>
        {item.label}
      </div>
    </motion.div>
  );
}

/* ── Section header — fades in via useInView ── */
function SectionHeader({ eyebrow, headline }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{
        fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#D4A853', marginBottom: '1rem',
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2rem, 5vw, 3.4rem)',
        fontWeight: 700,
        color: '#FFFFFF',
        lineHeight: 1.12,
        maxWidth: '580px',
        margin: '0 auto',
        textShadow: '0 4px 30px rgba(0,0,0,0.5)',
      }}>
        {headline}
      </h2>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   Main export
════════════════════════════════════════ */
export default function Hero({ user, onFindSitter, onBecomeSitter, onGoDashboard }) {
  const navigate  = useNavigate();
  const heroRef   = useRef(null);
  const heroBgRef = useRef(null);

  /* GSAP parallax on section 1 background */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(heroBgRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const trustItems = user
    ? [`Welcome back, ${user.name?.split(' ')[0]}!`, '✓ Your account is active', '✓ Local community']
    : ['✓ Free to join', '✓ Verified sitters', '✓ Local community'];

  return (
    <>
      <style>{`
        @keyframes heroScrollHint {
          0%, 100% { opacity: 0.45; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(8px); }
        }
        /* Disable fixed-attachment on touch devices to avoid iOS repaint bugs */
        @media (hover: none) {
          .parallax-fixed { background-attachment: scroll !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════
          SECTION 1 — Cinematic Hero
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          height: '100vh',
          minHeight: '680px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        {/* Parallax background — GSAP moves this div independently */}
        <div
          ref={heroBgRef}
          style={{
            position: 'absolute',
            top: '-12%',
            left: 0,
            right: 0,
            height: '124%',
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform',
          }}
        />

        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.38) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px',
          background: 'linear-gradient(to bottom, transparent, rgba(8,15,5,0.95))',
          pointerEvents: 'none',
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px', width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.38)',
              borderRadius: '100px', padding: '0.4rem 1.1rem', marginBottom: '1.8rem',
              fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#D4A853', backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>🌲</span>
            Shuswap Region, BC
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(3rem, 7vw, 7rem)',
              fontWeight: 700,
              lineHeight: 1.04,
              color: '#FFFFFF',
              marginBottom: '1.4rem',
              textShadow: '0 4px 50px rgba(0,0,0,0.55)',
            }}
          >
            Trusted Pet Care,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #D4A853 0%, #F5C842 45%, #C9952A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Close to Home
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(245,240,232,0.8)',
              lineHeight: 1.7,
              maxWidth: '520px',
              margin: '0 auto 2.8rem',
              fontWeight: 300,
              textShadow: '0 2px 16px rgba(0,0,0,0.45)',
            }}
          >
            Premium pet sitters in Salmon Arm, Sicamous & surrounding Shuswap
            communities — neighbours you can trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {user ? (
              <>
                <motion.button
                  onClick={onGoDashboard}
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                    color: '#1A1A1A', border: 'none', borderRadius: '50px',
                    padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.02em',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 4px 20px rgba(212,168,83,0.3)',
                  }}
                >
                  Go to My Dashboard →
                </motion.button>
                <motion.button
                  onClick={() => navigate('/browse')}
                  whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(255,255,255,0.1)', color: '#F5F0E8',
                    border: '1.5px solid rgba(255,255,255,0.38)', borderRadius: '50px',
                    padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 500,
                    cursor: 'pointer', backdropFilter: 'blur(8px)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Browse Sitters
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={onFindSitter}
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                    color: '#1A1A1A', border: 'none', borderRadius: '50px',
                    padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.02em',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 4px 20px rgba(212,168,83,0.3)',
                  }}
                >
                  Find a Sitter
                </motion.button>
                <motion.button
                  onClick={onBecomeSitter}
                  whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(255,255,255,0.1)', color: '#F5F0E8',
                    border: '1.5px solid rgba(255,255,255,0.38)', borderRadius: '50px',
                    padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 500,
                    cursor: 'pointer', backdropFilter: 'blur(8px)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Become a Sitter
                </motion.button>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.65 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap',
            }}
          >
            {trustItems.map((item) => (
              <span
                key={item}
                style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.42)', fontWeight: 400, letterSpacing: '0.04em' }}
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
            animation: 'heroScrollHint 2.5s ease-in-out infinite',
          }}>
            <div style={{
              width: '1px', height: '40px',
              background: 'linear-gradient(to bottom, transparent, rgba(212,168,83,0.65))',
            }} />
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: 'rgba(212,168,83,0.65)',
            }} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — How It Works
          Background: cozy dog at home (Unsplash 1601758228041)
          Step cards have semi-transparent dark green backdrop
      ════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
        }}
      >
        {/* CSS parallax background */}
        <div
          className="parallax-fixed"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HOW_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,12,4,0.72)' }} />

        {/* Edge vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top & bottom fades */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '180px',
          background: 'linear-gradient(to bottom, rgba(8,15,5,0.92), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px',
          background: 'linear-gradient(to top, rgba(8,15,5,0.92), transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '980px', width: '100%' }}>
          <SectionHeader eyebrow="How It Works" headline="Simple, local, and trusted" />

          <div style={{
            display: 'flex',
            gap: 'clamp(1.2rem, 3vw, 2rem)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 'clamp(3rem, 6vw, 5rem)',
          }}>
            {HOW_STEPS.map((step, i) => (
              <HowStep key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — Find Your Sitter
          Background: two dogs (Unsplash 1450778869180)
      ════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          minHeight: '600px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        {/* CSS parallax background */}
        <div
          className="parallax-fixed"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${FIND_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Layered overlays for drama */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top & bottom fades */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '200px',
          background: 'linear-gradient(to bottom, rgba(8,15,5,0.95), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
          background: 'linear-gradient(to top, rgba(10,31,10,0.98), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <FindSitterContent onFindSitter={onFindSitter} onBecomeSitter={onBecomeSitter} user={user} onGoDashboard={onGoDashboard} />
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — Trust Stats
          Solid dark forest green background
      ════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: '#0A1F0A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
          textAlign: 'center',
        }}
      >
        {/* Subtle top border glow */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.22), transparent)',
        }} />

        {/* Faint radial highlight */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,83,0.04) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', width: '100%' }}>
          <TrustSectionHeader />

          <div style={{
            display: 'flex',
            gap: 'clamp(1.2rem, 3vw, 2rem)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 'clamp(3rem, 6vw, 4.5rem)',
          }}>
            {TRUST_STATS.map((item, i) => (
              <TrustCard key={item.stat} item={item} index={i} />
            ))}
          </div>

          <TrustFooterCTA onFindSitter={onFindSitter} onBecomeSitter={onBecomeSitter} user={user} onGoDashboard={onGoDashboard} />
        </div>
      </section>
    </>
  );
}

/* ── Section 3 content — fades in on scroll ── */
function FindSitterContent({ onFindSitter, onBecomeSitter, user, onGoDashboard }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative', zIndex: 1, maxWidth: '720px', width: '100%' }}
    >
      <div style={{
        fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#D4A853', marginBottom: '1.2rem',
      }}>
        Ready to meet your sitter?
      </div>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
        fontWeight: 700,
        color: '#FFFFFF',
        lineHeight: 1.1,
        marginBottom: '1.4rem',
        textShadow: '0 4px 40px rgba(0,0,0,0.6)',
      }}>
        Trusted sitters in your neighbourhood
      </h2>

      <p style={{
        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
        color: 'rgba(245,240,232,0.7)',
        lineHeight: 1.75,
        maxWidth: '480px',
        margin: '0 auto 2.8rem',
        fontWeight: 300,
      }}>
        Every sitter on TruPaws is a local resident — vetted, reviewed, and within
        minutes of your home.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <motion.button
            onClick={onGoDashboard}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.55)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'linear-gradient(135deg, #D4A853, #B8892E)',
              color: '#1A1A1A', border: 'none', borderRadius: '50px',
              padding: '1.1rem 2.8rem', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.02em',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
            }}
          >
            Go to My Dashboard →
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={onFindSitter}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.55)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                color: '#1A1A1A', border: 'none', borderRadius: '50px',
                padding: '1.1rem 2.8rem', fontSize: '1rem', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.02em',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
              }}
            >
              Find a Sitter
            </motion.button>
            <motion.button
              onClick={onBecomeSitter}
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.18)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#F5F0E8',
                border: '1.5px solid rgba(255,255,255,0.38)', borderRadius: '50px',
                padding: '1.1rem 2.8rem', fontSize: '1rem', fontWeight: 500,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Become a Sitter
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Section 4 header ── */
function TrustSectionHeader() {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{
        fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#D4A853', marginBottom: '1rem',
      }}>
        Why TruPaws
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2rem, 5vw, 3.4rem)',
        fontWeight: 700,
        color: '#FFFFFF',
        lineHeight: 1.12,
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        Built for the Shuswap community
      </h2>
    </motion.div>
  );
}

/* ── Section 4 footer CTA ── */
function TrustFooterCTA({ onFindSitter, onBecomeSitter, user, onGoDashboard }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginTop: 'clamp(3.5rem, 7vw, 5.5rem)' }}
    >
      {/* Divider */}
      <div style={{
        width: '48px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.45), transparent)',
        margin: '0 auto 2.5rem',
      }} />

      <p style={{
        fontSize: '0.9rem',
        color: 'rgba(245,240,232,0.35)',
        marginBottom: '2rem',
        fontWeight: 300,
        letterSpacing: '0.02em',
      }}>
        Join your neighbours on TruPaws — it's free.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <motion.button
            onClick={onGoDashboard}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.4)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'linear-gradient(135deg, #D4A853, #B8892E)',
              color: '#1A1A1A', border: 'none', borderRadius: '50px',
              padding: '0.95rem 2.4rem', fontSize: '0.95rem', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.02em',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 20px rgba(212,168,83,0.25)',
            }}
          >
            Go to My Dashboard →
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={onFindSitter}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 36px rgba(212,168,83,0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                color: '#1A1A1A', border: 'none', borderRadius: '50px',
                padding: '0.95rem 2.4rem', fontSize: '0.95rem', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.02em',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 20px rgba(212,168,83,0.25)',
              }}
            >
              Find a Sitter
            </motion.button>
            <motion.button
              onClick={onBecomeSitter}
              whileHover={{ scale: 1.05, background: 'rgba(212,168,83,0.1)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent', color: 'rgba(245,240,232,0.55)',
                border: '1px solid rgba(212,168,83,0.2)', borderRadius: '50px',
                padding: '0.95rem 2.4rem', fontSize: '0.95rem', fontWeight: 500,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              Become a Sitter
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
