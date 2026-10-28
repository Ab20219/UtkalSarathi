import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AudioGuideStory } from '../types';
import {
  getMonumentVoiceProfile,
  MonumentVoiceProfile,
} from '../data/monumentVoiceProfiles';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Headphones,
  MapPin,
  Flame,
  Radio,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface UtkalKathaVoiceAssistantProps {
  selectedStory: AudioGuideStory;
  selectedLang: 'en' | 'or' | 'hi';
  onLanguageChange: (lang: 'en' | 'or' | 'hi') => void;
  onOpenGlobalAssistant?: (prompt: string) => void;
}

interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  isPlayingVoice?: boolean;
  isLive?: boolean;
}

export const UtkalKathaVoiceAssistant: React.FC<UtkalKathaVoiceAssistantProps> = ({
  selectedStory,
  selectedLang,
  onLanguageChange,
  onOpenGlobalAssistant,
}) => {
  const voiceProfile: MonumentVoiceProfile = useMemo(() => {
    return getMonumentVoiceProfile(selectedStory.id);
  }, [selectedStory.id]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initial welcome greeting tailored to the monument's historical voice
  const initialGreeting = useMemo(() => {
    switch (selectedLang) {
      case 'or':
        return `${voiceProfile.culturalGreeting.or} ଆପଣ ${voiceProfile.placeName.or}ର ପ୍ରାଚୀନ ଇତିହାସ, ଶିଳାଲେଖ, ବାସ୍ତୁକଳା କିମ୍ବା ଧର୍ମପୀଠର ଗୁପ୍ତ କଥା ବିଷୟରେ ଯାହା ଇଚ୍ଛା ପଚାରିପାରିବେ।`;
      case 'hi':
        return `${voiceProfile.culturalGreeting.hi} आप ${voiceProfile.placeName.hi} के शिलालेखों, वास्तुकला, आक्रमणों के इतिहास या पवित्र कथाओं के बारे में कुछ भी पूछ सकते हैं।`;
      case 'en':
      default:
        return `${voiceProfile.culturalGreeting.en} Ask me anything about the architectural marvels, documented epigraphs, royal dynasties, or living folklore of ${voiceProfile.placeName.en}.`;
    }
  }, [selectedLang, voiceProfile]);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: initialGreeting,
      timestamp: 'Just now',
      source: 'Archaeological Survey of India & Utkal Historical Chronicles',
    },
  ]);

  // Update greeting when monument or language changes
  useEffect(() => {
    setMessages([
      {
        id: `msg-welcome-${selectedStory.id}-${selectedLang}`,
        sender: 'assistant',
        text: initialGreeting,
        timestamp: 'Just now',
        source: 'Archaeological Survey of India & Utkal Historical Chronicles',
      },
    ]);
    stopAssistantVoice();
  }, [selectedStory.id, selectedLang, initialGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Speech Recognition (Web Speech API) with Indian language codes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        selectedLang === 'or' ? 'or-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, [selectedLang]);

  const toggleRecording = () => {
    if (!speechRecognitionRef.current) {
      setVoiceNotice('Voice dictation not available in browser. You can type your question.');
      setTimeout(() => setVoiceNotice(''), 4000);
      return;
    }

    if (isRecording) {
      speechRecognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        speechRecognitionRef.current.lang =
          selectedLang === 'or' ? 'or-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        speechRecognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      }
    }
  };

  const stopAssistantVoice = () => {
    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.pause();
        htmlAudioRef.current = null;
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setActiveSpeakingMsgId(null);
  };

  // Play voice for a specific message with distinct monument voice persona & language
  const handlePlayVoice = async (msgId: string, text: string) => {
    if (activeSpeakingMsgId === msgId) {
      stopAssistantVoice();
      return;
    }

    stopAssistantVoice();
    setActiveSpeakingMsgId(msgId);
    setVoiceNotice(`Speaking in ${voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en}'s voice...`);

    // Clean text: strip markdown bullets, hashes, bolding
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 1. Try Studio HD TTS from server with persona
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText.slice(0, 750),
          lang: selectedLang,
          persona: voiceProfile.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          const audio = new Audio(audioUrl);
          htmlAudioRef.current = audio;

          audio.onended = () => {
            setActiveSpeakingMsgId(null);
            setVoiceNotice('');
          };

          audio.onerror = () => {
            fallbackBrowserSpeech(msgId, cleanText);
          };

          await audio.play();
          return;
        }
      }
    } catch {
      // Proceed to fallback
    }

    // 2. Client-side SpeechSynthesis with monument-specific pitch & rate
    fallbackBrowserSpeech(msgId, cleanText);
  };

  const fallbackBrowserSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceNotice('Speech audio is displayed on screen.');
      setActiveSpeakingMsgId(null);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Split text into short, natural sentence segments (~180 chars) to prevent Chrome timeouts
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
      if (buffer) chunks.push(buffer);
      const segments = chunks.length > 0 ? chunks : [text.slice(0, 200)];

      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;

      if (selectedLang === 'or') {
        matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('or') ||
            v.name.toLowerCase().includes('odia') ||
            v.name.toLowerCase().includes('oriya') ||
            v.lang === 'hi-IN' ||
            v.lang === 'en-IN'
        );
      } else if (selectedLang === 'hi') {
        matchedVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'));
      } else {
        matchedVoice = voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en'));
      }

      let currentIdx = 0;
      const playNext = () => {
        if (currentIdx >= segments.length) {
          setActiveSpeakingMsgId(null);
          setVoiceNotice('');
          return;
        }

        const utterance = new SpeechSynthesisUtterance(segments[currentIdx]);
        (window as any)._activeAssistantUtterance = utterance;

        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          utterance.lang = selectedLang === 'or' ? 'hi-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        }

        utterance.pitch = voiceProfile.basePitch;
        utterance.rate = voiceProfile.rateMultiplier;

        utterance.onend = () => {
          currentIdx++;
          playNext();
        };

        utterance.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') return;
          console.warn('Utterance chunk warning, continuing:', e.error);
          currentIdx++;
          playNext();
        };

        window.speechSynthesis.speak(utterance);
      };

      playNext();
    } catch (e) {
      console.warn('Speech error:', e);
      setActiveSpeakingMsgId(null);
    }
  };

  // Submit query to /api/chat with full monument grounding
  const handleSendQuery = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    stopAssistantVoice();

    const userMessage: AssistantMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const langLabel = selectedLang === 'or' ? 'Odia' : selectedLang === 'hi' ? 'Hindi' : 'English';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: langLabel,
          isUtkalKatha: true,
          runningStory: {
            id: selectedStory.id,
            monument: selectedStory.monument,
            location: selectedStory.location,
            district: selectedStory.district,
            period: selectedStory.period,
            narrator: selectedStory.narrator,
            narratorName: voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en,
            voicePersonaTitle: voiceProfile.voicePersonaTitle[selectedLang] || voiceProfile.voicePersonaTitle.en,
            documentedHistory: selectedStory.documentedHistory,
            legendAndFolklore: selectedStory.legendAndFolklore,
            architecturalHighlights: selectedStory.architecturalHighlights,
            inscriptionsAndManuscripts: selectedStory.inscriptionsAndManuscripts,
            historicalSources: selectedStory.historicalSources,
            keyHistoricalFigures: selectedStory.keyHistoricalFigures,
            audioTranscript:
              selectedLang === 'or'
                ? selectedStory.audioTranscriptOr
                : selectedLang === 'hi'
                ? selectedStory.audioTranscriptHi
                : selectedStory.audioTranscriptEn,
          },
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        (selectedLang === 'or'
          ? `${selectedStory.monument} ର ଐତିହାସିକ ତଥ୍ୟ: ${selectedStory.documentedHistory.slice(0, 360)}`
          : selectedLang === 'hi'
          ? `${selectedStory.monument} के ऐतिहासिक अभिलेखों के अनुसार: ${selectedStory.documentedHistory.slice(0, 360)}`
          : `Regarding ${selectedStory.monument}: ${selectedStory.documentedHistory.slice(0, 360)}`);

      const assistantReply: AssistantMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        source: data.source || `Live Voice Engine • ${selectedStory.monument}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
      };

      setMessages((prev) => [...prev, assistantReply]);

      // Automatically speak the answer for instant voice feedback
      handlePlayVoice(assistantReply.id, replyText);
    } catch {
      const fallbackReply: AssistantMessage = {
        id: `fallback-${Date.now()}`,
        sender: 'assistant',
        text:
          selectedLang === 'or'
            ? `${selectedStory.monument} ର ଐତିହାସିକ ତଥ୍ୟ ଅନୁସାରେ: ${selectedStory.documentedHistory.slice(0, 320)}...`
            : selectedLang === 'hi'
            ? `${selectedStory.monument} के ऐतिहासिक अभिलेखों के अनुसार: ${selectedStory.documentedHistory.slice(0, 320)}...`
            : `According to historical records for ${selectedStory.monument}: ${selectedStory.documentedHistory.slice(0, 320)}...`,
        source: `Utkal Historical Archive • ${selectedStory.monument}`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border border-amber-600/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Monument Voice Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Utkal Katha Voice Assistant (ଉତ୍କଳ କଥା ସ୍ୱର ସହାୟକ)
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en}</span>
              <span className="text-xs font-normal text-amber-400/90 px-2 py-0.5 rounded-md bg-stone-800/80 border border-stone-700">
                {voiceProfile.voicePersonaTitle[selectedLang] || voiceProfile.voicePersonaTitle.en}
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <Headphones className="w-3 h-3 text-amber-400" />
              <span>{voiceProfile.timbreDescription}</span>
            </p>
          </div>
        </div>

        {/* Multilingual Voice Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-950/80 border border-stone-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => onLanguageChange('or')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'or'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            ଓଡ଼ିଆ (Odia)
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'hi'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'en'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Voice Status Alert if active */}
      {voiceNotice && (
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            {voiceNotice}
          </span>
          <button
            onClick={stopAssistantVoice}
            className="text-[11px] underline text-stone-400 hover:text-white"
          >
            Stop Voice
          </button>
        </div>
      )}

      {/* Monument-Specific Quick Questions Chips */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask About Running Story ({voiceProfile.placeName[selectedLang] || voiceProfile.placeName.en}):</span>
          </div>
          <span className="text-[10px] text-amber-400/90 bg-stone-950/90 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
            🎯 Answers Focused Exclusively On This Story
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {voiceProfile.curatedQuestions.map((q, idx) => {
            const questionText = q[selectedLang] || q.en;
            return (
              <button
                key={idx}
                onClick={() => handleSendQuery(questionText)}
                disabled={isLoading}
                className="text-left text-xs bg-stone-950/80 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-amber-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 group disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="line-clamp-2">{questionText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1 text-sm custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const isSpeaking = activeSpeakingMsgId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-medium rounded-tr-none'
                    : 'bg-stone-950 border border-stone-800/90 text-stone-200 rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-stone-800/60 text-[11px] text-amber-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      {voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en}
                      {m.isLive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          Live Answer
                        </span>
                      )}
                    </span>
                    <span className="text-stone-500 text-[10px]">{m.timestamp}</span>
                  </div>
                )}

                <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                  {m.text}
                </p>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-stone-500 text-[10px]">
                      {m.source || 'ASI Historical Records'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoice(m.id, m.text)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSpeaking
                            ? 'bg-amber-500 text-stone-950 animate-pulse'
                            : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30'
                        }`}
                        title="Listen to this answer"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>
                              {selectedLang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : selectedLang === 'hi' ? 'रोकें' : 'Stop'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {selectedLang === 'or'
                                ? 'ସ୍ୱରରେ ଶୁଣନ୍ତୁ'
                                : selectedLang === 'hi'
                                ? 'आवाज़ में सुनें'
                                : 'Listen Aloud'}
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-stone-950 border border-amber-500/40 rounded-2xl px-4 py-3 w-fit animate-pulse shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              {selectedLang === 'or'
                ? `${voiceProfile.narratorName.or} ପ୍ରତ୍ୟକ୍ଷ ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛନ୍ତି...`
                : selectedLang === 'hi'
                ? `${voiceProfile.narratorName.hi} सीधा उत्तर तैयार कर रहे हैं...`
                : `${voiceProfile.narratorName.en} is preparing a live answer to your question...`}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Text Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="mt-4 flex items-center gap-2 relative z-10"
      >
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center flex-shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400'
              : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-300 hover:text-amber-400'
          }`}
          title={isRecording ? 'Stop Recording' : 'Speak your question (Voice Input)'}
          aria-label="Toggle voice dictation"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            selectedLang === 'or'
              ? `${voiceProfile.placeName.or} ବିଷୟରେ କିଛି ବି ପଚାରନ୍ତୁ...`
              : selectedLang === 'hi'
              ? `${voiceProfile.placeName.hi} के बारे में कुछ भी पूछें...`
              : `Ask anything about ${voiceProfile.placeName.en}...`
          }
          className="flex-1 bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all flex-shrink-0 shadow-lg"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
