import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-bold text-slate-900">Your Cart</h2>
                                <span className="bg-primary text-white text-sm font-bold px-2 py-1 rounded-full">
                                    {getCartCount()}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-600" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingCart className="w-20 h-20 text-slate-300 mb-4" />
                                    <p className="text-slate-500 text-lg mb-2">Your cart is empty</p>
                                    <p className="text-slate-400 text-sm">Add some products to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => {
                                        const price = item.offerPrice || item.price;
                                        return (
                                            <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                                                <img
                                                    src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{item.name}</h3>
                                                    <p className="text-primary font-bold mb-2">₹{parseFloat(price).toFixed(2)}</p>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="p-1.5 hover:bg-slate-100 rounded-l-lg transition-colors"
                                                            >
                                                                <Minus className="w-4 h-4 text-slate-600" />
                                                            </button>
                                                            <span className="px-3 font-medium text-slate-900">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="p-1.5 hover:bg-slate-100 rounded-r-lg transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4 text-slate-600" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-slate-200 bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-semibold text-slate-700">Total:</span>
                                    <span className="text-2xl font-bold text-primary">₹{getCartTotal().toFixed(2)}</span>
                                </div>
                                <Link
                                    to="/checkout"
                                    onClick={onClose}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-sky-600 transition-colors font-medium shadow-lg shadow-sky-200"
                                >
                                    Proceed to Checkout <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
