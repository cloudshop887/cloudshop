import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, User, ShoppingBag, LogOut, Package } from 'lucide-react';

const CustomerLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default CustomerLayout;
