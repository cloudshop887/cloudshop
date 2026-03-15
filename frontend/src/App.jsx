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


const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/shops" element={<PageTransition><Navbar /><Shops /></PageTransition>} />
        <Route path="/shops/:id" element={<PageTransition><Navbar /><ShopDetail /></PageTransition>} />
        <Route path="/nearby-shops" element={<PageTransition><Navbar /><NearbyShops /></PageTransition>} />
        <Route path="/search-products" element={<PageTransition><Navbar /><SearchProducts /></PageTransition>} />
        <Route path="/compare-prices" element={<PageTransition><Navbar /><ComparePrices /></PageTransition>} />
        <Route path="/register-shop" element={<PageTransition><Navbar /><RegisterShop /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Navbar /><Login /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><Navbar /><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:resetToken" element={<PageTransition><Navbar /><ResetPassword /></PageTransition>} />
        <Route path="/auth/google/callback" element={<PageTransition><GoogleCallback /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Navbar /><Register /></PageTransition>} />
        <Route path="/about" element={<PageTransition><Navbar /><About /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Navbar /><Profile /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Navbar /><Settings /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Navbar /><CustomerDashboard /></PageTransition>} />

        {/* Shop Owner Routes */}
        <Route path="/my-shop" element={<PageTransition><Navbar /><ShopOwnerDashboard /></PageTransition>} />
        <Route path="/shop-settings" element={<PageTransition><Navbar /><ShopSettings /></PageTransition>} />
        <Route path="/add-product" element={<PageTransition><Navbar /><AddProduct /></PageTransition>} />
        <Route path="/bulk-upload" element={<PageTransition><Navbar /><BulkUploadProduct /></PageTransition>} />
        <Route path="/edit-product/:id" element={<PageTransition><Navbar /><EditProduct /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Navbar /><Checkout /></PageTransition>} />
        <Route path="/my-orders" element={<PageTransition><Navbar /><MyOrders /></PageTransition>} />
        <Route path="/my-reservations" element={<PageTransition><Navbar /><MyReservations /></PageTransition>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><AdminLayout><AdminDashboard /></AdminLayout></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminLayout><AdminUsers /></AdminLayout></PageTransition>} />
        <Route path="/admin/shops" element={<PageTransition><AdminLayout><AdminShops /></AdminLayout></PageTransition>} />
        <Route path="/admin/analytics" element={<PageTransition><AdminLayout><AdminAnalytics /></AdminLayout></PageTransition>} />
        <Route path="/admin/settings" element={<PageTransition><AdminLayout><AdminSettings /></AdminLayout></PageTransition>} />
        <Route path="/admin/*" element={<PageTransition><AdminLayout><AdminDashboard /></AdminLayout></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <AnimatedRoutes />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
