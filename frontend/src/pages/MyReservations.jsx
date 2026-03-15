import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, XCircle, Clock, Tag, Store, ArrowLeft, RefreshCw, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getDirectDriveLink } from '../utils/api';

const STATUS_CONFIG = {
    PENDING:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700',   icon: <CheckCircle className="w-4 h-4" /> },
    PICKED_UP: { label: 'Picked Up', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700',     icon: <XCircle className="w-4 h-4" /> },
};

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/reservations/my-reservations');
            setReservations(data);
        } catch (error) {
            console.error('Failed to fetch reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this reservation?')) return;
        setCancellingId(id);
        try {
            await api.put(`/reservations/${id}/cancel`);
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel reservation.');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Package className="w-6 h-6 text-primary" />
                                My Reservations
                            </h1>
                            <p className="text-sm text-slate-500">{reservations.length} reservation{reservations.length !== 1 && 's'} found</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchReservations}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {reservations.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700 mb-2">No Reservations Yet</h2>
                        <p className="text-slate-500 mb-6">Browse shops and use "Reserve & Pick" to save on purchases.</p>
                        <Link
                            to="/shops"
                            className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-sky-600 transition-colors"
                        >
                            Browse Shops
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((reservation, index) => {
                            const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.PENDING;
                            const hasSaving = reservation.discountPercentage > 0;
                            const savingsAmount = parseFloat(
                                ((parseFloat(reservation.originalPrice) - parseFloat(reservation.discountedPrice)) * reservation.quantity).toFixed(2)
                            );

                            return (
                                <motion.div
                                    key={reservation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                                >
                                    <div className="p-4 sm:p-5">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                {reservation.product?.imageUrl ? (
                                                    <img
                                                        src={getDirectDriveLink(reservation.product.imageUrl)}
                                                        alt={reservation.product?.name}
                                                        className="w-full h-full object-cover"
                                                        onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 truncate">{reservation.product?.name}</h3>
                                                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${status.color}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-500 mb-2">
                                                    Reservation #{reservation.id} • Qty: {reservation.quantity}
                                                </p>

                                                {/* Pricing */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {hasSaving ? (
                                                        <>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-lg font-bold text-green-600">
                                                                    ₹{(parseFloat(reservation.discountedPrice) * reservation.quantity).toFixed(2)}
                                                                </span>
                                                                <span className="text-sm text-slate-400 line-through">
                                                                    ₹{(parseFloat(reservation.originalPrice) * reservation.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                                <Tag className="w-3 h-3" />
                                                                {reservation.discountPercentage}% OFF
                                                            </div>
                                                            {savingsAmount > 0 && (
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    Save ₹{savingsAmount}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-lg font-bold text-slate-900">
                                                            ₹{(parseFloat(reservation.originalPrice) * reservation.quantity).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Bulk discount tag */}
                                                {reservation.bulkDiscountApplied && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                                                        <Percent className="w-3 h-3" />
                                                        Bulk discount included (+{reservation.bulkDiscountPercentage}%)
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {reservation.notes && (
                                                    <p className="mt-2 text-xs text-slate-500 italic">Note: {reservation.notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Store className="w-3.5 h-3.5" />
                                                <span>Reserved on {new Date(reservation.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}</span>
                                            </div>

                                            {reservation.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleCancel(reservation.id)}
                                                    disabled={cancellingId === reservation.id}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                                                >
                                                    {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReservations;
