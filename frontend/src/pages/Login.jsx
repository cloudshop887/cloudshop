import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import FirebaseGoogleLogin from '../components/FirebaseGoogleLogin';


const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', formData);
            // Check if user is admin
            if (data.role === 'ADMIN') {
                alert('Please use the Admin Portal to login.');
                // Clear any stored data just in case
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Trigger event for Navbar to update
            window.dispatchEvent(new Event('userLoggedIn'));

            alert('Login Successful!');
            navigate('/');
            window.location.reload(); // Reload to show Dashboard
        } catch (error) {
            console.error('Login error:', error);
            
            // Better error messages
            let errorMsg = 'Login failed';
            
            if (error.code === 'ECONNABORTED') {
                errorMsg = 'Connection timeout - Backend server may be starting up. Please try again in a moment.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMsg = 'Network error - Check your internet connection.';
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
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome Back!</h1>
                    <p className="text-slate-600 mt-2">Please log in to your account.</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:text-sky-600 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Login <LogIn className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-100 pt-6">
                        <p className="text-slate-600 text-sm mb-3">Or login with</p>

                        {/* Google Login Button */}
                        <div className="mb-3">
                            <FirebaseGoogleLogin />
                        </div>


                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-slate-600">
                            New user?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:text-sky-600 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
