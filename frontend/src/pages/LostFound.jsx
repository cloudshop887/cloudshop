import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Phone, Clock, Filter, AlertCircle, CheckCircle2, Package, X } from 'lucide-react';
import api from '../utils/api';

const LostFound = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        type: 'LOST',
        title: '',
        description: '',
        location: '',
        contact: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchItems();
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));
    }, [filter]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/lost-found${filter !== 'ALL' ? `?type=${filter}` : ''}`);
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lost-found', formData);
            setIsModalOpen(false);
            setFormData({ type: 'LOST', title: '', description: '', location: '', contact: '', imageUrl: '' });
            fetchItems();
        } catch (error) {
            alert('Failed to post item');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/lost-found/${id}`, { status });
            fetchItems();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                            Lost <span className="text-primary italic">&</span> Found
                        </h1>
                        <p className="text-slate-600">Helping the community find what they've lost.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                            {['ALL', 'LOST', 'FOUND'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === type
                                        ? 'bg-primary text-white shadow-lg shadow-sky-200'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {user ? (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-sky-600 transition-all shadow-xl shadow-sky-200"
                            >
                                <Plus className="w-5 h-5" />
                                Post Item
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Login to Post
                            </Link>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900">No items found</h2>
                        <p className="text-slate-500">Be the first to post something!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white/70 backdrop-blur-xl"
                            >
                                {/* Image Placeholder or Real Image */}
                                <div className="h-48 bg-slate-100 relative overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Package className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-lg ${item.type === 'LOST' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                        }`}>
                                        {item.type}
                                    </div>
                                    {item.status === 'RESOLVED' && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black tracking-widest uppercase transform -rotate-12 border-4 border-white">
                                                RESOLVED
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1">{item.title}</h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="truncate">{item.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <span>{item.contact}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {user && item.userId === user.id && item.status === 'OPEN' && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, 'RESOLVED')}
                                            className="w-full py-3 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-all border border-green-100"
                                        >
                                            Mark as Resolved
                                        </button>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 capitalize">Posted by {item.user?.fullName}</span>
                                        <AlertCircle className="w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-2xl font-black text-slate-900">Post Item</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                                    {['LOST', 'FOUND'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${formData.type === type
                                                ? 'bg-white text-slate-900 shadow-xl'
                                                : 'text-slate-500'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Item Title (e.g., iPhone 13 Pro)"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none font-bold placeholder:text-slate-400 transition-all"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Description (color, specifics...)"
                                        rows="3"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none font-bold placeholder:text-slate-400 transition-all resize-none"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Seen Location"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none font-bold placeholder:text-slate-400 transition-all"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Contact Details (Phone/Email)"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none font-bold placeholder:text-slate-400 transition-all"
                                        required
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                    <input
                                        type="url"
                                        placeholder="Image URL (Optional)"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none font-bold placeholder:text-slate-400 transition-all"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-sky-200 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Share Post
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LostFound;
