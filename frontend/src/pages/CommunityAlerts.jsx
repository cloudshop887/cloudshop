import React from 'react';
import AlertList from '../components/Community/AlertList';
import { MapPin, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommunityAlerts() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen pb-12 bg-slate-50 overflow-y-auto">

      {/* Hero Section */}
      <div className="relative overflow-hidden mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900">
            Connecting Our <span className="text-primary">Society</span> <br />
            in Real-Time
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            A live digital notice board for lost and found, job vacancies, local offers, and emergency alerts.
            No login required. Just community.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <MapPin className="text-primary w-4 h-4" />
              <span className="text-sm text-slate-700 font-medium">Active in: Your Local Area</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Info className="text-green-600 w-4 h-4" />
              <span className="text-sm text-slate-700 font-medium">Real-time updates enabled</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/community/post')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-sky-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-sky-200 transition-all transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Post New Alert
          </button>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AlertList />
      </div>

      <footer className="mt-20 border-t border-slate-200 pt-12 text-center text-slate-500 text-sm">
        <p>&copy; 2026 CommunityAlert Platform. Built for a safer, more connected society.</p>
      </footer>
    </main>
  );
}
