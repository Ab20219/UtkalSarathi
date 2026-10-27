export type SupportedLanguage = 'en' | 'or' | 'hi';

export type ReliabilitySourceLevel =
  | 'verified_official'
  | 'provider_confirmed'
  | 'community_reported'
  | 'estimated';

export interface RouteFareItem {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  estDuration: string;
  modes: {
    mode: 'Mo Bus' | 'OSRTC Bus' | 'Auto-Rickshaw' | 'Prepaid Taxi' | 'Train' | 'Boat';
    details: string;
    fare: string;
    numericMinFare: number;
    verificationStatus: 'verified_govt' | 'provider_confirmed' | 'estimated';
    lastUpdated: string;
    frequencyOrTimings?: string;
  }[];
  lastMileNote: string;
  coverageLimitationNotice?: string;
}

export interface HazardReport {
  id: string;
  location: string;
  district: string;
  type: 'Road Diversion' | 'Heavy Rush / Long Queue' | 'Waterlogging' | 'Weather Advisory' | 'Wildlife Warning';
  description: string;
  submittedBy: string;
  timestamp: string;
  status: 'verified' | 'under_review';
  upvotes: number;
  officialSource?: string;
}

export interface AudioGuideStory {
  id: string;
  title: string;
  odiaTitle: string;
  hindiTitle: string;
  durationMinutes: number;
  monument: string;
  location: string;
  district?: string;
  region?: string;
  period: string;
  narrator: string;
  audioUrl?: string;
  audioTranscriptEn: string;
  audioTranscriptOr: string;
  audioTranscriptHi: string;
  documentedHistory: string;
  legendAndFolklore: string;
  architecturalHighlights: string[];
  historicalSources?: string[];
  keyHistoricalFigures?: string[];
  inscriptionsAndManuscripts?: string;
  qrCodeBadgeText?: string;
  totalWords?: number;
  chapters?: {
    title: string;
    odiaTitle?: string;
    durationSec: number;
    text: string;
  }[];
}

export interface CulturalEvent {
  id: string;
  name: string;
  odiaName: string;
  period: string;
  dates: string;
  location: string;
  significance: string;
  travelerAdvice: string;
  source: string;
}

export interface CuisineItem {
  id: string;
  name: string;
  odiaName: string;
  category: 'Main Meal' | 'Traditional Sweet' | 'Pitha' | 'Seafood Delicacy';
  isVegetarian: boolean;
  giTagCertified?: boolean;
  originDistrict: string;
  description: string;
  keyIngredients: string[];
  mustTryLocations: string[];
  estimatedPrice: string;
}

export interface LocalBusiness {
  id: string;
  name: string;
  type: 'Hotel / Resort' | 'Homestay / Panthanivas' | 'Eco-Tourism Camp' | 'Artisan Workshop' | 'Authentic Kitchen' | 'Certified Tour Guide';
  location: string;
  district: string;
  phone: string;
  pricing: string;
  verifiedStatus: boolean;
  specialty: string;
  isCommercialPartner?: boolean;
}

export interface RoadmapPhaseItem {
  phase: string;
  title: string;
  scope: string;
  deliverables: string[];
  gateCriteria: string;
  status: 'Active Prototype' | 'Ready for Integration' | 'Future Scaling';
}
