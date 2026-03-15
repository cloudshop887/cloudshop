import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';

const EditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        offerPrice: '',
        stock: '',
        category: '',
        imageUrl: '',
    });

    const [customCategory, setCustomCategory] = useState('');

    const categories = [
        "Electronics", "Fashion", "Home & Living", "Food & Grocery",
        "Health & Beauty", "Sports & Outdoors", "Books & Stationery",
        "Toys & Games", "Automotive", "Other"
    ];

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            // Check if existing category is custom
            const isStandardCategory = categories.includes(data.category);
            const displayCategory = isStandardCategory ? data.category : 'Other';

            setFormData({
                name: data.name,
                description: data.description,
                price: data.price,
                offerPrice: data.offerPrice || '',
                stock: data.stock,
                category: displayCategory,
                imageUrl: data.imageUrl || '',
            });

            if (!isStandardCategory && data.category) {
                setCustomCategory(data.category);
            }
        } catch (err) {
            setError('Failed to fetch product details');
            console.error(err);
        } finally {
            setFetchLoading(false);
        }
    };

    const getDirectLink = (url) => {
        if (!url) return '';

        // Handle share.google links (Google Photos) - use directly
        if (url.includes('share.google')) {
            return url;
        }

        // Handle Google Drive links
        if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
            const idMatch = url.match(/\/d\/([^/?]+)|id=([^&]+)/);
            const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
            if (id) {
                return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            }
        }
        return url;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submissionData = { ...formData };
            if (submissionData.category === 'Other') {
                submissionData.category = customCategory;
            }
            await api.put(`/products/${id}`, submissionData);
            navigate('/my-shop');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/my-shop')}
                    className="flex items-center text-slate-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Package className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
                            <p className="text-slate-600">Update product details</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Offer Price (₹)</label>
                                <input
                                    type="number"
                                    name="offerPrice"
                                    min="0"
                                    step="0.01"
                                    value={formData.offerPrice}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Category & Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
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
                                            placeholder="Enter product category"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        required
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Preview */}
                        {formData.imageUrl && (
                            <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                                <p className="text-sm text-slate-500 mb-2">Image Preview:</p>
                                <div className="relative h-48 w-full bg-white rounded-md overflow-hidden flex items-center justify-center border border-slate-100">
                                    <img
                                        src={getDirectLink(formData.imageUrl)}
                                        alt="Preview"
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/400x300?text=Image+Load+Error';
                                            e.target.className = "h-full w-full object-contain opacity-50";
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    If image doesn't load, check if the link is direct and public.
                                </p>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/my-shop')}
                                className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium mr-4 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-8 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium disabled:opacity-50 shadow-lg shadow-sky-200"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditProduct;

