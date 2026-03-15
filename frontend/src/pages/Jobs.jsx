import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, Building2, Search, ChevronRight, Sparkles, TrendingUp, Laptop } from 'lucide-react';
import api from '../utils/api';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="relative rounded-[2.5rem] bg-slate-900 border-none p-12 mb-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
                    <div className="relative z-10 w-full lg:w-2/3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-sky-400 rounded-full text-xs font-black tracking-widest uppercase mb-6 border border-primary/20">
                            <Sparkles className="w-4 h-4" />
                            Career Opportunities
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
                            Work at the <br />
                            <span className="text-primary italic">Best Shops</span> Nearby.
                        </h1>
                        <p className="text-slate-400 text-lg mb-8 max-w-lg">
                            Find local job openings, from retail to deliveries. Connect with shop owners directly.
                        </p>

                        <div className="relative max-w-xl group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by job title or shop name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-8 py-6 rounded-2xl bg-white/10 border border-white/10 text-white focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-primary/20 outline-none font-bold text-lg transition-all"
                            />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 right-12 hidden lg:block">
                        <div className="flex gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-40 h-80 bg-white/5 rounded-t-full border border-white/5 backdrop-blur-sm -mb-20"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-8 border-none bg-primary/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900">Job Stats</h3>
                                <TrendingUp className="text-primary" />
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-100 text-sky-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                                        <span className="font-bold text-slate-600">Active Jobs</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">{jobs.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
                                        <span className="font-bold text-slate-600">Local Shops</span>
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">{[...new Set(jobs.map(j => j.shopId))].length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 border-none bg-slate-900 text-white">
                            <h3 className="text-xl font-black mb-4">Post a Vacancy?</h3>
                            <p className="text-slate-400 text-sm mb-6">If you are a shop owner, you can post job openings from your dashboard.</p>
                            <button className="w-full py-4 bg-primary text-white rounded-xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-sky-900/40">
                                Go to Shop Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 bg-white rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="text-center py-20 glass-card border-none bg-white">
                                <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h2 className="text-xl font-black text-slate-900">No jobs found</h2>
                                <p className="text-slate-500">Try searching for something else.</p>
                            </div>
                        ) : (
                            filteredJobs.map((job) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-card hover:bg-white hover:shadow-2xl hover:shadow-slate-200 group transition-all duration-500 p-8 border-2 border-transparent hover:border-primary/10"
                                >
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase rounded-full border border-primary/20">
                                                    {job.jobType.replace('_', ' ')}
                                                </span>
                                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">{job.title}</h2>
                                            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-bold">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                    {job.shop.name}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    {job.shop.address}
                                                </div>
                                                {job.salary && (
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="w-4 h-4 text-green-500" />
                                                        {job.salary}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 group-hover:bg-primary group-hover:shadow-sky-200 transition-all">
                                                Apply Now
                                            </button>
                                            <div className="hidden md:flex flex-col items-center p-3 bg-slate-50 rounded-2xl group-hover:bg-primary/5 transition-colors">
                                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-400">Immediate Start</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Laptop className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-400">On-site</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
