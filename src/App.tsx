import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { TransitMatrix } from './components/TransitMatrix';
import { UtkalSuraksha } from './components/UtkalSuraksha';
import { AudioStories } from './components/AudioStories';
import { CuisineAndCrafts } from './components/CuisineAndCrafts';
import { VisionAndRoadmap } from './components/VisionAndRoadmap';
import { OdishaGeoMap } from './components/OdishaGeoMap';
import { AiAssistantModal } from './components/AiAssistantModal';
import { OfflineModal } from './components/OfflineModal';
import { SupportedLanguage } from './types';
import {
  Compass,
  Bus,
  ShieldAlert,
  Volume2,
  UtensilsCrossed,
  Bot,
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('itinerary');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isOfflineOpen, setIsOfflineOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);
  const [savedTripNotes, setSavedTripNotes] = useState<string>(() => {
    return (
      localStorage.getItem('utkalsarathi_saved_trip') ||
      '3-Day Golden Triangle & Heritage Crafts Tour (Bhubaneswar - Konark - Puri - Raghurajpur)'
    );
  });
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(() => {
    return !!localStorage.getItem('utkalsarathi_offline_pack');
  });
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>(undefined);

  const handleNavigateToAudio = (storyId?: string) => {
    if (storyId) setSelectedStoryId(storyId);
    setCurrentTab('audio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToOffline = (notes: string) => {
    setSavedTripNotes(notes);
    localStorage.setItem('utkalsarathi_saved_trip', notes);
    setIsOfflineReady(true);
  };

  const handleOpenAssistantWithPrompt = (prompt?: string) => {
    setAssistantInitialPrompt(prompt);
    setIsAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'assistant') {
            setIsAssistantOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        language={language}
        setLanguage={setLanguage}
        onOpenSos={() => {
          setCurrentTab('safety');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOffline={() => setIsOfflineOpen(true)}
        isOfflineReady={isOfflineReady}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'itinerary' && (
          <ItineraryPlanner
            onSaveToOffline={handleSaveToOffline}
            onOpenAssistant={handleOpenAssistantWithPrompt}
            onNavigateToAudio={handleNavigateToAudio}
          />
        )}

        {currentTab === 'map' && (
          <OdishaGeoMap
            onOpenAssistant={handleOpenAssistantWithPrompt}
            onSelectDestination={(dest) => {
              setCurrentTab('itinerary');
              handleOpenAssistantWithPrompt(`Tell me about visiting ${dest.name} in ${dest.district}.`);
            }}
          />
        )}

        {currentTab === 'transit' && <TransitMatrix />}

        {currentTab === 'safety' && <UtkalSuraksha />}

        {currentTab === 'audio' && (
          <AudioStories
            onOpenAssistant={handleOpenAssistantWithPrompt}
            initialStoryId={selectedStoryId}
          />
        )}

        {currentTab === 'cuisine' && <CuisineAndCrafts />}

        {currentTab === 'roadmap' && <VisionAndRoadmap />}
      </main>

      {/* Floating Action Button for Utkal Mitra Assistant */}
      <button
        onClick={() => {
          setAssistantInitialPrompt(undefined);
          setIsAssistantOpen(true);
        }}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-950/60 hover:scale-105 transition-all"
        aria-label="Open Utkal Mitra AI Travel Assistant"
      >
        <Bot className="w-5 h-5 animate-bounce" />
        <span className="hidden sm:inline">Ask Utkal Mitra AI</span>
      </button>

      {/* Modals */}
      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        language={language}
        setLanguage={setLanguage}
        initialPrompt={assistantInitialPrompt}
        onSelectDistrictForTrip={(districtName) => {
          setCurrentTab('itinerary');
          handleOpenAssistantWithPrompt(`Create a customized travel itinerary for exploring ${districtName} district in Odisha.`);
        }}
      />

      <OfflineModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        savedTripNotes={savedTripNotes}
        onPackUpdated={() => setIsOfflineReady(true)}
      />

      {/* Comprehensive Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 text-xs py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-100 text-base">
                  Utkal<span className="text-amber-400">Sarathi</span>
                </span>
                <span className="text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-[10px]">
                  OSFIC Tourism & Culture
                </span>
              </div>
              <p className="text-stone-400 text-xs max-w-md leading-relaxed">
                An AI-powered, multilingual smart tourism, cultural discovery, and traveller safety
                platform for Odisha. Connecting travelers with verified Mo Bus transport, fair tariffs,
                sacred heritage stories, and authentic local artisans.
              </p>
            </div>

            <div>
              <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px] block mb-2">
                Primary Modules
              </span>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setCurrentTab('itinerary')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    AI Itinerary Planning
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('map')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Odisha Geo-Map & Routes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('transit')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Mo Bus & Regulated Transit
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('safety')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    UtkalSuraksha (Safety & SOS)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('audio')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Utkal Katha (Voice Stories)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('cuisine')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Odia Cuisine & Artisans
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px] block mb-2">
                Grounded Knowledge Sources
              </span>
              <ul className="space-y-1.5 text-stone-400 text-[11px]">
                <li>• Odisha Tourism Dev. Corp. (OTDC)</li>
                <li>• Capital Region Urban Transport (CRUT Mo Bus)</li>
                <li>• Archaeological Survey of India (ASI)</li>
                <li>• Shree Jagannath Temple Administration</li>
                <li>• Odisha State Disaster Mgmt. Authority (OSDMA)</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <div>
              © 2026 UtkalSarathi. Built for the OSFIC Tourism & Culture Challenge.
            </div>
            <div className="flex items-center gap-1">
              <span>Empowering inclusive, culturally responsible exploration across Odisha</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current ml-1" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
