import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingBag, X, ChevronDown, SortAsc, TrendingUp, IndianRupee } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';

const SearchProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ["All", "Grocery", "Fruits & Vegetables", "Bakery", "Electronics", "Stationery", "Medical", "Mobile Shop", "Fashion & Clothing", "Restaurant/Cafe"];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category && category !== 'All') params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            params.append('sortBy', sortBy);

            const response = await api.get(`/products?${params.toString()}`);
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, category, minPrice, maxPrice, sortBy]);

    const resetFilters = () => {
        setSearch('');
        setCategory('All');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore <span className="text-primary">Products</span></h1>
                    <p className="text-slate-600">Discover quality products from verified local shops in your neighborhood.</p>
                </div>

                {/* Search & Main controls */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products, brands, or shops..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-slate-700"
                            />
                        </div>

                        {/* Category Dropdown (Mobile visible, Desktop can be here or in filters) */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-sky-100' : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'}`}
                            >
                                <Filter className="w-5 h-5" />
                                <span>Filters</span>
                                {showFilters ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
                            </button>

                            <div className="relative group flex-1 lg:flex-none">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full lg:w-48 appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer font-medium text-slate-600"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="views">Most Popular</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Expandable Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-6 mt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Categories */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Categories</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${category === cat
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Price Range (₹)</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    className="w-full pl-3 pr-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                            <span className="text-slate-400">-</span>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    className="w-full pl-3 pr-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={resetFilters}
                                            className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Reset All Filters
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Section */}
                <div className="mb-4 flex items-center justify-between text-sm">
                    <p className="text-slate-500">
                        {loading ? 'Searching...' : `Showing ${Array.isArray(products) ? products.length : 0} products`}
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-slate-500 font-medium">Fetching best matches...</p>
                    </div>
                ) : (
                    <>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {products.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -4 }}
                                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group relative flex flex-col"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                                            <img
                                                src={getDirectDriveLink(product.imageUrl) || 'https://placehold.co/300?text=No+Image'}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => e.target.src = "https://placehold.co/300?text=No+Image"}
                                            />
                                            {/* Category Tag */}
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-slate-800 shadow-sm uppercase tracking-wider">
                                                {product.category}
                                            </div>
                                        </div>

                                        <div className="p-3 md:p-4 flex flex-col flex-1">
                                            <p className="text-[10px] md:text-xs font-bold text-primary mb-1 uppercase tracking-tight flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {product.shopName} {product.subcategory && <span className="text-slate-400 font-normal ml-1">| {product.subcategory}</span>}
                                            </p>
                                            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1 line-clamp-1 h-6">
                                                {product.name}
                                            </h3>

                                            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-slate-900 leading-none">
                                                        ₹{product.price}
                                                    </span>
                                                </div>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 bg-slate-900 text-white rounded-lg hover:bg-primary transition-colors h-9 w-9 flex items-center justify-center shadow-lg shadow-slate-200"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Navigate logic here
                                                        window.location.href = `/shops/${product.shopId}?productId=${product.id}`;
                                                    }}
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center glass-card">
                                <div className="p-4 bg-slate-100 rounded-full mb-4">
                                    <X className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                                <p className="text-slate-500 mb-6 max-w-xs">Try adjusting your search terms, category, or price filters to see more results.</p>
                                <button
                                    onClick={resetFilters}
                                    className="px-6 py-2 bg-primary text-white rounded-full font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchProducts;
