import React, { useState, useMemo } from 'react';
import { ODISHA_DESTINATIONS, Destination } from '../utils/itinerary';
import {
  MapPin,
  Compass,
  Navigation,
  Clock,
  Bus,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  Building,
  TreePine,
  Waves,
} from 'lucide-react';

// Real geographic coordinate points and approximate visual SVG map placement (normalized x,y percentage on Odisha map)
interface GeoDestination extends Destination {
  coordinates: { lat: number; lng: number };
  svgPos: { x: number; y: number }; // percentage 0-100 on Odisha canvas
  nearbyAttractions: string[];
}

const GEO_DESTINATIONS: GeoDestination[] = [
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'konark-sun-temple')!,
    coordinates: { lat: 19.8876, lng: 86.0945 },
    svgPos: { x: 74, y: 64 },
    nearbyAttractions: ['Chandrabhaga Beach (3 km)', 'Ramachandi Temple (7 km)', 'Kuruma Buddhist Site (8 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'puri-jagannath-temple')!,
    coordinates: { lat: 19.8049, lng: 85.8179 },
    svgPos: { x: 67, y: 69 },
    nearbyAttractions: ['Golden Beach (Blue Flag certified)', 'Gundicha Temple (3 km)', 'Raghurajpur (14 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'lingaraj-temple')!,
    coordinates: { lat: 20.2382, lng: 85.8338 },
    svgPos: { x: 63, y: 55 },
    nearbyAttractions: ['Bindusagar Lake (0.2 km)', 'Rajarani Temple (2 km)', 'Mukteshwar Temple (1.8 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'dhauli-shanti-stupa')!,
    coordinates: { lat: 20.1925, lng: 85.8394 },
    svgPos: { x: 64, y: 58 },
    nearbyAttractions: ['Ashokan Rock Edict (0.1 km)', 'Daya River Banks', 'Pipili Applique Village (10 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'udayagiri-khandagiri-caves')!,
    coordinates: { lat: 20.2612, lng: 85.7865 },
    svgPos: { x: 61, y: 54 },
    nearbyAttractions: ['Hathigumpha Inscription', 'Rani Gumpha Monasteries', 'Nandankanan Zoo (16 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'raghurajpur-heritage-village')!,
    coordinates: { lat: 19.8887, lng: 85.8359 },
    svgPos: { x: 66, y: 65 },
    nearbyAttractions: ['Chandanpur Coconut Groves (1.5 km)', 'Siruli Mahavir Temple (12 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'chilika-mangalajodi')!,
    coordinates: { lat: 19.8856, lng: 85.4247 },
    svgPos: { x: 55, y: 68 },
    nearbyAttractions: ['Kalijai Island Temple (Boat)', 'Satapada Dolphin Point', 'Nalabana Bird Sanctuary'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'bhitarkanika-national-park')!,
    coordinates: { lat: 20.7247, lng: 86.8667 },
    svgPos: { x: 82, y: 42 },
    nearbyAttractions: ['Gahirmatha Turtle Sanctuary (15 km)', 'Kanika Palace (18 km)', 'Khola Mangrove Creek'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'similipal-biosphere')!,
    coordinates: { lat: 21.8656, lng: 86.3375 },
    svgPos: { x: 70, y: 20 },
    nearbyAttractions: ['Barehipani Waterfall (399m)', 'Joranda Falls (181m)', 'Deokund Sacred Pool (28 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'satkosia-tiger-reserve')!,
    coordinates: { lat: 20.5744, lng: 84.8456 },
    svgPos: { x: 48, y: 48 },
    nearbyAttractions: ['Tikarpada Gharial Sanctuary', 'Badmul River Sandbar Camp', 'Purunakote Forests'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'daringbadi-kashmir-of-odisha')!,
    coordinates: { lat: 19.9056, lng: 84.1352 },
    svgPos: { x: 38, y: 66 },
    nearbyAttractions: ['Midubanda Waterfall (4 km)', 'Coffee & Pepper Plantations', 'Lovers Point (12 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'koraput-tribal-heritage')!,
    coordinates: { lat: 18.8135, lng: 82.7118 },
    svgPos: { x: 18, y: 84 },
    nearbyAttractions: ['Deomali Peak (1672m)', 'Duduma Waterfall (175m)', 'Gupteswar Cave Temple (55 km)'],
  },
  {
    ...ODISHA_DESTINATIONS.find((d) => d.id === 'hirakud-dam-sambalpur')!,
    coordinates: { lat: 21.5273, lng: 83.8732 },
    svgPos: { x: 32, y: 34 },
    nearbyAttractions: ['Gandhi Minar Observation Tower', 'Debrigarh Wildlife Sanctuary (22 km)', 'Maa Samaleswari Temple (15 km)'],
  },
];

const ORIGIN_HUBS: Record<string, { lat: number; lng: number; name: string }> = {
  Bhubaneswar: { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar (Capital Central Hub)' },
  Puri: { lat: 19.8135, lng: 85.8312, name: 'Puri (Coastal Pilgrimage Hub)' },
  Cuttack: { lat: 20.4625, lng: 85.883, name: 'Cuttack (Millennium City)' },
  Berhampur: { lat: 19.3149, lng: 84.7941, name: 'Berhampur (Southern Gateway)' },
  Sambalpur: { lat: 21.4669, lng: 83.9812, name: 'Sambalpur (Western Industrial & Handloom Hub)' },
  Rourkela: { lat: 22.2604, lng: 84.8536, name: 'Rourkela (Northern Gateway)' },
};

// Great-circle distance helper
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface OdishaGeoMapProps {
  onSelectDestination?: (dest: Destination) => void;
  onOpenAssistant?: (prompt: string) => void;
}

export const OdishaGeoMap: React.FC<OdishaGeoMapProps> = ({
  onSelectDestination,
  onOpenAssistant,
}) => {
  const [selectedHub, setSelectedHub] = useState<string>('Bhubaneswar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDest, setActiveDest] = useState<GeoDestination>(GEO_DESTINATIONS[0]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentOrigin = ORIGIN_HUBS[selectedHub] || ORIGIN_HUBS['Bhubaneswar'];

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    return GEO_DESTINATIONS.filter((d) => {
      const matchCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'heritage'
          ? d.category === 'heritage' || d.category === 'spiritual'
          : selectedCategory === 'nature'
          ? d.category === 'nature'
          : selectedCategory === 'coastal'
          ? d.region.includes('Coastal') || d.region.includes('Triangle')
          : selectedCategory === 'tribal'
          ? d.category === 'tribal_crafts'
          : true;

      const matchSearch =
        searchFilter.trim() === ''
          ? true
          : d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            d.district.toLowerCase().includes(searchFilter.toLowerCase()) ||
            d.odiaName.includes(searchFilter);

      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchFilter]);

  const activeDistKm = computeDistanceKm(
    currentOrigin.lat,
    currentOrigin.lng,
    activeDest.coordinates.lat,
    activeDest.coordinates.lng
  );

  // Approximate road travel time
  const estRoadHours = (activeDistKm / 45).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-teal-950/70 to-stone-900 border border-teal-800/40 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            Geographic Exploration & Route Mapping
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Odisha Tourism Geo-Explorer
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Explore heritage landmarks, eco-sanctuaries, waterfalls, and artisan craft clusters
            across all 5 geographic zones of Odisha with verified distance calculations and transit connectivity.
          </p>
        </div>
      </div>

      {/* Origin Selector and Filters */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Origin Hub Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Calculate Route From:</span>
          </div>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-teal-500"
          >
            {Object.keys(ORIGIN_HUBS).map((hub) => (
              <option key={hub} value={hub}>
                {ORIGIN_HUBS[hub].name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Destinations' },
            { id: 'heritage', label: 'Temples & Heritage' },
            { id: 'nature', label: 'Eco-Tourism & Lakes' },
            { id: 'coastal', label: 'Coastal & Beaches' },
            { id: 'tribal', label: 'Tribal & Crafts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container & Destination Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                Interactive State Map of Odisha
              </span>
            </div>
            <span className="text-[11px] text-stone-400">
              Click any landmark pin to view details
            </span>
          </div>

          {/* SVG Map of Odisha with Stylized Outline & Landmarks */}
          <div className="relative w-full aspect-[4/3] bg-stone-950/80 rounded-xl border border-stone-800/80 overflow-hidden flex items-center justify-center p-2">
            {/* Background subtle coastal waves */}
            <div className="absolute right-0 bottom-0 w-1/3 h-2/3 opacity-10 pointer-events-none text-teal-400">
              <Waves className="w-full h-full" />
            </div>

            {/* Stylized State Silhouette Backdrop */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-stone-800/50 fill-stone-850 stroke-stone-700/60 stroke-[0.8]"
            >
              {/* Odisha boundary polygon approximation */}
              <polygon points="12,78 15,65 24,55 28,38 42,28 55,18 72,12 85,18 88,32 82,45 78,58 72,70 65,75 50,78 35,85 20,90 12,85" />
              {/* Mahanadi River path */}
              <path
                d="M 32,34 Q 48,45 63,55 T 80,50"
                fill="none"
                stroke="#0d9488"
                strokeWidth="1.2"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              {/* Chilika Lake lagoon shape */}
              <ellipse cx="58" cy="70" rx="6" ry="3" fill="#0f766e" opacity="0.4" />
            </svg>

            {/* Hub Marker */}
            {ORIGIN_HUBS[selectedHub] && (
              <div
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${
                    selectedHub === 'Bhubaneswar'
                      ? 63
                      : selectedHub === 'Puri'
                      ? 67
                      : selectedHub === 'Cuttack'
                      ? 64
                      : selectedHub === 'Berhampur'
                      ? 45
                      : selectedHub === 'Sambalpur'
                      ? 32
                      : 48
                  }%`,
                  top: `${
                    selectedHub === 'Bhubaneswar'
                      ? 55
                      : selectedHub === 'Puri'
                      ? 69
                      : selectedHub === 'Cuttack'
                      ? 52
                      : selectedHub === 'Berhampur'
                      ? 76
                      : selectedHub === 'Sambalpur'
                      ? 34
                      : 20
                  }%`,
                }}
              >
                <div className="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-500/30 animate-pulse"></div>
              </div>
            )}

            {/* Destination Pins on Map */}
            {filteredDestinations.map((dest) => {
              const isSelected = activeDest.id === dest.id;
              return (
                <button
                  key={dest.id}
                  onClick={() => setActiveDest(dest)}
                  style={{
                    left: `${dest.svgPos.x}%`,
                    top: `${dest.svgPos.y}%`,
                  }}
                  className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 group transition-all focus:outline-none`}
                  title={`${dest.name} (${dest.district})`}
                >
                  <div
                    className={`flex items-center justify-center rounded-full transition-transform ${
                      isSelected
                        ? 'w-8 h-8 bg-amber-500 text-stone-950 scale-125 shadow-lg shadow-amber-500/50 z-40'
                        : 'w-6 h-6 bg-teal-600 text-white hover:bg-teal-500 hover:scale-110 shadow'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`absolute left-1/2 transform -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap font-bold shadow-md transition-opacity pointer-events-none ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 opacity-100 z-50'
                        : 'bg-stone-900/90 text-stone-200 border border-stone-700 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {dest.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Selected Origin Hub ({selectedHub})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
              Tourist Destinations ({filteredDestinations.length})
            </span>
          </div>
        </div>

        {/* Selected Destination Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-md space-y-4">
          <div className="border-b border-stone-800 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-teal-400">
                {activeDest.region} • {activeDest.district} District
              </span>
              <span className="text-xs text-stone-400">
                {activeDest.coordinates.lat.toFixed(4)}° N, {activeDest.coordinates.lng.toFixed(4)}° E
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {activeDest.name}
            </h3>
            <span className="text-xs text-amber-400 font-serif">
              {activeDest.odiaName}
            </span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            {activeDest.description}
          </p>

          {/* Distance & Travel Matrix Card */}
          <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Distance from {selectedHub}:</span>
              <span className="text-base font-extrabold text-amber-400">
                {activeDistKm} km
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="text-stone-400">Estimated Road Travel Time:</span>
              <span className="font-semibold text-stone-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                ~{estRoadHours} hours
              </span>
            </div>
            <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
              Primary Transit: {activeDest.transportInfo.options[0]?.mode} ({activeDest.transportInfo.options[0]?.fare})
            </div>
          </div>

          {/* Nearby Attractions */}
          <div>
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
              Nearby Attractions & Excursions:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activeDest.nearbyAttractions.map((att, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs border border-stone-700"
                >
                  {att}
                </span>
              ))}
            </div>
          </div>

          {/* Verified practical information */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-stone-850 p-2.5 rounded-lg border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Visiting Hours:</span>
              <span className="font-semibold text-stone-200">{activeDest.verifiedHours}</span>
            </div>
            <div className="bg-stone-850 p-2.5 rounded-lg border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Best Season:</span>
              <span className="font-semibold text-emerald-400">{activeDest.bestTimeToVisit.split('(')[0]}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            {onOpenAssistant && (
              <button
                onClick={() =>
                  onOpenAssistant(
                    `How do I travel from ${selectedHub} to ${activeDest.name}? What is the best route and schedule?`
                  )
                }
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Route Guide</span>
              </button>
            )}

            {onSelectDestination && (
              <button
                onClick={() => onSelectDestination(activeDest)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors"
              >
                View Full Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
