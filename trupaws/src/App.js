import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import TrustBar from './components/TrustBar';
import SitterCards from './components/SitterCards';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import SignupModal from './components/SignupModal';
import PetOwnerDashboard from './components/PetOwnerDashboard';
import SitterDashboard from './components/SitterDashboard';
import BrowseSitters from './pages/BrowseSitters';
import SitterProfile from './pages/SitterProfile';

// Fetch the profiles row for an authenticated session.
// Falls back to user_metadata if the DB trigger hasn't fired yet.
async function fetchProfile(session) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (data) return data;

  // Trigger race-condition fallback: build from metadata
  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    name: meta.name || session.user.email,
    role: meta.role || 'owner',
    location: meta.location || '',
  };
}

function ProtectedRoute({ user, authReady, children }) {
  if (!authReady) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalIntent, setModalIntent] = useState('find');
  const navigate = useNavigate();

  useEffect(() => {
    let ready = false;
    const markReady = () => {
      if (!ready) {
        ready = true;
        setAuthReady(true);
      }
    };

    const timeout = setTimeout(() => {
      console.warn('[App] Auth check timed out — showing landing page.');
      markReady();
    }, 5000);

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[App] getSession error:', error);
        } else if (session) {
          const profile = await fetchProfile(session);
          setUser(profile);
        }
      } catch (err) {
        console.error('[App] Auth init exception:', err);
      } finally {
        clearTimeout(timeout);
        markReady();
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          markReady();
          if (session) {
            try {
              const profile = await fetchProfile(session);
              setUser(profile);
            } catch (err) {
              console.error('[App] fetchProfile error on INITIAL_SESSION:', err);
            }
          }
        }
        if (event === 'SIGNED_IN' && session) {
          try {
            const profile = await fetchProfile(session);
            setUser(profile);
            navigate('/', { replace: true });
            setShowModal(false);
          } catch (err) {
            console.error('[App] fetchProfile error on SIGNED_IN:', err);
          }
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/', { replace: true });
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenModal = (intent) => {
    setModalIntent(intent);
    setShowModal(true);
  };

  const handleGoDashboard = () => {
    if (!user) return;
    navigate(user.role === 'sitter' ? '/dashboard/sitter' : '/dashboard/owner');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT handler clears state and navigates
  };

  if (!authReady) {
    return (
      <div
        style={{
          height: '100vh',
          background: '#080F05',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '36px',
            height: '36px',
            border: '2px solid rgba(212,168,83,0.2)',
            borderTop: '2px solid #D4A853',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar
                user={user}
                onOpenModal={handleOpenModal}
                onSignOut={handleSignOut}
                onGoHome={() => navigate('/')}
                onGoDashboard={handleGoDashboard}
                onBrowse={() => navigate('/browse')}
              />
              <Hero
                user={user}
                onFindSitter={() => handleOpenModal('find')}
                onBecomeSitter={() => handleOpenModal('become')}
                onGoDashboard={handleGoDashboard}
              />
              <HowItWorks />
              <TrustBar />
              <SitterCards />
              <Testimonials />
              <section
                id="about"
                style={{
                  padding: 'clamp(4rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem)',
                  background: 'linear-gradient(180deg, rgba(13,27,8,0) 0%, rgba(8,15,5,1) 100%)',
                  textAlign: 'center',
                }}
              >
                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: '#D4A853', marginBottom: '1rem',
                  }}>
                    About TruPaws
                  </div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                    fontWeight: 700, color: '#F5F0E8', lineHeight: 1.2, marginBottom: '1.4rem',
                  }}>
                    Built for Shuswap, BC
                  </h2>
                  <p style={{
                    fontSize: '1rem', color: 'rgba(245,240,232,0.58)', lineHeight: 1.8,
                    fontWeight: 300, marginBottom: '1rem',
                  }}>
                    TruPaws is a local pet-sitting marketplace connecting pet owners with trusted,
                    vetted sitters across Salmon Arm, Sicamous, Chase, Enderby, Armstrong, Sorrento,
                    and surrounding communities.
                  </p>
                  <p style={{
                    fontSize: '1rem', color: 'rgba(245,240,232,0.58)', lineHeight: 1.8, fontWeight: 300,
                  }}>
                    We believe your pets deserve care from someone who knows your neighbourhood —
                    not a corporate chain. Every sitter on TruPaws is a local community member,
                    reviewed by real Shuswap families.
                  </p>
                </div>
              </section>
              <Footer />
            </>
          }
        />

        <Route
          path="/browse"
          element={
            <>
              <Navbar
                user={user}
                onOpenModal={handleOpenModal}
                onSignOut={handleSignOut}
                onGoHome={() => navigate('/')}
                onGoDashboard={handleGoDashboard}
                onBrowse={() => navigate('/browse')}
              />
              <BrowseSitters
                user={user}
                onOpenModal={handleOpenModal}
                onGoHome={() => navigate('/')}
                onGoDashboard={handleGoDashboard}
              />
            </>
          }
        />

        <Route
          path="/sitter/:id"
          element={
            <>
              <Navbar
                user={user}
                onOpenModal={handleOpenModal}
                onSignOut={handleSignOut}
                onGoHome={() => navigate('/')}
                onGoDashboard={handleGoDashboard}
                onBrowse={() => navigate('/browse')}
              />
              <SitterProfile
                user={user}
                onOpenModal={handleOpenModal}
                onGoHome={() => navigate('/')}
                onGoBrowse={() => navigate('/browse')}
                onGoDashboard={handleGoDashboard}
              />
            </>
          }
        />

        <Route
          path="/dashboard/owner"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <PetOwnerDashboard user={user} onSignOut={handleSignOut} onGoHome={() => navigate('/')} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/sitter"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <SitterDashboard user={user} onSignOut={handleSignOut} onGoHome={() => navigate('/')} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AnimatePresence>
        {showModal && (
          <SignupModal
            key="signup-modal"
            intent={modalIntent}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
