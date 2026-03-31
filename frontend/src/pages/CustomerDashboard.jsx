import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, User, TrendingUp, Store } from 'lucide-react';
import api from '../utils/api';
import CustomerLayout from '../layouts/CustomerLayout';

const CustomerDashboard = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerData();

        // Poll for updates every 60 seconds to keep stats fresh
        const intervalId = setInterval(fetchCustomerData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchCustomerData = async () => {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
                setLoading(false);
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            setUser(userInfo);

            // Fetch user's orders using the correct endpoint
            try {
                const { data } = await api.get('/orders/myorders');
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Orders fetch failed:', err);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error in fetchCustomerData:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary border-t-transparent"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading your dashboard...</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (!user) {
        return (
            <CustomerLayout>
                <div className="text-center py-20">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Login</h2>
                    <p className="text-slate-600 mb-6">Login to see your orders and activity.</p>
                    <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors">Login Now</Link>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-primary to-sky-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center md:text-left"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Welcome back, {user?.fullName}!
                        </h1>
                        <p className="text-sky-100 text-lg">
                            Your neighborhood marketplace, now on the cloud
                        </p>
                    </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: "Total Orders", value: orders.length, icon: <ShoppingBag className="w-10 h-10 text-primary" /> },
                        { label: "Total Spent", value: `₹${orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}`, icon: <TrendingUp className="w-10 h-10 text-green-500" /> },
                        { label: "Account Status", value: "Active", valueColor: "text-green-600", icon: <User className="w-10 h-10 text-blue-500" /> }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">{stat.label}</p>
                                    <p className={`text-3xl font-bold mt-1 ${stat.valueColor || 'text-slate-900'}`}>{stat.value}</p>
                                </div>
                                {stat.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 mb-8"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            to="/shops"
                            className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                        >
                            <Store className="w-6 h-6 text-primary" />
                            <div>
                                <p className="font-semibold text-slate-900">Browse Shops</p>
                                <p className="text-sm text-slate-600">Discover local stores</p>
                            </div>
                        </Link>

                        <Link
                            to="/my-orders"
                            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                        >
                            <Package className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-slate-900">My Orders</p>
                                <p className="text-sm text-slate-600">Track your purchases</p>
                            </div>
                        </Link>

                        <Link
                            to="/profile"
                            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                            <User className="w-6 h-6 text-blue-600" />
                            <div>
                                <p className="font-semibold text-slate-900">My Profile</p>
                                <p className="text-sm text-slate-600">Update your info</p>
                            </div>
                        </Link>

                        {user?.role === 'SHOP_OWNER' ? (
                            <Link
                                to="/my-shop"
                                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                            >
                                <Store className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">My Shop</p>
                                    <p className="text-sm text-slate-600">Manage business</p>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                to="/register-shop"
                                className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                            >
                                <Store className="w-6 h-6 text-amber-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">Register Shop</p>
                                    <p className="text-sm text-slate-600">Start selling</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Recent Orders */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
                        <Link to="/my-orders" className="text-primary hover:text-sky-600 font-medium">
                            View All →
                        </Link>
                    </div>

                    {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Order ID</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Date</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Total</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 5).map((order) => (
                                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 font-mono">#{order.id}</td>
                                            <td className="py-3 px-4 text-sm text-slate-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-primary">
                                                ₹{parseFloat(order.totalAmount).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 mb-4">No orders yet</p>
                            <Link
                                to="/shops"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                            >
                                <Store className="w-5 h-5" />
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default CustomerDashboard;
