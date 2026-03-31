import React from 'react';
import { MapPin, Clock, Share2, AlertTriangle, Briefcase, Tag, Search, Info, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const typeConfig = {
    'EMERGENCY': { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    'COMMUNITY': { icon: Info, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    'OFFER': { icon: Tag, color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    'GENERAL': { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
};

export default function AlertCard({ alert }) {
    const config = typeConfig[alert.type] || typeConfig['GENERAL'];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={`glass rounded-3xl overflow-hidden group cursor-pointer border-t-4 ${config.border} shadow-xl hover:shadow-2xl transition-all duration-300`}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                    <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest shadow-inner`}>
                        <Icon className="w-3.5 h-3.5 animate-pulse" />
                        <span>{alert.type}</span>
                    </div>
                    <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight text-slate-900">
                    {alert.title}
                </h3>

                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {alert.description}
                </p>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-700 text-sm bg-slate-100 p-2 rounded-xl">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        <span className="truncate">{alert.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-slate-500">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            <span>{formatDistanceToNow(new Date(alert.createdAt))} ago</span>
                        </div>
                        <div className="flex items-center text-slate-400">
                            <User className="w-3.5 h-3.5 mr-1.5" />
                            <span className="font-medium">
                                {alert.anonymous ? 'Anonymous' : (alert.user?.fullName || 'Community Member')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {alert.imageUrl && (
                <div className="h-56 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10"></div>
                    <img
                        src={alert.imageUrl}
                        alt={alert.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </div>
            )}
        </motion.div>
    );
}
