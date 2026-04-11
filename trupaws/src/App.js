import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [showModal, setShowModal] = useState(false);
  const [modalIntent, setModalIntent] = useState('find');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('trupaws_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setPage(parsed.role === 'sitter' ? 'sitter-dashboard' : 'owner-dashboard');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenModal = (intent) => {
    setModalIntent(intent);
    setShowModal(true);
  };

  const handleSignup = (userData) => {
    localStorage.setItem('trupaws_user', JSON.stringify(userData));
    setUser(userData);
    setShowModal(false);
    setPage(userData.role === 'sitter' ? 'sitter-dashboard' : 'owner-dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('trupaws_user');
    setUser(null);
    setPage('landing');
  };

  return (
    <>
      {page === 'landing' && (
        <>
          <Navbar user={user} onOpenModal={handleOpenModal} onSignOut={handleSignOut} />
          <Hero onFindSitter={() => handleOpenModal('find')} onBecomeSitter={() => handleOpenModal('become')} />
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
            onSuccess={handleSignup}
          />
        )}
      </AnimatePresence>
    </>
  );
}
