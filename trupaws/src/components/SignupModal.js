import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const LOCATIONS = [
  'Salmon Arm',
  'Sicamous',
  'Chase',
  'Enderby',
  'Armstrong',
  'Sorrento',
  'Tappen',
  'Blind Bay',
  'Celista',
  'Anglemont',
  'Falkland',
  'Grindrod',
];

const inputStyle = {
  width: '100%',
  background: 'rgba(245,240,232,0.06)',
  border: '1px solid rgba(245,240,232,0.14)',
  borderRadius: '10px',
  padding: '0.8rem 1rem',
  color: '#F5F0E8',
  fontSize: '0.93rem',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.73rem',
  fontWeight: 600,
  color: 'rgba(245,240,232,0.5)',
  marginBottom: '0.4rem',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};

// onSuccess prop removed — App.js reacts to onAuthStateChange instead
export default function SignupModal({ intent, onClose }) {
  const [role, setRole] = useState(intent === 'become' ? 'sitter' : 'owner');
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (!form.location) e.location = 'Please choose your area';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          role,
          location: form.location,
        },
      },
    });

    setLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.session) {
      // Email confirmation is OFF — user is immediately logged in.
      // onAuthStateChange in App.js picks this up and closes the modal.
      // Nothing to do here.
    } else {
      // Email confirmation is ON — ask the user to check their inbox.
      setEmailSent(true);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Jane Smith',        autoComplete: 'name' },
    { key: 'email',    label: 'Email Address',    type: 'email',    placeholder: 'you@example.com',   autoComplete: 'email' },
    { key: 'password', label: 'Password',         type: 'password', placeholder: '••••••••',          autoComplete: 'new-password' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0E2412 0%, #091508 60%, #0A1A09 100%)',
          border: '1px solid rgba(212,168,83,0.18)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
          margin: 'auto',
        }}
      >
        {/* Gold accent line */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #D4A853, #F5C842, #D4A853, transparent)',
        }} />

        {/* Header */}
        <div style={{
          padding: '1.8rem 2rem 1.5rem',
          borderBottom: '1px solid rgba(245,240,232,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#F5F0E8',
              marginBottom: '0.25rem',
              lineHeight: 1.2,
            }}>
              🐾 Join TruPaws
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(245,240,232,0.38)', fontWeight: 300 }}>
              Free · Takes under 60 seconds
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, background: 'rgba(245,240,232,0.12)' }}
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            style={{
              background: 'rgba(245,240,232,0.07)',
              border: '1px solid rgba(245,240,232,0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              color: 'rgba(245,240,232,0.55)',
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </motion.button>
        </div>

        <div style={{ padding: '1.6rem 2rem 2rem' }}>

          {/* ── Email-sent confirmation screen ── */}
          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="email-sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📬</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#F5F0E8',
                  marginBottom: '0.7rem',
                }}>
                  Check your email
                </div>
                <p style={{
                  fontSize: '0.88rem',
                  color: 'rgba(245,240,232,0.5)',
                  lineHeight: 1.65,
                  fontWeight: 300,
                  marginBottom: '1.5rem',
                }}>
                  We sent a confirmation link to{' '}
                  <strong style={{ color: '#F5F0E8' }}>{form.email}</strong>.
                  Click it to activate your account and you'll be taken straight to your dashboard.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #C9952A)',
                    color: '#1A1A1A',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.85rem 2rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Got it
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Role selector */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#D4A853',
                    marginBottom: '0.75rem',
                  }}>
                    I want to
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    {[
                      { value: 'owner',  label: 'Find a Sitter', icon: '🐾', sub: 'I have pets to care for' },
                      { value: 'sitter', label: 'Be a Sitter',   icon: '🏡', sub: 'I want to earn & help'   },
                    ].map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => setRole(opt.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          background: role === opt.value ? 'rgba(212,168,83,0.14)' : 'rgba(245,240,232,0.03)',
                          border: `1.5px solid ${role === opt.value ? 'rgba(212,168,83,0.55)' : 'rgba(245,240,232,0.09)'}`,
                          borderRadius: '14px',
                          padding: '1rem 0.8rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          outline: 'none',
                        }}
                      >
                        <div style={{ fontSize: '1.7rem', marginBottom: '0.35rem' }}>{opt.icon}</div>
                        <div style={{
                          color: role === opt.value ? '#F5F0E8' : 'rgba(245,240,232,0.7)',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          fontFamily: "'Inter', sans-serif",
                          marginBottom: '0.12rem',
                        }}>
                          {opt.label}
                        </div>
                        <div style={{
                          color: 'rgba(245,240,232,0.38)',
                          fontSize: '0.72rem',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 300,
                        }}>
                          {opt.sub}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                  {fields.map((field) => (
                    <div key={field.key} style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        value={form[field.key]}
                        onChange={(e) => {
                          setForm({ ...form, [field.key]: e.target.value });
                          if (errors[field.key]) setErrors({ ...errors, [field.key]: null });
                          if (authError) setAuthError(null);
                        }}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        style={{
                          ...inputStyle,
                          borderColor: errors[field.key]
                            ? 'rgba(255,100,100,0.55)'
                            : focusedField === field.key
                            ? 'rgba(212,168,83,0.45)'
                            : 'rgba(245,240,232,0.14)',
                        }}
                      />
                      <AnimatePresence>
                        {errors[field.key] && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            style={{ color: 'rgba(255,120,100,0.9)', fontSize: '0.73rem', marginTop: '0.3rem', fontWeight: 500 }}
                          >
                            {errors[field.key]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {/* Location */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={labelStyle}>Your Community</label>
                    <select
                      value={form.location}
                      onChange={(e) => {
                        setForm({ ...form, location: e.target.value });
                        if (errors.location) setErrors({ ...errors, location: null });
                      }}
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...inputStyle,
                        background: '#0E2412',
                        cursor: 'pointer',
                        borderColor: errors.location
                          ? 'rgba(255,100,100,0.55)'
                          : focusedField === 'location'
                          ? 'rgba(212,168,83,0.45)'
                          : 'rgba(245,240,232,0.14)',
                        color: form.location ? '#F5F0E8' : 'rgba(245,240,232,0.3)',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(245,240,232,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="" disabled style={{ background: '#0E2412', color: 'rgba(245,240,232,0.4)' }}>
                        Select your community...
                      </option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} style={{ background: '#0E2412', color: '#F5F0E8' }}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <AnimatePresence>
                      {errors.location && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          style={{ color: 'rgba(255,120,100,0.9)', fontSize: '0.73rem', marginTop: '0.3rem', fontWeight: 500 }}
                        >
                          {errors.location}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Supabase-level error (e.g. "Email already registered") */}
                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        style={{
                          background: 'rgba(255,80,80,0.1)',
                          border: '1px solid rgba(255,80,80,0.3)',
                          borderRadius: '10px',
                          padding: '0.7rem 1rem',
                          marginBottom: '1rem',
                          fontSize: '0.82rem',
                          color: 'rgba(255,150,130,0.95)',
                          fontWeight: 400,
                          lineHeight: 1.5,
                        }}
                      >
                        {authError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(212,168,83,0.45)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    style={{
                      width: '100%',
                      background: loading ? 'rgba(212,168,83,0.5)' : 'linear-gradient(135deg, #D4A853 0%, #C9952A 100%)',
                      color: '#1A1A1A',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '1rem',
                      fontSize: '0.97rem',
                      fontWeight: 700,
                      cursor: loading ? 'default' : 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.03em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.3s',
                    }}
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(26,26,26,0.25)',
                            borderTop: '2px solid #1A1A1A',
                            borderRadius: '50%',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        Creating your account...
                      </>
                    ) : role === 'owner' ? (
                      'Find My Sitter →'
                    ) : (
                      'Start Earning →'
                    )}
                  </motion.button>

                  <div style={{
                    textAlign: 'center',
                    marginTop: '0.9rem',
                    fontSize: '0.72rem',
                    color: 'rgba(245,240,232,0.25)',
                    fontWeight: 300,
                    lineHeight: 1.5,
                  }}>
                    By joining you agree to our{' '}
                    <span style={{ color: 'rgba(212,168,83,0.5)', cursor: 'pointer' }}>Terms</span> &{' '}
                    <span style={{ color: 'rgba(212,168,83,0.5)', cursor: 'pointer' }}>Privacy Policy</span>
                  </div>
                </form>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </motion.div>
  );
}
