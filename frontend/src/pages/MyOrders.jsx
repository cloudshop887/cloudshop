import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusAlert, setStatusAlert] = useState(null);
    const prevOrdersRef = useRef([]);

    useEffect(() => {
        fetchOrders();

        // Poll for updates every 10 seconds
        const intervalId = setInterval(() => {
            pollOrders();
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
            prevOrdersRef.current = data;
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const pollOrders = async () => {
        try {
            const { data: latestOrders } = await api.get('/orders/myorders');

            // Check for status changes
            latestOrders.forEach(newOrder => {
                const oldOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
                if (oldOrder && oldOrder.status !== newOrder.status) {
                    if (newOrder.status === 'DISPATCHED') {
                        setStatusAlert(`Order #${newOrder.id} has been dispatched! 🚚`);
                        // Play sound
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.play().catch(() => { });
                        } catch (e) { }
                    }
                }
            });

            setOrders(latestOrders);
            prevOrdersRef.current = latestOrders;
        } catch (error) {
            console.error('Error polling orders:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'PROCESSING': return 'text-blue-600 bg-blue-100';
            case 'DISPATCHED': return 'text-blue-600 bg-blue-100';

            case 'DELIVERED': return 'text-green-600 bg-green-100';
            case 'CANCELLED': return 'text-red-600 bg-red-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Notification Banner */}
                <AnimatePresence>
                    {statusAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-24 right-4 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 cursor-pointer"
                            onClick={() => setStatusAlert(null)}
                        >
                            <Truck className="w-6 h-6 animate-bounce" />
                            <div>
                                <h4 className="font-bold">Order Update!</h4>
                                <p className="text-sm">{statusAlert}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setStatusAlert(null); }} className="ml-4 hover:text-blue-200">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
                    <Link to="/shops" className="text-primary hover:text-sky-600 font-medium">
                        Continue Shopping
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
                        <p className="text-slate-600 mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link
                            to="/shops"
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors inline-block"
                        >
                            Browse Shops
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Order ID</p>
                                        <p className="font-mono font-bold text-slate-900">#{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Date Placed</p>
                                        <p className="font-medium text-slate-900">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Shop</p>
                                        <p className="font-medium text-slate-900">{order.shop?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                                        <p className="font-bold text-primary text-lg">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-bold text-slate-900 mb-4">Items</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {item.product?.imageUrl ? (
                                                            <img src={getDirectDriveLink(item.product.imageUrl)} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{item.product?.name || `Product #${item.productId}`}</p>
                                                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium text-slate-900">
                                                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
