import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import ChatPanel from './ChatPanel';

const ALL_SERVICES = [
  'Dog Walking',
  'House Sitting',
  'Puppy Care',
  'Cat Sitting',
  'Senior Pets',
  'Farm Animals',
  'Overnight Stays',
  'Drop-in Visits',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'rgba(245,240,232,0.48)',
  marginBottom: '0.45rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(245,240,232,0.05)',
  border: '1px solid rgba(245,240,232,0.12)',
  borderRadius: '10px',
  padding: '0.8rem 1rem',
  color: '#F5F0E8',
  fontSize: '0.9rem',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

function ProfileCard({ title, icon, children }) {
  return (
    <div
      style={{
        background: 'rgba(245,240,232,0.03)',
        border: '1px solid rgba(245,240,232,0.07)',
        borderRadius: '20px',
        padding: '1.8rem',
        marginBottom: '1.1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.4rem',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#F5F0E8',
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export default function SitterDashboard({ user, onSignOut, onGoHome }) {
  const [profile, setProfile] = useState({
    bio: '',
    services: [],
    rate: '',
    availability: [],
    experience: '',
    pets: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
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
      .channel(`unread-sitter-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => setUnreadCount((n) => n + 1)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // Load existing sitter_profile from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setProfileLoading(true);
      try {
        // maybeSingle() returns null (not an error) when no row exists yet
        const { data, error } = await supabase
          .from('sitter_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[SitterDashboard] Load error:', error);
        } else if (data) {
          console.log('[SitterDashboard] Loaded profile:', data);
          setProfile({
            bio:          data.bio          || '',
            services:     data.services     || [],
            rate:         data.rate         != null ? String(data.rate) : '',
            availability: data.availability || [],
            experience:   data.experience   != null ? String(data.experience) : '',
            pets:         data.pets         || '',
            phone:        data.phone        || '',
          });
        } else {
          console.log('[SitterDashboard] No profile row yet — fresh sitter.');
        }
      } catch (err) {
        console.error('[SitterDashboard] Load exception:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const toggleService = (s) =>
    setProfile((p) => ({
      ...p,
      services: p.services.includes(s)
        ? p.services.filter((x) => x !== s)
        : [...p.services, s],
    }));

  const toggleDay = (d) =>
    setProfile((p) => ({
      ...p,
      availability: p.availability.includes(d)
        ? p.availability.filter((x) => x !== d)
        : [...p.availability, d],
    }));

  const handleSave = async () => {
    console.log('[SitterDashboard] handleSave → start');

    if (!user?.id) {
      console.error('[SitterDashboard] handleSave → no user.id', user);
      setSaveError('No user session found — please sign out and sign in again.');
      return;
    }

    console.log('[SitterDashboard] handleSave → user.id:', user.id);

    setSaving(true);
    setSaveError(null);

    const payload = {
      id:           user.id,
      bio:          profile.bio,
      services:     profile.services,
      rate:         profile.rate !== ''       ? parseFloat(profile.rate)         : null,
      availability: profile.availability,
      experience:   profile.experience !== '' ? parseInt(profile.experience, 10) : null,
      pets:         profile.pets,
      phone:        profile.phone,
      is_active:    true,
      updated_at:   new Date().toISOString(),
    };

    console.log('[SitterDashboard] handleSave → payload:', payload);
    console.log('[SitterDashboard] handleSave → calling INSERT on sitter_profiles...');

    try {
      const { data, error } = await supabase
        .from('sitter_profiles')
        .upsert(payload);

      console.log('[SitterDashboard] handleSave → UPSERT returned:', { data, error });

      if (error) {
        console.error('[SitterDashboard] handleSave → UPSERT error full object:', error);
        console.error('[SitterDashboard] handleSave → error.message:', error.message);
        console.error('[SitterDashboard] handleSave → error.code:', error.code);
        console.error('[SitterDashboard] handleSave → error.details:', error.details);
        console.error('[SitterDashboard] handleSave → error.hint:', error.hint);
        setSaveError(`${error.message} (code: ${error.code})`);
      } else {
        console.log('[SitterDashboard] handleSave → INSERT succeeded, data:', data);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('[SitterDashboard] handleSave → caught exception:', err);
      setSaveError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
      console.log('[SitterDashboard] handleSave → done');
    }
  };

  // Completion %
  const checkFields = [
    !!profile.bio.trim(),
    profile.services.length > 0,
    !!profile.rate,
    profile.availability.length > 0,
    !!profile.experience,
  ];
  const completionPct = Math.round(
    (checkFields.filter(Boolean).length / checkFields.length) * 100
  );

  const focusStyle = (field) => ({
    ...inputStyle,
    borderColor:
      focusedField === field
        ? 'rgba(212,168,83,0.45)'
        : 'rgba(245,240,232,0.12)',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#080F05', color: '#F5F0E8' }}>
      {/* Navbar */}
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
              background: 'rgba(212,168,83,0.1)',
              border: '1px solid rgba(212,168,83,0.22)',
              borderRadius: '20px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#D4A853',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Sitter
          </div>
          <div
            style={{
              fontSize: '0.82rem',
              color: 'rgba(245,240,232,0.5)',
            }}
          >
            <strong style={{ color: '#F5F0E8' }}>
              {user?.name?.split(' ')[0]}
            </strong>
          </div>
          {/* Messages button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setChatOpen(true); setUnreadCount(0); }}
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
          maxWidth: '780px',
          margin: '0 auto',
          padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2rem)',
        }}
      >
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '2.2rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
              marginBottom: '1.2rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1A3A12, #0D2210)',
                  border: '2.5px solid rgba(212,168,83,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.8rem',
                }}
              >
                🧑‍💼
              </div>
              <motion.div
                whileHover={{ scale: 1.15 }}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4A853, #B8892E)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  border: '2px solid #080F05',
                  color: '#1A1A1A',
                }}
              >
                ✎
              </motion.div>
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                  fontWeight: 700,
                  color: '#F5F0E8',
                  marginBottom: '0.4rem',
                  lineHeight: 1.1,
                }}
              >
                {user?.name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'rgba(212,168,83,0.08)',
                    border: '1px solid rgba(212,168,83,0.2)',
                    borderRadius: '20px',
                    padding: '0.22rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#D4A853',
                  }}
                >
                  📍 {user?.location}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'rgba(74,222,128,0.07)',
                    border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: '20px',
                    padding: '0.22rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'rgba(74,222,128,0.8)',
                  }}
                >
                  ⏳ Pending Review
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              color: 'rgba(245,240,232,0.42)',
              fontSize: '0.9rem',
              fontWeight: 300,
              lineHeight: 1.65,
            }}
          >
            Complete your profile to start receiving booking requests from pet
            owners in your area. Profiles are reviewed within 24 hours.
          </p>
        </motion.div>

        {/* Completion bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(245,240,232,0.03)',
            border: '1px solid rgba(245,240,232,0.07)',
            borderRadius: '16px',
            padding: '1.1rem 1.5rem',
            marginBottom: '1.8rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.65rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'rgba(245,240,232,0.55)',
              }}
            >
              Profile Completion
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: completionPct === 100 ? '#4ade80' : '#D4A853',
              }}
            >
              {completionPct}%
            </span>
          </div>
          <div
            style={{
              background: 'rgba(245,240,232,0.07)',
              borderRadius: '4px',
              height: '6px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                background:
                  completionPct === 100
                    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                    : 'linear-gradient(90deg, #D4A853, #F5C842)',
                borderRadius: '4px',
              }}
            />
          </div>
        </motion.div>

        {/* About card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProfileCard title="About You" icon="📝">
            <div>
              <label style={labelStyle}>Your Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                onFocus={() => setFocusedField('bio')}
                onBlur={() => setFocusedField(null)}
                placeholder="Tell pet owners about yourself — your experience, your home environment, what makes you special as a sitter..."
                rows={4}
                style={{
                  ...focusStyle('bio'),
                  resize: 'vertical',
                  minHeight: '100px',
                  lineHeight: 1.6,
                }}
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.9rem',
                  marginTop: '0.9rem',
                }}
              >
                <div>
                  <label style={labelStyle}>Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile({ ...profile, experience: e.target.value })
                    }
                    onFocus={() => setFocusedField('experience')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 3"
                    style={focusStyle('experience')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Your Own Pets</label>
                  <input
                    type="text"
                    value={profile.pets}
                    onChange={(e) =>
                      setProfile({ ...profile, pets: e.target.value })
                    }
                    onFocus={() => setFocusedField('pets')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 1 dog, 2 cats"
                    style={focusStyle('pets')}
                  />
                </div>
              </div>
              <div style={{ marginTop: '0.9rem' }}>
                <label style={labelStyle}>Phone (optional)</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="250-555-0123"
                  style={focusStyle('phone')}
                />
              </div>
            </div>
          </ProfileCard>
        </motion.div>

        {/* Services card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.23, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProfileCard title="Services Offered" icon="🐕">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              {ALL_SERVICES.map((s) => {
                const active = profile.services.includes(s);
                return (
                  <motion.button
                    key={s}
                    onClick={() => toggleService(s)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: active
                        ? 'rgba(212,168,83,0.18)'
                        : 'rgba(245,240,232,0.04)',
                      border: `1.5px solid ${
                        active
                          ? 'rgba(212,168,83,0.5)'
                          : 'rgba(245,240,232,0.1)'
                      }`,
                      borderRadius: '50px',
                      padding: '0.48rem 1.05rem',
                      color: active ? '#D4A853' : 'rgba(245,240,232,0.55)',
                      fontSize: '0.84rem',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                  >
                    {active ? '✓ ' : ''}
                    {s}
                  </motion.button>
                );
              })}
            </div>
          </ProfileCard>
        </motion.div>

        {/* Rate card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.31, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProfileCard title="Your Daily Rate" icon="💰">
            <div style={{ maxWidth: '220px' }}>
              <label style={labelStyle}>Rate (CAD $ / day)</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#D4A853',
                    fontWeight: 700,
                    fontSize: '1rem',
                    pointerEvents: 'none',
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={profile.rate}
                  onChange={(e) => setProfile({ ...profile, rate: e.target.value })}
                  onFocus={() => setFocusedField('rate')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="0"
                  style={{ ...focusStyle('rate'), paddingLeft: '1.9rem' }}
                />
              </div>
              <p
                style={{
                  fontSize: '0.76rem',
                  color: 'rgba(245,240,232,0.3)',
                  marginTop: '0.5rem',
                  fontWeight: 300,
                  lineHeight: 1.5,
                }}
              >
                Average in Shuswap: <strong style={{ color: 'rgba(212,168,83,0.6)' }}>$28–$42</strong> /day
              </p>
            </div>
          </ProfileCard>
        </motion.div>

        {/* Availability card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.39, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProfileCard title="Availability" icon="📅">
            <div>
              <label style={{ ...labelStyle, marginBottom: '0.8rem' }}>
                Available Days
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {DAYS.map((d) => {
                  const active = profile.availability.includes(d);
                  return (
                    <motion.button
                      key={d}
                      onClick={() => toggleDay(d)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.93 }}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: active
                          ? 'rgba(212,168,83,0.18)'
                          : 'rgba(245,240,232,0.04)',
                        border: `1.5px solid ${
                          active
                            ? 'rgba(212,168,83,0.5)'
                            : 'rgba(245,240,232,0.1)'
                        }`,
                        color: active ? '#D4A853' : 'rgba(245,240,232,0.42)',
                        fontSize: '0.78rem',
                        fontWeight: active ? 700 : 400,
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s',
                        outline: 'none',
                      }}
                    >
                      {d}
                    </motion.button>
                  );
                })}
              </div>
              <p
                style={{
                  fontSize: '0.76rem',
                  color: 'rgba(245,240,232,0.3)',
                  marginTop: '0.8rem',
                  fontWeight: 300,
                }}
              >
                Select all days you are generally available. You can update
                this anytime.
              </p>
            </div>
          </ProfileCard>
        </motion.div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.button
            onClick={handleSave}
            disabled={saving || profileLoading}
            whileHover={!saving ? { scale: 1.02, boxShadow: '0 8px 36px rgba(212,168,83,0.42)' } : {}}
            whileTap={!saving ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              background: savedSuccess
                ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                : saving
                ? 'rgba(212,168,83,0.5)'
                : 'linear-gradient(135deg, #D4A853 0%, #C9952A 100%)',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '50px',
              padding: '1.1rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: saving ? 'default' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.03em',
              transition: 'background 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {saving ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(26,26,26,0.25)',
                    borderTop: '2px solid #1A1A1A',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
                Saving...
              </>
            ) : savedSuccess ? (
              '✓ Profile Saved!'
            ) : (
              'Save My Profile'
            )}
          </motion.button>

          <AnimatePresence>
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  textAlign: 'center',
                  marginTop: '0.9rem',
                  fontSize: '0.82rem',
                  color: 'rgba(74,222,128,0.75)',
                  fontWeight: 400,
                }}
              >
                Profile saved to Supabase · visible to pet owners
              </motion.div>
            )}
            {saveError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  textAlign: 'center',
                  marginTop: '0.9rem',
                  fontSize: '0.82rem',
                  color: 'rgba(255,120,100,0.85)',
                  fontWeight: 400,
                }}
              >
                Error: {saveError}
              </motion.div>
            )}
          </AnimatePresence>

          <p
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'rgba(245,240,232,0.22)',
              fontWeight: 300,
            }}
          >
            Your profile will be reviewed within 24 hours before going live
          </p>
        </motion.div>
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
              initialRecipient={null}
              onClose={() => setChatOpen(false)}
              onUnreadCleared={() => setUnreadCount(0)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
