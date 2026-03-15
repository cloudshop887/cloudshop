import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, ShoppingCart, ArrowLeft, Package, Store, Navigation, Car, Bike, Footprints, Info, Search, Tag, Percent } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';
import { useCart } from '../context/CartContext';
import { checkShopOpen } from '../utils/timeHelpers';
import { calculateDistance, getCurrentPosition, calculateTravelTimes, formatDistance, formatTravelTime } from '../utils/distance';
import ReservePickModal from '../components/ReservePickModal';

const ShopDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showReserveModal, setShowReserveModal] = useState(false);

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (showPurchaseModal || showReserveModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPurchaseModal, showReserveModal]);
    const [addedToCart, setAddedToCart] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Distance calculator states
    const [userLocation, setUserLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [travelTimes, setTravelTimes] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const location = useLocation();

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                const { data } = await api.get(`/shops/${id}`);
                setShop(data);
                setProducts(data.products || []);
            } catch (error) {
                console.error('Failed to fetch shop details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchShopDetails();
    }, [id]);

    // Handle deep linking to product
    useEffect(() => {
        if (!loading && products.length > 0) {
            const params = new URLSearchParams(location.search);
            const productId = params.get('productId');

            if (productId) {
                const element = document.getElementById(`product-${productId}`);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Highlight the product momentarily
                        element.classList.add('ring-4', 'ring-primary', 'ring-opacity-50');
                        setTimeout(() => {
                            element.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50');
                        }, 2000);
                    }, 500);
                }
            }
        }
    }, [loading, products, location.search]);

    const handleAddToCart = (product) => {
        try {
            addToCart(product, 1);
            setAddedToCart(product.id);

            // Show success message for 2 seconds
            setTimeout(() => {
                setAddedToCart(null);
            }, 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart. Please try again.');
        }
    };

    const handleBuyNow = (product) => {
        setSelectedProduct(product);
        setShowPurchaseModal(true);
    };

    const handleOnlineOrder = () => {
        // Add to cart and go to checkout
        handleAddToCart(selectedProduct);
        setShowPurchaseModal(false);
        navigate('/checkout');
    };

    const handleReservePickup = () => {
        // Open Reserve & Pick modal
        setShowPurchaseModal(false);
        setShowReserveModal(true);
    };

    // Get user's current location and calculate distance
    const handleGetDistance = async () => {
        if (shop.latitude === null || shop.latitude === undefined || shop.longitude === null || shop.longitude === undefined) {
            alert('Shop location not available. Coordinates are missing.');
            return;
        }

        setLoadingLocation(true);

        try {
            const position = await getCurrentPosition();
            const { lat: userLat, lon: userLon } = position;

            setUserLocation({ lat: userLat, lon: userLon });

            const dist = calculateDistance(
                userLat,
                userLon,
                shop.latitude,
                shop.longitude
            );

            if (dist !== null) {
                setDistance(dist);
                setTravelTimes(calculateTravelTimes(dist));
            } else {
                alert('Could not calculate distance. Invalid coordinates.');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            alert(error.message || 'Unable to get your location. Please check your browser settings.');
        } finally {
            setLoadingLocation(false);
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center">
                <p className="text-slate-500">Shop not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Link to="/shops" className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shops
                </Link>
            </div>

            {/* Compact Shop Banner */}
            <div className="relative h-40 bg-slate-200 mt-4">
                <img
                    src={getDirectDriveLink(shop.bannerUrl) || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Compact Shop Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="glass-card p-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        {/* Logo */}
                        {shop.logoUrl && (
                            <img
                                src={getDirectDriveLink(shop.logoUrl)}
                                alt={`${shop.name} logo`}
                                className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover flex-shrink-0"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/100?text=Logo";
                                }}
                            />
                        )}

                        {/* Name & Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{shop.name}</h1>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                    {shop.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 text-sm">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-bold">4.5</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                    <span className="truncate max-w-[200px] sm:max-w-md">{shop.address}</span>
                                </div>
                                {shop.openingHours && (
                                    <div className="hidden sm:flex items-center gap-1 border-l border-slate-300 pl-2 ml-1">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        <span>{shop.openingHours}</span>
                                        {(() => {
                                            const isOpen = checkShopOpen(shop.openTime, shop.closeTime);
                                            if (isOpen !== null) {
                                                return (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isOpen ? 'Open' : 'Closed'}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Description & Hours (Collapsible or small) */}
                    {shop.description && (
                        <p className="mt-3 text-xs sm:text-sm text-slate-500 line-clamp-2">{shop.description}</p>
                    )}
                </div>

                {/* Compact Distance Calculator */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Navigation className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Distance to Shop</h2>
                                {distance !== null ? (
                                    <p className="text-xs text-slate-500">
                                        From your location: <span className="font-bold text-primary">
                                            {formatDistance(distance)}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500">Calculate travel time & distance</p>
                                )}
                            </div>
                        </div>

                        {distance === null ? (
                            <button
                                onClick={handleGetDistance}
                                disabled={loadingLocation}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 w-full md:w-auto"
                            >
                                {loadingLocation ? 'Locating...' : 'Calculate'}
                            </button>
                        ) : (
                            <div className="flex flex-1 md:justify-end items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                                {/* Modes */}
                                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                                    {/* Walking */}
                                    <div className="flex flex-col items-center px-3 py-1 border-r border-slate-200 min-w-[60px]">
                                        <Footprints className="w-4 h-4 text-green-600 mb-0.5" />
                                        <span className="text-[10px] font-bold text-slate-700">{formatTravelTime(travelTimes.walking)}</span>
                                        <span className="text-[9px] text-slate-400">Walk</span>
                                    </div>

                                    {/* Scooter/Bike */}
                                    <div className="flex flex-col items-center px-3 py-1 border-r border-slate-200 min-w-[60px]">
                                        <Bike className="w-4 h-4 text-blue-600 mb-0.5" />
                                        <span className="text-[10px] font-bold text-slate-700">{formatTravelTime(travelTimes.biking)}</span>
                                        <span className="text-[9px] text-slate-400">Scooty</span>
                                    </div>

                                    {/* Car */}
                                    <div className="flex flex-col items-center px-3 py-1 min-w-[60px]">
                                        <Car className="w-4 h-4 text-purple-600 mb-0.5" />
                                        <span className="text-[10px] font-bold text-slate-700">{formatTravelTime(travelTimes.driving)}</span>
                                        <span className="text-[9px] text-slate-400">Car</span>
                                    </div>
                                </div>

                                {/* Maps Link */}
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${shop.latitude},${shop.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-sm flex-shrink-0"
                                    title="Open in Google Maps"
                                >
                                    <MapPin className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Available Products</h2>

                        {/* Search within shop */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search in this shop..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {(() => {
                        const filteredProducts = products.filter(product =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.subcategory?.toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        if (filteredProducts.length > 0) {
                            return (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {filteredProducts.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            id={`product-${product.id}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -3 }}
                                            className={`bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''}`}
                                        >
                                            {/* Product Image - Compact */}
                                            <div className="h-40 bg-slate-100 relative group">
                                                <img
                                                    src={getDirectDriveLink(product.imageUrl) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
                                                    }}
                                                />
                                                {product.offerPrice && (
                                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                        {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                                                    </div>
                                                )}
                                                {!product.offerPrice && shop.isReservePickDiscountEnabled && shop.reservePickDiscountPercentage > 0 && (
                                                    <div className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        Pick {shop.reservePickDiscountPercentage}% OFF
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details - Compact */}
                                            <div className="p-3 flex flex-col flex-1">
                                                <div className="mb-2 flex-1">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{product.category}</p>
                                                    <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-tight mb-1" title={product.name}>
                                                        {product.name}
                                                    </h3>

                                                    {/* Price Section */}
                                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                                        {product.offerPrice ? (
                                                            <>
                                                                <span className="text-base font-bold text-slate-900">₹{product.offerPrice}</span>
                                                                <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-base font-bold text-slate-900">₹{product.price}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stock Status */}
                                                <div className="mb-2">
                                                    {product.stock > 0 ? (
                                                        <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Compact Buttons */}
                                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={product.stock === 0}
                                                        className={`flex items-center justify-center gap-1 py-1.5 rounded transition-all disabled:opacity-50 text-xs font-medium ${addedToCart === product.id
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                        title="Add to Cart"
                                                    >
                                                        <ShoppingCart className="w-3.5 h-3.5" />
                                                        {addedToCart === product.id && <span className="text-[10px]">✓</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleBuyNow(product)}
                                                        disabled={product.stock === 0}
                                                        className="flex items-center justify-center py-1.5 bg-primary text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 text-xs font-medium"
                                                    >
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            );
                        } else {
                            return (
                                <div className="text-center py-20 glass-card">
                                    <p className="text-slate-500 text-lg">
                                        {searchTerm ? `No products matching "${searchTerm}"` : "No products available yet."}
                                    </p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="mt-4 text-primary font-medium hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            );
                        }
                    })()}
                </div>

                {/* Reserve & Pick Modal */}
                {showReserveModal && selectedProduct && (
                    <ReservePickModal
                        product={selectedProduct}
                        shop={shop}
                        onClose={() => { setShowReserveModal(false); setSelectedProduct(null); }}
                        onSuccess={() => {}}
                    />
                )}

                {/* Purchase Options Modal */}
                {showPurchaseModal && selectedProduct && (
                    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
                        <div className="min-h-screen flex items-center justify-center p-4">
                            <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Choose Purchase Option</h3>
                            <p className="text-slate-600 mb-6">How would you like to purchase <span className="font-semibold">{selectedProduct.name}</span>?</p>

                            <div className="space-y-4">
                                {/* Online Order */}
                                {shop.isDeliveryEnabled ? (
                                    <button
                                        onClick={handleOnlineOrder}
                                        className="w-full p-4 border-2 border-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors text-left"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Package className="w-6 h-6 text-primary mt-1" />
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Online Order & Delivery</h4>
                                                <p className="text-sm text-slate-600">Order now and get it delivered to your location</p>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-xl text-left opacity-60">
                                        <div className="flex items-start gap-3">
                                            <Package className="w-6 h-6 text-slate-400 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-slate-500 mb-1">Delivery Not Available</h4>
                                                <p className="text-sm text-slate-400">This shop only supports local pick up currently.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reserve & Pickup Options */}
                                {(shop.isReservePickDiscountEnabled || shop.isPickupEnabled) ? (
                                    <button
                                        onClick={handleReservePickup}
                                        className="w-full p-4 border-2 border-sky-400 rounded-xl hover:bg-sky-50 transition-colors text-left relative overflow-hidden"
                                    >
                                        {shop.reservePickDiscountPercentage > 0 && shop.isReservePickDiscountEnabled && (
                                            <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5">
                                                {shop.reservePickDiscountPercentage}% OFF
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <Store className="w-6 h-6 text-sky-600 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">
                                                    Reserve & Pick Up
                                                    {shop.isReservePickDiscountEnabled && shop.reservePickDiscountPercentage > 0 && (
                                                        <span className="ml-2 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                                                            Discount!
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-slate-600">Reserve now and pay/pick up at the shop</p>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-xl text-left opacity-60">
                                        <div className="flex items-start gap-3">
                                            <Store className="w-6 h-6 text-slate-400 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-slate-500 mb-1">Pick Up Not Available</h4>
                                                <p className="text-sm text-slate-400">This shop only supports home delivery.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowPurchaseModal(false)}
                                className="w-full mt-6 py-3 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopDetail;
