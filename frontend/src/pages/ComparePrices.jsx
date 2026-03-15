import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, Scale, ShoppingBag, X } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';

const ComparePrices = () => {
    const [category, setCategory] = useState('Electronics');
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchComparison();
        }, 500);
        return () => clearTimeout(timer);
    }, [category, searchTerm, minPrice, maxPrice]);

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('category', category);
            if (searchTerm) params.append('search', searchTerm);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const response = await api.get(`/products/compare?${params.toString()}`);
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching comparison:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <Link to="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Price Comparison</h1>
                    </div>
                    <p className="text-slate-600 ml-12">Compare prices of products within the same category.</p>
                </div>

                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-[2]">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Search Product</label>
                        <input
                            type="text"
                            placeholder="Enter product name (e.g. Milk, iPhone)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full md:w-48 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer font-medium text-slate-600"
                        >
                            <option value="Grocery">Grocery</option>
                            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Stationery">Stationery</option>
                            <option value="Medical">Medical</option>
                            <option value="Mobile Shop">Mobile Shop</option>
                            <option value="Fashion & Clothing">Fashion & Clothing</option>
                            <option value="Restaurant/Cafe">Restaurant/Cafe</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Min Price</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full md:w-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Max Price</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full md:w-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-slate-500 font-medium">Comparing prices across shops...</p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Information</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Available at Shop</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={getDirectDriveLink(product.imageUrl) || 'https://placehold.co/60'}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shadow-sm"
                                                        />
                                                        {index === 0 && products.length > 1 && (
                                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm uppercase">Best Price</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{product.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">ID: #{product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-primary/5 rounded-lg text-primary">
                                                        <ShoppingBag className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{product.shopName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                                                    {index === 0 && products.length > 1 && (
                                                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Cheapest match
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/shops/${product.shopId}?productId=${product.id}`}
                                                    className="inline-flex items-center justify-center p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-primary hover:text-white transition-all group/btn"
                                                >
                                                    <ChevronDown className="w-5 h-5 -rotate-90 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {products.length === 0 && (
                            <div className="text-center py-20 px-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">Try changing your search keywords or price filters to compare items.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparePrices;
