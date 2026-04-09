import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: '340+', label: 'Bookings completed' },
  { value: '98%', label: 'Owner satisfaction' },
  { value: '43', label: 'Verified local sitters' },
  { value: '4.97', label: 'Average rating' },
];

export default function TrustBar() {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'linear-gradient(135deg, rgba(45,80,22,0.3) 0%, rgba(139,94,60,0.2) 100%)',
        borderTop: '1px solid rgba(212,168,83,0.15)',
        borderBottom: '1px solid rgba(212,168,83,0.15)',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          gap: 'clamp(2rem, 5vw, 4rem)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', minWidth: '120px' }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2.2rem, 5vw, 3rem)',
                fontWeight: 700,
                color: '#D4A853',
                lineHeight: 1,
                marginBottom: '0.4rem',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'rgba(245,240,232,0.55)',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
