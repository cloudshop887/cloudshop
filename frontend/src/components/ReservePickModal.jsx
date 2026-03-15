import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Tag, Package, X, CheckCircle, TrendingDown, Zap, Info, Loader } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';

/**
 * ReservePickModal – Shown when a customer clicks "Reserve & Pick" on a product.
 * Fetches a live discount preview, then lets them confirm the reservation.
 */
const ReservePickModal = ({ product, shop, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const maxQty = Math.min(product.stock, 20);

    // Fetch discount preview whenever quantity changes
    useEffect(() => {
        let cancelled = false;
        const fetchPreview = async () => {
            setLoadingPreview(true);
            try {
                const { data } = await api.post('/reservations/preview-discount', {
                    productId: product.id,
                    shopId: shop.id,
                    quantity,
                });
                if (!cancelled) setPreview(data);
            } catch (err) {
                if (!cancelled) setError('Could not load discount info.');
            } finally {
                if (!cancelled) setLoadingPreview(false);
            }
        };
        fetchPreview();
        return () => { cancelled = true; };
    }, [product.id, shop.id, quantity]);

    const handleConfirm = async () => {
        setSubmitting(true);
        setError('');
        try {
            const { data } = await api.post('/reservations', {
                productId: product.id,
                shopId: shop.id,
                quantity,
                notes: notes.trim() || undefined,
            });
            setConfirmed(true);
            if (onSuccess) onSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create reservation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                    {confirmed ? (
                        /* Success State */
                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Reserved! 🎉</h3>
                            <p className="text-slate-600 mb-1">
                                <span className="font-semibold text-primary">{product.name}</span> has been reserved.
                            </p>
                            <p className="text-sm text-slate-500 mb-6">Visit the shop to pick it up and enjoy your discount!</p>
                            {preview && preview.discountPercentage > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                    <p className="text-green-700 font-bold text-lg">
                                        You saved ₹{preview.totalSavings.toFixed(2)}!
                                    </p>
                                    <p className="text-green-600 text-sm">{preview.discountPercentage}% Reserve & Pick discount applied</p>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        /* Reservation Form */
                        <>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white relative">
                                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Reserve & Pick</h3>
                                        <p className="text-sky-100 text-sm">Reserve now, pick up from the shop</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Product Info */}
                                <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-14 h-14 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.imageUrl && (
                                            <img src={getDirectDriveLink(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{shop.name}</p>
                                        <p className="text-primary font-bold mt-1">₹{parseFloat(product.offerPrice || product.price).toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-bold text-xl"
                                        >-</button>
                                        <span className="text-xl font-bold text-slate-900 w-8 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-bold text-xl"
                                        >+</button>
                                        <span className="text-xs text-slate-400 ml-1">(Max: {maxQty})</span>
                                    </div>

                                    {/* Bulk discount hint */}
                                    {preview && preview.isDiscountEnabled && shop.bulkDiscountMinItems && quantity < shop.bulkDiscountMinItems && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                            <Zap className="w-3.5 h-3.5" />
                                            Add {shop.bulkDiscountMinItems - quantity} more for extra bulk discount!
                                        </div>
                                    )}
                                </div>

                                {/* Discount Preview */}
                                {loadingPreview ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader className="w-5 h-5 animate-spin text-primary" />
                                        <span className="ml-2 text-sm text-slate-500">Calculating discount...</span>
                                    </div>
                                ) : preview ? (
                                    <div className={`rounded-xl p-4 border ${preview.isDiscountEnabled && preview.discountPercentage > 0
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                        : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className={`w-4 h-4 ${preview.isDiscountEnabled && preview.discountPercentage > 0 ? 'text-green-600' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-bold ${preview.isDiscountEnabled && preview.discountPercentage > 0 ? 'text-green-700' : 'text-slate-500'}`}>
                                                {preview.isDiscountEnabled && preview.discountPercentage > 0
                                                    ? `Reserve & Pick Discount: ${preview.discountPercentage}% OFF`
                                                    : 'No discount active for this shop'}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Original price ({quantity} × ₹{preview.originalPrice.toFixed(2)})</span>
                                                <span className={preview.discountPercentage > 0 ? 'text-slate-400 line-through' : 'font-bold text-slate-900'}>
                                                    ₹{preview.totalOriginal.toFixed(2)}
                                                </span>
                                            </div>

                                            {preview.discountPercentage > 0 && (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-green-600">
                                                            Reserve & Pick discount
                                                            {preview.bulkDiscountApplied && ` (base + bulk)`}
                                                        </span>
                                                        <span className="text-green-600 font-bold">-₹{preview.totalSavings.toFixed(2)}</span>
                                                    </div>

                                                    {preview.bulkDiscountApplied && (
                                                        <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                                                            <Zap className="w-3 h-3" />
                                                            Bulk discount applied! (+{preview.bulkDiscountPercentage}%)
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between font-bold text-lg border-t border-green-200 pt-2 mt-2">
                                                        <span className="text-slate-900">You Pay</span>
                                                        <span className="text-green-600">₹{preview.totalDiscounted.toFixed(2)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                        <Info className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Any special instructions for the shop..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                {/* Info Banner */}
                                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span>Visit the shop to pick up your reserved items. The discount applies at the counter when you show your reservation.</span>
                                </div>

                                {/* Confirm Button */}
                                <button
                                    onClick={handleConfirm}
                                    disabled={submitting || loadingPreview}
                                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-base hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <><Loader className="w-5 h-5 animate-spin" />Reserving...</>
                                    ) : (
                                        <><Package className="w-5 h-5" />Confirm Reservation</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
    );
};

export default ReservePickModal;
