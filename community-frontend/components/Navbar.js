"use client";
import Link from 'next/link';
import { Bell, MapPin, PlusCircle, Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <a
                            href={process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://cloudshop-main.vercel.app"}
                            className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-full transition-all"
                            title="Back to Cloud Shop"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </a>
                        <Link href="/" className="flex items-center space-x-2">

                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow">
                                <Bell className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold gradient-text">CommunityAlert</span>
                        </Link>
                    </div>

                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900"
                            />
                            <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-slate-500 hover:text-primary transition-colors relative">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <Link href="/post" className="flex items-center space-x-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105 glow">
                            <PlusCircle className="w-5 h-5" />
                            <span className="hidden sm:inline">Post Alert</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
