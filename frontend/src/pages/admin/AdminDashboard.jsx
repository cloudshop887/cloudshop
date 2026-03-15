import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, IndianRupee, TrendingUp, ArrowUpRight, Check, X, RefreshCw, Megaphone, Send, AlertTriangle, Info, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../utils/adminApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Shops', value: '0', icon: Store, color: 'bg-blue-500', trend: '+0%' },
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-purple-500', trend: '+0%' },
        { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'bg-orange-500', trend: '+0%' },
        { label: 'Revenue', value: '₹0.00', icon: IndianRupee, color: 'bg-green-500', trend: '+0%' },
    ]);
    const [pendingShops, setPendingShops] = useState([]);
    const [totalShopsCount, setTotalShopsCount] = useState(0);
    const [systemActivity, setSystemActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementData, setAnnouncementData] = useState({
        title: '',
        message: '',
        type: 'INFO',
        role: 'ALL'
    });
    const [revenueData, setRevenueData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Statistics
            const { data: statsData } = await api.get('/admin/stats');

            // Update stats grid
            setStats([
                { label: 'Total Shops', value: statsData.totalShops.toString(), icon: Store, color: 'bg-blue-500' },
                { label: 'Total Users', value: statsData.totalUsers.toString(), icon: Users, color: 'bg-purple-500' },
                { label: 'Total Orders', value: statsData.totalOrders.toString(), icon: ShoppingBag, color: 'bg-orange-500' },
                { label: 'Revenue', value: `₹${statsData.totalRevenue}`, icon: IndianRupee, color: 'bg-green-500' },
            ]);

            setRevenueData(statsData.revenueChart);

            // Fetch pending shops
            console.log('Admin Dashboard: Fetching all shops...');
            const { data: allShops } = await api.get('/shops/admin/all');
            console.log('Admin Dashboard: All shops received:', allShops);

            if (Array.isArray(allShops)) {
                setTotalShopsCount(allShops.length);
                const pending = allShops.filter(shop => {
                    // Handle various types for isApproved (boolean, number, string)
                    const isApproved = shop.isApproved === true || shop.isApproved === 1 || shop.isApproved === 'true';
                    return !isApproved;
                });
                console.log(`Admin Dashboard: ${allShops.length} total shops, ${pending.length} pending`);
                setPendingShops(pending);
            } else {
                console.error('Admin Dashboard: Expected array for allShops, received:', typeof allShops);
                setTotalShopsCount(0);
                setPendingShops([]);
            }

            // Fetch activity
            const { data: activityData } = await api.get('/admin/activity');
            setSystemActivity(activityData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setLoading(false);
        }
    };

    const handleApproveShop = async (shopId) => {
        try {
            await api.put(`/shops/${shopId}/approve`);
            alert('Shop approved successfully!');
            fetchDashboardData(); // Refresh
        } catch (error) {
            console.error('Error approving shop:', error);
            alert('Failed to approve shop');
        }
    };

    const handleAutoApproveToggle = () => {
        // In a real app, this would update a backend setting
        setAutoApprove(!autoApprove);
        if (!autoApprove) {
            alert("Auto-Approval Mode Enabled: Future shops will be approved automatically (Simulation)");
        } else {
            alert("Manual Approval Mode Enabled");
        }
    };

    const handleApproveAll = async () => {
        if (!window.confirm(`Approve all ${pendingShops.length} pending shops?`)) return;

        try {
            await Promise.all(pendingShops.map(shop => api.put(`/shops/${shop.id}/approve`)));
            alert('All shops approved!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error approving all:', error);
            alert('Some approvals failed');
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', announcementData);
            alert('Announcement broadcasted successfully!');
            setShowAnnouncementModal(false);
            setAnnouncementData({ title: '', message: '', type: 'INFO', role: 'ALL' });
        } catch (error) {
            console.error('Error broadcasting announcement:', error);
            alert('Failed to broadcast announcement');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Welcome back, Admin. Manage your marketplace.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center gap-2"
                    >
                        <Megaphone className="w-4 h-4" /> Global Announcement
                    </button>
                    <button
                        onClick={handleAutoApproveToggle}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${autoApprove ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-700 text-slate-300 border border-slate-600'}`}
                    >
                        {autoApprove ? 'Auto-Approval: ON' : 'Auto-Approval: OFF'}
                    </button>
                </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20 text-white`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Revenue Overview (Last 6 Months)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                cursor={{ fill: '#334155', opacity: 0.4 }}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#0EA5E9"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Shops Section */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Pending Shop Approvals</h3>
                        {pendingShops.length > 0 && (
                            <button onClick={handleApproveAll} className="text-sm text-primary hover:text-sky-400">
                                Approve All
                            </button>
                        )}
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {pendingShops.length > 0 ? (
                            pendingShops.map((shop) => (
                                <div key={shop.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-700/50 rounded-lg gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Store className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{shop.name}</p>
                                            <p className="text-sm text-slate-400">{shop.category} • {shop.owner?.fullName}</p>
                                            <p className="text-xs text-slate-500 mt-1">{shop.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleApproveShop(shop.id)}
                                            className="flex-1 sm:flex-none px-3 py-2 bg-green-500/20 text-green-400 text-sm rounded hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Check className="w-4 h-4" /> Approve
                                        </button>
                                        {/* <button className="flex-1 sm:flex-none px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1">
                                            <X className="w-4 h-4" /> Reject
                                        </button> */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>{totalShopsCount === 0 ? "No shops registered in the system" : "No shops awaiting approval"}</p>
                                {totalShopsCount > 0 && <p className="text-xs mt-2">{totalShopsCount} shops are already approved</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity (Placeholder for now) */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">System Activity</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {systemActivity.length > 0 ? (
                            systemActivity.map((activity) => (
                                <div key={activity.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-700/50">
                                    <p className="text-slate-300 text-sm">{activity.text}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(activity.time).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Announcement Modal */}
            {
                showAnnouncementModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                        <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Megaphone className="text-primary" /> Post New Announcement
                                </h2>
                                <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. System Maintenance"
                                        required
                                        value={announcementData.title}
                                        onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white outline-none focus:border-primary transition-colors resize-none"
                                        placeholder="Write your message here..."
                                        rows="4"
                                        required
                                        value={announcementData.message}
                                        onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alert Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white outline-none focus:border-primary transition-colors"
                                            value={announcementData.type}
                                            onChange={(e) => setAnnouncementData({ ...announcementData, type: e.target.value })}
                                        >
                                            <option value="INFO">Information</option>
                                            <option value="SUCCESS">Success / Reward</option>
                                            <option value="WARNING">Important Alert</option>
                                            <option value="PROMOTION">Special Promo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Audience</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white outline-none focus:border-primary transition-colors"
                                            value={announcementData.role}
                                            onChange={(e) => setAnnouncementData({ ...announcementData, role: e.target.value })}
                                        >
                                            <option value="ALL">Everyone</option>
                                            <option value="USER">Customers Only</option>
                                            <option value="SHOP_OWNER">Shop Owners Only</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                                >
                                    <Send className="w-5 h-5" /> Broadcast Announcement
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default AdminDashboard;
