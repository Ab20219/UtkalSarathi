import React, { useState } from 'react';
import {
  EMERGENCY_CONTACTS,
  EmergencyContact,
} from '../utils/offlinePack';
import {
  VERIFIED_EMERGENCY_FACILITIES,
  INITIAL_HAZARDS,
} from '../data/mockData';
import { HazardReport } from '../types';
import {
  ShieldAlert,
  PhoneCall,
  Share2,
  AlertTriangle,
  Hospital,
  Shield,
  CloudRain,
  MapPin,
  Clock,
  ThumbsUp,
  PlusCircle,
  CheckCircle2,
  Info,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export const UtkalSuraksha: React.FC = () => {
  const [hazards, setHazards] = useState<HazardReport[]>(INITIAL_HAZARDS);
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New report form state
  const [newLoc, setNewLoc] = useState('');
  const [newDistrict, setNewDistrict] = useState('Puri');
  const [newType, setNewType] = useState<
    'Road Diversion' | 'Heavy Rush / Long Queue' | 'Waterlogging' | 'Weather Advisory' | 'Wildlife Warning'
  >('Heavy Rush / Long Queue');
  const [newDesc, setNewDesc] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Live Location Share state
  const [sharedLink, setSharedLink] = useState<string | null>(null);

  const handleCopyNumber = (id: string, num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLiveLocation = () => {
    // Generate simulated location sharing link
    const time = new Date().toLocaleTimeString();
    const mockLat = '19.8135';
    const mockLng = '85.8312';
    const link = `https://maps.google.com/?q=${mockLat},${mockLng} (UtkalSuraksha Live Safe Track: Puri Grand Road at ${time})`;
    setSharedLink(link);
  };

  const handleSubmitHazard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.trim() || !newDesc.trim()) return;

    const report: HazardReport = {
      id: `hz-${Date.now()}`,
      location: newLoc,
      district: newDistrict,
      type: newType,
      description: newDesc,
      submittedBy: 'Traveller (You)',
      timestamp: 'Just now',
      status: 'under_review',
      upvotes: 1,
    };

    setHazards([report, ...hazards]);
    setNewLoc('');
    setNewDesc('');
    setShowReportForm(false);
    setSubmittedMessage('Report submitted successfully! Queued for moderator verification.');
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  const handleUpvote = (id: string) => {
    setHazards(
      hazards.map((h) => (h.id === id ? { ...h, upvotes: h.upvotes + 1 } : h))
    );
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950 via-stone-900 to-red-950 border border-red-800/40 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            UtkalSuraksha: Traveller Safety & Emergency Protocol
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Comprehensive Traveller Safety & Official Assistance
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Instant SOS calling shortcuts, verified tourist police stations, accredited hospitals,
            and crowdsourced community hazard warnings across Odisha.
          </p>
        </div>
      </div>

      {/* Mandatory Safety Notice / Disclaimer per OSFIC Proposal */}
      <div className="p-4 rounded-xl bg-stone-900 border border-amber-600/40 flex items-start gap-3 shadow-md">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 leading-relaxed">
          <span className="font-bold text-amber-300 block mb-0.5">
            Important Safety Protocol & Network Transparency:
          </span>
          The emergency calling shortcuts initiate standard cellular telephone calls via your device.
          They are not a guaranteed automated electronic dispatch unless confirmed by direct verbal communication
          with emergency operators. In case of imminent danger, directly dial{' '}
          <span className="font-extrabold text-white">112</span>.
        </div>
      </div>

      {/* Emergency SOS Numbers Grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-white">Verified 24x7 Emergency Hotlines</h2>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active & Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {EMERGENCY_CONTACTS.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                contact.priority === 'critical'
                  ? 'bg-red-950/20 border-red-800/40 hover:border-red-600'
                  : 'bg-stone-850 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    {contact.odiaName}
                  </span>
                  {contact.priority === 'critical' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
                      CRITICAL
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-stone-100 mt-1">{contact.name}</h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{contact.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white tracking-wide">
                  {contact.number}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyNumber(contact.id, contact.number)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                    title="Copy number"
                    aria-label={`Copy number for ${contact.name}`}
                  >
                    {copiedId === contact.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Call
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Location Sharing & Trusted Contact Simulation */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Share Live Journey Status with Family / Trusted Contacts
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Generate a secure emergency message containing your current GPS pin and checkpoint in Odisha.
            </p>
          </div>

          <button
            onClick={handleShareLiveLocation}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <MapPin className="w-4 h-4" />
            Generate Location Share Pin
          </button>
        </div>

        {sharedLink && (
          <div className="mt-4 p-4 rounded-xl bg-stone-800/80 border border-amber-500/40 space-y-2">
            <span className="text-xs font-bold text-amber-300 block">
              Shareable Emergency Tracking Message:
            </span>
            <div className="bg-stone-900 p-2.5 rounded-lg font-mono text-xs text-stone-300 break-all select-all border border-stone-700">
              {`"I am traveling in Odisha with UtkalSarathi. Current location check: ${sharedLink}. Emergency contact: 112."`}
            </div>
            <div className="flex gap-2 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `I am currently traveling in Odisha. Check my location pin: ${sharedLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                Share via WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(sharedLink);
                  alert('Copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 font-medium text-xs"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Official Weather Advisory & IMD Alerts */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-850 border border-stone-800 p-5 sm:p-6 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              Official IMD & Disaster Management Weather Advisory
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/40">
            Updated Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200">Coastal Weather (Puri, Konark, Gopalpur)</span>
              <span className="text-emerald-400 font-semibold">Green (Normal)</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              Sea condition is moderate. Safe for beach walks at Chandrabhaga and Swargadwar.
              High tide expected at 14:40 hrs. Follow lifeguard flags; avoid swimming beyond 15 meters from shoreline.
            </p>
            <span className="text-[10px] text-stone-500 block">
              Source: IMD Bhubaneswar Weather Bulletin (0674-2596116)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200">Inland & Forest Zones (Similipal, Satkosia)</span>
              <span className="text-amber-400 font-semibold">Mild Thunderstorm Watch</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              Isolated afternoon showers expected in Mayurbhanj and Angul districts. Visitors with safari bookings
              advised to commence morning entries by 08:30 AM before trail mudding.
            </p>
            <span className="text-[10px] text-stone-500 block">
              Source: OSDMA Forest Weather Portal (1070)
            </span>
          </div>
        </div>
      </div>

      {/* Community Hazards & Incidents Reporting */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Live Travel Disruptions & Community Hazard Reports
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Verified police advisories and community-reported local road disruptions.
            </p>
          </div>

          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            {showReportForm ? 'Cancel Report' : 'Report Hazard / Disruption'}
          </button>
        </div>

        {submittedMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {submittedMessage}
          </div>
        )}

        {/* Hazard Submission Form */}
        {showReportForm && (
          <form
            onSubmit={handleSubmitHazard}
            className="p-5 rounded-xl bg-stone-850 border border-amber-600/40 space-y-4 text-xs animate-fade-in"
          >
            <h3 className="font-bold text-white text-sm">
              Submit Local Travel Incident / Hazard Report
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Incident Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                >
                  <option value="Heavy Rush / Long Queue">Heavy Rush / Long Queue</option>
                  <option value="Road Diversion">Road Diversion / Repair</option>
                  <option value="Waterlogging">Waterlogging / High Tide</option>
                  <option value="Weather Advisory">Severe Weather Alert</option>
                  <option value="Wildlife Warning">Wildlife Movement Near Track</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">District</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                >
                  <option value="Puri">Puri</option>
                  <option value="Khurda / Bhubaneswar">Khurda / Bhubaneswar</option>
                  <option value="Cuttack">Cuttack</option>
                  <option value="Ganjam">Ganjam</option>
                  <option value="Mayurbhanj">Mayurbhanj</option>
                  <option value="Angul">Angul</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Specific Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chandrabhaga Marine Drive curve"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  required
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Description & Practical Alternative Route
              </label>
              <textarea
                rows={2}
                placeholder="Describe current road status, estimated delay, or alternate transport recommendation..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                required
                className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        )}

        {/* Hazard List */}
        <div className="space-y-3">
          {hazards.map((hz) => (
            <div
              key={hz.id}
              className="p-4 rounded-xl bg-stone-850 border border-stone-800 flex flex-col sm:flex-row items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hz.type === 'Road Diversion'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : hz.type === 'Heavy Rush / Long Queue'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {hz.type}
                  </span>
                  <span className="font-bold text-stone-200">{hz.location}</span>
                  <span className="text-stone-500">({hz.district})</span>
                </div>
                <p className="text-stone-300 leading-relaxed pt-1">{hz.description}</p>
                <div className="text-[11px] text-stone-500 pt-1 flex items-center gap-3">
                  <span>Reported by: {hz.submittedBy}</span>
                  <span>• {hz.timestamp}</span>
                  {hz.status === 'verified' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Under Review</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleUpvote(hz.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-semibold transition-colors flex-shrink-0"
                aria-label={`Confirm hazard at ${hz.location}`}
              >
                <ThumbsUp className="w-3 h-3 text-amber-400" />
                <span>Confirm ({hz.upvotes})</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Medical & Police Facilities */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Verified Major Trauma & Police Stations
            </h2>
          </div>
          <span className="text-xs text-stone-400">Golden Triangle & Core Corridors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {VERIFIED_EMERGENCY_FACILITIES.map((facility) => (
            <div
              key={facility.id}
              className="p-4 rounded-xl bg-stone-850 border border-stone-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {facility.type}
                  </span>
                  <span className="text-[11px] text-stone-400">{facility.district}</span>
                </div>
                <h3 className="text-sm font-bold text-stone-100 mt-1">{facility.name}</h3>
                <p className="text-xs text-stone-400 mt-1">{facility.address}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300">{facility.contact}</span>
                <a
                  href={`tel:${facility.contact.split('/')[0].replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  Call Facility
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
