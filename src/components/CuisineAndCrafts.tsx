import React, { useState } from 'react';
import { ODISHA_CUISINE, LOCAL_BUSINESSES } from '../data/mockData';
import { CuisineItem, LocalBusiness } from '../types';
import {
  UtensilsCrossed,
  Award,
  Phone,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const CuisineAndCrafts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [businesses, setBusinesses] = useState<LocalBusiness[]>(LOCAL_BUSINESSES);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Registration Form
  const [bizName, setBizName] = useState('');
  const [bizType, setBizType] = useState<LocalBusiness['type']>('Artisan Workshop');
  const [bizLocation, setBizLocation] = useState('');
  const [bizDistrict, setBizDistrict] = useState('Puri');
  const [bizPhone, setBizPhone] = useState('');
  const [bizPricing, setBizPricing] = useState('');
  const [bizSpecialty, setBizSpecialty] = useState('');

  const filteredCuisine = ODISHA_CUISINE.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'veg') return item.isVegetarian;
    if (selectedCategory === 'sweet') return item.category === 'Traditional Sweet';
    if (selectedCategory === 'gi') return item.giTagCertified;
    return true;
  });

  const handleRegisterBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizPhone) return;

    const newBiz: LocalBusiness = {
      id: `biz-${Date.now()}`,
      name: bizName,
      type: bizType,
      location: bizLocation,
      district: bizDistrict,
      phone: bizPhone,
      pricing: bizPricing || 'Direct artisan price',
      verifiedStatus: false,
      specialty: bizSpecialty,
    };

    setBusinesses([newBiz, ...businesses]);
    setShowRegisterModal(false);
    setRegisterSuccess(
      `Your enterprise "${bizName}" was submitted for verification by the UtkalSarathi team.`
    );
    setTimeout(() => setRegisterSuccess(null), 5000);

    // Reset
    setBizName('');
    setBizPhone('');
    setBizLocation('');
    setBizPricing('');
    setBizSpecialty('');
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-orange-950/70 to-stone-900 border border-orange-800/40 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold mb-3">
            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
            Accommodation, Regional Cuisine & Local Business Integration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Odisha Culinary Heritage & Fair-Trade Artisans
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Taste genuine Dalma, Nayagarh Chhena Poda, and GI-tagged Rasagola. Connect directly
            with Raghurajpur Pattachitra painters, Sambalpuri weavers, and certified eco-camps
            with transparent pricing and zero middleman exploitation.
          </p>
        </div>
      </div>

      {registerSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          {registerSuccess}
        </div>
      )}

      {/* Regional Cuisine Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-400" />
              Authentic Odia Culinary Guide
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Traditional recipes, certified origins, and fair price benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Delicacies' },
              { id: 'veg', label: 'Pure Veg' },
              { id: 'sweet', label: 'Traditional Sweets' },
              { id: 'gi', label: 'GI Tag Certified' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategory(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all ${
                  selectedCategory === f.id
                    ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCuisine.map((dish) => (
            <div
              key={dish.id}
              className="p-4 rounded-xl bg-stone-850 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        dish.isVegetarian ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      title={dish.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                    />
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      {dish.category}
                    </span>
                  </div>

                  {dish.giTagCertified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Award className="w-3 h-3 text-amber-400" />
                      GI Certified
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-1.5">{dish.name}</h3>
                <span className="text-xs text-orange-300/80 font-medium">{dish.odiaName}</span>

                <p className="text-xs text-stone-300 mt-2 leading-relaxed">{dish.description}</p>

                {/* Key Ingredients */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dish.keyIngredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] border border-stone-700/80"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-1.5">
                <div className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Where to Taste: </span>
                  {dish.mustTryLocations.join(', ')}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-stone-400">Fair Price:</span>
                  <span className="font-extrabold text-amber-400">{dish.estimatedPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artisans, Handloom & Local Businesses */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              Verified Local Artisans, Weavers & Eco-Cottages
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Support direct rural artisans and homestays without middleman commissions.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            List Your Tourism Business / Homestay
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="p-4 rounded-xl bg-stone-850 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {biz.type}
                  </span>
                  {biz.verifiedStatus ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified Partner
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-400">
                      Community Listed
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-1.5">{biz.name}</h3>
                <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  <span>
                    {biz.location}, {biz.district}
                  </span>
                </div>

                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  <span className="font-semibold text-amber-300/90">Specialty: </span>
                  {biz.specialty}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block">Transparent Pricing:</span>
                  <span className="text-xs font-bold text-stone-200">{biz.pricing}</span>
                </div>

                <a
                  href={`tel:${biz.phone.replace(/[^0-9]/g, '')}`}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Contact Directly
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Listing Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-6 text-stone-100 shadow-2xl relative">
            <div className="flex items-start justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Register Your Tourism Enterprise
                </h3>
                <p className="text-xs text-stone-400">
                  Connect with visitors seeking genuine Odia experiences.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterBusiness} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Business / Homestay / Workshop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maa Mangala Pattachitra Studio"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Type</label>
                  <select
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value as any)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                  >
                    <option value="Artisan Workshop">Artisan Workshop</option>
                    <option value="Homestay / Panthanivas">Homestay / Panthanivas</option>
                    <option value="Eco-Tourism Camp">Eco-Tourism Camp</option>
                    <option value="Authentic Kitchen">Authentic Kitchen</option>
                    <option value="Certified Tour Guide">Certified Tour Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">District</label>
                  <select
                    value={bizDistrict}
                    onChange={(e) => setBizDistrict(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                  >
                    <option value="Puri">Puri</option>
                    <option value="Khurda / Bhubaneswar">Khurda / Bhubaneswar</option>
                    <option value="Cuttack">Cuttack</option>
                    <option value="Sambalpur">Sambalpur</option>
                    <option value="Mayurbhanj">Mayurbhanj</option>
                    <option value="Ganjam">Ganjam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 00000"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Pricing Guide</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹500 - ₹3,000"
                    value={bizPricing}
                    onChange={(e) => setBizPricing(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Specific Address</label>
                <input
                  type="text"
                  placeholder="Village name, street or landmark"
                  value={bizLocation}
                  onChange={(e) => setBizLocation(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Specialty Description</label>
                <textarea
                  rows={2}
                  placeholder="What unique art, food, or hospitality service do you provide?"
                  value={bizSpecialty}
                  onChange={(e) => setBizSpecialty(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-stone-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
