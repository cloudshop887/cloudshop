import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, Save, X, Clock } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';
import CustomerLayout from '../layouts/CustomerLayout';
import { getOpeningHoursString } from '../utils/timeHelpers';
import ReservePickDiscountSettings from '../components/ReservePickDiscountSettings';

const ShopSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [shop, setShop] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        latitude: '',
        longitude: '',
        category: '',
        openTime: '',
        closeTime: '',
        bannerUrl: '',
        logoUrl: '',
        isPickupEnabled: true,
        isDeliveryEnabled: true,
        isReservePickDiscountEnabled: false,
        reservePickDiscountPercentage: 10,
        bulkDiscountMinItems: 5,
        bulkDiscountPercentage: 5,
    });
    const [customCategory, setCustomCategory] = useState('');

    const categories = [
        "Grocery", "Fruits & Vegetables", "Bakery", "Electronics",
        "Stationery", "Medical", "Mobile Shop", "Fashion & Clothing",
        "Restaurant/Cafe", "Other"
    ];

    useEffect(() => {
        fetchShopDetails();
    }, []);

    const fetchShopDetails = async () => {
        try {
            const { data } = await api.get('/shops/my-shop');
            setShop(data);

            // Check if saved category is a custom one
            const isStandardCategory = categories.includes(data.category);
            const displayCategory = isStandardCategory ? data.category : 'Other';

            setFormData({
                name: data.name || '',
                description: data.description || '',
                address: data.address || '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                category: displayCategory || '',
                openTime: data.openTime || '',
                closeTime: data.closeTime || '',
                bannerUrl: data.bannerUrl || '',
                logoUrl: data.logoUrl || '',
                isPickupEnabled: data.isPickupEnabled ?? true,
                isDeliveryEnabled: data.isDeliveryEnabled ?? true,
                isReservePickDiscountEnabled: data.isReservePickDiscountEnabled ?? false,
                reservePickDiscountPercentage: data.reservePickDiscountPercentage ?? 10,
                bulkDiscountMinItems: data.bulkDiscountMinItems ?? 5,
                bulkDiscountPercentage: data.bulkDiscountPercentage ?? 5,
            });

            if (!isStandardCategory && data.category) {
                setCustomCategory(data.category);
            }
        } catch (error) {
            console.error('Error fetching shop:', error);
            alert('Failed to load shop details');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDiscountChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                reservePickDiscountPercentage: parseFloat(formData.reservePickDiscountPercentage),
                bulkDiscountMinItems: parseInt(formData.bulkDiscountMinItems),
                bulkDiscountPercentage: parseFloat(formData.bulkDiscountPercentage),
            };

            // Handle custom category
            if (updateData.category === 'Other') {
                updateData.category = customCategory;
            }

            // Generate openingHours string
            if (updateData.openTime && updateData.closeTime) {
                updateData.openingHours = getOpeningHoursString(updateData.openTime, updateData.closeTime);
            }

            await api.put(`/shops/${shop.id}`, updateData);
            alert('Shop updated successfully!');
            navigate('/my-shop'); // Navigate back to dashboard instead of full reload
        } catch (error) {
            console.error('Error updating shop:', error);
            alert(error.response?.data?.message || 'Failed to update shop');
        } finally {
            setLoading(false);
        }
    };

    if (!shop) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-slate-500">Loading...</p>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Store className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-slate-900">Shop Settings</h1>
                    </div>
                    <button
                        onClick={() => navigate('/my-shop')}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                    {/* Shop Status */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Shop Status</p>
                                <p className="text-lg font-bold text-slate-900">
                                    {shop.isApproved ? '✅ Approved & Live' : '⏳ Pending Approval'}
                                </p>
                            </div>
                            {!shop.isApproved && (
                                <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                                    Waiting for admin approval
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell customers about your shop..."
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
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
                                            placeholder="Enter your custom shop category"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Opening Hours</label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Opens at</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="time"
                                                name="openTime"
                                                required
                                                value={formData.openTime}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-2 py-3 rounded-lg border border-slate-200 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Closes at</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="time"
                                                name="closeTime"
                                                required
                                                value={formData.closeTime}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-2 py-3 rounded-lg border border-slate-200 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {formData.openTime && formData.closeTime && (
                                    <p className="text-xs text-primary mt-2 font-medium">
                                        Displayed as: {getOpeningHoursString(formData.openTime, formData.closeTime)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Location</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    required
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        name="latitude"
                                        step="any"
                                        required
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        name="longitude"
                                        step="any"
                                        required
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order & Delivery Support */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Types & Fulfillment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isPickupEnabled: !p.isPickupEnabled }))}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    formData.isPickupEnabled 
                                        ? 'bg-sky-50 border-sky-200 text-sky-900' 
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.isPickupEnabled ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Allow Pickup</p>
                                        <p className="text-xs opacity-70">Customers can pick up orders from shop</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isPickupEnabled ? 'bg-sky-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPickupEnabled ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isDeliveryEnabled: !p.isDeliveryEnabled }))}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    formData.isDeliveryEnabled 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.isDeliveryEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <Upload className="w-5 h-5 transform rotate-90" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Allow Delivery</p>
                                        <p className="text-xs opacity-70">You will deliver orders to customers</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isDeliveryEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isDeliveryEnabled ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Branding: Logo & Banner */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Branding</h3>
                        <div className="space-y-6">
                            {/* Logo URL */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Shop Logo URL</label>
                                <div className="flex gap-4 items-start">
                                    <input
                                        type="url"
                                        name="logoUrl"
                                        value={formData.logoUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/logo.png"
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                    {formData.logoUrl && (
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                            <img
                                                src={getDirectDriveLink(formData.logoUrl)}
                                                alt="Logo preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/48?text=Error';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Banner URL */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image URL</label>
                                <input
                                    type="url"
                                    name="bannerUrl"
                                    value={formData.bannerUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/banner.jpg"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">Recommended size: 1200x400px</p>
                            </div>

                            {formData.bannerUrl && (
                                <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                                    <img
                                        src={getDirectDriveLink(formData.bannerUrl)}
                                        alt="Banner preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reserve & Pick Discount Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Reserve & Pick Discount</h3>
                        <ReservePickDiscountSettings
                            settings={{
                                isReservePickDiscountEnabled: formData.isReservePickDiscountEnabled,
                                reservePickDiscountPercentage: formData.reservePickDiscountPercentage,
                                bulkDiscountMinItems: formData.bulkDiscountMinItems,
                                bulkDiscountPercentage: formData.bulkDiscountPercentage,
                            }}
                            onChange={handleDiscountChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
};

export default ShopSettings;
