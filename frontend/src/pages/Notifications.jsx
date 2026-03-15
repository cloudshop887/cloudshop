import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Megaphone, Trash2, CheckCircle, Info, AlertTriangle, Star, ShoppingBag, Briefcase, Tag, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [communityFeed, setCommunityFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(localStorage.getItem('token') ? 'PERSONAL' : 'COMMUNITY'); // PERSONAL, COMMUNITY
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const requests = [
                api.get('/announcements'),
                api.get('/jobs'),
                api.get('/offers')
            ];

            if (token) {
                requests.push(api.get('/notifications'));
            }

            const results = await Promise.allSettled(requests);

            // Process results
            const annonc = results[0].status === 'fulfilled' ? results[0].value.data : [];
            const jobs = results[1].status === 'fulfilled' ? results[1].value.data : [];
            const offers = results[2].status === 'fulfilled' ? results[2].value.data : [];
            const notifs = token && results[3]?.status === 'fulfilled' ? results[3].value.data : [];

            setNotifications(notifs);

            // Combine community items
            const feed = [
                ...annonc.map(a => ({ ...a, feedType: 'ANNOUNCEMENT' })),
                ...jobs.map(j => ({ ...j, feedType: 'JOB' })),
                ...offers.map(o => ({ ...o, feedType: 'OFFER' }))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setCommunityFeed(feed);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`, { isRead: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDeleteNotif = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'INFO': return <Info className="text-blue-500" />;
            case 'WARNING': return <AlertTriangle className="text-amber-500" />;
            case 'SUCCESS': return <CheckCircle className="text-green-500" />;
            case 'PROMOTION': return <Star className="text-purple-500" />;
            case 'ORDER': return <ShoppingBag className="text-primary" />;
            case 'JOB': return <Briefcase className="text-sky-500" />;
            case 'OFFER': return <Tag className="text-amber-500" />;
            case 'ANNOUNCEMENT': return <Megaphone className="text-primary" />;
            default: return <Bell className="text-slate-400" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'INFO': return 'bg-blue-50 border-blue-100';
            case 'WARNING': return 'bg-amber-50 border-amber-100';
            case 'SUCCESS': return 'bg-green-50 border-green-100';
            case 'PROMOTION': return 'bg-purple-50 border-purple-100';
            case 'ORDER': return 'bg-sky-50 border-sky-100';
            case 'JOB': return 'bg-sky-50 border-sky-100';
            case 'OFFER': return 'bg-amber-50 border-amber-100';
            case 'ANNOUNCEMENT': return 'bg-primary/5 border-primary/10';
            default: return 'bg-slate-50 border-slate-100';
        }
    };

    const renderFeedItem = (item) => {
        if (item.feedType === 'ANNOUNCEMENT') {
            return (
                <div key={`ann-${item.id}`} className={`p-8 rounded-[2rem] shadow-xl ${getBgColor(item.type)} relative overflow-hidden`}>
                    <div className="absolute -right-8 -bottom-8 opacity-[0.05] grayscale">
                        <Megaphone size={160} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/80 backdrop-blur rounded-2xl">
                                {getIcon(item.type)}
                            </div>
                            <div>
                                <div className="text-[10px] font-black tracking-widest uppercase text-slate-400">Announcement</div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{item.title}</h3>
                            </div>
                        </div>
                        <p className="text-slate-700 font-bold mb-4">{item.message}</p>
                        <div className="flex items-center justify-between text-xs font-black text-slate-400">
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className="px-3 py-1 bg-white/60 rounded-full">FOR {item.role}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (item.feedType === 'JOB') {
            return (
                <div key={`job-${item.id}`} className="p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.shop?.name || 'Local Shop'}</p>
                            </div>
                        </div>
                        <Link to="/jobs" className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                    <p className="text-slate-600 font-medium line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.jobType}</span>
                        {item.salary && <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">₹{item.salary}</span>}
                    </div>
                </div>
            );
        }

        if (item.feedType === 'OFFER') {
            return (
                <div key={`off-${item.id}`} className="p-6 rounded-3xl bg-white border-2 border-amber-100 shadow-xl shadow-amber-200/20 relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                                <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{item.discount}</p>
                            </div>
                        </div>
                        <Link to="/offers" className="p-2 bg-amber-50 text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white transition-all">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                    <p className="text-slate-600 font-medium mb-4">{item.shop?.name} is offering a special discount!</p>
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>New Offer</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Updates <span className="text-primary">&</span> Alerts
                            <div className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </div>
                        </h1>
                        <p className="text-slate-600 mt-1 font-medium">Keep up with your orders and local happenings.</p>
                    </div>

                    <div className="flex bg-white rounded-[2rem] p-2 shadow-2xl shadow-slate-200 border border-slate-100 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('PERSONAL')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'PERSONAL'
                                ? 'bg-primary text-white shadow-xl shadow-sky-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Bell className="w-5 h-5" />
                            Personal
                        </button>
                        <button
                            onClick={() => setActiveTab('COMMUNITY')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'COMMUNITY'
                                ? 'bg-primary text-white shadow-xl shadow-sky-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Megaphone className="w-5 h-5" />
                            Community
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse"></div>)}
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'PERSONAL' ? (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-4"
                                >
                                    {!localStorage.getItem('token') ? (
                                        <div className="text-center py-20 glass-card rounded-[3rem]">
                                            <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-slate-900">Sign in for personal updates</h3>
                                            <p className="text-slate-500 mb-6 font-medium">Please login to see your order updates and personal notifications.</p>
                                            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg shadow-sky-200 transition-all">
                                                Login Now
                                            </Link>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="text-center py-24 glass-card rounded-[3rem]">
                                            <Bell className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                            <h3 className="text-2xl font-black text-slate-900">All quiet here</h3>
                                            <p className="text-slate-500 font-medium">No new personal notifications for now.</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`group relative flex items-start gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 ${n.isRead ? 'bg-white border-transparent' : 'bg-white border-primary/20'
                                                    }`}
                                            >
                                                <div className={`p-4 rounded-2xl ${getBgColor(n.type)} flex-shrink-0`}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                                                            {new Date(n.createdAt).toLocaleString()}
                                                        </span>
                                                        {!n.isRead && (
                                                            <span className="px-3 py-1 bg-primary text-[10px] font-black text-white rounded-full uppercase tracking-widest">New</span>
                                                        )}
                                                    </div>
                                                    <p className={`font-bold text-xl leading-tight ${n.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                                                        {n.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    {!n.isRead && (
                                                        <button onClick={() => handleMarkAsRead(n.id)} className="p-3 hover:bg-green-50 text-green-500 rounded-xl transition-all" title="Mark as read">
                                                            <CheckCircle className="w-6 h-6" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteNotif(n.id)} className="p-3 hover:bg-red-50 text-red-500 rounded-xl transition-all" title="Delete">
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="community"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                >
                                    {communityFeed.length === 0 ? (
                                        <div className="text-center py-24 glass-card rounded-[3rem]">
                                            <Megaphone className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                            <h3 className="text-2xl font-black text-slate-900">Quiet for now</h3>
                                            <p className="text-slate-500 font-medium">No community activity to show today.</p>
                                        </div>
                                    ) : (
                                        communityFeed.map(renderFeedItem)
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
