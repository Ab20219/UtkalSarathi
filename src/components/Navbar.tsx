import React from 'react';
import { SupportedLanguage } from '../types';
import { ShieldAlert, Compass, Bus, Volume2, UtensilsCrossed, Bot, Download, Globe, Milestone } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onOpenSos: () => void;
  onOpenOffline: () => void;
  isOfflineReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onOpenSos,
  onOpenOffline,
  isOfflineReady,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-amber-900/40 text-stone-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => setCurrentTab('itinerary')}
            className="flex items-center gap-3 text-left group transition-all"
            aria-label="UtkalSarathi Home"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 flex items-center justify-center shadow-md shadow-orange-950/50 group-hover:scale-105 transition-transform">
              {/* Stylized Sun Wheel / Chariot Motif */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 sm:w-7 sm:h-7 text-amber-100 animate-spin-slow"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Utkal<span className="text-amber-400">Sarathi</span>
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Odisha Smart Tourism
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden md:block">
                AI Cultural Discovery, Transit Pricing & Traveller Safety
              </p>
            </div>
          </button>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SOS Shortcut */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-900/40 animate-pulse transition-all"
              aria-label="Open UtkalSuraksha Emergency SOS Help"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS (112)</span>
            </button>

            {/* Offline Pack */}
            <button
              onClick={onOpenOffline}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs sm:text-sm font-medium transition-colors"
              aria-label="Open Offline Travel Pack"
              title="Download emergency info for offline access"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Offline Pack</span>
              {isOfflineReady && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Offline ready" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 rounded-lg p-1 border border-stone-700">
              <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('or')}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  language === 'or'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                aria-label="Switch to Odia"
              >
                ଓଡ଼ିଆ (OR)
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  language === 'hi'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                aria-label="Switch to Hindi"
              >
                हिन्दी (HI)
              </button>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar border-t border-stone-800 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setCurrentTab('itinerary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'itinerary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Discover & Itinerary</span>
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'map'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Odisha Geo-Map</span>
          </button>

          <button
            onClick={() => setCurrentTab('transit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'transit'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>Transit & Fair Fares</span>
          </button>

          <button
            onClick={() => setCurrentTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'safety'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>UtkalSuraksha (Safety)</span>
          </button>

          <button
            onClick={() => setCurrentTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'audio'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Utkal Katha (Voice Stories)</span>
          </button>

          <button
            onClick={() => setCurrentTab('cuisine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'cuisine'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-orange-400" />
            <span>Cuisine & Artisans</span>
          </button>

          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'roadmap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Milestone className="w-4 h-4 text-amber-400" />
            <span>Roadmap & Vision</span>
          </button>

          <button
            onClick={() => setCurrentTab('assistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'assistant'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Utkal Mitra AI (30 Districts)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
