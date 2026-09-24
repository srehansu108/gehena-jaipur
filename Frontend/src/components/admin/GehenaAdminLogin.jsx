// client/src/pages/Admin/Gehena/GehenaAdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminApi, { ADMIN_TOKEN_KEY, ADMIN_INFO_KEY } from '../../../api/adminApi';

const GehenaAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.post('/login', { email, password });
      const { token, admin } = res.data.data;
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
      navigate('/admin/gehena/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fff5f7] via-white to-[#fce7f0] overflow-hidden">
      {/* Blush blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-300/20 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Floating petals */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-pink-300 to-rose-400 opacity-30 pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 6 + Math.random() * 6,
            height: 4 + Math.random() * 4,
            borderRadius: '50% 0 50% 50%',
          }}
          animate={{
            y: [0, -60, 0],
            rotate: [0, 180, 360],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md z-20"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-200 to-fuchsia-200 mb-4 shadow-lg"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl">💎</span>
            </motion.div>
            <h1
              className="text-3xl font-light text-[#3a1f2b]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Gehena{' '}
              <span className="italic bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
            <p className="text-sm text-[#5a3d4a] mt-2">
              Boutique Story Management
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#3a1f2b] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={loading}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/50 outline-none transition-all text-[#3a1f2b] bg-white"
                placeholder="admin@gehena.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3a1f2b] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/50 outline-none transition-all text-[#3a1f2b] bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-semibold rounded-2xl shadow-lg shadow-pink-300/40 hover:shadow-2xl hover:shadow-pink-400/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <span>→</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-pink-100 text-center">
            <p className="text-xs text-[#5a3d4a]/70">
              🔒 Authorized personnel only. All actions are logged.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default GehenaAdminLogin;