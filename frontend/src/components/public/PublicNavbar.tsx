import React, { useState } from 'react';
import { Building2, Search, GitCompare, Menu, X, Zap, User } from 'lucide-react';

interface PublicNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'investor' | 'franchiser' | 'admin') => void;
  onOpenCompare: () => void;
  onOpenFeasibility?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenCompare,
  onOpenFeasibility,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFeasibilityClick = () => {
    if (onOpenFeasibility) {
      onOpenFeasibility();
    } else {
      onNavigate('feasibility');
    }
  };

  return (
    <header id="public-header" className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-slate-900 text-sm tracking-tight block">
                FranchiseDSS
              </span>
              <span className="text-[9px] font-extrabold tracking-wider text-blue-600 block uppercase">
                Decision Support
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 text-[11px] font-semibold bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`px-3 py-1 rounded-md transition-all duration-200 ${
                currentView === 'home' || currentView === 'landing'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Overview &amp; Aim
            </button>


            <button
              id="nav-discover"
              onClick={() => onNavigate('discover')}
              className={`px-3 py-1 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                currentView === 'discover'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Search className="w-3 h-3 text-blue-600" />
              Franchise Marketplace
            </button>

            <button
              id="nav-compare"
              onClick={onOpenCompare}
              className="px-3 py-1 rounded-md transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 flex items-center gap-1.5"
            >
              <GitCompare className="w-3 h-3 text-blue-600" />
              Compare Matrix
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              id="public-btn-login"
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              Log In
            </button>

            <button
              id="public-btn-register"
              onClick={() => onOpenAuth('register')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs transition hover:scale-[1.02]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 p-3 space-y-1.5 bg-white rounded-b-xl text-xs">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('discover'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Discover Marketplace
            </button>
            <button
              onClick={() => { onOpenCompare(); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Compare Brands
            </button>
            <button
              onClick={() => { handleFeasibilityClick(); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Feasibility DSS Engine
            </button>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-center font-bold bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
              >
                Log In
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-center font-bold bg-blue-600 text-white rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
    </header>
  );
};
