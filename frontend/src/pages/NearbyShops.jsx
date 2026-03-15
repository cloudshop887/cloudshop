import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Store, Info } from 'lucide-react';
import api from '../utils/api';
import { getCurrentPosition } from '../utils/distance';

const NearbyShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [radius, setRadius] = useState(5);
    const [category, setCategory] = useState('All');

    const categories = ["All", "Grocery", "Fruits & Vegetables", "Bakery", "Electronics", "Stationery", "Medical", "Mobile Shop", "Fashion & Clothing", "Restaurant/Cafe"];

    useEffect(() => {
        const getInitialLocation = async () => {
            setLoading(true);
            try {
                const position = await getCurrentPosition();
                setLocation({
                    lat: position.lat,
                    lng: position.lon
                });
                fetchNearbyShops(position.lat, position.lon, radius, category);
            } catch (err) {
                console.error('Location error:', err);
                setError(err.message || 'Unable to retrieve your location.');
                setLoading(false);
            }
        };

        getInitialLocation();
    }, []);

    const fetchNearbyShops = async (lat, lng, r, cat) => {
        try {
            setLoading(true);
            const queryCategory = cat && cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
            const response = await api.get(`/shops/nearby?lat=${lat}&lng=${lng}&radius=${r}${queryCategory}`);
            setShops(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch nearby shops.');
        } finally {
            setLoading(false);
        }
    };

    const handleRadiusChange = (e) => {
        const newRadius = e.target.value;
        setRadius(newRadius);
        if (location) {
            fetchNearbyShops(location.lat, location.lng, newRadius, category);
        }
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setCategory(newCategory);
        if (location) {
            fetchNearbyShops(location.lat, location.lng, radius, newCategory);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Nearby Shops</h1>
                    <p className="text-slate-600">Find shops closest to your location.</p>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-6 glass-card p-4">
                    <div className="flex items-center gap-3">
                        <label className="font-bold text-slate-700 text-sm">Radius:</label>
                        <select
                            value={radius}
                            onChange={handleRadiusChange}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="1">1 km</option>
                            <option value="3">3 km</option>
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="25">25 km</option>
                            <option value="50">50 km</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="font-bold text-slate-700 text-sm">Category:</label>
                        <select
                            value={category}
                            onChange={handleCategoryChange}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && shops.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No shops found within {radius}km.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                        <motion.div
                            key={shop.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{shop.name}</h3>
                                    <p className="text-sm text-slate-500">{shop.category}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {shop.isOpen ? 'OPEN' : 'CLOSED'}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-slate-600">
                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                    <span className="text-sm truncate">{shop.address}</span>
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <Navigation className="w-4 h-4 mr-2 text-primary" />
                                    <span className="text-sm">{shop.distance.toFixed(2)} km away</span>
                                </div>
                                {shop.openTime && (
                                    <div className="flex items-center text-slate-600">
                                        <Clock className="w-4 h-4 mr-2 text-primary" />
                                        <span className="text-sm">{shop.openTime} - {shop.closeTime}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => window.location.href = `/shops/${shop.id}`}
                                className="w-full py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
                            >
                                Visit Shop
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NearbyShops;
