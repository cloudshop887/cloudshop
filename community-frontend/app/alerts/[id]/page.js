"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { MapPin, Clock, Phone, Share2, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AlertDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlert = async () => {
            try {
                const response = await axios.get(`${API_URL}/alerts/${id}`);
                setAlert(response.data);
            } catch (error) {
                console.error('Error fetching alert:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlert();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    if (!alert) return <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Alert not found</h1>
        <button onClick={() => router.push('/')} className="mt-4 text-primary hover:underline">Back to feed</button>
    </div>;

    return (
        <main className="min-h-screen pt-24 pb-12 bg-slate-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {alert.imageUrl ? (
                            <div className="rounded-3xl overflow-hidden glass aspect-square">
                                <img
                                    src={alert.imageUrl}
                                    alt={alert.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-slate-900 flex items-center justify-center aspect-square border border-slate-800">
                                <AlertTriangle className="w-24 h-24 text-slate-700" />
                            </div>
                        )}

                        <div className="flex items-center justify-between glass p-4 rounded-2xl">
                            <div className="flex items-center space-x-2 text-green-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-sm font-medium">Community Verified</span>
                            </div>
                            <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
                                <Share2 className="w-5 h-5" />
                                <span className="text-sm">Share</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6 w-fit">
                            {alert.category}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                            {alert.title}
                        </h1>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="flex items-center text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-800">
                                <MapPin className="w-5 h-5 mr-2 text-primary" />
                                {alert.location}
                            </div>
                            <div className="flex items-center text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-800">
                                <Clock className="w-5 h-5 mr-2" />
                                {formatDistanceToNow(new Date(alert.createdAt))} ago
                            </div>
                        </div>

                        <div className="glass p-6 rounded-2xl mb-8">
                            <h3 className="text-lg font-bold mb-4">Description</h3>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {alert.description}
                            </p>
                        </div>

                        {alert.contact && (
                            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-primary" /> Contact Information
                                </h3>
                                <p className="text-primary font-mono text-xl">{alert.contact}</p>
                                <p className="text-slate-500 text-xs mt-4">
                                    Please be cautious when sharing personal information or meeting strangers.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
