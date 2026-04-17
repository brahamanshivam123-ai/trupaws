import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import ChatPanel from './ChatPanel';

// Pick a deterministic emoji avatar from a UUID's first hex char
const AVATARS = ['👩','🧑','👨','👩‍🦰','👨‍🦱','👩‍🦱','👨‍🌾','👩‍💼','🧑‍🦱','👩‍🦳'];
function avatarFor(id) {
  return AVATARS[parseInt((id || '0')[0], 16) % AVATARS.length];
}

const MOCK_SITTERS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'Salmon Arm',
    emoji: '👩',
    rating: 4.9,
    reviews: 47,
    services: ['Dog Walking', 'House Sitting', 'Puppy Care'],
    rate: 35,
    bio: 'Lifelong animal lover with 8 years of pet care experience. I treat every pet like my own family.',
    available: true,
    badge: 'Top Sitter',
  },
  {
    id: 2,
    name: 'Tom Bergstrom',
    location: 'Sicamous',
    emoji: '🧑',
    rating: 4.8,
    reviews: 31,
    services: ['House Sitting', 'Dog Walking', 'Senior Pets'],
    rate: 30,
    bio: 'Retired vet tech with a calm, professional approach. Specializing in senior dogs and cats.',
    available: true,
    badge: 'Verified',
  },
  {
    id: 3,
    name: 'Emma Larsen',
    location: 'Chase',
    emoji: '👩‍🦰',
    rating: 5.0,
    reviews: 18,
    services: ['Puppy Care', 'Dog Walking'],
    rate: 28,
    bio: 'Energetic and patient with young dogs. Your pup will be exhausted and happy every day!',
    available: false,
    badge: '5★ Rating',
  },
  {
    id: 4,
    name: 'Lucas Vance',
    location: 'Salmon Arm',
    emoji: '👨‍🌾',
    rating: 4.7,
    reviews: 55,
    services: ['House Sitting', 'Farm Animals', 'Dog Walking'],
    rate: 40,
    bio: 'Farm-raised and comfortable with all animals including horses, goats, chickens, and dogs.',
    available: true,
    badge: 'Farm Specialist',
  },
  {
    id: 5,
    name: 'Priya Sharma',
    location: 'Enderby',
    emoji: '👩‍🦱',
    rating: 4.9,
    reviews: 22,
    services: ['Cat Sitting', 'Dog Walking', 'Puppy Care'],
    rate: 27,
    bio: 'Gentle with anxious animals. I send daily photo updates so you never have to worry.',
    available: true,
    badge: 'Verified',
  },
  {
    id: 6,
    name: 'Declan McRae',
    location: 'Sorrento',
    emoji: '👨‍🦱',
    rating: 4.6,
    reviews: 12,
    services: ['Overnight Stays', 'House Sitting', 'Dog Walking'],
    rate: 45,
    bio: 'Your dog sleeps in my home, not a kennel. Overnight stays with full care and big morning walks.',
    available: true,
    badge: 'New',
  },
];

const LOCATIONS = ['All Areas', 'Salmon Arm', 'Sicamous', 'Chase', 'Enderby', 'Armstrong', 'Sorrento'];

