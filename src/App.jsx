import React, { useState, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import MobileDrawer from './components/MobileDrawer';
import HeroSection from './components/HeroSection';
import TrustAndMetrics from './components/TrustAndMetrics';
import BlackManifesto from './components/BlackManifesto';
import CapabilitiesWall from './components/CapabilitiesWall';
import HorizontalWorkShowcase from './components/HorizontalWorkShowcase';
import ProcessSection from './components/ProcessSection';
import IndustryGrid from './components/IndustryGrid';
import Testimonials from './components/Testimonials';
import AuditModal from './components/AuditModal';
import Footer from './components/Footer';

// Admin CMS Components (Lazy Loaded for Code Splitting)
const AdminLogin = React.lazy(() => import('./admin/AdminLogin'));
const AdminLayout = React.lazy(() => import('./admin/AdminLayout'));
import { getAdminMe } from './api/admin';

// Page Views
import ServiceView from './components/Views/ServiceView';
import CaseStudiesView from './components/Views/CaseStudiesView';
import ContactView from './components/Views/ContactView';

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'home';
  });
  const [adminUser, setAdminUser] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cursorState, setCursorState] = useState({ visible: false, text: 'VIEW' });

  useEffect(() => {
    // Check if path is /admin
    if (window.location.pathname.startsWith('/admin')) {
      setActivePage('admin');
    }
  }, []);

  useEffect(() => {
    if (activePage === 'admin') {
      getAdminMe()
        .then(res => {
          if (res.success && res.data) {
            setAdminUser(res.data);
          }
        })
        .catch(() => {
          setAdminUser(null);
        });
    }
  }, [activePage]);

  const openAuditModal = () => setIsAuditModalOpen(true);
  const closeAuditModal = () => setIsAuditModalOpen(false);

  const handleHoverCursor = (visible, text = 'VIEW') => {
    setCursorState({ visible, text });
  };

  const handleSelectService = (serviceId) => {
    setActivePage('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIndustry = (industryId) => {
    setActivePage('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Admin CMS Panel if activePage === 'admin'
  if (activePage === 'admin') {
    return (
      <React.Suspense fallback={
        <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div>Loading DigitalClik CMS...</div>
        </div>
      }>
        {!adminUser ? (
          <AdminLogin onLoginSuccess={(u) => setAdminUser(u)} />
        ) : (
          <AdminLayout 
            user={adminUser} 
            onLogout={() => setAdminUser(null)} 
            onViewPublicSite={() => {
              setActivePage('home');
              window.history.pushState({}, '', '/');
            }} 
          />
        )}
      </React.Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      
      {/* Custom Contextual Cursor Follower (Desktop Only) */}
      {cursorState.visible && <CustomCursor text={cursorState.text} />}

      {/* Top Utility Statement Bar */}
      <TopBar onOpenAuditModal={openAuditModal} />

      {/* Main Navigation Header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenAuditModal={openAuditModal}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Off-Canvas Drawer */}
      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        setActivePage={setActivePage}
        onOpenAuditModal={openAuditModal}
      />

      {/* Main View Engine */}
      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <>
            {/* 1. WHITE HERO */}
            <HeroSection onOpenAuditModal={openAuditModal} />
            
            {/* 2. TRUST & MANIFESTO */}
            <TrustAndMetrics />

            {/* 3. BLACK MANIFESTO SECTION */}
            <BlackManifesto />

            {/* 4. WHITE SERVICES EXPLORER */}
            <CapabilitiesWall onSelectService={handleSelectService} />

            {/* 5. FULL-BLEED & CINEMATIC PORTFOLIO */}
            <HorizontalWorkShowcase onHoverCursor={handleHoverCursor} />

            {/* 6. SOFT GRAY PROCESS WORKFLOW */}
            <ProcessSection />

            {/* 7. TYPOGRAPHIC INDUSTRY LIST */}
            <IndustryGrid onSelectIndustry={handleSelectIndustry} />

            {/* 8. BLACK EDITORIAL TESTIMONIAL */}
            <Testimonials />
          </>
        )}

        {activePage === 'services' && (
          <ServiceView onOpenAuditModal={openAuditModal} />
        )}

        {activePage === 'case-studies' && (
          <CaseStudiesView onOpenAuditModal={openAuditModal} />
        )}

        {activePage === 'industries' && (
          <ServiceView onOpenAuditModal={openAuditModal} />
        )}

        {activePage === 'contact' && (
          <ContactView onOpenAuditModal={openAuditModal} />
        )}
      </main>

      {/* FULL PURPLE CTA & NEAR-BLACK FOOTER */}
      <Footer setActivePage={setActivePage} onOpenAuditModal={openAuditModal} />

      {/* Global Audit Modal Overlay */}
      <AuditModal isOpen={isAuditModalOpen} onClose={closeAuditModal} />

    </div>
  );
}
