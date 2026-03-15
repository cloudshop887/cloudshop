import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getDirectDriveLink } from '../utils/api';
import { getOpeningHoursString } from '../utils/timeHelpers';

const RegisterShop = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        category: '',
        openTime: '',
        closeTime: '',
        description: '',
        logoUrl: ''
    });

    const [customCategory, setCustomCategory] = useState('');

    const [isLocating, setIsLocating] = useState(false);
    const [loading, setLoading] = useState(false);

    const [hasShop, setHasShop] = useState(false);
    const [existingShop, setExistingShop] = useState(null);

    // Check if user is logged in and if they already have a shop
    useEffect(() => {
        const checkShopStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first to register your shop');
                navigate('/login');
                return;
            }

            try {
                // Try to fetch 'my-shop'. verify if user is already an owner.
                // This will work if role is SHOP_OWNER in DB, even if local storage is outdated.
                const { data: userShop } = await api.get('/shops/my-shop');

                if (userShop) {
                    setHasShop(true);
                    setExistingShop(userShop);

                    // Auto-fix local storage if needed, but DON'T downgrade ADMINS
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    if (userInfo.role !== 'SHOP_OWNER' && userInfo.role !== 'ADMIN') {
                        userInfo.role = 'SHOP_OWNER';
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                        window.dispatchEvent(new Event('userLoggedIn'));
                    }
                }
            } catch (error) {
                // Ignore 403 (Not owner) and 404 (No shop found)
            }
        };

        checkShopStatus();
    }, [navigate]);

    const categories = [
        "Grocery",
        "Fruits & Vegetables",
        "Bakery",
        "Electronics",
        "Stationery",
        "Medical",
        "Mobile Shop",
        "Fashion & Clothing",
        "Restaurant/Cafe",
        "Other"
    ];



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon
                }));

                // Reverse Geocoding to get address
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    if (data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }));
                    }
                } catch (error) {
                    console.error("Error getting address:", error);
                }

                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                let msg = "Unable to retrieve your location";
                if (error.code === error.PERMISSION_DENIED) msg = "Location permission denied. Please allow access in browser settings.";
                alert(msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submissionData = { ...formData };
            if (submissionData.category === 'Other') {
                submissionData.category = customCategory;
            }

            // Generate openingHours string for backward compatibility / display
            if (submissionData.openTime && submissionData.closeTime) {
                submissionData.openingHours = getOpeningHoursString(submissionData.openTime, submissionData.closeTime);
            }

            console.log('Submitting shop registration:', submissionData);
            const { data } = await api.post('/shops', submissionData);
            console.log('Shop registration response:', data);

            // Update user role in local storage with the data returned from backend
            const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

            // Only update role if current is not ADMIN
            // Optimistically set to SHOP_OWNER so the UI updates immediately
            const newRole = currentUserInfo.role === 'ADMIN' ? 'ADMIN' : 'SHOP_OWNER';

            const updatedUserInfo = {
                ...currentUserInfo,
                role: newRole,
                id: data.user.id,
                _id: data.user.id,
                fullName: data.user.fullName,
                email: data.user.email
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            // Trigger navbar update
            window.dispatchEvent(new Event('userLoggedIn'));

            alert('Shop registered successfully! Your shop is now pending approval. You can check the status in your Shop Dashboard.');
            navigate('/my-shop');
        } catch (error) {
            console.error('Shop registration error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Shop registration failed';

            if (errorMessage === 'You already own a shop') {
                // If backend says we own a shop, update local state and redirect
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                userInfo.role = 'SHOP_OWNER';
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                window.dispatchEvent(new Event('userLoggedIn'));

                alert('You already have a registered shop. Redirecting to your dashboard.');
                navigate('/my-shop');
            } else {
                alert(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    if (hasShop) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col items-center justify-center text-center">
                <div className="glass-card p-8 max-w-md w-full">
                    <Store className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Shop Already Registered</h2>
                    <p className="text-slate-600 mb-6">
                        You have already registered <span className="font-bold text-slate-900">{existingShop?.name}</span>. You can manage your products and orders from your dashboard.
                    </p>
                    <button
                        onClick={() => navigate('/my-shop')}
                        className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium shadow-lg shadow-sky-200"
                    >
                        Go to Shop Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Register Your <span className="text-primary">Shop</span>
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Join our cloud marketplace and reach customers in your neighborhood.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass-card p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Store className="w-5 h-5 text-primary" /> Shop Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your shop's official name"
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Address</label>
                                    <textarea
                                        name="address"
                                        required
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Full address including street, area, city, pincode"
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Location</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                name="latitude"
                                                step="any"
                                                required
                                                value={formData.latitude}
                                                onChange={handleChange}
                                                placeholder="Latitude"
                                                className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary outline-none"
                                            />
                                            <input
                                                type="number"
                                                name="longitude"
                                                step="any"
                                                required
                                                value={formData.longitude}
                                                onChange={handleChange}
                                                placeholder="Longitude"
                                                className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={isLocating}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-100 text-primary hover:bg-sky-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isLocating ? (
                                                <span className="animate-pulse">Locating...</span>
                                            ) : (
                                                <>
                                                    <Navigation className="w-4 h-4" /> Auto-detect
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Use auto-detect or paste coordinates manually.</p>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Category</label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {formData.category === 'Other' && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Specify Category</label>
                                            <input
                                                type="text"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                required
                                                placeholder="Enter custom category"
                                                className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Opening Hours</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="time"
                                                name="openTime"
                                                required
                                                value={formData.openTime}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-2 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary outline-none"
                                                title="Opening Time"
                                            />
                                        </div>
                                        <div className="flex items-center text-slate-400">-</div>
                                        <div className="flex-1 relative">
                                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="time"
                                                name="closeTime"
                                                required
                                                value={formData.closeTime}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-2 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary outline-none"
                                                title="Closing Time"
                                            />
                                        </div>
                                    </div>
                                    {formData.openTime && formData.closeTime && (
                                        <p className="text-xs text-primary mt-1 font-medium">
                                            {getOpeningHoursString(formData.openTime, formData.closeTime)}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Short intro about your shop, services, or offers"
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Logo URL (Optional)</label>
                                    <input
                                        type="url"
                                        name="logoUrl"
                                        value={formData.logoUrl || ''}
                                        onChange={handleChange}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                    {formData.logoUrl && (
                                        <div className="mt-2 p-2 border border-slate-200 rounded-lg bg-white inline-block">
                                            <img
                                                src={getDirectDriveLink(formData.logoUrl)}
                                                alt="Logo Preview"
                                                className="h-16 w-16 object-cover rounded-full"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/64?text=Error';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registering...' : 'Register Shop'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterShop;
