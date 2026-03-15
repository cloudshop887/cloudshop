import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download } from 'lucide-react';

const AdminAnalytics = () => {
    // Mock data - in a real app, fetch this from backend
    const userGrowthData = [
        { name: 'Jan', users: 400 },
        { name: 'Feb', users: 300 },
        { name: 'Mar', users: 600 },
        { name: 'Apr', users: 800 },
        { name: 'May', users: 1000 },
        { name: 'Jun', users: 1200 },
    ];

    const shopStatusData = [
        { name: 'Approved', value: 45 },
        { name: 'Pending', value: 12 },
        { name: 'Rejected', value: 5 },
    ];

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    const handleExport = (type) => {
        alert(`Exporting ${type} data... (Feature coming soon)`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('users')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                        <Download className="w-4 h-4" /> Export Users
                    </button>
                    <button
                        onClick={() => handleExport('shops')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                        <Download className="w-4 h-4" /> Export Shops
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-4">User Growth</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shop Status Pie Chart */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-4">Shop Status Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={shopStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {shopStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue/Activity Bar Chart (Mock) */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 lg:col-span-2">
                    <h2 className="text-lg font-bold text-white mb-4">Monthly Activity</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="users" name="Active Users" fill="#8B5CF6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
