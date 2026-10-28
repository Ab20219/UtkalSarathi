import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CULTURAL_EVENTS } from '../data/mockData';
import { ODISHA_HISTORICAL_STORIES } from '../data/odishaHistoricalStories';
import { ODISHA_CHRONICLES_VOLUME_TWO } from '../data/odishaHistoricalChroniclesVolume';
import { AudioGuideStory } from '../types';
import { getMonumentVoiceProfile, MonumentVoiceProfile } from '../data/monumentVoiceProfiles';
import { UtkalKathaVoiceAssistant } from './UtkalKathaVoiceAssistant';

const AUDIO_GUIDE_STORIES: AudioGuideStory[] = [
  ...ODISHA_HISTORICAL_STORIES,
  ...ODISHA_CHRONICLES_VOLUME_TWO,
];
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Calendar,
  Languages,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  FastForward,
  Rewind,
  QrCode,
  Download,
  Copy,
  Search,
  Sliders,
  Radio,
  FileText,
  UserCheck,
  GraduationCap,
  Bot,
  Filter,
  Music,
  Headphones,
  Globe,
  Scroll,
  Layers,
  Sparkle,
  Award,
} from 'lucide-react';

interface AudioStoriesProps {
  onOpenAssistant?: (prompt: string) => void;
  initialStoryId?: string;
}

type VoicePersona = 'royal' | 'temple' | 'historian';

/**
 * Splits long historical narratives into sentence-sized segments (~150-220 chars)
 * to prevent browser SpeechSynthesisUtterance buffer overruns and dropouts.
 */
