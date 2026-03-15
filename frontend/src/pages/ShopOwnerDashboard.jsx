import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Edit, Trash2, Store, TrendingUp, IndianRupee, Eye, FileSpreadsheet, MapPin, Bell, XCircle, Briefcase, GraduationCap, Users, BookMarked, Tag } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';

const ShopOwnerDashboard = () => {
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newOrderAlert, setNewOrderAlert] = useState(null);
    const prevOrdersRef = useRef([]);

    useEffect(() => {
        fetchShopData();

        // Poll for new orders every 10 seconds
        const intervalId = setInterval(() => {
            if (shop?.id) {
                pollOrders(shop.id);
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, [shop?.id]);

    const fetchShopData = async () => {
        try {
            // Get user's shop using the new endpoint
            const { data: myShop } = await api.get('/shops/my-shop');

            if (myShop) {
                setShop(myShop);
                // Get shop's products
                const { data: allProducts } = await api.get(`/products?shopId=${myShop.id}`);
                setProducts(allProducts);

                // Get shop's orders
                try {
                    const { data: shopOrders } = await api.get(`/orders/shop/${myShop.id}`);
                    setOrders(shopOrders);
                    prevOrdersRef.current = shopOrders;
                } catch (err) {
                    console.log('Orders endpoint not available yet');
                    setOrders([]);
                }

                // Get reservations
                try {
                    const { data: resData } = await api.get(`/reservations/shop/${myShop.id}`);
                    setReservations(resData);
                } catch (err) {
                    console.log('Reservations not available');
                }
            }
        } catch (error) {
            console.error('Error fetching shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const pollOrders = async (shopId) => {
        try {
            const { data: latestOrders } = await api.get(`/orders/shop/${shopId}`);

            // Check for new orders
            if (latestOrders.length > prevOrdersRef.current.length) {
                const newOrdersCount = latestOrders.length - prevOrdersRef.current.length;
                setNewOrderAlert(`You have ${newOrdersCount} new order(s)!`);

                // Play notification sound if possible (browser policy might block)
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(e => console.log('Audio play failed', e));
                } catch (e) {
                    // Ignore audio errors
                }
            }

            setOrders(latestOrders);
            prevOrdersRef.current = latestOrders;
        } catch (error) {
            console.error('Error polling orders:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.delete(`/products/${productId}`);
            alert('Product deleted successfully!');
            fetchShopData(); // Refresh
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });

            // Optimistic update
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            // Also update ref to avoid false "new order" alert on next poll
            prevOrdersRef.current = prevOrdersRef.current.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );

        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update order status');
        }
    };

    const calculateRevenue = () => {
        return orders.reduce((total, order) => total + parseFloat(order.totalAmount || 0), 0);
    };

    const handleReservationStatus = async (resId, status) => {
        try {
            await api.put(`/reservations/${resId}/status`, { status });
            setReservations(prev => prev.map(r => r.id === resId ? { ...r, status } : r));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update reservation status.');
        }
    };

    const pendingReservations = reservations.filter(r => r.status === 'PENDING');

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen pt-20 pb-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20 glass-card">
                        <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">No Shop Registered</h2>
                        <p className="text-slate-600 mb-6">You haven't registered a shop yet.</p>
                        <Link
                            to="/register-shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Register Your Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Notification Banner */}
                <AnimatePresence>
                    {newOrderAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-24 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 cursor-pointer"
                            onClick={() => setNewOrderAlert(null)}
                        >
                            <Bell className="w-6 h-6 animate-bounce" />
                            <div>
                                <h4 className="font-bold">New Order Alert!</h4>
                                <p className="text-sm">{newOrderAlert}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setNewOrderAlert(null); }} className="ml-4 hover:text-green-200">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shop Header */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{shop.name}</h1>
                            <div className="flex items-center gap-2 mt-2 text-slate-600">
                                <MapPin className="w-4 h-4 text-primary" />
                                <p>{shop.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${shop.isApproved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {shop.isApproved ? '✅ Live' : '⏳ Pending Approval'}
                            </span>
                            <Link
                                to="/shop-settings"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Shop
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Total Products", value: products.length, icon: <Package className="w-10 h-10 text-primary" /> },
                        { label: "Total Orders", value: orders.length, icon: <TrendingUp className="w-10 h-10 text-green-500" /> },
                        { label: "Pending Reservations", value: pendingReservations.length, icon: <BookMarked className="w-10 h-10 text-sky-500" /> },
                        { label: "Revenue", value: `₹${calculateRevenue().toFixed(2)}`, icon: <IndianRupee className="w-10 h-10 text-amber-500" /> }
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
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </div>
                                {stat.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Reservations Panel */}
                {reservations.length > 0 && (
                    <div className="glass-card p-6 mb-8 border-2 border-sky-100 shadow-sky-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <BookMarked className="w-6 h-6 text-sky-500" />
                                <h2 className="text-2xl font-bold text-slate-900">Reservations</h2>
                                {pendingReservations.length > 0 && (
                                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {pendingReservations.length} pending
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">ID</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Customer</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Product</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Qty</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Price</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Discount</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                                        <th className="text-left py-3 px-4 text-slate-700 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map(res => (
                                        <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 font-mono text-sm">#{res.id}</td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-slate-900 text-sm">{res.user?.fullName || 'Guest'}</p>
                                                <p className="text-xs text-slate-400">{res.user?.phone || res.user?.email || ''}</p>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{res.product?.name || `Product #${res.productId}`}</td>
                                            <td className="py-3 px-4 text-sm font-medium">{res.quantity}</td>
                                            <td className="py-3 px-4">
                                                {res.discountPercentage > 0 ? (
                                                    <div>
                                                        <span className="text-green-600 font-bold text-sm">₹{(parseFloat(res.discountedPrice) * res.quantity).toFixed(2)}</span>
                                                        <span className="text-slate-400 line-through text-xs ml-1">₹{(parseFloat(res.originalPrice) * res.quantity).toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-sm">₹{(parseFloat(res.originalPrice) * res.quantity).toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {res.discountPercentage > 0 ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        <Tag className="w-3 h-3" />{res.discountPercentage}%
                                                    </span>
                                                ) : <span className="text-slate-400 text-xs">No discount</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                    res.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                                    res.status === 'PICKED_UP' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>{res.status}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {res.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReservationStatus(res.id, 'CONFIRMED')}
                                                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                                        >Confirm</button>
                                                        <button
                                                            onClick={() => handleReservationStatus(res.id, 'CANCELLED')}
                                                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                                        >Cancel</button>
                                                    </div>
                                                )}
                                                {res.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleReservationStatus(res.id, 'PICKED_UP')}
                                                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                                                    >Mark Picked Up</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Products Section */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">My Products</h2>
                            <div className="flex gap-2">
                                <Link
                                    to="/bulk-upload"
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    <FileSpreadsheet className="w-5 h-5" />
                                    Bulk Upload
                                </Link>
                                <Link
                                    to="/add-product"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Product
                                </Link>
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Product</th>
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Price</th>
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Stock</th>
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getDirectDriveLink(product.imageUrl) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                                                            alt={product.name}
                                                            className="w-10 h-10 object-cover rounded bg-slate-100"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://placehold.co/100?text=No+Img";
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                                                            <p className="text-xs text-slate-500">{product.views || 0} views</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-medium">₹{parseFloat(product.price).toFixed(2)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/edit-product/${product.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500 mb-4">No products yet</p>
                            </div>
                        )}
                    </div>

                    {/* Orders Section */}
                    <div className="glass-card p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Orders</h2>
                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Order ID</th>
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Customer</th>
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Total</th>
                                            <th className="text-left py-3 px-4 text-slate-700 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4 font-mono">#{order.id}</td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-slate-900">{order.user?.fullName || 'Guest'}</p>
                                                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-primary">₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                                                <td className="py-3 px-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase border-none outline-none cursor-pointer ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            order.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="DISPATCHED">Dispatched</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No orders received yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopOwnerDashboard;
