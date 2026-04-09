import { Suspense, useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import TrustBar from './components/TrustBar';
import SitterCards from './components/SitterCards';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

// Lazy-load the heavy 3D scene
const Scene = (() => {
  const { lazy } = require('react');
  return lazy(() => import('./components/Scene'));
})();

function LoadingFallback() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0D1B08',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(212,168,83,0.3)',
          borderTop: '2px solid #D4A853',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / max);
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Fixed 3D canvas layer */}
      <Suspense fallback={<LoadingFallback />}>
        <Scene scrollProgress={scrollProgress} />
      </Suspense>

      {/* Scroll content layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <Navbar />

        {/* Hero — full viewport, transparent over 3D */}
        <div style={{ pointerEvents: 'auto' }}>
          <Hero />
        </div>

        {/* Content sections — opaque backgrounds */}
        <div style={{ pointerEvents: 'auto' }}>
          <HowItWorks />
          <TrustBar />
          <SitterCards />
          <Testimonials />
          <Footer />
        </div>
      </div>
    </>
  );
}
