import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const testimonials = [
  {
    quote: "Jake looked after our horses and dogs while we were in Kelowna for two weeks. Daily photos, fence checks, everything. He treated our farm like it was his own.",
    name: "Linda & Tom R.",
    location: "Sicamous",
    pet: "2 horses, 3 dogs",
    avatar: "👩‍🌾",
  },
  {
    quote: "Priya noticed our elderly lab was limping on day two and called us right away. She took him to the vet herself. That kind of care can't be faked.",
    name: "Marcus W.",
    location: "Salmon Arm",
    pet: "Senior Labrador",
    avatar: "👨",
  },
  {
    quote: "As someone who moved here from Vancouver, I was nervous about finding trustworthy care. TruPaws connected me with Sarah down the street — literally a neighbour.",
    name: "Mei L.",
    location: "Chase",
    pet: "Two cats",
    avatar: "👩",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const containerRef = useRef();
  const inView = useInView(containerRef, { once: true, margin: '-100px' });

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((a) => (a + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[active];

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'rgba(13,27,8,0.98)',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D4A853',
            marginBottom: '2.5rem',
          }}
        >
          What Owners Say
        </div>

        <div style={{ position: 'relative', minHeight: '200px' }}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Quote mark */}
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '6rem',
                lineHeight: 0.5,
                color: 'rgba(212,168,83,0.2)',
                marginBottom: '1rem',
                userSelect: 'none',
              }}
            >
              "
            </div>

            <blockquote
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                fontWeight: 400,
                color: '#F5F0E8',
                lineHeight: 1.55,
                fontStyle: 'italic',
                marginBottom: '2rem',
              }}
            >
              {t.quote}
            </blockquote>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(45,80,22,0.6), rgba(212,168,83,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  border: '1.5px solid rgba(212,168,83,0.3)',
                }}
              >
                {t.avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '0.95rem' }}>{t.name}</div>
                <div style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.8rem' }}>
                  {t.location} · {t.pet}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === active ? '#D4A853' : 'rgba(245,240,232,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
