import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AlertCard from './AlertCard';
import { socket } from '../../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw, Navigation, Search } from 'lucide-react';

export default function AlertList() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [location, setLocation] = useState(null);
    const [radius, setRadius] = useState(10);
    const [locLoading, setLocLoading] = useState(false);

    useEffect(() => {
        // Initial fetch
        fetchAlerts();

        // Socket listeners
        socket.connect();
        socket.on('new_alert', (newAlert) => {
            // Logic for location-based notification filter can be added here
            if (location) {
                const dist = calculateDistance(location.lat, location.lng, newAlert.latitude, newAlert.longitude);
                if (dist <= radius) {
                    setAlerts(prev => [newAlert, ...prev]);
                }
            } else {
                setAlerts(prev => [newAlert, ...prev]);
            }
        });

        return () => {
            socket.off('new_alert');
            socket.disconnect();
        };
    }, [location, radius]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (location) {
                params.lat = location.lat;
                params.lng = location.lng;
                params.radius = radius;
            }

            const response = await api.get(`/alerts`, { params });
            setAlerts(response.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        setLocLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocLoading(false);
                    alert("Could not get location. Showing all alerts.");
                }
            );
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const types = ['All', 'EMERGENCY', 'COMMUNITY', 'OFFER', 'GENERAL'];

    const filteredAlerts = filter === 'All'
        ? alerts
        : alerts.filter(a => a.type === filter);

    return (
        <div className="space-y-8">
            {/* Location Bar */}
            <div className="glass p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${location ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Discovery Radius</p>
                        <div className="flex flex-wrap gap-2">
                            {[2, 5, 10, 50].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRadius(r)}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all border ${radius === r
                                        ? 'bg-primary text-white border-primary shadow-sm scale-105'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:bg-slate-50'
                                        }`}
                                >
                                    {r} KM
                                </button>
                            ))}
                            <span className="text-[10px] text-slate-400 font-bold self-center ml-1">
                                {location ? '✨ Local' : '🌍 Global'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={getUserLocation}
                    disabled={locLoading}
                    className={`px-6 py-2.5 rounded-2xl flex items-center space-x-2 transition-all font-bold text-sm ${location
                        ? 'bg-green-600 text-white glow'
                        : 'bg-primary hover:bg-primary-dark text-white'
                        } disabled:opacity-50`}
                >
                    {locLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    <span>{location ? 'Location Active' : 'Find Nearby Alerts'}</span>
                </button>
            </div>

            {/* Filter Chips */}
            <div className="flex overflow-x-auto space-x-3 pb-4 scrollbar-hide py-2">
                {types.map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black tracking-widest transition-all uppercase ${filter === t
                            ? 'bg-primary text-white shadow-lg glow scale-105'
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-sm'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass h-80 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {filteredAlerts.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 glass rounded-3xl border-dashed border-2 border-slate-200"
                >
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-primary w-10 h-10" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">No alerts in your vicinity.</p>
                    <p className="text-slate-500 mt-2">Try expanding your radius or checking back later.</p>
                </motion.div>
            )}
        </div>
    );
}
