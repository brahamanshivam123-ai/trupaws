import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 2,
        background: '#080F05',
        borderTop: '1px solid rgba(212,168,83,0.12)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem) 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#F5F0E8',
              marginBottom: '0.8rem',
            }}
          >
            🐾 Tru<span style={{ color: '#D4A853' }}>Paws</span>
          </div>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'rgba(245,240,232,0.45)',
              lineHeight: 1.7,
              maxWidth: '220px',
              fontWeight: 300,
            }}
          >
            Premium pet sitting for the Shuswap region. Built for small towns where trust matters most.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
            {['𝕏', 'in', 'f'].map((icon) => (
              <motion.div
                key={icon}
                whileHover={{ scale: 1.15, color: '#D4A853' }}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(245,240,232,0.07)',
                  border: '1px solid rgba(245,240,232,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  color: 'rgba(245,240,232,0.5)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'color 0.2s',
                }}
              >
                {icon}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          {
            title: 'Services',
            links: ['Dog Walking', 'House Sitting', 'Puppy Care', 'Senior Pets', 'Farm Animals'],
          },
          {
            title: 'Locations',
            links: ['Salmon Arm', 'Sicamous', 'Chase', 'Enderby', 'Armstrong'],
          },
          {
            title: 'Company',
            links: ['About Us', 'How It Works', 'Safety', 'Become a Sitter', 'Contact'],
          },
        ].map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#D4A853',
                marginBottom: '1.1rem',
              }}
            >
              {col.title}
            </div>
            {col.links.map((link) => (
              <motion.div
                key={link}
                whileHover={{ x: 4, color: '#F5F0E8' }}
                style={{
                  fontSize: '0.9rem',
                  color: 'rgba(245,240,232,0.45)',
                  marginBottom: '0.6rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  fontWeight: 300,
                }}
              >
                {link}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(245,240,232,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'rgba(245,240,232,0.28)', fontWeight: 300 }}>
          © 2025 TruPaws · Shuswap Region, British Columbia
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy', 'Terms', 'Cookies'].map((item) => (
            <motion.span
              key={item}
              whileHover={{ color: '#D4A853' }}
              style={{
                fontSize: '0.8rem',
                color: 'rgba(245,240,232,0.28)',
                cursor: 'pointer',
                fontWeight: 300,
                transition: 'color 0.2s',
              }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </footer>
  );
}
