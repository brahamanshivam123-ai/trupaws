import { useState, useEffect } from 'react';
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

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [authReady, setAuthReady] = useState(false); // prevents flicker on load
  const [showModal, setShowModal] = useState(false);
  const [modalIntent, setModalIntent] = useState('find');

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await fetchProfile(session);
        setUser(profile);
        setPage(profile.role === 'sitter' ? 'sitter-dashboard' : 'owner-dashboard');
      }
      setAuthReady(true);
    });

    // React to every future auth event (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED…)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const profile = await fetchProfile(session);
          setUser(profile);
          setPage(profile.role === 'sitter' ? 'sitter-dashboard' : 'owner-dashboard');
          setShowModal(false);
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setPage('landing');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleOpenModal = (intent) => {
    setModalIntent(intent);
    setShowModal(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT handler clears state
  };

  // Don't render until we've checked for an existing session
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
      {page === 'landing' && (
        <>
          <Navbar user={user} onOpenModal={handleOpenModal} onSignOut={handleSignOut} />
          <Hero
            onFindSitter={() => handleOpenModal('find')}
            onBecomeSitter={() => handleOpenModal('become')}
          />
          <HowItWorks />
          <TrustBar />
          <SitterCards />
          <Testimonials />
          <Footer />
        </>
      )}

      {page === 'owner-dashboard' && (
        <PetOwnerDashboard user={user} onSignOut={handleSignOut} />
      )}

      {page === 'sitter-dashboard' && (
        <SitterDashboard user={user} onSignOut={handleSignOut} />
      )}

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
