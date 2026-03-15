import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Store, Package, Settings, ShoppingBag, Edit2, Save, X, Lock, Smartphone } from 'lucide-react';
import api, { getDirectDriveLink } from '../utils/api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form States
    const [editForm, setEditForm] = useState({
        fullName: '',
        phone: '',
        profilePic: ''
    });

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            setEditForm({
                fullName: parsedUser.fullName || '',
                phone: parsedUser.phone || parsedUser.phoneNumber || '',
                profilePic: parsedUser.profilePic || ''
            });
            checkShopOwnership(parsedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const checkShopOwnership = async (userId) => {
        try {
            const { data } = await api.get('/shops');
            const myShop = data.find(s => s.ownerId === userId);
            setShop(myShop);
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset form
            setEditForm({
                fullName: user.fullName || '',
                phone: user.phone || user.phoneNumber || '',
                profilePic: user.profilePic || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveChanges = async () => {
        // Validation
        if (!editForm.fullName.trim()) return alert("Name cannot be empty");

        const phoneRegex = /^[6-9]\d{9}$/;
        if (editForm.phone && !phoneRegex.test(editForm.phone)) {
            return alert("Please enter a valid 10-digit phone number");
        }

        // Update directly
        await updateUserProfile(editForm);
    };

    const updateUserProfile = async (data) => {
        try {
            const response = await api.put('/auth/profile', {
                fullName: data.fullName,
                phone: data.phone,
                profilePic: data.profilePic
            });

            setUser(response.data);
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error('Update needed:', error);
            alert(error.response?.data?.message || "Failed to update profile");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null; // Or redirect

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                        <p className="text-slate-600 mt-2">Manage your personal information</p>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={handleEditToggle}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-primary rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </h2>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleEditToggle}
                                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Cancel"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleSaveChanges}
                                            className="p-2 text-white bg-primary hover:bg-sky-600 rounded-full shadow-lg shadow-sky-200 transition-all"
                                            title="Save Changes"
                                        >
                                            <Save className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Name Field */}
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editForm.fullName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Profile Picture URL</label>
                                            <input
                                                type="text"
                                                value={editForm.profilePic}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, profilePic: e.target.value }))}
                                                placeholder="Paste image URL here"
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-6">
                                        {user.profilePic ? (
                                            <img src={getDirectDriveLink(user.profilePic)} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                                        ) : (
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900">{user.fullName}</p>
                                            <p className="text-slate-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Email Field (Read Only) */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email
                                    </label>
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-medium text-slate-900">{user.email}</p>
                                        {isEditing && <Lock className="w-4 h-4 text-slate-400" title="Email cannot be changed" />}
                                    </div>
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Phone Number
                                    </label>
                                    {isEditing ? (
                                        <div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500">+91</span>
                                                <input
                                                    type="tel"
                                                    value={editForm.phone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setEditForm(prev => ({ ...prev, phone: val }));
                                                    }}
                                                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="9999999999"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-medium text-slate-900">
                                            {user.phone || user.phoneNumber || 'Not set'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">Role</label>
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Existing Shop Info Section (Unchanged) */}
                        {shop && (
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-primary" />
                                    My Shop
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-lg font-medium text-slate-900">{shop.name}</p>
                                            <p className="text-slate-600 text-sm">{shop.address}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${shop.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {shop.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <Link to="/my-shop" className="inline-flex items-center gap-2 text-primary font-medium hover:text-sky-600">
                                        Go to Dashboard <Settings className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions (Unchanged) */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link to="/my-orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-slate-900">My Orders</span>
                                </Link>
                                {/* ... other links same as before ... */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Profile;
