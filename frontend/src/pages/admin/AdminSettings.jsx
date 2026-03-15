import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, Bell, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/adminApi';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [admin, setAdmin] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'ADMIN'
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        const storedAdmin = JSON.parse(localStorage.getItem('adminUser') || '{}');
        setAdmin(prev => ({ ...prev, ...storedAdmin }));
    }, []);

    const handleChange = (e) => {
        setAdmin({ ...admin, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app, this would be an API call
            // await api.put('/users/profile', admin);

            // Mock update
            localStorage.setItem('adminUser', JSON.stringify(admin));
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
                <p className="text-slate-400 mt-1">Manage your profile and system preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-slate-800">
                                {admin.fullName?.charAt(0) || 'A'}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-slate-700 hover:bg-primary text-white rounded-full border-4 border-slate-800 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-white">{admin.fullName}</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                            Super Admin
                        </span>
                    </motion.div>

                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" /> System Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Version</span>
                                <span className="text-white font-mono">v1.0.0</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Server Status</span>
                                <span className="text-green-400 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Last Login</span>
                                <span className="text-white">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Personal Information
                        </h3>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={admin.fullName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={admin.phone}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={admin.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-primary hover:bg-sky-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> Security
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="password"
                                        name="current"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="password"
                                            name="new"
                                            value={passwords.new}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="password"
                                            name="confirm"
                                            value={passwords.confirm}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Update Password
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" /> Notifications
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                                <div>
                                    <p className="text-white font-medium">New Shop Registrations</p>
                                    <p className="text-xs text-slate-400">Get notified when a new shop signs up</p>
                                </div>
                                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                                <div>
                                    <p className="text-white font-medium">System Alerts</p>
                                    <p className="text-xs text-slate-400">Receive critical system updates</p>
                                </div>
                                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
