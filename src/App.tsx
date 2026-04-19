import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import HeroBanner from './components/public/HeroBanner';
import QuickAccessBar from './components/public/QuickAccessBar';
import SimCatalog from './components/public/SimCatalog';
import SimPhongThuy from './components/public/SimPhongThuy';
import SimSoDepPage from './components/public/SimSoDepPage';
import SimDepTheoGiaPage from './components/public/SimDepTheoGiaPage';
import SimPhongThuyPage from './components/public/SimPhongThuyPage';
import ViettelPackages from './components/public/ViettelPackages';
import InternetPackages from './components/public/InternetPackages';
import ZaloButton from './components/shared/ZaloButton';
import LoginModal from './components/shared/LoginModal';
import AdminPanel from './components/admin/AdminPanel';
import StaffPanel from './components/staff/StaffPanel';
import { fetchAvailableSims } from './services/simService';
import type { SimEntry } from './types';

type UserRole = 'admin' | 'staff' | null;
type AppPage = 'home' | 'sim-so-dep' | 'sim-theo-gia' | 'sim-phong-thuy';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [page, setPage] = useState<AppPage>('home');
  const [sims, setSims] = useState<SimEntry[]>([]);
  const [simsLoading, setSimsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableSims({ limit: 500 })
      .then(({ data }) => setSims(data))
      .catch(() => setSims([]))
      .finally(() => setSimsLoading(false));
  }, []);

  const handleLogin = (userRole: 'admin' | 'staff') => { setRole(userRole); setShowLogin(false); };
  const handleLogout = () => setRole(null);

  if (role === 'admin') return <AdminPanel onLogout={handleLogout} />;
  if (role === 'staff') return <StaffPanel onLogout={handleLogout} />;

  const isHome = page === 'home';

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header onAdminClick={() => setShowLogin(true)} />

      {isHome && <HeroBanner />}
      <QuickAccessBar onSimSoDep={() => setPage('sim-so-dep')} />

      {isHome && (
        <div className="lg:hidden bg-[#ee0033] flex items-center justify-between px-4 py-2">
          <span className="text-white text-xs font-bold">📞 Hỗ trợ 24/7</span>
          <a href="tel:0359247247" className="bg-white text-[#ee0033] px-3 py-1 rounded-full text-xs font-black">
            0359.247.247
          </a>
        </div>
      )}

      <AnimatePresence mode="wait">
        {page === 'sim-theo-gia' && (
          <SimDepTheoGiaPage key="sim-theo-gia" onBack={() => setPage('sim-so-dep')} />
        )}
        {page === 'sim-phong-thuy' && (
          <SimPhongThuyPage key="sim-phong-thuy" onBack={() => setPage('sim-so-dep')} />
        )}
        {page === 'sim-so-dep' && (
          <SimSoDepPage
            key="sim-so-dep"
            onClose={() => setPage('home')}
            onNavigate={(p) => setPage(p as AppPage)}
          />
        )}
        {page === 'home' && (
          <div key="home">
            <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <main className="flex-1 min-w-0">
                  <SimCatalog externalSims={sims} simsLoading={simsLoading} />
                  <SimPhongThuy sims={sims} />
                  <InternetPackages />
                  <ViettelPackages />
                </main>
                <div className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
                  <div className="lg:sticky lg:top-20"><Sidebar /></div>
                </div>
              </div>
              <div className="lg:hidden mt-4"><Sidebar /></div>
            </div>
            <Footer />
          </div>
        )}
      </AnimatePresence>

      <ZaloButton />
      <MobileBottomNav />
      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  );
}