export default function PetOwnerDashboard({ user, onSignOut, onGoHome }) {
  const [bookings, setBookings] = useState([]);
  const [sitters, setSitters] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Areas');
  const [contactedId, setContactedId] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Unread message count + real-time badge
  useEffect(() => {
    if (!user?.id) return;
    const loadUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .is('read_at', null);
      setUnreadCount(count || 0);
    };
    loadUnread();

    const channel = supabase
      .channel(`unread-owner-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => setUnreadCount((n) => n + 1)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('bookings')
      .select('*, sitter_profiles(display_name)')
      .eq('pet_owner_id', user.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => setBookings(data || []));
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);

      const { data, error } = await supabase
        .from('sitter_profiles')
        .select('*, profiles!inner(name, location)')
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        // Shape Supabase rows into the card format
        setSitters(
          data.map((s) => ({
            id:       s.id,
            name:     s.profiles?.name     || 'Unknown',
            location: s.profiles?.location || 'Shuswap',
            emoji:    avatarFor(s.id),
            rating:   null,
            reviews:  0,
            services: s.services     || [],
            rate:     s.rate         || 0,
            bio:      s.bio          || 'Local pet sitter in the Shuswap.',
            available: true,
            badge:    s.is_verified  ? 'Verified' : 'New',
          }))
        );
        setUsingMock(false);
      } else {
        // No live sitters yet — show mock data so the page isn't empty
        setSitters(MOCK_SITTERS);
        setUsingMock(true);
      }

      setLoadingData(false);
    };
    load();
  }, []);

  const filtered = sitters.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.services.some((sv) => sv.toLowerCase().includes(term));
    const matchesLocation =
      locationFilter === 'All Areas' || s.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#080F05', color: '#F5F0E8' }}>
      {/* Top navbar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,15,5,0.96)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(212,168,83,0.1)',
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.button
            onClick={onGoHome}
            whileHover={{ x: -2, color: '#D4A853' }}
            whileTap={{ scale: 0.93 }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(245,240,232,0.4)', fontSize: '1.1rem',
              padding: '0.2rem 0.1rem', lineHeight: 1, display: 'flex', alignItems: 'center',
            }}
            title="Back to home"
          >
            ←
          </motion.button>
          <div
            onClick={onGoHome}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.3rem', fontWeight: 700, color: '#F5F0E8',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              cursor: 'pointer', userSelect: 'none',
            }}
          >
            🐾 Tru<span style={{ color: '#D4A853' }}>Paws</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              fontSize: '0.82rem',
              color: 'rgba(245,240,232,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#4ade80',
                display: 'inline-block',
              }}
            />
            <span>
              Hi,{' '}
              <strong style={{ color: '#F5F0E8' }}>
                {user?.name?.split(' ')[0]}
              </strong>{' '}
              · {user?.location}
            </span>
          </div>
          {/* Messages button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setChatOpen(true); setChatRecipient(null); setUnreadCount(0); }}
            style={{
              position: 'relative',
              background: chatOpen ? 'rgba(212,168,83,0.14)' : 'rgba(245,240,232,0.06)',
              border: `1px solid ${chatOpen ? 'rgba(212,168,83,0.35)' : 'rgba(245,240,232,0.1)'}`,
              borderRadius: '50px',
              padding: '0.4rem 1rem',
              color: chatOpen ? '#D4A853' : 'rgba(245,240,232,0.55)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
          >
            💬 Messages
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#D4A853',
                  color: '#1A1A1A',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #080F05',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSignOut}
            style={{
              background: 'rgba(245,240,232,0.06)',
              border: '1px solid rgba(245,240,232,0.1)',
              borderRadius: '50px',
              padding: '0.4rem 1.1rem',
              color: 'rgba(245,240,232,0.55)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign Out
          </motion.button>
        </div>
      </nav>

      <div
        style={{
          maxWidth: '1140px',
          margin: '0 auto',
          padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2rem)',
        }}
      >
        {/* My Bookings */}
        {bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#F5F0E8', marginBottom: '1rem' }}>
              My Bookings
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {bookings.map((b) => {
                const statusColors = {
                  pending:   { bg: 'rgba(212,168,83,0.15)',  border: 'rgba(212,168,83,0.4)',  text: '#D4A853' },
                  accepted:  { bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.35)', text: '#4ade80' },
                  completed: { bg: 'rgba(245,240,232,0.06)', border: 'rgba(245,240,232,0.15)',text: 'rgba(245,240,232,0.45)' },
                  cancelled: { bg: 'rgba(220,38,38,0.1)',    border: 'rgba(220,38,38,0.3)',   text: '#f87171' },
                };
                const sc = statusColors[b.status] || statusColors.pending;
                return (
                  <div
                    key={b.id}
                    style={{
                      background: 'rgba(245,240,232,0.04)',
                      border: '1px solid rgba(245,240,232,0.08)',
                      borderRadius: 14,
                      padding: '1rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#F5F0E8', fontSize: '0.95rem' }}>
                        {b.sitter_profiles?.display_name || 'Sitter'}
                      </div>
                      <div style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.8rem', marginTop: 2 }}>
                        {b.start_date} → {b.end_date}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#D4A853', fontWeight: 700, fontSize: '0.95rem' }}>
                        ${b.total_price}
                      </span>
                      <span style={{
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        color: sc.text,
                        borderRadius: 20,
                        padding: '3px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '2rem' }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
              fontWeight: 700,
              color: '#F5F0E8',
              marginBottom: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            Find Your Perfect Sitter
          </h1>
          <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.95rem', fontWeight: 300 }}>
            {loadingData ? 'Loading sitters…' : `${filtered.length} trusted sitters serving ${locationFilter === 'All Areas' ? 'the Shuswap' : locationFilter}`}
          </p>
        </motion.div>

        {/* Mock-data notice — shown only when no live sitters exist yet */}
        <AnimatePresence>
          {usingMock && !loadingData && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(212,168,83,0.07)',
                border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: '12px',
                padding: '0.7rem 1.1rem',
                marginBottom: '1.8rem',
                fontSize: '0.82rem',
                color: 'rgba(212,168,83,0.8)',
                fontWeight: 400,
              }}
            >
              <span>✨</span>
              <span>
                Showing sample sitters — real profiles will appear here once sitters sign up in your area.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            gap: '0.85rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search input */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '200px' }}>
            <span
              style={{
                position: 'absolute',
                left: '1.05rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.95rem',
                pointerEvents: 'none',
                opacity: 0.4,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(245,240,232,0.05)',
                border: '1px solid rgba(245,240,232,0.1)',
                borderRadius: '50px',
                padding: '0.8rem 1rem 0.8rem 2.8rem',
                color: '#F5F0E8',
                fontSize: '0.88rem',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Location filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              background: 'rgba(245,240,232,0.05)',
              border: '1px solid rgba(245,240,232,0.1)',
              borderRadius: '50px',
              padding: '0.8rem 1.3rem',
              color: '#F5F0E8',
              fontSize: '0.88rem',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(245,240,232,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem',
            }}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc} style={{ background: '#080F05' }}>
                {loc}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.4rem',
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((sitter, i) => (
              <motion.div
                key={sitter.id}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.48, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.22 } }}
                style={{
                  background: 'rgba(245,240,232,0.035)',
                  border: '1px solid rgba(245,240,232,0.08)',
                  borderRadius: '20px',
                  padding: '1.7rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                }}
              >
                {/* Subtle glow on available sitters */}
                {sitter.available && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: 'radial-gradient(circle at 100% 0%, rgba(74,222,128,0.06) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1.1rem',
                    right: '1.1rem',
                    background: 'rgba(212,168,83,0.12)',
                    border: '1px solid rgba(212,168,83,0.28)',
                    borderRadius: '20px',
                    padding: '0.18rem 0.6rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#D4A853',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {sitter.badge}
                </div>

                {/* Avatar + info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1A3A12, #0D2210)',
                      border: '2px solid rgba(212,168,83,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.7rem',
                      flexShrink: 0,
                    }}
                  >
                    {sitter.emoji}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#F5F0E8',
                        marginBottom: '0.15rem',
                      }}
                    >
                      {sitter.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'rgba(245,240,232,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      📍 {sitter.location}
                    </div>
                  </div>
                </div>

                {/* Rating + availability */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <span style={{ color: '#D4A853', fontSize: '0.88rem' }}>★</span>
                  <span
                    style={{ fontWeight: 700, color: '#F5F0E8', fontSize: '0.88rem' }}
                  >
                    {sitter.rating}
                  </span>
                  <span
                    style={{ color: 'rgba(245,240,232,0.35)', fontSize: '0.78rem' }}
                  >
                    ({sitter.reviews})
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: sitter.available ? '#4ade80' : 'rgba(245,240,232,0.2)',
                        boxShadow: sitter.available ? '0 0 6px rgba(74,222,128,0.6)' : 'none',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.73rem',
                        color: sitter.available
                          ? 'rgba(74,222,128,0.85)'
                          : 'rgba(245,240,232,0.3)',
                        fontWeight: 500,
                      }}
                    >
                      {sitter.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p
                  style={{
                    fontSize: '0.83rem',
                    color: 'rgba(245,240,232,0.55)',
                    lineHeight: 1.65,
                    fontWeight: 300,
                    marginBottom: '1rem',
                  }}
                >
                  {sitter.bio}
                </p>

                {/* Service tags */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.35rem',
                    marginBottom: '1.2rem',
                  }}
                >
                  {sitter.services.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: 'rgba(45,80,22,0.35)',
                        border: '1px solid rgba(45,80,22,0.55)',
                        borderRadius: '20px',
                        padding: '0.18rem 0.6rem',
                        fontSize: '0.72rem',
                        color: 'rgba(245,240,232,0.7)',
                        fontWeight: 500,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Rate + CTA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#D4A853',
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      ${sitter.rate}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'rgba(245,240,232,0.35)',
                        fontWeight: 300,
                      }}
                    >
                      {' '}
                      /day
                    </span>
                  </div>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 4px 20px rgba(212,168,83,0.38)',
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setContactedId(sitter.id);
                      if (!usingMock) {
                        setChatRecipient({ id: sitter.id, name: sitter.name });
                        setChatOpen(true);
                      }
                    }}
                    style={{
                      background:
                        contactedId === sitter.id
                          ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                          : 'linear-gradient(135deg, #D4A853, #B8892E)',
                      color: '#1A1A1A',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.83rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'background 0.4s ease',
                    }}
                  >
                    {contactedId === sitter.id && !usingMock ? '💬 Chat' : contactedId === sitter.id ? '✓ Requested' : 'Contact'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              padding: '5rem 1rem',
              color: 'rgba(245,240,232,0.35)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🐾</div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.3rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'rgba(245,240,232,0.5)',
              }}
            >
              No sitters found
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 300 }}>
              Try adjusting your search or area filter
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat panel backdrop */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setChatOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 199,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(3px)',
              }}
            />
            <ChatPanel
              key="chat-panel"
              currentUser={user}
              initialRecipient={chatRecipient}
              onClose={() => setChatOpen(false)}
              onUnreadCleared={() => setUnreadCount(0)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
