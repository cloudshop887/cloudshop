import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, ShoppingBag, BarChart3, LogOut, Settings } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Store, label: 'Manage Shops', path: '/admin/shops' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 fixed h-full bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-primary">CloudShop<span className="text-white text-sm ml-1">Admin</span></h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