function splitStoryIntoSegments(text: string): string[] {
  if (!text) return [];
  const rawSentences = text
    .replace(/([.!?।\n])\s+/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = '';

  for (const s of rawSentences) {
    if (!buffer) {
      buffer = s;
    } else if (buffer.length + s.length + 1 <= 200) {
      buffer += ' ' + s;
    } else {
      chunks.push(buffer);
      buffer = s;
    }
  }
  if (buffer) {
    chunks.push(buffer);
  }

  return chunks.length > 0 ? chunks : [text.slice(0, 200)];
}

export const AudioStories: React.FC<AudioStoriesProps> = ({ onOpenAssistant, initialStoryId }) => {
  const initialStory = useMemo(() => {
    if (initialStoryId) {
      const match = AUDIO_GUIDE_STORIES.find((s) => s.id === initialStoryId);
      if (match) return match;
    }
    return AUDIO_GUIDE_STORIES[0];
  }, [initialStoryId]);

  const [selectedStory, setSelectedStory] = useState<AudioGuideStory>(initialStory);
  const [selectedLang, setSelectedLang] = useState<'en' | 'or' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'chapters' | 'history' | 'legend' | 'architecture' | 'sources'>('chapters');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState<string>('All');

  // Playback & Timing state machine
  const [playbackState, setPlaybackState] = useState<
    'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error' | 'completed' | 'cancelled'
  >('idle');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isStoryOver, setIsStoryOver] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1.0);
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('royal');
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [activeAudioSourceType, setActiveAudioSourceType] = useState<'ai_hd' | 'browser_tts'>('ai_hd');
  const [voiceStatusNotice, setVoiceStatusNotice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Monument-specific voice identity
  const activeVoiceProfile: MonumentVoiceProfile = useMemo(() => {
    return getMonumentVoiceProfile(selectedStory.id);
  }, [selectedStory.id]);

  // Ambient sound / Web Audio state
  const [isAmbienceEnabled, setIsAmbienceEnabled] = useState<boolean>(true);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.22);

  const timerRef = useRef<any>(null);
  const keepAliveTimerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOscillatorsRef = useRef<OscillatorNode[]>([]);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const textOffsetCharRef = useRef<number>(0);
  const activeSegmentsRef = useRef<string[]>([]);
  const currentSegmentIndexRef = useRef<number>(0);
  const isSpeechCancelledRef = useRef<boolean>(false);

  // Strict duration: Calibrated to 8 mins (480 seconds) per story
  const exactDurationMinutes = useMemo(() => {
    return Math.max(1, Math.round(selectedStory.durationMinutes || 8));
  }, [selectedStory.durationMinutes]);

  const totalDurationSec = useMemo(() => {
    return exactDurationMinutes * 60; // 480s for 8 mins
  }, [exactDurationMinutes]);

  // Scrubber percentage strictly bounded between 0% and 100% (snaps to 100% when story is over)
  const progressPercent = useMemo(() => {
    if (isStoryOver || playbackState === 'completed') return 100;
    if (totalDurationSec <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTimeSec / totalDurationSec) * 100));
  }, [currentTimeSec, totalDurationSec, isStoryOver, playbackState]);

  // Clean Web Audio Drone generator using monument-specific root chord
  const startAmbientSound = () => {
    if (!isAmbienceEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      stopAmbientSound();

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      ambientGainRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.connect(masterGain);

      // Authentic monument-specific tanpura root chord frequencies
      const freqs = activeVoiceProfile.droneRootFreqs;
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.28 / (idx + 1), ctx.currentTime);

        osc.connect(subGain);
        subGain.connect(filter);
        osc.start();
        oscs.push(osc);
      });

      ambientOscillatorsRef.current = oscs;
    } catch (e) {
      console.warn('Web Audio ambience failed:', e);
    }
  };

  const stopAmbientSound = () => {
    if (ambientOscillatorsRef.current.length > 0) {
      ambientOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      ambientOscillatorsRef.current = [];
    }
  };

  useEffect(() => {
    if (ambientGainRef.current && audioCtxRef.current) {
      ambientGainRef.current.gain.setValueAtTime(
        isAmbienceEnabled ? ambientVolume : 0,
        audioCtxRef.current.currentTime
      );
    }
  }, [ambientVolume, isAmbienceEnabled]);

  // Clean up all audio on unmount
  useEffect(() => {
    return () => {
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        htmlAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAmbientSound();
      clearInterval(timerRef.current);
      clearInterval(keepAliveTimerRef.current);
    };
  }, []);

  // Filtered stories catalog
  const filteredStories = useMemo(() => {
    return AUDIO_GUIDE_STORIES.filter((story) => {
      const matchesRegion =
        selectedRegion === 'All' ||
        story.region === selectedRegion ||
        (selectedRegion === 'Golden Triangle' &&
          (story.location.includes('Konark') ||
            story.location.includes('Puri') ||
            story.location.includes('Bhubaneswar')));

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesRegion;

      const matchesSearch =
        story.title.toLowerCase().includes(query) ||
        story.odiaTitle.toLowerCase().includes(query) ||
        story.hindiTitle.toLowerCase().includes(query) ||
        story.monument.toLowerCase().includes(query) ||
        story.location.toLowerCase().includes(query) ||
        (story.district && story.district.toLowerCase().includes(query)) ||
        (story.keyHistoricalFigures &&
          story.keyHistoricalFigures.some((f) => f.toLowerCase().includes(query))) ||
        story.documentedHistory.toLowerCase().includes(query);

      return matchesRegion && matchesSearch;
    });
  }, [searchQuery, selectedRegion]);

  const getTranscript = (story: AudioGuideStory, lang: 'en' | 'or' | 'hi') => {
    switch (lang) {
      case 'or':
        return story.audioTranscriptOr || story.audioTranscriptEn;
      case 'hi':
        return story.audioTranscriptHi || story.audioTranscriptEn;
      case 'en':
      default:
        return story.audioTranscriptEn;
    }
  };

  const currentTranscript = useMemo(() => {
    return getTranscript(selectedStory, selectedLang);
  }, [selectedStory, selectedLang]);

  // Persona configurations
  const personaSettings = useMemo(() => {
    switch (voicePersona) {
      case 'royal':
        return {
          label: 'Royal Kalinga Narrator',
          desc: 'Solemn, regal cadence honoring ancient naval armadas and imperial sovereignty.',
          basePitch: 0.92,
          rateMultiplier: 0.96,
        };
      case 'temple':
        return {
          label: 'Temple Chronicler',
          desc: 'Devotional, lyrical storytelling inspired by sacred palm-leaf archives.',
          basePitch: 1.06,
          rateMultiplier: 0.98,
        };
      case 'historian':
        return {
          label: 'Archaeological Historian',
          desc: 'Articulate epigraphist analyzing stone inscriptions, excavations, and strata.',
          basePitch: 1.0,
          rateMultiplier: 1.04,
        };
    }
  }, [voicePersona]);

  // Categorized Historical Sources for the multi-source tab
  const parsedSources = useMemo(() => {
    const rawSources = selectedStory.historicalSources || [
      'Archaeological Survey of India (ASI) Monument Records & Field Surveys',
      'Epigraphia Indica, Geological Survey of India, and Odisha State Museum Archives',
      'Madala Panji Palm-Leaf Manuscripts, Puri Jagannath Temple Archives',
    ];

    return rawSources.map((src, index) => {
      let category = 'Academic & ASI Records';
      let icon = '🏛️';
      let tagColor = 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40';

      const lower = src.toLowerCase();
      if (lower.includes('inscription') || lower.includes('plate') || lower.includes('edicts') || lower.includes('epigraphia')) {
        category = 'Inscriptions & Epigraphy';
        icon = '📜';
        tagColor = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      } else if (lower.includes('panji') || lower.includes('purana') || lower.includes('manuscript') || lower.includes('chakada')) {
        category = 'Palm-Leaf Chronicles';
        icon = '🪔';
        tagColor = 'bg-orange-950/40 text-orange-300 border-orange-800/40';
      } else if (lower.includes('xuanzang') || lower.includes('ptolemy') || lower.includes('ain-i-akbari') || lower.includes('taranatha') || lower.includes('tabaqat')) {
        category = 'Classical Foreign Travelers';
        icon = '🌍';
        tagColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      } else if (lower.includes('asi') || lower.includes('excavation') || lower.includes('survey') || lower.includes('nio')) {
        category = 'Excavations & Field Surveys';
        icon = '🔬';
        tagColor = 'bg-purple-950/40 text-purple-300 border-purple-800/40';
      }

      return {
        id: index + 1,
        source: src,
        category,
        icon,
        tagColor,
      };
    });
  }, [selectedStory.historicalSources]);

  const filteredSources = useMemo(() => {
    if (sourceCategoryFilter === 'All') return parsedSources;
    return parsedSources.filter((s) => s.category === sourceCategoryFilter);
  }, [parsedSources, sourceCategoryFilter]);

  // Stop all active audio engines cleanly
  const stopAllAudio = useCallback(() => {
    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.pause();
        htmlAudioRef.current.currentTime = 0;
      } catch {}
      htmlAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    stopAmbientSound();
    clearInterval(timerRef.current);
    clearInterval(keepAliveTimerRef.current);
    setIsAiLoading(false);
    setPlaybackState('cancelled');
  }, []);

  // Natural audio progress ticker (strictly synchronizes with actual narration, without premature timer cutoffs)
  const startStoryTicker = useCallback((expectedTotalSec?: number) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTimeSec((prev) => {
        const ceiling = expectedTotalSec || totalDurationSec;
        if (prev < ceiling) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);
  }, [totalDurationSec]);

  // Segmented Client-Side Web Speech API Player with Monument Voice Profiles
  const fallbackBrowserSpeech = useCallback((
    storyToPlay: AudioGuideStory,
    langToUse: 'en' | 'or' | 'hi',
    totalSec: number,
    startSegmentIndex: number = 0
  ) => {
    setActiveAudioSourceType('browser_tts');
    const fullText = getTranscript(storyToPlay, langToUse);
    const monumentVoice = getMonumentVoiceProfile(storyToPlay.id);
    const segments = splitStoryIntoSegments(fullText);
    activeSegmentsRef.current = segments;
    currentSegmentIndexRef.current = startSegmentIndex;
    isSpeechCancelledRef.current = false;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceStatusNotice('Playing sacred acoustic soundscape with synced historical text.');
      setPlaybackState('playing');
      setIsPlaying(true);
      setIsPaused(false);
      setIsStoryOver(false);
      startStoryTicker(totalSec);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    let matchedVoice: SpeechSynthesisVoice | null = null;

    if (langToUse === 'or') {
      matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('or') ||
          v.name.toLowerCase().includes('odia') ||
          v.name.toLowerCase().includes('oriya') ||
          v.lang === 'hi-IN' ||
          v.lang === 'en-IN'
      ) || null;
    } else if (langToUse === 'hi') {
      matchedVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN')) || null;
    } else {
      matchedVoice = voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en')) || null;
    }

    const playNextSegment = (idx: number) => {
      if (isSpeechCancelledRef.current) return;

      if (idx >= segments.length) {
        setPlaybackState('completed');
        setIsPlaying(false);
        setIsPaused(false);
        setIsStoryOver(true);
        setCurrentTimeSec(totalSec);
        stopAmbientSound();
        clearInterval(timerRef.current);
        setVoiceStatusNotice(
          `Story Over — Narration completed in ${monumentVoice.narratorName[langToUse] || monumentVoice.narratorName.en}'s voice.`
        );
        return;
      }

      currentSegmentIndexRef.current = idx;
      const progressRatio = idx / Math.max(1, segments.length);
      setCurrentTimeSec(Math.min(totalSec, Math.round(progressRatio * totalSec)));

      try {
        window.speechSynthesis.cancel();
        const textChunk = segments[idx];
        const utterance = new SpeechSynthesisUtterance(textChunk);
        (window as any)._activeUtterance = utterance;

        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          utterance.lang = langToUse === 'or' ? 'hi-IN' : langToUse === 'hi' ? 'hi-IN' : 'en-IN';
        }

        utterance.rate = playbackSpeed * personaSettings.rateMultiplier * monumentVoice.rateMultiplier;
        utterance.pitch = pitch * personaSettings.basePitch * monumentVoice.basePitch;

        utterance.onend = () => {
          if (!isSpeechCancelledRef.current) {
            playNextSegment(idx + 1);
          }
        };

        utterance.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') return;
          console.warn('Speech segment notification, advancing to next part:', e.error);
          if (!isSpeechCancelledRef.current) {
            playNextSegment(idx + 1);
          }
        };

        window.speechSynthesis.speak(utterance);
        setPlaybackState('playing');
        setVoiceStatusNotice(
          `Narrating part ${idx + 1}/${segments.length} via ${monumentVoice.narratorName[langToUse] || monumentVoice.narratorName.en} (${monumentVoice.voicePersonaTitle[langToUse] || monumentVoice.voicePersonaTitle.en})`
        );
      } catch (err) {
        console.warn('Speech synthesis chunk error:', err);
        playNextSegment(idx + 1);
      }
    };

    setPlaybackState('playing');
    setIsPlaying(true);
    setIsPaused(false);
    setIsStoryOver(false);
    startStoryTicker(totalSec);
    playNextSegment(startSegmentIndex);
  }, [personaSettings, pitch, playbackSpeed, startStoryTicker]);

  // Execute full audio playback for a given story and language
  const executeAudioPlayback = useCallback(async (
    storyToPlay: AudioGuideStory,
    langToUse: 'en' | 'or' | 'hi' = selectedLang,
    startSegmentIndex: number = 0
  ) => {
    // 1. Prime Web Audio context synchronously during user click gesture
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch {}

    // 2. Stop ongoing audio cleanly
    stopAllAudio();

    // 3. Update story and language selection
    setSelectedStory(storyToPlay);
    setSelectedLang(langToUse);
    setIsStoryOver(false);
    setPlaybackState('loading');

    const durationMinutes = Math.max(1, Math.round(storyToPlay.durationMinutes || 8));
    const totalSec = durationMinutes * 60;
    const monumentVoice = getMonumentVoiceProfile(storyToPlay.id);

    // 4. Start ambient soundscape immediately with monument-specific tanpura frequencies
    startAmbientSound();
    setIsPlaying(true);
    setIsPaused(false);
    startStoryTicker(totalSec);

    // 5. Try high-definition studio narration via server Gemini TTS if available
    setIsAiLoading(true);
    setVoiceStatusNotice(
      `Initializing ${monumentVoice.narratorName[langToUse] || monumentVoice.narratorName.en} (${storyToPlay.monument})...`
    );

    let studioAudioSuccess = false;
    try {
      const fullText = getTranscript(storyToPlay, langToUse);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText.slice(0, 500),
          lang: langToUse,
          persona: monumentVoice.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          const audio = new Audio(audioUrl);
          audio.playbackRate = playbackSpeed;
          htmlAudioRef.current = audio;

          // Track real audio playback position
          audio.ontimeupdate = () => {
            if (audio.currentTime > 0) {
              const cur = Math.round(audio.currentTime);
              setCurrentTimeSec(cur);
            }
          };

          audio.onwaiting = () => {
            setPlaybackState('buffering');
          };

          audio.onplaying = () => {
            setPlaybackState('playing');
          };

          // The story finishes STRICTLY when the actual audio segment gets over
          audio.onended = () => {
            setPlaybackState('completed');
            setIsPlaying(false);
            setIsPaused(false);
            setIsStoryOver(true);
            const actualEndSec = audio.duration && !isNaN(audio.duration) ? Math.round(audio.duration) : totalSec;
            setCurrentTimeSec(actualEndSec);
            stopAmbientSound();
            clearInterval(timerRef.current);
            setVoiceStatusNotice(`Story Over — Completed narration of ${storyToPlay.monument}.`);
          };

          audio.onerror = () => {
            setPlaybackState('buffering');
            fallbackBrowserSpeech(storyToPlay, langToUse, totalSec, startSegmentIndex);
          };

          try {
            await audio.play();
            studioAudioSuccess = true;
            setActiveAudioSourceType('ai_hd');
            setPlaybackState('playing');
            setIsPlaying(true);
            setIsPaused(false);
            setIsAiLoading(false);
            setVoiceStatusNotice(
              `Streaming Studio HD Voice: ${monumentVoice.narratorName[langToUse] || monumentVoice.narratorName.en} with Sacred Tanpura`
            );
            return;
          } catch {
            // Audio play restricted
          }
        }
      }
    } catch {
      // Proceed to fallback
    }

    setIsAiLoading(false);
    if (!studioAudioSuccess) {
      fallbackBrowserSpeech(storyToPlay, langToUse, totalSec, startSegmentIndex);
    }
  }, [selectedLang, stopAllAudio, playbackSpeed, fallbackBrowserSpeech, startStoryTicker]);

  // Main user action: Selecting a place and running its story
  const handleSelectAndPlayStory = useCallback((
    story: AudioGuideStory,
    lang?: 'en' | 'or' | 'hi'
  ) => {
    // If clicking the story that is already selected
    if (selectedStory.id === story.id) {
      if (isPlaying) {
        // Pause
        isSpeechCancelledRef.current = true;
        if (htmlAudioRef.current) htmlAudioRef.current.pause();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        stopAmbientSound();
        setPlaybackState('paused');
        setIsPlaying(false);
        setIsPaused(true);
        clearInterval(timerRef.current);
        setVoiceStatusNotice(`Paused narration of ${story.monument}.`);
        return;
      } else if (isPaused) {
        // Resume
        if (htmlAudioRef.current) {
          htmlAudioRef.current.play().catch(() => {});
          startAmbientSound();
          setPlaybackState('playing');
          setIsPlaying(true);
          setIsPaused(false);
          startStoryTicker();
          setVoiceStatusNotice(`Resumed narration of ${story.monument}.`);
          return;
        } else {
          isSpeechCancelledRef.current = false;
          startAmbientSound();
          fallbackBrowserSpeech(story, lang || selectedLang, totalDurationSec, currentSegmentIndexRef.current);
          setVoiceStatusNotice(`Resumed narration of ${story.monument}.`);
          return;
        }
      }
    }

    // New story selection: run immediately from the beginning
    setCurrentTimeSec(0);
    textOffsetCharRef.current = 0;
    currentSegmentIndexRef.current = 0;
    isSpeechCancelledRef.current = false;
    setIsStoryOver(false);
    setPlaybackState('loading');
    executeAudioPlayback(story, lang || selectedLang, 0);
  }, [selectedStory.id, isPlaying, isPaused, selectedLang, executeAudioPlayback, fallbackBrowserSpeech, startStoryTicker, totalDurationSec]);

  const togglePlayback = () => {
    handleSelectAndPlayStory(selectedStory);
  };

  const handleReset = () => {
    setCurrentTimeSec(0);
    textOffsetCharRef.current = 0;
    currentSegmentIndexRef.current = 0;
    isSpeechCancelledRef.current = false;
    setIsStoryOver(false);
    executeAudioPlayback(selectedStory, selectedLang, 0);
  };

  // Replay from start
  const handleReplay = () => {
    setCurrentTimeSec(0);
    textOffsetCharRef.current = 0;
    currentSegmentIndexRef.current = 0;
    isSpeechCancelledRef.current = false;
    setIsStoryOver(false);
    executeAudioPlayback(selectedStory, selectedLang, 0);
  };

  // Play next monument in catalog
  const handlePlayNextMonument = () => {
    const currentIndex = AUDIO_GUIDE_STORIES.findIndex((s) => s.id === selectedStory.id);
    const nextIndex = (currentIndex + 1) % AUDIO_GUIDE_STORIES.length;
    const nextStory = AUDIO_GUIDE_STORIES[nextIndex];
    handleSelectAndPlayStory(nextStory);
  };

  // Currently playing / active chapter index based on elapsed seconds
  const currentChapterIdx = useMemo(() => {
    if (!selectedStory.chapters || selectedStory.chapters.length === 0) return 0;
    const idx = Math.min(
      selectedStory.chapters.length - 1,
      Math.floor((currentTimeSec / Math.max(1, totalDurationSec)) * selectedStory.chapters.length)
    );
    return Math.max(0, idx);
  }, [currentTimeSec, totalDurationSec, selectedStory.chapters]);

  // Main action: Selecting a specific story part / chapter and running it immediately
  const handlePlayStoryPart = useCallback((chapterIdx: number) => {
    if (!selectedStory.chapters || !selectedStory.chapters[chapterIdx]) return;
    const chapter = selectedStory.chapters[chapterIdx];
    const totalChapters = selectedStory.chapters.length || 4;
    const partSec = totalDurationSec / totalChapters;
    const chapterStartTime = Math.round(chapterIdx * partSec);
    setCurrentTimeSec(chapterStartTime);
    setIsStoryOver(false);

    const fullTranscript = getTranscript(selectedStory, selectedLang);
    const targetChar = Math.round((chapterIdx / totalChapters) * fullTranscript.length);
    textOffsetCharRef.current = targetChar;

    const segmentsCount = activeSegmentsRef.current.length || 1;
    const targetSeg = Math.min(segmentsCount - 1, Math.floor((chapterIdx / totalChapters) * segmentsCount));
    currentSegmentIndexRef.current = targetSeg;

    setVoiceStatusNotice(`Playing Part ${chapterIdx + 1}: ${chapter.title}`);
    executeAudioPlayback(selectedStory, selectedLang, targetSeg);
  }, [selectedStory, selectedLang, totalDurationSec, executeAudioPlayback]);

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(totalDurationSec, currentTimeSec + seconds));
    const ratio = newTime / totalDurationSec;
    const targetChar = Math.round(ratio * currentTranscript.length);

    setCurrentTimeSec(newTime);
    textOffsetCharRef.current = targetChar;

    const segmentsCount = activeSegmentsRef.current.length || 1;
    const targetSeg = Math.min(segmentsCount - 1, Math.floor(ratio * segmentsCount));
    currentSegmentIndexRef.current = targetSeg;

    if (isPlaying) {
      executeAudioPlayback(selectedStory, selectedLang, targetSeg);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(ratio * totalDurationSec);
    const targetChar = Math.round(ratio * currentTranscript.length);

    setCurrentTimeSec(newTime);
    textOffsetCharRef.current = targetChar;

    const segmentsCount = activeSegmentsRef.current.length || 1;
    const targetSeg = Math.min(segmentsCount - 1, Math.floor(ratio * segmentsCount));
    currentSegmentIndexRef.current = targetSeg;

    if (isPlaying) {
      executeAudioPlayback(selectedStory, selectedLang, targetSeg);
    }
  };

  const handleSpeedChange = (spd: number) => {
    setPlaybackSpeed(spd);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.playbackRate = spd;
    }
    if (isPlaying) {
      executeAudioPlayback(selectedStory, selectedLang, textOffsetCharRef.current);
    }
  };

  const handlePitchChange = (p: number) => {
    setPitch(p);
    if (isPlaying) {
      executeAudioPlayback(selectedStory, selectedLang, textOffsetCharRef.current);
    }
  };

  const handlePersonaChange = (persona: VoicePersona) => {
    setVoicePersona(persona);
    if (isPlaying) {
      executeAudioPlayback(selectedStory, selectedLang, textOffsetCharRef.current);
    }
  };

  // Quick sound & voice engine test
  const handleTestAudio = () => {
    startAmbientSound();
    setVoiceStatusNotice('Playing test acoustic bell & Indian temple ambience...');
    setTimeout(() => {
      setVoiceStatusNotice('');
    }, 4500);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(currentTranscript).then(() => {
      setCopyToast(`Transcript copied (${selectedLang.toUpperCase()})`);
      setTimeout(() => setCopyToast(null), 3000);
    });
  };

  const handleDownloadGuide = () => {
    const content = `UTKALSARATHI AUDIO GUIDE & HISTORICAL ARCHIVE
=====================================================
Monument: ${selectedStory.monument}
Title: ${selectedStory.title}
Odia Title: ${selectedStory.odiaTitle}
Hindi Title: ${selectedStory.hindiTitle}
District: ${selectedStory.district || selectedStory.location}
Duration: ${exactDurationMinutes} Minutes Only (${totalDurationSec} Seconds)
Period / Era: ${selectedStory.period}
QR Access ID: SCAN-${selectedStory.id.toUpperCase()}

=====================================================
1. PRIMARY HISTORICAL EPIGRAPHY & PEER-REVIEWED RECORDS
=====================================================
Inscriptions & Manuscripts:
${selectedStory.inscriptionsAndManuscripts || 'Archival epigraphs documented by ASI.'}

Key Historical Figures:
${selectedStory.keyHistoricalFigures?.join(', ') || 'Monarchs, Guild Architects, Sages'}

Documented History:
${selectedStory.documentedHistory}

=====================================================
2. SACRED LEGENDS & LIVING FOLKLORE
=====================================================
${selectedStory.legendAndFolklore}

=====================================================
3. ARCHITECTURAL & ENGINEERING HIGHLIGHTS
=====================================================
${selectedStory.architecturalHighlights.map((feat) => `* ${feat}`).join('\n')}

=====================================================
4. MULTI-SOURCE ACADEMIC BIBLIOGRAPHY
=====================================================
${selectedStory.historicalSources?.map((src) => `[Source] ${src}`).join('\n') || 'ASI Annual Reports & State Archives.'}

=====================================================
5. AUDIO TRANSCRIPT (${selectedLang.toUpperCase()})
=====================================================
${currentTranscript}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UtkalSarathi_${selectedStory.id}_10Min_Guide.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Historical archive for "${selectedStory.title}" downloaded.`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  const regions = [
    'All',
    'Golden Triangle',
    'Coastal & Maritime',
    'Diamond Triangle',
    'Northern Highlands',
    'Western Odisha',
    'Southern Ghats',
    'Central Valley',
  ];

  // Format current and total time display: strictly "0:00" up to "10:00"
  const formattedCurrentTime = useMemo(() => {
    const mins = Math.floor(currentTimeSec / 60);
    const secs = currentTimeSec % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [currentTimeSec]);

  const formattedTotalTime = useMemo(() => {
    return `${exactDurationMinutes}:00`; // Strictly 10:00
  }, [exactDurationMinutes]);

  const sourceCategories = [
    'All',
    'Inscriptions & Epigraphy',
    'Palm-Leaf Chronicles',
    'Classical Foreign Travelers',
    'Excavations & Field Surveys',
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/90 to-stone-900 border border-amber-800/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Utkal Katha: 10-Min Historical Audio Guides & Multi-Source Epigraphy
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Historical Chronicles & Voice Storytelling
          </h1>
          <p className="mt-2 text-stone-300 text-sm sm:text-base leading-relaxed">
            Experience Odisha&apos;s timeless heritage with synchronized audio storytelling in <strong>English</strong>,
            <strong>Odia (ଓଡ଼ିଆ)</strong>, and <strong>Hindi (हिन्दी)</strong>. Each curated story is calibrated
            to <strong>10 minutes</strong> with authentic citations from rock inscriptions, palm-leaf chronicles,
            Greco-Roman accounts, and ASI excavations.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {AUDIO_GUIDE_STORIES.length} Curated Chronicles (120,000+ Words)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-amber-400" /> Multi-Source Primary Citations
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Dual-Engine HD Audio + Drone
            </span>
          </div>
        </div>
      </div>

      {/* Quick Place Selector & Filter Bar */}
      <div className="space-y-3">
        {/* Quick Place / Monument Selector Dropdown */}
        <div className="bg-stone-900 border border-amber-600/40 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="quick-place-select" className="block text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                Select Place &amp; Run Utkal Katha (10-Min Audio Guide):
              </label>
              <select
                id="quick-place-select"
                value={selectedStory.id}
                onChange={(e) => {
                  const found = AUDIO_GUIDE_STORIES.find((s) => s.id === e.target.value);
                  if (found) handleSelectAndPlayStory(found);
                }}
                className="w-full bg-stone-950 border border-stone-700 hover:border-amber-500/60 text-stone-100 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {AUDIO_GUIDE_STORIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    📍 {s.monument} — {s.district || s.location} ({s.odiaTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSelectAndPlayStory(selectedStory)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all flex-shrink-0 ${
              isPlaying
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                : isPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 shadow-orange-950/60 hover:scale-[1.02]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Story</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Story</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>▶ Run Selected Story</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by monument, district, dynasty, or inscription..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-900 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Showing {filteredStories.length} of {AUDIO_GUIDE_STORIES.length} historic sites</span>
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRegion === reg
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Story Catalog + Audio Player Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Story Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Archaeological Chronicles (10 Mins)
            </h3>
            <span className="text-[11px] text-amber-400/90 font-mono">
              Click place or story to run audio
            </span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredStories.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/60 border border-stone-800 rounded-2xl text-stone-400 text-xs">
                No tourist places matched your search query. Try searching &quot;Konark&quot;, &quot;Ashoka&quot;, or &quot;Mayurbhanj&quot;.
              </div>
            ) : (
              filteredStories.map((story) => {
                const isSelected = selectedStory.id === story.id;
                const isThisPlaying = isSelected && isPlaying;
                const isThisPaused = isSelected && isPaused;

                return (
                  <div
                    key={story.id}
                    onClick={() => handleSelectAndPlayStory(story)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
                      isThisPlaying
                        ? 'bg-amber-950/50 border-amber-500 shadow-xl ring-2 ring-amber-500/60'
                        : isSelected
                        ? 'bg-stone-850 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40'
                        : 'bg-stone-900 border-stone-800 hover:border-amber-700/60 hover:bg-stone-850/70'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/15 via-transparent to-transparent pointer-events-none" />
                    )}

                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold truncate max-w-[210px]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {story.location} {story.district ? `(${story.district})` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono bg-stone-800 px-2 py-0.5 rounded-full text-stone-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        10 mins only
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-100 text-sm group-hover:text-amber-300 transition-colors">
                      {story.title}
                    </h4>

                    <div className="text-xs text-amber-300/80 font-medium mt-0.5">
                      {story.odiaTitle} • {story.hindiTitle}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Scroll className="w-2.5 h-2.5 text-amber-400" />
                        {story.totalWords || 1500}+ Words
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-cyan-400" />
                        4 Parts
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {story.documentedHistory}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 pt-2.5">
                      <span className="truncate max-w-[150px]">Era: {story.period}</span>

                      {/* Explicit Clickable Select & Run Story Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndPlayStory(story);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                          isThisPlaying
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 animate-pulse'
                            : isThisPaused
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                            : isSelected
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/60'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40'
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Playing (Pause)</span>
                          </>
                        ) : isThisPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Resume Story</span>
                          </>
                        ) : isSelected && isAiLoading ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading Voice...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Select &amp; Run Story</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Audio Player and Deep Content */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Hero Action: Run Story Immediately */}
          {/* Story Over / Completion Banner (Strictly Ends when Story Ends) */}
          {isStoryOver && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border border-amber-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-1.5">
                    <span>🏆 Story Narration Over • Time Over (କାହାଣୀ ସମାପ୍ତ • ସମୟ ଅବଧି ପୂର୍ଣ୍ଣ)</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1">
                    Complete 8-minute historical narration finished in{' '}
                    <strong className="text-amber-200">
                      {activeVoiceProfile.narratorName[selectedLang] || activeVoiceProfile.narratorName.en}
                    </strong>
                    &apos;s voice.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>↺ Replay Story</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlayNextMonument}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Next Site ⏭️</span>
                </button>
              </div>
            </div>
          )}

          {/* Hero Action: Run Story Immediately */}
          <button
            type="button"
            onClick={() => {
              if (isStoryOver) {
                handleReplay();
              } else {
                handleSelectAndPlayStory(selectedStory);
              }
            }}
            className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-sm sm:text-base shadow-xl transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'
                : isPaused
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950/60'
                : isStoryOver
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-stone-950 shadow-amber-950/60 hover:scale-[1.01]'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-stone-950 shadow-orange-950/60 hover:scale-[1.01]'
            }`}
          >
            {isAiLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-stone-950" />
                <span>Generating Studio HD Voice Narration...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Story ({formattedCurrentTime} / {formattedTotalTime})</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Resume Story ({formattedCurrentTime} / {formattedTotalTime})</span>
              </>
            ) : isStoryOver ? (
              <>
                <RotateCcw className="w-5 h-5 fill-current" />
                <span>↺ Story Completed (Click to Replay from Beginning)</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>▶ RUN STORY (8-Min Audio Guide for {selectedStory.monument})</span>
              </>
            )}
          </button>

          {/* Active Monument Header */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                {selectedStory.monument} • {selectedStory.region || 'Heritage'}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Duration: 8 Mins ({formattedTotalTime})
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              {selectedStory.title}
            </h2>

            <div className="text-xs sm:text-sm text-amber-300 font-medium mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>{selectedStory.odiaTitle}</span>
              <span className="text-stone-500">•</span>
              <span>{selectedStory.hindiTitle}</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {selectedStory.location} {selectedStory.district ? `(${selectedStory.district} District)` : ''}
              </span>
            </div>

            {/* Monument-Specific Voice Identity Badge */}
            <div className="mt-3 p-3 rounded-2xl bg-stone-850/90 border border-amber-600/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2 flex-wrap">
                  <span>🎙️ Place Voice Identity:</span>
                  <span className="text-white font-extrabold">
                    {activeVoiceProfile.narratorName[selectedLang] || activeVoiceProfile.narratorName.en}
                  </span>
                  <span className="text-[10px] text-amber-400/80 px-2 py-0.5 rounded-full bg-stone-900 border border-stone-700">
                    {activeVoiceProfile.voicePersonaTitle[selectedLang] || activeVoiceProfile.voicePersonaTitle.en}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {activeVoiceProfile.timbreDescription}
                </p>
              </div>
            </div>

            {/* In-Depth Historical Chronicle & Research Metrics */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/80 to-orange-950/80 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                <span>📜 {selectedStory.totalWords || 1500}+ Words Deep Historical Chronicle</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>4 Synchronized Story Parts (8:00 Total)</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Source Epigraphs & ASI</span>
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-850 border border-stone-700 text-[11px] font-mono text-cyan-300">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedStory.qrCodeBadgeText || `SCAN-${selectedStory.id.toUpperCase()}`}</span>
              </span>

              <button
                onClick={handleCopyTranscript}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold transition-colors"
                title="Copy current language transcript"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Transcript</span>
              </button>

              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold transition-colors"
                title="Download complete historical archive and transcript for offline use"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Archive (.txt)</span>
              </button>

              {onOpenAssistant && (
                <button
                  onClick={() =>
                    onOpenAssistant(
                      `Compare all primary historical sources (epigraphs, copper plates, palm-leaf Madala Panji, Xuanzang accounts, and ASI excavation reports) for ${selectedStory.monument} in ${selectedStory.location} (${selectedStory.district || 'Odisha'}).`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/40 text-purple-300 text-[11px] font-semibold transition-colors ml-auto"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ask AI to Compare Sources</span>
                </button>
              )}
            </div>

            {/* Toasts */}
            {copyToast && (
              <div className="mt-2 p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{copyToast}</span>
              </div>
            )}

            {downloadToast && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{downloadToast}</span>
              </div>
            )}
          </div>

          {/* Interactive AI Voice Console */}
          <div className="bg-stone-850/95 border border-stone-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
            {/* Top row: Language Toggle + Voice Persona Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-750">
              {/* Language Choice */}
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-stone-300">Language:</span>
                <div className="flex gap-1">
                  {(
                    [
                      { code: 'en', label: 'English', sub: 'en-IN' },
                      { code: 'or', label: 'ଓଡ଼ିଆ', sub: 'Odia' },
                      { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code);
                        if (isPlaying) {
                          executeAudioPlayback(selectedStory, lang.code, 0);
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        selectedLang === lang.code
                          ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-400">Persona:</span>
                <div className="flex gap-1">
                  {(
                    [
                      { id: 'royal', label: 'Royal Kalinga' },
                      { id: 'temple', label: 'Temple Palm-Leaf' },
                      { id: 'historian', label: 'Archaeologist' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaChange(p.id)}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-medium border transition-colors ${
                        voicePersona === p.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Persona Description & Voice Engine Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-400 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2">
                <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-stone-500'}`} />
                <span>
                  <strong>{personaSettings.label}:</strong> {personaSettings.desc}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleTestAudio}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold text-[10px] border border-stone-700 flex items-center gap-1 transition-colors"
                  title="Test sacred acoustic chime & speaker output"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Test Audio</span>
                </button>

                <span className="text-[10px] text-stone-500 font-mono">
                  Engine: {activeAudioSourceType === 'ai_hd' ? 'Utkal Sound Studio HD' : 'Indic Synthesizer'}
                </span>
              </div>
            </div>

            {voiceStatusNotice && (
              <div className="text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{voiceStatusNotice}</span>
              </div>
            )}

            {/* Equalizer Visualizer (Animated Soundwave Bars) */}
            <div className="h-8 flex items-end justify-center gap-1.5 py-1 px-4 bg-stone-900/80 rounded-xl border border-stone-800/80">
              {[40, 75, 55, 90, 60, 100, 45, 80, 65, 85, 50, 95, 70, 40, 85, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                      : 'bg-stone-750'
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(15, Math.sin((currentTimeSec * 2 + i) * 0.8) * 45 + 50)}%`
                      : '20%',
                  }}
                />
              ))}
            </div>

            {/* Scrubber / Seekable Progress Bar (8:00 Duration Limit) */}
            <div className="space-y-1.5">
              <div
                onClick={handleSeek}
                className="w-full h-3 rounded-full bg-stone-800 hover:bg-stone-750 cursor-pointer overflow-hidden relative group p-0.5 border border-stone-700"
                title="Click to seek anywhere in narration"
              >
                <div
                  className={`h-full rounded-full transition-all duration-200 group-hover:brightness-110 ${
                    isStoryOver
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-400'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400'
                  }`}
                  style={{ width: `${isStoryOver ? 100 : progressPercent}%` }}
                />
              </div>

              {/* Exact time display: left is elapsed, right is strictly formattedTotalTime */}
              <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono">
                <span className={`font-bold ${isStoryOver ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isStoryOver ? formattedTotalTime : formattedCurrentTime}
                </span>
                <span className="text-[11px]">
                  {isStoryOver ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      STORY OVER • TIME OVER (100% Complete)
                    </span>
                  ) : (
                    <span className="text-stone-400">
                      Duration: 8 mins ({Math.round(progressPercent)}%)
                    </span>
                  )}
                </span>
                <span className="text-stone-200 font-bold">{formattedTotalTime}</span>
              </div>
            </div>

            {/* Playback Controls & Speed/Pitch Options */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {/* Speed Buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-stone-400 mr-1 font-semibold">Speed:</span>
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 text-[11px] rounded font-mono font-bold transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-stone-400 hover:text-stone-200 bg-stone-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Main Play, Pause, Skip Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleSkip(-15)}
                  className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center"
                  title="Rewind 15 seconds"
                  aria-label="Skip backward 15 seconds"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  title="Restart narration from beginning"
                  aria-label="Reset audio playback"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayback}
                  disabled={isAiLoading}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-950/60 hover:scale-105 transition-transform ${isAiLoading ? 'opacity-80 animate-pulse' : ''}`}
                  aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
                >
                  {isAiLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(15)}
                  className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center"
                  title="Forward 15 seconds"
                  aria-label="Skip forward 15 seconds"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>

              {/* Pitch Slider & Ambience Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 font-semibold">Pitch:</span>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                    className="w-16 accent-amber-500 cursor-pointer"
                    title={`Pitch: ${pitch.toFixed(2)}x`}
                  />
                  <span className="text-[10px] font-mono text-amber-300/90 w-6">
                    {pitch.toFixed(1)}x
                  </span>
                </div>

                {/* Ambient Drone Music Toggle */}
                <button
                  onClick={() => setIsAmbienceEnabled(!isAmbienceEnabled)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    isAmbienceEnabled
                      ? 'bg-amber-950/50 border-amber-600/50 text-amber-300'
                      : 'bg-stone-800 border-stone-700 text-stone-500'
                  }`}
                  title={isAmbienceEnabled ? 'Sacred temple ambient drone is ON' : 'Sacred temple ambient drone is OFF'}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{isAmbienceEnabled ? 'Drone ON' : 'Muted'}</span>
                </button>
              </div>
            </div>

            {/* Transcript Preview Box */}
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between font-bold text-amber-400 text-xs mb-1.5">
                <span>Narration Audio Transcript ({selectedLang.toUpperCase()}):</span>
                <span className="text-[10px] text-stone-500 font-normal">
                  Word sync enabled
                </span>
              </div>
              <p>{currentTranscript}</p>
            </div>
          </div>

          {/* Interactive Story Parts / Chapters Selector (Instant Run on Click) */}
          {selectedStory.chapters && selectedStory.chapters.length > 0 && (
            <div className="bg-stone-850/95 border border-amber-800/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800 pb-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Select Story Part / Chapter (Click Any Part to Run)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-amber-950/60 text-amber-300 border border-amber-800/40 px-2.5 py-0.5 rounded-full font-bold">
                    Part {currentChapterIdx + 1} of {selectedStory.chapters?.length || 4} Active
                  </span>
                  <span className="text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                    Strictly 8:00 Total
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {selectedStory.chapters.map((ch, idx) => {
                  const isThisPartActive = isPlaying && currentChapterIdx === idx;
                  const isThisPartSelected = currentChapterIdx === idx;
                  const totalParts = selectedStory.chapters?.length || 4;
                  const partSec = totalDurationSec / totalParts;
                  const chapterStartSec = Math.round(idx * partSec);
                  const startMin = Math.floor(chapterStartSec / 60);
                  const startSec = chapterStartSec % 60;
                  const formattedStart = `${startMin}:${startSec < 10 ? '0' : ''}${startSec}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => handlePlayStoryPart(idx)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                        isThisPartActive
                          ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-md shadow-amber-950/50'
                          : isThisPartSelected
                          ? 'bg-stone-800/90 border-amber-600/60'
                          : 'bg-stone-900/80 border-stone-800 hover:border-amber-600/40 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isThisPartActive
                            ? 'bg-amber-500 text-stone-950 font-extrabold'
                            : 'bg-stone-800 text-amber-400 border border-stone-700'
                        }`}>
                          Part {idx + 1} of {selectedStory.chapters?.length || 4}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400/80" />
                          Starts {formattedStart} (2m 00s)
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {ch.title}
                      </h5>
                      {ch.odiaTitle && (
                        <p className="text-xs text-amber-300/80 font-medium truncate mt-0.5">
                          {ch.odiaTitle}
                        </p>
                      )}
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {ch.text}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-400">
                          {isThisPartActive ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                              Narrating Now...
                            </span>
                          ) : (
                            'Click to play part'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayStoryPart(idx);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                            isThisPartActive
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-sm'
                              : 'bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isThisPartActive ? (
                            <>
                              <Pause className="w-3 h-3 fill-current" />
                              <span>Playing Part {idx + 1}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Run Part {idx + 1}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deep Historical Analysis: 5 Specialized Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chapters'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>📖 4 Story Parts</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📜 Inscriptions & History</span>
              </button>

              <button
                onClick={() => setActiveTab('legend')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'legend'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🪔 Sacred Legends & Folklore</span>
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'architecture'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>🏛️ Engineering Marvels</span>
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'sources'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>📚 Different Sources ({parsedSources.length})</span>
              </button>
            </div>

            {/* Tab 0: 4 Story Parts Complete Reader */}
            {activeTab === 'chapters' && selectedStory.chapters && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-amber-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-amber-400" />
                    4 Interactive Story Parts & Synchronized Audio Narration
                  </div>
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full font-mono">
                    2m 30s Per Part • 10 Mins Total
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedStory.chapters.map((ch, idx) => {
                    const isThisPartActive = isPlaying && currentChapterIdx === idx;
                    const startMin = Math.floor((idx * 150) / 60);
                    const startSec = (idx * 150) % 60;
                    const formattedStart = `${startMin}:${startSec < 10 ? '0' : ''}${startSec}`;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isThisPartActive
                            ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500/50'
                            : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
                              Part {idx + 1}
                            </span>
                            <h4 className="font-bold text-sm text-white">
                              {ch.title}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlayStoryPart(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isThisPartActive
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                            }`}
                          >
                            {isThisPartActive ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Narrating Now ({formattedCurrentTime})</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>▶ Run Part {idx + 1} (Starts {formattedStart})</span>
                              </>
                            )}
                          </button>
                        </div>

                        {ch.odiaTitle && (
                          <div className="text-xs text-amber-300/90 font-medium mb-2">
                            {ch.odiaTitle}
                          </div>
                        )}

                        <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/40 p-3 rounded-lg border border-stone-800/60">
                          {ch.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 1: Documented History & Inscriptions */}
            {activeTab === 'history' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-amber-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Peer-Reviewed Historical Records & Epigraphy
                  </div>
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                    ASI & Museum Epigraphy
                  </span>
                </div>

                {/* Inscriptions & Manuscripts Highlight */}
                {selectedStory.inscriptionsAndManuscripts && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 space-y-1">
                    <div className="font-bold text-[11px] uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Key Inscriptions, Copper Plates & Manuscripts:
                    </div>
                    <p className="text-xs leading-relaxed">
                      {selectedStory.inscriptionsAndManuscripts}
                    </p>
                  </div>
                )}

                {/* Key Historical Figures */}
                {selectedStory.keyHistoricalFigures && selectedStory.keyHistoricalFigures.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                      Prominent Historical Figures & Epigraphic Mentions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStory.keyHistoricalFigures.map((fig, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-[11px] flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          {fig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Documented History Chronicle */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Archaeological Chronicle:
                  </span>
                  <p className="text-stone-200 leading-relaxed text-xs">
                    {selectedStory.documentedHistory}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Sacred Legends & Living Folklore */}
            {activeTab === 'legend' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-orange-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-orange-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    Traditional Folk Stories, Oral Lore & Spiritual Philosophy
                  </div>
                  <span className="text-[10px] text-orange-400/80 bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-500/20">
                    Odia Oral Tradition
                  </span>
                </div>

                <p className="text-stone-200 text-xs leading-relaxed">
                  {selectedStory.legendAndFolklore}
                </p>

                <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-orange-200 text-[11px]">
                  💡 <strong>Heritage Note:</strong> In Odisha&apos;s historiography, oral traditions
                  often reflect philosophical principles and ethical commitments of artisan communities
                  passed down across generations through Pattachitra balladeers and Gotipua dancers.
                </div>
              </div>
            )}

            {/* Tab 3: Architectural Highlights */}
            {activeTab === 'architecture' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-cyan-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Structural, Astronomical & Aesthetic Engineering
                  </div>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Kalinga Deula Architecture
                  </span>
                </div>

                <ul className="space-y-2 pt-1">
                  {selectedStory.architecturalHighlights.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-stone-200 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-cyan-400 font-bold mt-0.5">❖</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab 4: Different Historical Sources Breakdown */}
            {activeTab === 'sources' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-emerald-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    Information from Different Historical Sources
                  </div>
                  <span className="text-[10px] text-stone-400">
                    Epigraphy • Palm-Leaf • Greek/Chinese • ASI
                  </span>
                </div>

                {/* Category Pills for Different Sources */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {sourceCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSourceCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                        sourceCategoryFilter === cat
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Categorized Source Cards */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredSources.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border mb-1 ${item.tagColor}`}>
                            {item.category}
                          </span>
                          <p className="text-stone-200 text-xs leading-relaxed font-medium">
                            {item.source}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-stone-500 text-[10px] self-end sm:self-start">
                        Ref #{item.id}
                      </span>
                    </div>
                  ))}
                </div>

                {onOpenAssistant && (
                  <div className="pt-1 border-t border-stone-800">
                    <button
                      onClick={() =>
                        onOpenAssistant(
                          `Provide a deep comparative synthesis of the different historical sources for ${selectedStory.monument} (${selectedStory.district || selectedStory.location}), contrasting epigraphical inscriptions with traditional palm-leaf manuscripts and foreign travel records.`
                        )
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span>Ask AI for Cross-Source Scholarly Analysis</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Utkal Katha Multilingual Voice Assistant (Interactive Odia, Hindi & English Historical Voice Engine) */}
      <UtkalKathaVoiceAssistant
        selectedStory={selectedStory}
        selectedLang={selectedLang}
        onLanguageChange={(newLang) => {
          setSelectedLang(newLang);
          if (isPlaying) {
            executeAudioPlayback(selectedStory, newLang, textOffsetCharRef.current);
          }
        }}
        onOpenGlobalAssistant={onOpenAssistant}
      />

      {/* Cultural Festivals Calendar */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Odisha Cultural Events & Historical Celebrations
            </h2>
          </div>
          <span className="text-xs text-stone-400">Authentic Dates & Visitor Guidelines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CULTURAL_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-stone-850 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {evt.period}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{evt.name}</h3>
                <span className="text-xs text-amber-300/80 font-medium">{evt.odiaName}</span>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">{evt.significance}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 space-y-1">
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Dates: {evt.dates}
                </div>
                <div className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Traveller Advice: </span>
                  {evt.travelerAdvice}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
