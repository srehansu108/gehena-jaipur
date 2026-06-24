// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Home from './pages/Home';
import { NavbarMega } from './components/NavbarMega';
import { Footer } from './components/Footer'; // ✅ Import Footer
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

// ✅ Footer wrapper component to conditionally hide footer
function AppContent() {
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/signup'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <NavbarMega />
      <Routes>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
      </Routes>
      {!shouldHideFooter && <Footer />}
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