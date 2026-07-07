// src/App.jsx

import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Home from './pages/Home';
import { NavbarMega } from './components/NavbarMega';
import { Footer } from './components/Footer';
import ProductPage from './pages/ProductPage';
import ProductDetails from './pages/ProductDetails';  
import { BestSellersPage } from './pages/BestSellersPage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';  
import { ExclusiveSalesPage } from './pages/ExclusiveSalesPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import AccountPage from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';

// ✅ Admin Components
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import Layout from './components/layout/Layout';
import AdminProducts from './pages/AdminProducts';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';

function AppContent() {
  const location = useLocation();
  
  // ✅ Check if current route should hide header/footer
  const shouldHideHeaderFooter = useMemo(() => {
    const path = location.pathname;
    return path.startsWith('/admin') || ['/login', '/signup', '/admin/login'].includes(path);
  }, [location.pathname]);

  return (
    <>
      {/* ✅ Conditionally render Navbar */}
      {!shouldHideHeaderFooter && <NavbarMega />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/category/:category" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetails />} /> 
        <Route path="/best-sellers" element={<BestSellersPage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/exclusive-sales" element={<ExclusiveSalesPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/product-category/:category" element={<ProductPage />} />
        <Route path="/product-category/:category/:subcategorySlug" element={<ProductPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Admin Auth Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Protected User Routes */}
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        
        {/* ✅ Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminProducts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminAnalytics />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminSettings />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* ✅ Conditionally render Footer */}
      {!shouldHideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;