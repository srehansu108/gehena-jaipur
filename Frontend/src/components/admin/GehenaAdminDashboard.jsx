// client/src/pages/Admin/Gehena/GehenaAdminDashboard.jsx
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gehenaAdminApi from '../../api/gehenaAdminApi';
import { ADMIN_INFO_KEY, ADMIN_TOKEN_KEY } from '../../../api/adminApi';

// Lazy load tabs
const ContentTab = lazy(() => import('./tabs/ContentTab'));
const GemsTab = lazy(() => import('./tabs/GemsTab'));
const EnquiriesTab = lazy(() => import('./tabs/EnquiriesTab'));
const PreviewTab = lazy(() => import('./tabs/PreviewTab'));

const TABS = [
  { id: 'content', label: 'Story Content', icon: '📖' },
  { id: 'gems', label: 'Gemstones', icon: '💎' },
  { id: 'enquiries', label: 'Enquiries', icon: '✉️' },
  { id: 'preview', label: 'Live Preview', icon: '👁' },
];

const GehenaAdminDashboard = () => {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem(ADMIN_INFO_KEY) || '{}');
  const [activeTab, setActiveTab] = useState('content');
  const [stats, setStats] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_INFO_KEY);
    navigate('/admin/gehena/login');
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await gehenaAdminApi.get('/stats');
      setStats(res.data.data);
    } catch (e) {
      console.warn('Stats failed:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 30000);
    return () => clearInterval(t);
  }, [fetchStats]);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#fff5f7] via-white to-[#fce7f0] text-[#3a1f2b]">
      {/* Ambient blobs */}
      <motion.div
        className="fixed top-0 right-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none z-0"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-0 left-0 w-96 h-96 bg-fuchsia-300/15 rounded-full blur-3xl pointer-events-none z-0"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* ─── Top Nav ─── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-200 to-fuchsia-200 flex items-center justify-center shadow-sm"
              whileHover={{ rotate: 8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <span className="text-xl">💎</span>
            </motion.div>
            <div>
              <h1
                className="text-lg font-light leading-tight text-[#3a1f2b]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Gehena{' '}
                <span className="italic bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                  Admin
                </span>
              </h1>
              <p className="text-xs text-[#5a3d4a]/70">{adminInfo.email || 'admin'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/boutique')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#5a3d4a] hover:text-pink-600 border-2 border-pink-200 hover:border-pink-400 rounded-full transition-colors"
            >
              <span>👁</span> View Boutique
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-medium text-[#3a1f2b] border-2 border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {/* ─── Stats ─── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Active Gems"
              value={`${stats.gems.active}/${stats.gems.total}`}
              icon="💎"
              gradient="from-pink-500 to-rose-400"
            />
            <StatCard
              label="Total Enquiries"
              value={stats.enquiries.total}
              icon="✉️"
              gradient="from-fuchsia-500 to-pink-400"
            />
            <StatCard
              label="New Requests"
              value={stats.enquiries.new}
              icon="🔔"
              gradient="from-rose-500 to-fuchsia-500"
            />
            <StatCard
              label="Scheduled"
              value={stats.enquiries.scheduled}
              icon="📅"
              gradient="from-pink-400 to-fuchsia-400"
            />
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-pink-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-pink-600'
                    : 'text-[#5a3d4a]/70 hover:text-pink-500'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-fuchsia-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeTab === 'content' && <ContentTab onSaved={fetchStats} />}
                  {activeTab === 'gems' && <GemsTab onChanged={fetchStats} />}
                  {activeTab === 'enquiries' && <EnquiriesTab onChanged={fetchStats} />}
                  {activeTab === 'preview' && <PreviewTab />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
};

// ─── Stat Card ───
const StatCard = ({ label, value, icon, gradient = 'from-pink-500 to-rose-400' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 shadow-sm p-4 overflow-hidden"
  >
    <div
      className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl`}
    />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs text-[#5a3d4a]/70 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p
          className="text-2xl md:text-3xl font-light mt-1 text-[#3a1f2b]"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {value}
        </p>
      </div>
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
      >
        <span className="text-lg">{icon}</span>
      </div>
    </div>
  </motion.div>
);

export default GehenaAdminDashboard;