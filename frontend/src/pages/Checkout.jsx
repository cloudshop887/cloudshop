import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        zipCode: '',
        phone: ''
    });

    const [deliveryMethods, setDeliveryMethods] = useState({}); // { shopId: 'DELIVERY' | 'PICKUP' }

    // Group items by shop
    const itemsByShop = cartItems.reduce((acc, item) => {
        const shopId = item.shopId;
        if (!acc[shopId]) {
            acc[shopId] = {
                shopName: item.shop?.name || 'Unknown Shop',
                isPickupEnabled: item.shop?.isPickupEnabled ?? true,
                isDeliveryEnabled: item.shop?.isDeliveryEnabled ?? true,
                items: [],
                total: 0
            };

            // Set default delivery method for this shop if not already set
            if (!deliveryMethods[shopId]) {
                const defaultMethod = item.shop?.isDeliveryEnabled !== false ? 'DELIVERY' : 'PICKUP';
                setDeliveryMethods(prev => ({ ...prev, [shopId]: defaultMethod }));
            }
        }
        acc[shopId].items.push(item);
        const price = item.offerPrice || item.price;
        acc[shopId].total += parseFloat(price) * item.quantity;
        return acc;
    }, {});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create an order for each shop
            const orderPromises = Object.keys(itemsByShop).map(shopId => {
                const shopGroup = itemsByShop[shopId];

                const orderData = {
                    shopId: parseInt(shopId),
                    totalAmount: shopGroup.total,
                    orderItems: shopGroup.items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.offerPrice || item.price
                    })),
                    shippingAddress: deliveryMethods[shopId] === 'PICKUP' 
                        ? `PICKUP FROM SHOP: ${shopGroup.shopName}` 
                        : `${shippingInfo.address}, ${shippingInfo.city} - ${shippingInfo.zipCode}`,
                    phone: shippingInfo.phone,
                    deliveryMethod: deliveryMethods[shopId]
                };

                return api.post('/orders', orderData);
            });

            await Promise.all(orderPromises);

            setSuccess(true);
            clearCart();

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/my-orders');
            }, 2000);

        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !success) {
        return (
            <div className="min-h-screen pt-20 pb-12 bg-slate-50 flex flex-col items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-600 mb-6">Add some products to start shopping</p>
                <button
                    onClick={() => navigate('/shops')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                    Browse Shops
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen pt-20 pb-12 bg-slate-50 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h2>
                    <p className="text-slate-600 mb-6">Thank you for shopping with CloudShop.</p>
                    <p className="text-sm text-slate-500">Redirecting to your orders...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {Object.keys(itemsByShop).map(shopId => (
                            <div key={shopId} className="glass-card p-6">
                                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                    Items from {itemsByShop[shopId].shopName}
                                </h3>

                                <div className="space-y-4">
                                    {itemsByShop[shopId].items.map(item => (
                                        <div key={item.id} className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
                                            <img
                                                src={item.imageUrl || "https://placehold.co/100"}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-lg bg-slate-100"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900">{item.name}</h4>
                                                <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                <p className="text-primary font-bold mt-1">
                                                    ₹{(parseFloat(item.offerPrice || item.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-slate-600">Subtotal for this shop</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        ₹{itemsByShop[shopId].total.toFixed(2)}
                                    </span>
                                </div>

                                {/* Delivery Method Selector */}
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-sm font-medium text-slate-700 mb-3">Fulfillment Method</p>
                                    <div className="flex gap-3">
                                        {itemsByShop[shopId].isDeliveryEnabled && (
                                            <button
                                                type="button"
                                                onClick={() => setDeliveryMethods(p => ({ ...p, [shopId]: 'DELIVERY' }))}
                                                className={`flex-1 py-3 px-4 rounded-lg flex flex-col items-center gap-1 border-2 transition-all ${
                                                    deliveryMethods[shopId] === 'DELIVERY'
                                                        ? 'border-primary bg-white shadow-md'
                                                        : 'border-transparent bg-slate-200 text-slate-500 hover:bg-slate-300'
                                                }`}
                                            >
                                                <MapPin className={`w-5 h-5 ${deliveryMethods[shopId] === 'DELIVERY' ? 'text-primary' : 'text-slate-400'}`} />
                                                <span className="text-xs font-bold">Home Delivery</span>
                                            </button>
                                        )}
                                        {itemsByShop[shopId].isPickupEnabled && (
                                            <button
                                                type="button"
                                                onClick={() => setDeliveryMethods(p => ({ ...p, [shopId]: 'PICKUP' }))}
                                                className={`flex-1 py-3 px-4 rounded-lg flex flex-col items-center gap-1 border-2 transition-all ${
                                                    deliveryMethods[shopId] === 'PICKUP'
                                                        ? 'border-primary bg-white shadow-md'
                                                        : 'border-transparent bg-slate-200 text-slate-500 hover:bg-slate-300'
                                                }`}
                                            >
                                                <ShoppingBag className={`w-5 h-5 ${deliveryMethods[shopId] === 'PICKUP' ? 'text-primary' : 'text-slate-400'}`} />
                                                <span className="text-xs font-bold">Self Pickup</span>
                                            </button>
                                        )}
                                    </div>
                                    {deliveryMethods[shopId] === 'PICKUP' && (
                                        <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Visit shop to collect your items after order confirmation.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Shipping & Payment */}
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="glass-card p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Shipping Details
                            </h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                                    <textarea
                                        name="address"
                                        required
                                        rows="3"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none"
                                        placeholder="Street address, Apt, etc."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={shippingInfo.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            required
                                            value={shippingInfo.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={shippingInfo.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-medium text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary">
                                        ₹{getCartTotal().toFixed(2)}
                                    </span>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg mb-6 flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm text-slate-600">Payment Method: <span className="font-medium text-slate-900">Cash on Delivery</span></span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-bold text-lg shadow-lg shadow-sky-200 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
