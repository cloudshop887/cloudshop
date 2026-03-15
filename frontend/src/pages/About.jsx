import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, CheckCircle, Store, User, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const About = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                        We Are <span className="text-primary">CloudShop</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Bridging the gap between local commerce and digital convenience.
                        Your neighborhood shops, now just a tap away.
                    </p>
                </motion.div>

                {/* Mission & Vision */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
                >
                    <motion.div variants={itemVariants} className="glass-card p-8 border-l-4 border-primary">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-sky-100 rounded-full text-primary">
                                <Target className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Our Mission</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            To empower every local shop owner with cutting-edge digital tools, enabling them to compete in the modern economy while providing customers with the most convenient, transparent, and hyper-local shopping experience.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card p-8 border-l-4 border-blue-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Eye className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Our Vision</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            To build a connected world where "local" means "limitless". We envision a future where every neighborhood store has a cloud presence, creating a vibrant, sustainable, and digitally inclusive community marketplace.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Our Values */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">Our Core Values</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Heart, title: "Community First", desc: "We build for people, strengthening local bonds." },
                            { icon: Shield, title: "Trust & Transparency", desc: "Honest listings, verified shops, real prices." },
                            { icon: Zap, title: "Innovation", desc: "Simplifying complex tech for everyday users." },
                            { icon: Globe, title: "Inclusivity", desc: "A platform for every shop, big or small." }
                        ].map((val, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center"
                            >
                                <div className="inline-flex p-3 bg-slate-50 rounded-full text-primary mb-4">
                                    <val.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{val.title}</h3>
                                <p className="text-slate-500">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* How It Works */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How CloudShop Works</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* For Shop Owners */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100"
                        >
                            <div className="bg-primary p-6 text-white flex items-center gap-3">
                                <Store className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">For Shop Owners</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                {[
                                    "Register your shop with basic details & location.",
                                    "Upload products, set prices, and add exciting offers.",
                                    "Get a dedicated dashboard to manage your digital store.",
                                    "Connect directly with nearby customers."
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-sky-100 text-primary rounded-full flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-700 text-lg">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* For Customers */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100"
                        >
                            <div className="bg-slate-800 p-6 text-white flex items-center gap-3">
                                <User className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">For Customers</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                {[
                                    "Search for products or shops in your specific area.",
                                    "Compare prices and check distance in real-time.",
                                    "View shop profiles, ratings, and active offers.",
                                    "Contact shop owners directly via phone or WhatsApp."
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-700 text-lg">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-10 text-center"
                >
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Choose CloudShop?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">Hyper-Local Focus</h4>
                            <p className="text-slate-600">We prioritize shops near you, saving time and supporting your community.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">Zero Commission</h4>
                            <p className="text-slate-600">Direct connection means better prices for you and full profit for shops.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">Real-Time Updates</h4>
                            <p className="text-slate-600">Know exactly what's in stock and who is open right now.</p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default About;
