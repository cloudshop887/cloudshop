import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('adminToken')) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call the real backend API
            const { data } = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password
            });

            // Check if user is admin
            if (data.role !== 'ADMIN') {
                alert('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Store token and user info
            // Store token and user info
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data));
            localStorage.setItem('isAdmin', 'true');

            // Navigate to admin dashboard
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            
            // Better error messages
            let errorMsg = 'Login failed';
            
            if (error.code === 'ECONNABORTED') {
                errorMsg = 'Connection timeout - Backend server may be starting up. Please try again in a moment.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMsg = 'Network error - Check your internet connection or API URL configuration.';
            } else if (error.response?.status === 401) {
                errorMsg = 'Invalid email or password';
            } else if (error.response?.status === 404) {
                errorMsg = 'User not found';
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Restricted Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 mb-2 text-sm">Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="Enter admin email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2 text-sm">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Login to Dashboard'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        &larr; Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
