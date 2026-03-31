import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, ArrowRight, Filter, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getDirectDriveLink } from '../utils/api';
import { checkShopOpen } from '../utils/timeHelpers';
import { calculateDistance, getCurrentPosition, formatDistance } from '../utils/distance';

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [userLocation, setUserLocation] = useState(null);
    const [shopDistances, setShopDistances] = useState({});
    const [calculatingFor, setCalculatingFor] = useState(null);

    const categories = ["All", "Grocery", "Fruits & Vegetables", "Bakery", "Electronics", "Stationery", "Medical", "Mobile Shop", "Fashion & Clothing", "Restaurant/Cafe"];

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const { data } = await api.get('/shops');
                setShops(data);
            } catch (error) {
                console.error("Failed to fetch shops", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    // Handle distance calculation for a specific shop
    const handleCalculateDistance = async (shop) => {
        if (shop.latitude === null || shop.latitude === undefined || shop.longitude === null || shop.longitude === undefined) {
            alert('Shop location not available');
            return;
        }

        setCalculatingFor(shop.id);

        try {
            const position = await getCurrentPosition();
            const { lat: userLat, lon: userLon } = position;

            if (!userLocation) {
                setUserLocation({ lat: userLat, lon: userLon });
            }

            const dist = calculateDistance(
                userLat,
                userLon,
                shop.latitude,
                shop.longitude
            );

            if (dist !== null) {
                setShopDistances(prev => ({
                    ...prev,
                    [shop.id]: dist
                }));
            }
        } catch (error) {
            console.error('Error getting location:', error);
            alert(error.message || 'Unable to get your location.');
        } finally {
            setCalculatingFor(null);
        }
    };

    const filteredShops = useMemo(() => {
        return shops.filter(shop => {
            const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || shop.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [shops, searchTerm, selectedCategory]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto">

                {/* Header & Search */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Explore Local Shops</h1>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by shop name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? 'bg-primary text-white shadow-md shadow-sky-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shops Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredShops.length > 0 ? (
                            filteredShops.map((shop) => (
                                <motion.div
                                    key={shop.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="h-48 bg-slate-200 relative">
                                        <img
                                            src={getDirectDriveLink(shop.bannerUrl, 400) || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60"}
                                            alt={shop.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60";
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                                            {shop.category}
                                        </div>

                                        {/* Shop Logo Overlay */}
                                        {shop.logoUrl && (
                                            <div className="absolute -bottom-6 left-6 p-1 bg-white rounded-full shadow-lg">
                                                <img
                                                    src={getDirectDriveLink(shop.logoUrl, 100)}
                                                    alt={shop.name}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/64?text=Logo";
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 pt-8">
                                        {/* Shop Name with Distance Button */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-slate-900">{shop.name}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCalculateDistance(shop);
                                                }}
                                                disabled={calculatingFor === shop.id}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                                title="Calculate distance"
                                            >
                                                {calculatingFor === shop.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Navigation className="w-3 h-3" />
                                                        {shopDistances[shop.id] !== undefined ? (
                                                            <span>
                                                                {formatDistance(shopDistances[shop.id])}
                                                            </span>
                                                        ) : (
                                                            <span>Distance</span>
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{shop.address}</span>
                                        </div>

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>4.5</span>
                                                <span className="text-slate-400 font-normal text-xs">(120+)</span>
                                            </div>
                                            {(() => {
                                                const isOpen = checkShopOpen(shop.openTime, shop.closeTime);
                                                if (isOpen === null) return null; // Or show nothing
                                                return isOpen ? (
                                                    <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                                                        Open Now
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                                                        Closed
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <Link
                                            to={`/shops/${shop.id}`}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg hover:bg-primary transition-colors"
                                        >
                                            Visit Shop <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-slate-500 text-lg">No shops found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shops;
