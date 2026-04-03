import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import RegisterShop from './pages/RegisterShop';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Shops from './pages/Shops';
import ShopDetail from './pages/ShopDetail';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShops from './pages/admin/AdminShops';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLayout from './layouts/AdminLayout';
import BulkUploadProduct from './pages/BulkUploadProduct';
import ShopSettings from './pages/ShopSettings';
import CustomerDashboard from './pages/CustomerDashboard';
import { CartProvider } from './context/CartContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NearbyShops from './pages/NearbyShops';
import SearchProducts from './pages/SearchProducts';
import ComparePrices from './pages/ComparePrices';
import PageTransition from './components/PageTransition';
import GoogleCallback from './pages/GoogleCallback';
import MyReservations from './pages/MyReservations';
import CommunityAlerts from './pages/CommunityAlerts';
import CommunityPost from './pages/CommunityPost';

// Pages that should NOT show the main Navbar (admin, auth-only, etc.)
const HIDE_NAVBAR_PATHS = [
  '/admin',
  '/admin/login',
  '/admin/dashboard',
  '/admin/users',
  '/admin/shops',
  '/admin/analytics',
  '/admin/settings',
  '/auth/google/callback',
];

const AppLayout = ({ children }) => {
  const location = useLocation();

  // Hide navbar for admin routes and google callback
  const hideNavbar = HIDE_NAVBAR_PATHS.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {/* ✅ Single global Navbar - renders once, fixed at top */}
      {!hideNavbar && <Navbar />}

      {/* ✅ Global layout padding:
           pt-16 = clears fixed top navbar (h-16)
           pb-20 = clears bottom nav bar (h-16 + safe area)
           Admin pages get no padding since they have their own layout */}
      <main className={!hideNavbar ? 'pt-16 pb-20 min-h-screen' : 'min-h-screen'}>
        {children}
      </main>
    </>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public Routes ─────────────────────────────── */}
        <Route path="/"                         element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/shops"                    element={<PageTransition><Shops /></PageTransition>} />
        <Route path="/shops/:id"                element={<PageTransition><ShopDetail /></PageTransition>} />
        <Route path="/nearby-shops"             element={<PageTransition><NearbyShops /></PageTransition>} />
        <Route path="/search-products"          element={<PageTransition><SearchProducts /></PageTransition>} />
        <Route path="/compare-prices"           element={<PageTransition><ComparePrices /></PageTransition>} />
        <Route path="/register-shop"            element={<PageTransition><RegisterShop /></PageTransition>} />
        <Route path="/login"                    element={<PageTransition><Login /></PageTransition>} />
        <Route path="/forgot-password"          element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:resetToken" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/auth/google/callback"     element={<PageTransition><GoogleCallback /></PageTransition>} />
        <Route path="/register"                 element={<PageTransition><Register /></PageTransition>} />
        <Route path="/about"                    element={<PageTransition><About /></PageTransition>} />
        <Route path="/community"                element={<PageTransition><CommunityAlerts /></PageTransition>} />
        <Route path="/community/post"           element={<PageTransition><CommunityPost /></PageTransition>} />
        <Route path="/profile"                  element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/settings"                 element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/dashboard"                element={<PageTransition><CustomerDashboard /></PageTransition>} />

        {/* ── Shop Owner Routes ──────────────────────────── */}
        <Route path="/my-shop"                  element={<PageTransition><ShopOwnerDashboard /></PageTransition>} />
        <Route path="/shop-settings"            element={<PageTransition><ShopSettings /></PageTransition>} />
        <Route path="/add-product"              element={<PageTransition><AddProduct /></PageTransition>} />
        <Route path="/bulk-upload"              element={<PageTransition><BulkUploadProduct /></PageTransition>} />
        <Route path="/edit-product/:id"         element={<PageTransition><EditProduct /></PageTransition>} />
        <Route path="/checkout"                 element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/my-orders"                element={<PageTransition><MyOrders /></PageTransition>} />
        <Route path="/my-reservations"          element={<PageTransition><MyReservations /></PageTransition>} />

        {/* ── Admin Routes (have their own AdminLayout, no main Navbar) ── */}
        <Route path="/admin/login"              element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/dashboard"          element={<PageTransition><AdminLayout><AdminDashboard /></AdminLayout></PageTransition>} />
        <Route path="/admin/users"              element={<PageTransition><AdminLayout><AdminUsers /></AdminLayout></PageTransition>} />
        <Route path="/admin/shops"              element={<PageTransition><AdminLayout><AdminShops /></AdminLayout></PageTransition>} />
        <Route path="/admin/analytics"          element={<PageTransition><AdminLayout><AdminAnalytics /></AdminLayout></PageTransition>} />
        <Route path="/admin/settings"           element={<PageTransition><AdminLayout><AdminSettings /></AdminLayout></PageTransition>} />
        <Route path="/admin/*"                  element={<PageTransition><AdminLayout><AdminDashboard /></AdminLayout></PageTransition>} />

      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          {/* ✅ AppLayout wraps everything — handles Navbar visibility + padding globally */}
          <AppLayout>
            <AnimatedRoutes />
          </AppLayout>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;