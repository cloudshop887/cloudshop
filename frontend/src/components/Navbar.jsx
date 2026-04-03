import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, ShoppingCart, ChevronRight, Package, Store, Info, Home, MapPin, Scale, Search, Briefcase, AlertCircle, Bell, Tag, Megaphone, Shield, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';
import { getDirectDriveLink } from '../utils/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { getCartCount } = useCart();
    const cartCount = getCartCount();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }

        const updateUserInfo = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            } else {
                setUser(null);
            }
        };

        window.addEventListener('userLoggedIn', updateUserInfo);

        return () => {
            window.removeEventListener('userLoggedIn', updateUserInfo);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    const handleCartClick = () => {
        setCartOpen(true);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Left: Menu Button & Logo */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-2 -ml-2 text-slate-700 hover:text-primary hover:bg-slate-100 rounded-full transition-all font-bold"
                                title="Open menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <ShoppingBag className="h-6 w-6 text-primary font-bold" />
                                </div>
                                <span className="text-lg sm:text-xl font-black tracking-wide text-slate-900 drop-shadow-sm">LocalLink</span>
                            </Link>
                        </div>

                        {/* Right: Cart & Login */}
                        <div className="flex items-center gap-4">
                            {!user && (
                                <Link
                                    to="/login"
                                    className="hidden sm:block px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-sky-600 transition-colors shadow-sm shadow-sky-200"
                                >
                                    Login
                                </Link>
                            )}
                            {user && (
                                <>
                                    <button
                                        onClick={() => navigate('/community')}
                                        className="p-2 text-slate-600 hover:text-primary transition-colors relative group"
                                        title="Community Alerts"
                                    >
                                        <Megaphone className="w-6 h-6" />
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    </button>
                                    <NotificationBell />
                                    <button
                                        onClick={handleCartClick}
                                        className="relative p-2 text-slate-600 hover:text-primary transition-colors"
                                    >
                                        <ShoppingCart className="w-6 h-6" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav >

            {/* Mobile/Drawer Menu with Animation */}
            < AnimatePresence >
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="w-6 h-6 text-primary" />
                                        <span className="font-bold text-lg text-slate-800">Menu</span>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                {/* User Info (if logged in) */}
                                {user && (
                                    <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            {user.profilePic ? (
                                                <img src={getDirectDriveLink(user.profilePic)} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                                            ) : (
                                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight">{user.fullName}</p>
                                                <p className="text-[11px] text-slate-500 truncate max-w-[140px] mt-0.5">{user.email}</p>
                                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter mt-1 inline-block">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Links */}
                                <div className="space-y-2 flex-1">
                                    <NavLink to={user ? '/dashboard' : '/'} icon={<Home className="w-5 h-5" />} label="Home" onClick={() => setIsOpen(false)} />
                                    <NavLink to="/shops" icon={<Store className="w-5 h-5" />} label="Browse Shops" onClick={() => setIsOpen(false)} />
                                    <NavLink to="/nearby-shops" icon={<MapPin className="w-5 h-5" />} label="Nearby Shops" onClick={() => setIsOpen(false)} />
                                    <NavLink to="/compare-prices" icon={<Scale className="w-5 h-5" />} label="Compare Prices" onClick={() => setIsOpen(false)} />
                                    <NavLink to="/search-products" icon={<Search className="w-5 h-5" />} label="Search Products" onClick={() => setIsOpen(false)} />
                                    <button
                                        onClick={() => { navigate('/community'); setIsOpen(false); }}
                                        className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl transition-all group shadow-lg shadow-sky-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-xl">
                                                <Megaphone className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold leading-tight text-white">Community Alerts</p>
                                                <p className="text-[10px] text-sky-100 font-medium italic">Real-time local updates</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
                                            <ChevronRight className="w-4 h-4 text-white/50" />
                                        </div>
                                    </button>



                                    {user && (
                                        <>
                                            <NavLink to="/my-orders" icon={<Package className="w-5 h-5" />} label="My Orders" onClick={() => setIsOpen(false)} />
                                            <NavLink to="/my-reservations" icon={<BookMarked className="w-5 h-5" />} label="My Reservations" onClick={() => setIsOpen(false)} />
                                            <NavLink to="/profile" icon={<User className="w-5 h-5" />} label="My Profile" onClick={() => setIsOpen(false)} />

                                            {/* Shop Related Links */}
                                            {/* Logic Fixed: Prioritize Shop Dashboard if user is OWNER or ADMIN */}
                                            {user.role === 'SHOP_OWNER' || user.role === 'ADMIN' ? (
                                                <NavLink to="/my-shop" icon={<Store className="w-5 h-5" />} label="My Shop Dashboard" onClick={() => setIsOpen(false)} />
                                            ) : (
                                                <NavLink to="/register-shop" icon={<Store className="w-5 h-5" />} label="Register Your Shop" onClick={() => setIsOpen(false)} />
                                            )}

                                            {/* Admin Specific Links */}
                                            {user.role === 'ADMIN' && (
                                                <Link
                                                    to="/admin/dashboard" // Changed from href to Link for SPA navigation
                                                    className="flex items-center justify-between p-3 bg-slate-900 text-amber-400 rounded-lg border border-amber-400/20 hover:bg-slate-800 transition-all group mt-4"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="w-5 h-5" />
                                                        <span className="font-bold">Admin Panel</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </>
                                    )}

                                    {!user && (
                                        <NavLink to="/about" icon={<Info className="w-5 h-5" />} label="About Us" onClick={() => setIsOpen(false)} />
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-auto pt-6 border-t border-slate-100">
                                    {user ? (
                                        <button
                                            onClick={() => { handleLogout(); setIsOpen(false); }}
                                            className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 w-full p-3 bg-primary text-white rounded-xl hover:bg-sky-600 transition-colors font-medium shadow-lg shadow-sky-200"
                                        >
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )
                }
            </AnimatePresence >

            {/* Cart Sidebar */}
            {
                cartOpen && (
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <CartSidebarLazy isOpen={cartOpen} onClose={() => setCartOpen(false)} />
                    </React.Suspense>
                )
            }
        </>
    );
};

// Helper Component for Links
const NavLink = ({ to, icon, label, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center justify-between p-3 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-all group"
    >
        <div className="flex items-center gap-3">
            <span className="text-slate-400 group-hover:text-primary transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
    </Link>
);

const CartSidebarLazy = React.lazy(() => import('./CartSidebar'));

export default Navbar;
