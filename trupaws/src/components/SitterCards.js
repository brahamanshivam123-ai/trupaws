import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const sitters = [
  {
    name: 'Sarah M.',
    location: 'Salmon Arm',
    pets: 'Dogs & Cats',
    rate: '$28/day',
    rating: 5.0,
    reviews: 47,
    years: 3,
    avatar: '🧑‍🦰',
    tags: ['Overnight', 'Dog Walking', 'Senior Pets'],
    bio: "Born and raised in Salmon Arm. My golden retriever Maple and I have been welcoming furry guests for three years.",
    accentColor: '#2D5016',
    bgGradient: 'linear-gradient(135deg, rgba(45,80,22,0.25) 0%, rgba(45,80,22,0.08) 100%)',
  },
  {
    name: 'Jake T.',
    location: 'Sicamous',
    pets: 'All Animals',
    rate: '$32/day',
    rating: 4.9,
    reviews: 63,
    years: 5,
    avatar: '🧑‍🦱',
    tags: ['House Sitting', 'Farm Animals', 'Cats'],
    bio: "Former vet tech turned full-time sitter. I've cared for everything from guinea pigs to horses on the lake.",
    accentColor: '#D4A853',
    bgGradient: 'linear-gradient(135deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.06) 100%)',
  },
  {
    name: 'Priya K.',
    location: 'Chase',
    pets: 'Dogs & Small Pets',
    rate: '$25/day',
    rating: 5.0,
    reviews: 29,
    years: 2,
    avatar: '👩',
    tags: ['Puppy Care', 'Medication', 'Drop-in Visits'],
    bio: "Certified in pet first aid. I specialize in puppies and senior dogs who need extra patience and love.",
    accentColor: '#8B5E3C',
    bgGradient: 'linear-gradient(135deg, rgba(139,94,60,0.25) 0%, rgba(139,94,60,0.08) 100%)',
  },
  {
    name: 'Marcus D.',
    location: 'Enderby',
    pets: 'Dogs',
    rate: '$30/day',
    rating: 4.8,
    reviews: 81,
    years: 6,
    avatar: '👨',
    tags: ['Large Breeds', 'Adventure Walks', 'Agility'],
    bio: "Trail runner and dog dad to three Labs. Your high-energy dog will be exhausted and happy every single day.",
    accentColor: '#4a7a28',
    bgGradient: 'linear-gradient(135deg, rgba(74,122,40,0.22) 0%, rgba(74,122,40,0.07) 100%)',
  },
];

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1L7.4 4.2L11 4.7L8.5 7L9.2 10.5L6 8.8L2.8 10.5L3.5 7L1 4.7L4.6 4.2L6 1Z"
            fill={s <= Math.floor(rating) ? '#D4A853' : 'rgba(212,168,83,0.25)'}
          />
        </svg>
      ))}
      <span style={{ color: '#D4A853', fontWeight: 700, fontSize: '0.8rem', marginLeft: '4px' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function SitterCard({ sitter, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 70, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.9, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        background: sitter.bgGradient,
        border: `1px solid ${hovered ? sitter.accentColor + '80' : 'rgba(245,240,232,0.1)'}`,
        borderRadius: '24px',
        padding: '1.8rem',
        flex: '1 1 240px',
        maxWidth: '300px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}
      whileHover={{ y: -10, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* Glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          background: sitter.accentColor,
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Verified badge */}
      <div
        style={{
          position: 'absolute',
          top: '1.2rem',
          right: '1.2rem',
          background: 'rgba(45,80,22,0.8)',
          border: '1px solid rgba(74,122,40,0.5)',
          borderRadius: '100px',
          padding: '0.2rem 0.6rem',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#7BC67E',
        }}
      >
        ✓ Verified
      </div>

      {/* Avatar */}
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${sitter.accentColor}, ${sitter.accentColor}88)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1rem',
          border: `2px solid ${sitter.accentColor}60`,
        }}
      >
        {sitter.avatar}
      </div>

      {/* Name + location */}
      <div style={{ marginBottom: '0.6rem' }}>
        <h3 style={{ color: '#F5F0E8', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.2rem' }}>
          {sitter.name}
        </h3>
        <div style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.82rem', fontWeight: 400 }}>
          📍 {sitter.location} · {sitter.years}yr sitter
        </div>
      </div>

      <StarRating rating={sitter.rating} />
      <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: '0.75rem', marginTop: '2px', marginBottom: '0.9rem' }}>
        {sitter.reviews} reviews
      </div>

      {/* Bio */}
      <p style={{ fontSize: '0.87rem', color: 'rgba(245,240,232,0.65)', lineHeight: 1.6, marginBottom: '1.1rem', fontWeight: 300 }}>
        {sitter.bio}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.3rem' }}>
        {sitter.tags.map((tag) => (
          <span
            key={tag}
            style={{
              background: `${sitter.accentColor}30`,
              border: `1px solid ${sitter.accentColor}50`,
              borderRadius: '100px',
              padding: '0.2rem 0.7rem',
              fontSize: '0.72rem',
              color: '#F5F0E8',
              fontWeight: 500,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: sitter.accentColor === '#D4A853' ? '#D4A853' : '#D4A853', fontWeight: 700, fontSize: '1.05rem', fontFamily: "'Playfair Display', serif" }}>
          {sitter.rate}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: sitter.accentColor,
            color: '#F5F0E8',
            border: 'none',
            borderRadius: '50px',
            padding: '0.45rem 1.1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Message
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function SitterCards() {
  const titleRef = useRef();
  const inView = useInView(titleRef, { once: true, margin: '-80px' });

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'rgba(13,27,8,0.98)',
      }}
    >
      {/* Decorative top line */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(212,168,83,0.2)',
          paddingTop: 'clamp(5rem, 10vw, 8rem)',
        }}
      />

      {/* Title */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)', marginTop: '-4rem' }}
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
          Meet Your Neighbours
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 700,
            color: '#F5F0E8',
            lineHeight: 1.15,
            maxWidth: '640px',
            margin: '0 auto 1.2rem',
          }}
        >
          Sitters who actually know your street
        </h2>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'rgba(245,240,232,0.5)',
            maxWidth: '460px',
            margin: '0 auto',
            fontWeight: 300,
            lineHeight: 1.65,
          }}
        >
          Every sitter is background-checked, insured, and someone your pet can actually run up to with a wagging tail.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div
        style={{
          display: 'flex',
          gap: 'clamp(1rem, 2.5vw, 1.8rem)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '1300px',
          margin: '0 auto 3rem',
        }}
      >
        {sitters.map((sitter, i) => (
          <SitterCard key={sitter.name} sitter={sitter} index={i} />
        ))}
      </div>

      {/* View all CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{ textAlign: 'center' }}
      >
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(212,168,83,0.25)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'transparent',
            color: '#D4A853',
            border: '1.5px solid rgba(212,168,83,0.5)',
            borderRadius: '50px',
            padding: '0.85rem 2.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.02em',
          }}
        >
          Browse All 43 Sitters →
        </motion.button>
      </motion.div>
    </section>
  );
}
