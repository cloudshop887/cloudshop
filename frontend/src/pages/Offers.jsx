import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Clock, ShoppingBag, ExternalLink, Filter, Search, Copy, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/offers');
            setOffers(data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredOffers = offers.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.shop?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Hot <span className="text-primary">Offers</span> & Deals
                            <div className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </div>
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">Grab the best discounts from shops near you.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by shop or offer..."
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredOffers.map((offer, index) => (
                                <motion.div
                                    key={offer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-slate-100"
                                >
                                    {/* Offer Image or Gradient */}
                                    <div className="h-40 relative overflow-hidden">
                                        {offer.imageUrl ? (
                                            <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary via-sky-400 to-blue-500 opacity-90 group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                        <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-primary font-black text-sm shadow-lg">
                                            {offer.discount || 'Special Offer'}
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                <ShoppingBag className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{offer.shop?.name}</span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">{offer.title}</h3>
                                        <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed font-medium">{offer.description}</p>

                                        {offer.code && (
                                            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-between group/code transition-colors hover:border-primary/30">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Promo Code</p>
                                                    <p className="text-lg font-black text-slate-900 tracking-widest">{offer.code}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopyCode(offer.code)}
                                                    className="p-3 bg-white text-primary rounded-xl shadow-sm hover:bg-primary hover:text-white transition-all transform active:scale-95"
                                                >
                                                    {copiedCode === offer.code ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-tighter">
                                                    Expires: {offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString() : 'Limited Time'}
                                                </span>
                                            </div>
                                            <Link
                                                to={`/shops/${offer.shopId}`}
                                                className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:gap-3 transition-all"
                                            >
                                                Visit Shop <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredOffers.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100">
                        <Tag className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No offers found</h3>
                        <p className="text-slate-500 font-medium">Try searching for something else or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Offers;
