import Navbar from "@/components/Navbar";
import AlertList from "@/components/AlertList";
import { MapPin, Info } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen pt-20 pb-12">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Connecting Our <span className="gradient-text">Society</span> <br />
            in Real-Time
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            A live digital notice board for lost and found, job vacancies, local offers, and emergency alerts.
            No login required. Just community.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <MapPin className="text-primary w-4 h-4" />
              <span className="text-sm text-slate-700">Active in: Your Local Area</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Info className="text-green-600 w-4 h-4" />
              <span className="text-sm text-slate-700">Real-time updates enabled</span>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AlertList />
      </div>

      <footer className="mt-20 border-t border-white/5 py-12 text-center text-slate-600 text-sm">
        <p>&copy; 2026 CommunityAlert Platform. Built for a safer, more connected society.</p>
      </footer>
    </main>
  );
}
