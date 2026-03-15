import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import FirebaseGoogleLogin from '../components/FirebaseGoogleLogin';


const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        profilePic: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                profilePic: formData.profilePic,
                password: formData.password
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.dispatchEvent(new Event('userLoggedIn'));
            alert('Account created successfully!');
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration Failed');
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
                    <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-600 mt-2">Create your customer account to continue.</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

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
                                    placeholder="This email will be used for login"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your active mobile number"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture URL (Optional)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="url"
                                    name="profilePic"
                                    value={formData.profilePic}
                                    onChange={handleChange}
                                    placeholder="Paste Google Drive or Image URL"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Paste a direct link to your photo.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-100 pt-6">
                        <p className="text-slate-600 text-sm mb-3">Or sign up with</p>
                        <FirebaseGoogleLogin text="Sign up with Google" />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-slate-600">
                            Already registered?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:text-sky-600 transition-colors">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
