import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen pt-16">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12">
                <div className="absolute inset-0 bg-[url('/cloudshoplogo.png')] bg-cover bg-center opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 via-white/80 to-white"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-7xl font-bold mb-6 text-slate-900"
                    >
                        Discover Local Shops in <span className="text-gradient">One Tap</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto"
                    >
                        Multi-Vendor Cloud Marketplace | Shop Registration | Real-Time Visibility
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/shops" className="bg-primary hover:bg-sky-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200 hover:shadow-sky-300">
                            Explore Shops <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a href={import.meta.env.VITE_COMMUNITY_URL || "https://community-alerts.vercel.app"} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-slate-50 text-primary border-2 border-primary px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-sm">
                            Real-time Community Alerts
                        </a>
                        <Link to="/register-shop" className="glass hover:bg-white text-slate-700 px-8 py-4 rounded-full text-lg font-semibold transition-all border border-slate-200 shadow-sm hover:shadow-md">
                            Register Your Shop
                        </Link>
                    </motion.div>


                </div>
            </section>

            {/* Tech Stack Marquee */}
            <section className="py-10 bg-slate-50 border-y border-slate-200 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-slate-400 mb-6 text-sm uppercase tracking-widest">Powered By Modern Tech</p>
                    <div className="flex justify-center gap-8 flex-wrap text-slate-500 font-mono text-sm">
                        <span>React</span>
                        <span>Tailwind CSS</span>
                        <span>Node.js</span>
                        <span>Prisma</span>
                        <span>Firebase</span>
                        <span>Socket.IO</span>
                        <span>Leaflet</span>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">What is <span className="text-primary">CloudShop</span>?</h2>
                        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Store className="w-12 h-12 text-primary mb-6" />,
                                title: "For Local Shops",
                                desc: "Register on the cloud, upload products and offers, and reach customers nearby. Simple dashboard for product management."
                            },
                            {
                                icon: <ShieldCheck className="w-12 h-12 text-primary mb-6" />,
                                title: "Admin Verified",
                                desc: "Secure platform with Admin approval workflow. Ensuring only legitimate businesses are listed."
                            },
                            {
                                icon: <Zap className="w-12 h-12 text-primary mb-6" />,
                                title: "Fast & Modern",
                                desc: "Clean, modern UI with glassmorphism. Distance-aware listings so customers find what they need quickly."
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                whileHover={{ y: -10 }}
                                className="glass-card p-8 hover:bg-white transition-colors border border-slate-100"
                            >
                                {item.icon}
                                <h3 className="text-xl font-bold mb-4 text-slate-800">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2024 CloudShop. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:text-white transition-colors">About</Link>
                        <Link to="/shops" className="hover:text-white transition-colors">Shops</Link>
                        <Link to="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
