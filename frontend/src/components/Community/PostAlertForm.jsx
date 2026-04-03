import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Type, FileText, MapPin, CheckCircle2, AlertCircle, Image as ImageIcon, Navigation, X, RefreshCw } from 'lucide-react';

export default function PostAlertForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'GENERAL',
        location: '',
        latitude: null,
        longitude: null,
        imageUrl: '',
        anonymous: false
    });

    const [captcha, setCaptcha] = useState({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) });
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    const types = ['EMERGENCY', 'COMMUNITY', 'OFFER', 'GENERAL'];

    const getUserLocation = () => {
        setLocLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        location: prev.location || 'Detected Location'
                    }));
                    setLocLoading(false);
                },
                (error) => {
                    console.error(error);
                    setLocLoading(false);
                    alert("Could not get location. Please enter manually.");
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Alert Title is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.location.trim()) newErrors.location = "Location is required.";

        if (!captchaInput) {
            newErrors.captcha = "Please complete the spam check.";
        } else if (parseInt(captchaInput) !== captcha.a + captcha.b) {
            newErrors.captcha = "Calculation is incorrect. Try again.";
            setCaptcha({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) });
            setCaptchaInput('');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.post(`/alerts`, formData);
            setSuccess(true);
            setTimeout(() => navigate('/community'), 2000);
        } catch (err) {
            setErrors({ global: err.response?.data?.message || 'Broadcast failed. Check connection.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (success) {
        return (
            // ✅ FIX: pt-14 clears the fixed top navbar, pb-20 clears the bottom nav
            <div className="pt-14 pb-20 px-4 min-h-screen flex items-center justify-center">
                <div className="glass rounded-[2rem] p-16 text-center shadow-2xl scale-in-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 glow">
                        <CheckCircle2 className="text-green-500 w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 gradient-text">Broadcast Sent!</h2>
                    <p className="text-slate-600 text-lg">Your update is now live on the community map.</p>
                </div>
            </div>
        );
    }

    return (
        // ✅ FIX: pt-14 = height of top navbar (h-14), pb-20 = height of bottom navbar (h-16 + safe area)
        <div className="pt-14 pb-20 px-4 md:px-6 min-h-screen">
            <div className="max-w-3xl mx-auto py-6">
                <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-b-8 border-primary/20">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center glow text-white">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black gradient-text uppercase tracking-tighter">New Alert</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Share in real-time</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/community')}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center group"
                            title="Cancel"
                        >
                            <span className="hidden sm:inline mr-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cancel</span>
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {errors.global && (
                        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-600 p-5 rounded-2xl mb-10 flex items-center animate-shake">
                            <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0" />
                            <span className="font-bold text-sm">{errors.global}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center">
                                    <Type className="w-3 h-3 mr-2" /> Alert Title
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Water shortage in North Wing"
                                    className={`w-full bg-white border ${errors.title ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-2xl px-5 py-4 focus:outline-none transition-all font-medium text-slate-900 shadow-sm`}
                                />
                                {errors.title && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-left-2">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center">
                                    <LayoutGrid className="w-3 h-3 mr-2" /> Category
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none font-bold text-primary shadow-sm hover:border-primary/30"
                                >
                                    {types.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center">
                                <FileText className="w-3 h-3 mr-2" /> Detailed Information
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Describe the situation clearly..."
                                className={`w-full bg-white border ${errors.description ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-2xl px-5 py-4 focus:outline-none transition-all font-medium leading-relaxed text-slate-900 shadow-sm`}
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-left-2">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center">
                                    <MapPin className="w-3 h-3 mr-2" /> Location Reference
                                </label>
                                <div className="relative">
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter landmark or area name"
                                        className={`w-full bg-white border ${errors.location ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-2xl px-5 py-4 focus:outline-none transition-all pr-12 font-medium text-slate-900 shadow-sm`}
                                    />
                                    <button
                                        type="button"
                                        onClick={getUserLocation}
                                        className={`absolute right-3 top-3 p-2 rounded-xl transition-all ${formData.latitude ? 'bg-green-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary hover:text-white'}`}
                                    >
                                        {locLoading ? <RefreshCw className="w-4 h-4 animate-spin text-slate-900" /> : <Navigation className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.location && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-left-2">{errors.location}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center">
                                    <ImageIcon className="w-3 h-3 mr-2" /> Image URL (Optional)
                                </label>
                                <input
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://image-hosting.com/alert.jpg"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-medium text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-6 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="anonymous"
                                        id="anonymous"
                                        checked={formData.anonymous}
                                        onChange={handleChange}
                                        className="w-6 h-6 rounded-lg border-2 border-slate-200 bg-white text-primary focus:ring-0"
                                    />
                                    <label htmlFor="anonymous" className="text-sm font-bold text-slate-600 cursor-pointer">
                                        Post as Anonymous
                                    </label>
                                </div>
                                {user && !formData.anonymous && (
                                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                                        Logged in as: {user.fullName}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-slate-200 border border-slate-300 px-4 py-2 rounded-xl text-lg font-black tracking-widest text-primary">
                                    {captcha.a} + {captcha.b} = ?
                                </div>
                                <input
                                    type="number"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    placeholder="Result"
                                    className={`flex-1 bg-white border ${errors.captcha ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'} rounded-2xl px-5 py-3 focus:outline-none focus:ring-4 transition-all font-bold text-slate-900`}
                                />
                            </div>
                            {errors.captcha && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.captcha}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark py-6 rounded-[1.5rem] font-black text-xl uppercase tracking-widest transition-all transform hover:scale-[1.01] hover:shadow-2xl disabled:opacity-50 text-white glow"
                        >
                            {loading ? 'Broadcasting...' : 'Launch Alert'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}