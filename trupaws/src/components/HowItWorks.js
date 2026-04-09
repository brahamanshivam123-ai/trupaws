import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: '📋',
    title: 'Post Your Need',
    description:
      'Tell us about your pets, dates, and preferences. Takes under 2 minutes — no account needed to browse.',
    accent: '#2D5016',
    glow: 'rgba(45,80,22,0.4)',
  },
  {
    number: '02',
    icon: '🤝',
    title: 'Match with a Neighbour',
    description:
      'We surface verified local sitters in your community. Read reviews, check backgrounds, video-chat before you commit.',
    accent: '#D4A853',
    glow: 'rgba(212,168,83,0.4)',
  },
  {
    number: '03',
    icon: '😌',
    title: 'Relax Completely',
    description:
      'Daily photo updates, GPS check-ins, and a 24/7 support line. Enjoy your time away knowing your family is loved.',
    accent: '#8B5E3C',
    glow: 'rgba(139,94,60,0.4)',
  },
];

function StepCard({ step, index }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: index * 0.18, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      style={{
        position: 'relative',
        background: 'rgba(245,240,232,0.04)',
        border: '1px solid rgba(245,240,232,0.1)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        flex: '1 1 260px',
        maxWidth: '340px',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* Background glow blob */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '140px',
          height: '140px',
          background: step.glow,
          borderRadius: '50%',
          filter: 'blur(50px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Step number */}
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '4.5rem',
          fontWeight: 700,
          color: step.accent,
          opacity: 0.2,
          lineHeight: 1,
          position: 'absolute',
          top: '1.2rem',
          right: '1.6rem',
          userSelect: 'none',
        }}
      >
        {step.number}
      </div>

      {/* Icon */}
      <div style={{ fontSize: '2.8rem', marginBottom: '1.2rem' }}>{step.icon}</div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.45rem',
          fontWeight: 600,
          color: '#F5F0E8',
          marginBottom: '0.85rem',
          lineHeight: 1.25,
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '0.95rem',
          color: 'rgba(245,240,232,0.65)',
          lineHeight: 1.7,
          fontWeight: 300,
        }}
      >
        {step.description}
      </p>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${step.accent}, transparent)`,
          borderRadius: '0 0 20px 20px',
        }}
      />
    </motion.div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef();
  const titleRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'linear-gradient(180deg, rgba(13,27,8,0.0) 0%, rgba(20,35,12,0.95) 15%, rgba(20,35,12,0.98) 85%, rgba(13,27,8,0.0) 100%)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Section label */}
      <div
        ref={titleRef}
        style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)', opacity: 0 }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D4A853',
            marginBottom: '1rem',
          }}
        >
          How It Works
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 700,
            color: '#F5F0E8',
            lineHeight: 1.15,
            maxWidth: '600px',
            margin: '0 auto 1.2rem',
          }}
        >
          As simple as texting a friend
        </h2>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'rgba(245,240,232,0.55)',
            maxWidth: '460px',
            margin: '0 auto',
            fontWeight: 300,
            lineHeight: 1.65,
          }}
        >
          No apps to download. No complicated forms. Just genuine local care, three steps away.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          gap: 'clamp(1rem, 3vw, 2rem)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>

      {/* Connector dots (desktop only) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '3rem',
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === 1 ? '#D4A853' : 'rgba(245,240,232,0.2)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  );
}
