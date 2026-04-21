import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const LOCATIONS = [
  'Salmon Arm', 'Sicamous', 'Chase', 'Enderby', 'Armstrong',
  'Sorrento', 'Tappen', 'Blind Bay', 'Celista', 'Anglemont',
  'Falkland', 'Grindrod',
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

const ROLE_OPTIONS = [
  { value: 'owner',     label: 'I need a sitter', icon: '🐾', sub: 'Find care for my pets'    },
  { value: 'sitter',   label: 'I am a sitter',   icon: '🏡', sub: 'Earn by caring for pets'  },
  { value: 'explorer', label: 'Just exploring',   icon: '🔍', sub: 'Browse before deciding'   },
];

export default function SignupModal({ intent, onClose }) {
  // mode: 'signup' | 'signin'
  const [mode, setMode] = useState(intent === 'signin' ? 'signin' : 'signup');
  // step: 1 = role selection, 2 = details form  (signup only)
  const [step, setStep] = useState(1);
  // role selection
  const [role, setRole] = useState(intent === 'become' ? 'sitter' : 'owner');

  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const switchMode = (next) => {
    setMode(next);
    setStep(1);
    setErrors({});
    setAuthError(null);
  };

  const handleField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
    if (authError) setAuthError(null);
  };

  // Step 1 → 2
  const handleContinue = () => {
    setStep(2);
    setErrors({});
    setAuthError(null);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                              e.name = 'Name is required';
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Enter a valid email';
    if (form.password.length < 6)                       e.password = 'At least 6 characters';
    if (!form.location)                                 e.location = 'Please choose your area';
    return e;
  };

  const validateSignIn = () => {
    const e = {};
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Enter a valid email';
    if (!form.password)                                 e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = mode === 'signin' ? validateSignIn() : validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setAuthError(null);

    const authTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 30 s. Check your connection and try again.')), 30000)
    );

    try {
      if (mode === 'signin') {
        const result = await Promise.race([
          supabase.auth.signInWithPassword({ email: form.email, password: form.password }),
          authTimeout,
        ]);
        const { error } = result;
        if (error) { setAuthError(error.message); setLoading(false); return; }
        // App.js onAuthStateChange SIGNED_IN will fire → setUser → setPage('landing')
        setLoading(false);
        return;
      }

      // signup
      const effectiveRole = role === 'explorer' ? 'owner' : role;
      const { data, error } = await Promise.race([
        supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name, role: effectiveRole, location: form.location } },
        }),
        authTimeout,
      ]);

      if (error) { setAuthError(error.message); setLoading(false); return; }

      if (data?.session) {
        setLoading(false); // onAuthStateChange fires and navigates
      } else if (data?.user) {
        setEmailSent(true);
        setLoading(false);
      } else {
        setAuthError('Unexpected response — please try again.');
        setLoading(false);
      }
    } catch (err) {
      setAuthError(err?.message || 'Something went wrong. Check your connection and try again.');
      setLoading(false);
    }
  };

  const submitLabel = () => {
    if (loading) return mode === 'signin' ? 'Signing in…' : 'Creating account…';
    if (mode === 'signin') return 'Sign In →';
    if (role === 'sitter') return 'Join as a Sitter →';
    if (role === 'explorer') return 'Start Exploring →';
    return 'Find My Sitter →';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'flex-start',
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
          padding: '1.6rem 2rem 1.4rem',
          borderBottom: '1px solid rgba(245,240,232,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            {/* Back button — shown in signup step 2 */}
            {mode === 'signup' && step === 2 && (
              <motion.button
                onClick={() => { setStep(1); setErrors({}); setAuthError(null); }}
                whileHover={{ x: -2, color: '#D4A853' }}
                whileTap={{ scale: 0.93 }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(245,240,232,0.45)',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: '0.1rem',
                }}
              >
                ←
              </motion.button>
            )}
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#F5F0E8',
                lineHeight: 1.2,
              }}>
                {mode === 'signin'
                  ? '🐾 Welcome back'
                  : step === 1
                  ? '🐾 Join TruPaws'
                  : role === 'sitter'
                  ? '🏡 Become a Sitter'
                  : role === 'explorer'
                  ? '🔍 Create Your Account'
                  : '🐾 Find a Sitter'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(245,240,232,0.38)', fontWeight: 300, marginTop: '0.15rem' }}>
                {mode === 'signin'
                  ? 'Sign in to your account'
                  : step === 1
                  ? 'Tell us why you\'re here'
                  : 'Free · Takes under 60 seconds'}
              </div>
            </div>
          </div>

          {/* Step indicator — signup only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            {mode === 'signup' && (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[1, 2].map((s) => (
                  <div key={s} style={{
                    width: s === step ? '20px' : '7px',
                    height: '7px',
                    borderRadius: '4px',
                    background: s === step ? '#D4A853' : s < step ? 'rgba(212,168,83,0.4)' : 'rgba(245,240,232,0.15)',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1, background: 'rgba(245,240,232,0.12)' }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              style={{
                background: 'rgba(245,240,232,0.07)',
                border: '1px solid rgba(245,240,232,0.1)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: 'rgba(245,240,232,0.55)',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </motion.button>
          </div>
        </div>

        <div style={{ padding: '1.6rem 2rem 2rem' }}>
          <AnimatePresence mode="wait">

            {/* ── Email-sent confirmation ── */}
            {emailSent ? (
              <motion.div
                key="email-sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{ textAlign: 'center', padding: '0.5rem 0' }}
              >
                <div style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>📬</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.3rem', fontWeight: 700, color: '#F5F0E8', marginBottom: '0.6rem',
                }}>
                  Check your email
                </div>
                <p style={{
                  fontSize: '0.88rem', color: 'rgba(245,240,232,0.5)', lineHeight: 1.65,
                  fontWeight: 300, marginBottom: '1.5rem',
                }}>
                  We sent a confirmation link to{' '}
                  <strong style={{ color: '#F5F0E8' }}>{form.email}</strong>.
                  Click it to activate your account.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #C9952A)', color: '#1A1A1A',
                    border: 'none', borderRadius: '50px', padding: '0.85rem 2rem',
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Got it
                </motion.button>
              </motion.div>

            ) : mode === 'signin' ? (
              /* ── Sign In form ── */
              <motion.div key="signin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSubmit} noValidate>
                  {[
                    { key: 'email',    label: 'Email Address', type: 'email',    placeholder: 'you@example.com', autoComplete: 'email' },
                    { key: 'password', label: 'Password',      type: 'password', placeholder: '••••••••',        autoComplete: 'current-password' },
                  ].map((field) => (
                    <div key={field.key} style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        value={form[field.key]}
                        onChange={(e) => handleField(field.key, e.target.value)}
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
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            style={{ color: 'rgba(255,120,100,0.9)', fontSize: '0.73rem', marginTop: '0.3rem', fontWeight: 500 }}
                          >
                            {errors[field.key]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <AuthError msg={authError} />

                  <SubmitButton loading={loading} label={submitLabel()} />

                  <div style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.82rem', color: 'rgba(245,240,232,0.35)' }}>
                    No account?{' '}
                    <span onClick={() => switchMode('signup')} style={{ color: '#D4A853', cursor: 'pointer', fontWeight: 500 }}>
                      Create one
                    </span>
                  </div>
                </form>
              </motion.div>

            ) : step === 1 ? (
              /* ── Signup Step 1: role selection ── */
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.6rem' }}>
                  {ROLE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        background: role === opt.value ? 'rgba(212,168,83,0.12)' : 'rgba(245,240,232,0.03)',
                        border: `1.5px solid ${role === opt.value ? 'rgba(212,168,83,0.55)' : 'rgba(245,240,232,0.09)'}`,
                        borderRadius: '14px',
                        padding: '1rem 1.2rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.18s',
                        outline: 'none',
                        width: '100%',
                      }}
                    >
                      <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{opt.icon}</span>
                      <div>
                        <div style={{
                          color: role === opt.value ? '#F5F0E8' : 'rgba(245,240,232,0.75)',
                          fontWeight: 600, fontSize: '0.95rem',
                          fontFamily: "'Inter', sans-serif", marginBottom: '0.12rem',
                        }}>
                          {opt.label}
                        </div>
                        <div style={{
                          color: 'rgba(245,240,232,0.38)', fontSize: '0.78rem',
                          fontFamily: "'Inter', sans-serif", fontWeight: 300,
                        }}>
                          {opt.sub}
                        </div>
                      </div>
                      {/* Selection indicator */}
                      <div style={{
                        marginLeft: 'auto', flexShrink: 0,
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: `2px solid ${role === opt.value ? '#D4A853' : 'rgba(245,240,232,0.2)'}`,
                        background: role === opt.value ? '#D4A853' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.18s',
                        fontSize: '0.65rem', color: '#1A1A1A', fontWeight: 700,
                      }}>
                        {role === opt.value && '✓'}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleContinue}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(212,168,83,0.45)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #D4A853 0%, #C9952A 100%)',
                    color: '#1A1A1A', border: 'none', borderRadius: '50px',
                    padding: '1rem', fontSize: '0.97rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.03em',
                  }}
                >
                  Continue →
                </motion.button>

                <div style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.82rem', color: 'rgba(245,240,232,0.35)' }}>
                  Already have an account?{' '}
                  <span onClick={() => switchMode('signin')} style={{ color: '#D4A853', cursor: 'pointer', fontWeight: 500 }}>
                    Sign in
                  </span>
                </div>
              </motion.div>

            ) : (
              /* ── Signup Step 2: details form ── */
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form onSubmit={handleSubmit} noValidate>
                  {[
                    { key: 'name',     label: 'Full Name',     type: 'text',     placeholder: 'Jane Smith',      autoComplete: 'name' },
                    { key: 'email',    label: 'Email Address', type: 'email',    placeholder: 'you@example.com', autoComplete: 'email' },
                    { key: 'password', label: 'Password',      type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
                  ].map((field) => (
                    <div key={field.key} style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        value={form[field.key]}
                        onChange={(e) => handleField(field.key, e.target.value)}
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
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
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
                      onChange={(e) => handleField('location', e.target.value)}
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...inputStyle,
                        background: errors.location ? 'rgba(255,100,100,0.04)' : '#0E2412',
                        cursor: 'pointer',
                        borderColor: errors.location
                          ? 'rgba(255,100,100,0.55)'
                          : focusedField === 'location'
                          ? 'rgba(212,168,83,0.45)'
                          : 'rgba(245,240,232,0.14)',
                        color: form.location ? '#F5F0E8' : 'rgba(245,240,232,0.3)',
                        appearance: 'none', WebkitAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(245,240,232,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem',
                      }}
                    >
                      <option value="" disabled style={{ background: '#0E2412', color: 'rgba(245,240,232,0.4)' }}>
                        Select your community…
                      </option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} style={{ background: '#0E2412', color: '#F5F0E8' }}>{loc}</option>
                      ))}
                    </select>
                    <AnimatePresence>
                      {errors.location && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          style={{ color: 'rgba(255,120,100,0.9)', fontSize: '0.73rem', marginTop: '0.3rem', fontWeight: 500 }}
                        >
                          {errors.location}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AuthError msg={authError} />

                  <SubmitButton loading={loading} label={submitLabel()} />

                  <div style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.82rem', color: 'rgba(245,240,232,0.35)' }}>
                    Already have an account?{' '}
                    <span onClick={() => switchMode('signin')} style={{ color: '#D4A853', cursor: 'pointer', fontWeight: 500 }}>
                      Sign in
                    </span>
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

function AuthError({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          style={{
            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem',
            fontSize: '0.82rem', color: 'rgba(255,150,130,0.95)', fontWeight: 400, lineHeight: 1.5,
          }}
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(212,168,83,0.45)' } : {}}
      whileTap={!loading ? { scale: 0.98 } : {}}
      style={{
        width: '100%',
        background: loading ? 'rgba(212,168,83,0.5)' : 'linear-gradient(135deg, #D4A853 0%, #C9952A 100%)',
        color: '#1A1A1A', border: 'none', borderRadius: '50px',
        padding: '1rem', fontSize: '0.97rem', fontWeight: 700,
        cursor: loading ? 'default' : 'pointer',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.03em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        transition: 'background 0.3s',
      }}
    >
      {loading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(26,26,26,0.25)',
              borderTop: '2px solid #1A1A1A',
              borderRadius: '50%', display: 'inline-block', flexShrink: 0,
            }}
          />
          {label}
        </>
      ) : label}
    </motion.button>
  );
}
