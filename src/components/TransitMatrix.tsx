import React, { useState } from 'react';
import { ODISHA_TRANSIT_ROUTES } from '../data/mockData';
import { RouteFareItem } from '../types';
import {
  Bus,
  Train,
  Car,
  Compass,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  Clock,
  MapPin,
  Search,
  IndianRupee,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const TransitMatrix: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<RouteFareItem>(ODISHA_TRANSIT_ROUTES[0]);
  const [passengerCount, setPassengerCount] = useState<number>(2);

  const filteredRoutes = ODISHA_TRANSIT_ROUTES.filter((r) => {
    const matchesSearch =
      r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.to.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedModeFilter === 'all') return true;
    return r.modes.some((m) => m.mode.toLowerCase().includes(selectedModeFilter.toLowerCase()));
  });

  const getVerificationBadge = (status: 'verified_govt' | 'provider_confirmed' | 'estimated') => {
    switch (status) {
      case 'verified_govt':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Verified Govt Fare
          </span>
        );
      case 'provider_confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            <CheckCircle className="w-3 h-3 text-cyan-400" />
            Provider Confirmed
          </span>
        );
      case 'estimated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
            <HelpCircle className="w-3 h-3 text-amber-400" />
            Estimated Fair Rate
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-emerald-950/70 to-stone-900 border border-emerald-800/40 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Bus className="w-3.5 h-3.5 text-emerald-400" />
            Intelligent Local Transportation & Transparent Pricing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Odisha Transit & Regulated Fare Matrix
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Avoid arbitrary tourist surcharges. UtkalSarathi benchmarks official CRUT ‘Mo Bus’
            schedules, railway frequencies, prepaid station counters, and last-mile connectivity
            guidance to heritage sites.
          </p>
        </div>
      </div>

      {/* Disclaimers & Transparency Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/30 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-emerald-300 block">Official Govt Rates</span>
            <span className="text-stone-300">
              CRUT Mo Bus and IRCTC fares are strictly verified from published tariffs.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900 border border-cyan-500/30 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-cyan-300 block">Prepaid Counters</span>
            <span className="text-stone-300">
              Use official pre-fixed police booths at Puri & Bhubaneswar stations.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-500/30 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block">Honest Uncertainty</span>
            <span className="text-stone-300">
              Where reliable timetables are unavailable (remote eco-camps), we communicate limits rather than inventing routes.
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search routes (e.g. Puri, Konark, Dhauli)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-9 pr-3.5 py-2 text-stone-200 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'mo bus', 'train', 'auto', 'boat'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedModeFilter(mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border whitespace-nowrap transition-all ${
                selectedModeFilter === mode
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Route List + Selected Route Detail Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 px-1">
            Available Curated Corridors ({filteredRoutes.length})
          </h3>

          <div className="space-y-2.5">
            {filteredRoutes.map((route) => {
              const isSelected = selectedRoute.id === route.id;
              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-stone-850 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Compass className="w-3.5 h-3.5" />
                      {route.distanceKm} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.estDuration}
                    </span>
                  </div>

                  <div className="font-bold text-stone-100 text-sm">
                    {route.from.split('(')[0]} <span className="text-amber-400 font-bold">→</span>{' '}
                    {route.to.split('(')[0]}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-800/80">
                    <div className="flex items-center gap-1 text-[11px] text-stone-300">
                      <span>Available modes:</span>
                      <span className="text-amber-300 font-medium">
                        {route.modes.map((m) => m.mode).join(', ')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      From {route.modes[0]?.fare.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Route Deep Dive & Interactive Fare Calculator */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Route Deep Dive • {selectedRoute.distanceKm} km
              </span>
              <span className="text-xs text-stone-400">Est. Time: {selectedRoute.estDuration}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              {selectedRoute.from} <span className="text-amber-400">→</span> {selectedRoute.to}
            </h2>
          </div>

          {/* Passenger counter for calculation */}
          <div className="bg-stone-800/60 border border-stone-700/60 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-semibold text-stone-200">
                Fare Calculator for Group Size:
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setPassengerCount(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                    passengerCount === num
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Transportation Modes Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Verified Transit Options
            </h3>

            {selectedRoute.modes.map((mode, idx) => {
              // Calculate for party
              const isVehicle = mode.mode.includes('Taxi') || mode.mode.includes('Boat') || mode.mode.includes('Auto');
              const partyEst = isVehicle
                ? mode.numericMinFare
                : mode.numericMinFare * passengerCount;

              return (
                <div
                  key={idx}
                  className="bg-stone-850 border border-stone-800 rounded-xl p-4 transition-all hover:border-stone-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-100 text-sm">
                          {mode.mode}
                        </span>
                        {getVerificationBadge(mode.verificationStatus)}
                      </div>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        {mode.details}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-extrabold text-amber-400">{mode.fare}</div>
                      <div className="text-[11px] text-stone-400">
                        {isVehicle
                          ? `Total vehicle for ${passengerCount} pax`
                          : `Total for ${passengerCount} passengers: ₹${partyEst}`}
                      </div>
                    </div>
                  </div>

                  {mode.frequencyOrTimings && (
                    <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Timings: {mode.frequencyOrTimings}</span>
                    </div>
                  )}

                  <div className="mt-2 text-[11px] text-stone-500 border-t border-stone-800/80 pt-1.5 flex items-center justify-between">
                    <span>Source: {mode.lastUpdated}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Last Mile Advice */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Last-Mile & Station Connectivity Notice</span>
            </div>
            <p className="leading-relaxed text-stone-300">{selectedRoute.lastMileNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
