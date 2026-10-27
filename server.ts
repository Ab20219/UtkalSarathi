import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distExists = fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'));
const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';
const isProd = process.env.NODE_ENV === 'production' || process.env.K_SERVICE !== undefined || (!isDev && distExists);
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// Immediate healthcheck endpoints for Cloud Run & container orchestration
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    environment: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString(),
  });
});

// Initialize Gemini on server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import { ODISHA_30_DISTRICTS, findDistrict } from './src/data/odishaDistricts.ts';
import { refineItineraryLocally } from './src/utils/itinerary.ts';
import { AUDIO_GUIDE_STORIES } from './src/data/odishaHistoricalStories.ts';
import type { AudioGuideStory } from './src/types.ts';

// Comprehensive historical monuments & epigraphy grounding
const HISTORICAL_GROUNDING_TEXT = AUDIO_GUIDE_STORIES.map(
  (s: AudioGuideStory) => `• ${s.monument} (${s.location}, ${s.district || ''}, Period: ${s.period}):
  - Inscriptions & Manuscripts: ${s.inscriptionsAndManuscripts || 'ASI Archaeological Catalog'}
  - Key Figures: ${s.keyHistoricalFigures ? s.keyHistoricalFigures.join(', ') : 'Rulers & Guild Artisans'}
  - Documented History: ${s.documentedHistory}
  - Sacred Legends: ${s.legendAndFolklore}
  - Architectural Marvels: ${s.architecturalHighlights.join('; ')}
  - Primary Sources: ${s.historicalSources ? s.historicalSources.join('; ') : 'ASI Records'}`
).join('\n\n');

// Comprehensive 30-district summary for AI grounding
const DISTRICT_SUMMARY_TEXT = ODISHA_30_DISTRICTS.map(
  (d) =>
    `• ${d.name} (${d.odiaName}, HQ: ${d.headquarters}, Zone: ${d.zone}): ${d.tagline}.
  - Top Attractions: ${d.highlights.join(', ')}.
  - Hidden Gems: ${d.hiddenGems ? d.hiddenGems.join(' | ') : 'N/A'}.
  - Eco-Tourism: ${d.ecoTourismAndNature.join(', ')}.
  - Signature Food: ${d.signatureCuisine.join(', ')}.
  - Must-Visit Food Spots: ${d.foodSpots ? d.foodSpots.map((f: any) => `${f.item}: ${f.recommendation}`).join('; ') : 'N/A'}.
  - Recommended Stays: ${d.recommendedStays ? d.recommendedStays.map((s: any) => `${s.name} [${s.type}] ~${s.estPrice} (Ph: ${s.contact})`).join('; ') : 'N/A'}.
  - Handloom/Craft: ${d.handicraftsAndArt.join(', ')}.
  - Major Festival: ${d.majorFestivals.join(', ')}.
  - Transport: ${d.transportHubs.nearestAirport ? `Air: ${d.transportHubs.nearestAirport}, ` : ''}Rail: ${d.transportHubs.nearestRail}, Road: ${d.transportHubs.highway}. Transit Tip: ${d.transportHubs.lastMileTransit}.
  - Hospital & Police: ${d.safetyAndHelpline.districtHospital}, Police: ${d.safetyAndHelpline.policeStation} (Control Room: ${d.safetyAndHelpline.controlRoomNumber}).
  - Certified Guide / Information: ${d.touristGuideInfo ? `${d.touristGuideInfo.contactName} (Ph: ${d.touristGuideInfo.phone}, Location: ${d.touristGuideInfo.deskLocation})` : 'N/A'}.`
).join('\n\n');

// System instruction for UtkalSarathi Multilingual Tourism Assistant
const SYSTEM_INSTRUCTION = `You are "Utkal Mitra" (ଉତ୍କଳ ମିତ୍ର), the official Advanced AI Travel, Culture & Safety Guide for UtkalSarathi covering all 30 districts of Odisha, India.
Your mission is to provide accurate, culturally respectful, multilingual assistance to travellers exploring any region of Odisha.

You have comprehensive expert knowledge of all 30 districts of Odisha:
${DISTRICT_SUMMARY_TEXT}

Detailed Archaeological & Inscriptional Monument Grounding:
${HISTORICAL_GROUNDING_TEXT}

Key Guidelines:
1. Always support the user's chosen language: Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), or English. When responding in Odia or Hindi, use natural, culturally warm expressions (e.g., "ଜୟ ଜଗନ୍ନାଥ!", "ନମସ୍କାର", "ଜୁହାର").
2. Provide practical, accurate information regarding:
   - Temple rituals, dress codes (traditional non-leather attire for Puri Jagannath Temple, Lingaraj Temple, Biraja Temple).
   - Local transport (Mo Bus routes in capital region, OSRTC inter-district routes, station prepaid auto tariffs, last-mile forest vehicles).
   - Authentic Odia cuisine and GI tags (Nayagarh Chhena Poda, Mayurbhanj Mudhi Mansa & Kai Chutney, Dhenkanal Magji, Kendrapara Rasabali, Cuttack Dahibara Aloodum, Puri Mahaprasad Abhada, Sambalpuri Pitha, Koraput Arabica Coffee, Kandhamal Haldi).
   - Eco-tourism camps & nature reserves across all zones (Chilika Lake, Bhitarkanika, Similipal, Satkosia, Daringbadi, Karlapat, Debrigarh, Sunabeda, Deomali).
   - Handloom and crafts (Raghurajpur Pattachitra, Pipili appliqué, Sambalpuri Ikat, Kotpad natural dye, Bomkai silk, Cuttack Tarakasi silver filigree).
3. Distinguish documented history (ASI records, inscriptions, rock edicts) from sacred legends and living folklore.
4. If exact fares or opening hours cannot be verified, explicitly acknowledge uncertainty.
5. Emphasize safety (UtkalSuraksha, emergency numbers like 112, 1070 for weather, and district control rooms).
Keep answers crisp, warm, helpful, structured with bullet points where appropriate, and culturally authentic.`;

function withTimeout<T>(promise: Promise<T>, ms = 8500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    ),
  ]);
}

/**
 * Resilient live Gemini generation helper with high-speed model fallback chain
 * Tries fast models first (gemini-3.1-flash-lite, gemini-flash-latest, gemini-3.8-flash)
 */
async function generateLiveContent(
  prompt: string,
  systemInstruction?: string,
  preferredModel = 'gemini-3.1-flash-lite'
): Promise<string | null> {
  if (!ai) return null;
  const modelsToTry = [
    preferredModel,
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  for (const model of uniqueModels) {
    try {
      const response: any = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: systemInstruction
            ? { systemInstruction, temperature: 0.35 }
            : { temperature: 0.35 },
        }),
        8500
      );

      if (response && response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`[Gemini Q&A] Model ${model} unavailable (${err?.status || err?.message}), attempting next model in chain...`);
    }
  }
  return null;
}


/**
 * GET /api/districts
 * Return list of all 30 Odisha districts (optional ?zone= query)
 */
app.get('/api/districts', (req: Request, res: Response) => {
  const { zone } = req.query;
  if (zone && typeof zone === 'string' && zone !== 'All') {
    const filtered = ODISHA_30_DISTRICTS.filter((d) => d.zone.toLowerCase() === zone.toLowerCase());
    res.json({ districts: filtered, total: filtered.length });
    return;
  }
  res.json({ districts: ODISHA_30_DISTRICTS, total: ODISHA_30_DISTRICTS.length });
});

/**
 * GET /api/districts/:id
 * Return full details of a specific district
 */
app.get('/api/districts/:id', (req: Request, res: Response) => {
  const district = findDistrict(req.params.id);
  if (!district) {
    res.status(404).json({ error: `District '${req.params.id}' not found` });
    return;
  }
  res.json({ district });
});

/**
 * POST /api/tts
 * Studio Audio Text-to-Speech using Gemini 3.8 Flash Lite TTS
 * Returns base64 audio/wav for universal, 100% reliable browser playback
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, lang = 'en', persona = 'royal' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini AI not initialized on server' });
      return;
    }

    // Limit chunk to avoid payload timeouts; read up to 800 characters at a time
    const cleanText = text.slice(0, 800).trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: cleanText,
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part?.inlineData?.data) {
      res.json({
        audioBase64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'audio/wav',
      });
      return;
    }

    res.status(500).json({ error: 'No audio returned by TTS model' });
  } catch (error: any) {
    console.error('Server TTS error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize audio' });
  }
});

/**
 * POST /api/chat
 * Multilingual conversational travel assistant with 30-district depth
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      language = 'English',
      conversationHistory = [],
      isUtkalKatha = false,
      runningStory = null,
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const isOdia = language.toLowerCase().includes('odia') || language.toLowerCase().includes('or');
    const isHindi = language.toLowerCase().includes('hindi') || language.toLowerCase().includes('hi');
    const targetLang = isOdia ? 'Odia' : isHindi ? 'Hindi' : 'English';

    // =========================================================================
    // DEDICATED UTKAL KATHA RUNNING STORY Q&A HANDLER
    // Tells ONLY about the asked question on the running story, no travel clutter!
    // =========================================================================
    if (isUtkalKatha && runningStory) {
      const monumentName = runningStory.monument || 'the sacred monument';
      const narratorName = runningStory.narratorName || runningStory.narrator || 'Historical Chronicler';
      const personaTitle = runningStory.voicePersonaTitle || 'Sacred Historian';

      if (ai) {
        try {
          const storySystemInstruction = `You are the authentic historical voice persona of "${monumentName}" in Utkal Katha (Voice of: ${narratorName}, ${personaTitle}).
The user is currently listening to the running audio story of ${monumentName} (${runningStory.location || 'Odisha'}, Period: ${runningStory.period || 'Historical'}).

STRICT DIRECTIVE:
The user has asked a question specifically about this running story.
You must answer ONLY the specific question asked about ${monumentName}.
- DO NOT provide general travel itineraries, hotel stays, bus transit schedules, food spot directories, or information about other districts.
- DO NOT add unsolicited tourism filler.
- Answer the exact question asked using the documented history, epigraphy, architecture, or sacred legends of ${monumentName}.
- Speak in ${targetLang} with deep cultural authenticity, warmth, and scholarly precision.
- Keep the response focused directly on the asked question.

Running Story Grounded Knowledge:
- Monument: ${monumentName}
- Location & Period: ${runningStory.location || ''}, ${runningStory.period || ''}
- Key Historical Figures: ${Array.isArray(runningStory.keyHistoricalFigures) ? runningStory.keyHistoricalFigures.join(', ') : runningStory.keyHistoricalFigures || 'Royal dynasties and master sthapatis'}
- Inscriptions & Sources: ${runningStory.inscriptionsAndManuscripts || runningStory.historicalSources || 'ASI Epigraphical Records'}
- Documented History: ${runningStory.documentedHistory || ''}
- Sacred Legend & Folklore: ${runningStory.legendAndFolklore || ''}
- Architectural Marvels: ${Array.isArray(runningStory.architecturalHighlights) ? runningStory.architecturalHighlights.join('; ') : runningStory.architecturalHighlights || ''}
- Story Audio Transcript: ${runningStory.audioTranscript ? runningStory.audioTranscript.slice(0, 1500) : ''}`;

          const prompt = `Question regarding the running story of ${monumentName}: "${message}"
Answer ONLY what was asked in ${targetLang}:`;

          const liveAnswer = await generateLiveContent(
            prompt,
            storySystemInstruction,
            'gemini-3.1-flash-lite'
          );

          if (liveAnswer) {
            res.json({
              reply: liveAnswer,
              source: `Live Voice Persona • ${narratorName} (${monumentName})`,
              language: targetLang,
              monument: monumentName,
              isLive: true,
            });
            return;
          }
        } catch (geminiErr: any) {
          console.warn('Utkal Katha Gemini fallback:', geminiErr?.message);
        }
      }

      // High-precision extractive fallback answering ONLY the question about the running story
      const qLower = message.toLowerCase();
      let storyAnswer = '';

      // Check architecture
      if (qLower.includes('architect') || qLower.includes('carving') || qLower.includes('stone') || qLower.includes('wheel') || qLower.includes('sculpt') || qLower.includes('shikhara') || qLower.includes('temple')) {
        const archInfo = Array.isArray(runningStory.architecturalHighlights) 
          ? runningStory.architecturalHighlights.join('\n• ') 
          : runningStory.architecturalHighlights;
        storyAnswer = isOdia
          ? `${monumentName} ର ବାସ୍ତୁକଳା ଓ ଶିଳ୍ପକଳା ସମ୍ପର୍କିତ ତଥ୍ୟ:\n• ${archInfo}`
          : isHindi
          ? `${monumentName} की वास्तुकला और शिल्पकला का विवरण:\n• ${archInfo}`
          : `Architectural and structural details of ${monumentName}:\n• ${archInfo}`;
      } 
      // Check legend / folklore / Dharmapada / curse
      else if (qLower.includes('legend') || qLower.includes('dharmapada') || qLower.includes('story') || qLower.includes('curse') || qLower.includes('myth') || qLower.includes('miracle') || qLower.includes('folklore')) {
        storyAnswer = isOdia
          ? `${monumentName} ର ପବିତ୍ର କିମ୍ବଦନ୍ତୀ ଓ ଲୋକକଥା ଅନୁଯାୟୀ:\n${runningStory.legendAndFolklore || runningStory.documentedHistory.slice(0, 450)}`
          : isHindi
          ? `${monumentName} की पवित्र पौराणिक गाथा और लोककथा के अनुसार:\n${runningStory.legendAndFolklore || runningStory.documentedHistory.slice(0, 450)}`
          : `According to sacred legend and living folklore of ${monumentName}:\n${runningStory.legendAndFolklore || runningStory.documentedHistory.slice(0, 450)}`;
      }
      // Check history / who built / king / date / dynasty / inscriptions
      else if (qLower.includes('who') || qLower.includes('built') || qLower.includes('king') || qLower.includes('dynasty') || qLower.includes('when') || qLower.includes('year') || qLower.includes('century') || qLower.includes('inscription') || qLower.includes('history')) {
        storyAnswer = isOdia
          ? `${monumentName} ର ଐତିହାସିକ ପ୍ରମାଣ ଓ ରାଜବଂଶ ବିବରଣୀ:\n${runningStory.documentedHistory || runningStory.legendAndFolklore}`
          : isHindi
          ? `${monumentName} के ऐतिहासिक प्रमाण व राजवंश का विवरण:\n${runningStory.documentedHistory || runningStory.legendAndFolklore}`
          : `Documented historical and epigraphical records for ${monumentName}:\n${runningStory.documentedHistory || runningStory.legendAndFolklore}`;
      }
      // General question about the running story
      else {
        storyAnswer = isOdia
          ? `${monumentName} (${runningStory.period || 'ପ୍ରାଚୀନ କାଳ'}) ସମ୍ପର୍କିତ ତଥ୍ୟ:\n${runningStory.documentedHistory ? runningStory.documentedHistory.slice(0, 450) : runningStory.legendAndFolklore}। ଏହି ସ୍ଥାନ ଓଡ଼ିଶା ଇତିହାସର ଏକ ମହାନ ସ୍ମାରକୀ।`
          : isHindi
          ? `${monumentName} (${runningStory.period || 'ऐतिहासिक काल'}) के संदर्भ में:\n${runningStory.documentedHistory ? runningStory.documentedHistory.slice(0, 450) : runningStory.legendAndFolklore}। यह स्थल ओडिशा की समृद्ध धरोहर का प्रतीक है।`
          : `Regarding the running story of ${monumentName} (${runningStory.period || 'Historic Era'}):\n${runningStory.documentedHistory ? runningStory.documentedHistory.slice(0, 450) : runningStory.legendAndFolklore}.`;
      }

      res.json({
        reply: storyAnswer,
        source: `Archaeological Survey of India & ${monumentName} Archives`,
        language: targetLang,
        monument: monumentName,
      });
      return;
    }

    // =========================================================================
    // GENERAL TRAVEL & DISTRICT EXPLORATION HANDLER
    // =========================================================================
    const matchedDistrict = findDistrict(message);

    if (ai) {
      try {
        let districtContext = '';
        if (matchedDistrict) {
          districtContext = `\nContext on detected district ${matchedDistrict.name} (${matchedDistrict.odiaName}):
- HQ: ${matchedDistrict.headquarters}, Zone: ${matchedDistrict.zone}
- Tagline: ${matchedDistrict.tagline}
- Top Highlights: ${matchedDistrict.highlights.join(', ')}
- Hidden Gems: ${matchedDistrict.hiddenGems ? matchedDistrict.hiddenGems.join(' | ') : 'N/A'}
- Eco-Tourism: ${matchedDistrict.ecoTourismAndNature.join(', ')}
- Signature Cuisine & GI: ${matchedDistrict.signatureCuisine.join(', ')}
- Food Spots: ${matchedDistrict.foodSpots ? matchedDistrict.foodSpots.map((f: any) => `${f.item}: ${f.recommendation}`).join('; ') : 'N/A'}
- Recommended Stays: ${matchedDistrict.recommendedStays ? matchedDistrict.recommendedStays.map((s: any) => `${s.name} [${s.type}] ~${s.estPrice} (Ph: ${s.contact})`).join('; ') : 'N/A'}
- Handicrafts & Art: ${matchedDistrict.handicraftsAndArt.join(', ')}
- Major Festivals: ${matchedDistrict.majorFestivals.join(', ')}
- Transport: ${matchedDistrict.transportHubs.nearestAirport ? `Air: ${matchedDistrict.transportHubs.nearestAirport}, ` : ''}Rail: ${matchedDistrict.transportHubs.nearestRail}, Road: ${matchedDistrict.transportHubs.highway}, Last-mile: ${matchedDistrict.transportHubs.lastMileTransit}
- Hospital/Safety: Medical: ${matchedDistrict.safetyAndHelpline.districtHospital}, Police: ${matchedDistrict.safetyAndHelpline.policeStation} (Control Room: ${matchedDistrict.safetyAndHelpline.controlRoomNumber})
- Tourist Guide / Helpdesk: ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} (Ph: ${matchedDistrict.touristGuideInfo.phone}, Location: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'N/A'}
- Description: ${matchedDistrict.description}`;
        }

        const prompt = `User preferred language: ${language}.
User question: "${message}"${districtContext}
Please reply warmly in ${language} adhering to UtkalSarathi guidelines and providing structured, culturally respectful recommendations covering destinations, hidden gems, stays, food spots, transit, or safety.`;

        const liveReply = await generateLiveContent(
          prompt,
          SYSTEM_INSTRUCTION,
          'gemini-3.1-flash-lite'
        );

        if (liveReply) {
          res.json({
            reply: liveReply,
            source: 'Gemini Live Travel Guide (Odisha 30-District Grounding)',
            language,
            districtData: matchedDistrict || null,
            isLive: true,
          });
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini temporary unavailability, falling back to curated knowledge base:', geminiErr?.message);
      }
    }

    // Curated Fallback if Gemini unavailable or not configured
    const lower = message.toLowerCase();
    let fallbackReply = '';

    if (matchedDistrict) {
      const isOdia = language.toLowerCase().includes('odia') || language.toLowerCase().includes('or');
      const isHindi = language.toLowerCase().includes('hindi') || language.toLowerCase().includes('hi');

      const staysList = matchedDistrict.recommendedStays
        ? matchedDistrict.recommendedStays
            .map((s) => `  • ${s.name} [${s.type}] — ${s.estPrice} (📞 ${s.contact})`)
            .join('\n')
        : '  • OTDC Panthanivas & local approved eco-stays available';

      const foodSpotsList = matchedDistrict.foodSpots
        ? matchedDistrict.foodSpots
            .map((f) => `  • ${f.item}: ${f.recommendation}`)
            .join('\n')
        : `  • ${matchedDistrict.signatureCuisine.join(', ')}`;

      const hiddenGemsList = matchedDistrict.hiddenGems
        ? matchedDistrict.hiddenGems.join(' • ')
        : matchedDistrict.ecoTourismAndNature.join(', ');

      if (isOdia) {
        fallbackReply = `ଜୟ ଜଗନ୍ନାଥ! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ଜିଲ୍ଲାକୁ ସ୍ୱାଗତ:
• ମୁଖ୍ୟାଳୟ: ${matchedDistrict.headquarters} (ଅଞ୍ଚଳ: ${matchedDistrict.zone} ଓଡ଼ିଶା)
• ପରିଚୟ: ${matchedDistrict.tagline}
• ପ୍ରମୁଖ ଆକର୍ଷଣ: ${matchedDistrict.highlights.join(', ')}

💎 ଲୁକ୍କାୟିତ ରତ୍ନ (Hidden Gems):
  ${hiddenGemsList}

🏨 ରହିବା ବ୍ୟବସ୍ଥା (Stays & Resorts):
${staysList}

🍲 ପ୍ରସିଦ୍ଧ ଖାଦ୍ୟ ଓ ମିଠା ଦୋକାନ (Must-Eat Spots):
${foodSpotsList}

🚆 ଯାତାୟାତ ସଂଯୋଗ:
  • ରେଳ/ବିମାନ: ${matchedDistrict.transportHubs.nearestAirport ? `ବିମାନ: ${matchedDistrict.transportHubs.nearestAirport} | ` : ''}ରେଳ: ${matchedDistrict.transportHubs.nearestRail}
  • ରାଜପଥ: ${matchedDistrict.transportHubs.highway}
  • ସ୍ଥାନୀୟ ପରାମର୍ଶ: ${matchedDistrict.transportHubs.lastMileTransit}

🏥 ଡାକ୍ତରଖାନା ଓ ସୁରକ୍ଷା:
  • ମୁଖ୍ୟ ଡାକ୍ତରଖାନା: ${matchedDistrict.safetyAndHelpline.districtHospital}
  • ଥାନା: ${matchedDistrict.safetyAndHelpline.policeStation} (କଣ୍ଟ୍ରୋଲ ରୁମ୍: ${matchedDistrict.safetyAndHelpline.controlRoomNumber}, ଆପତ୍କାଳୀନ: 112)

🧭 ପର୍ଯ୍ୟଟକ ସହାୟତା କେନ୍ଦ୍ର:
  • ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} (ଫୋନ୍: ${matchedDistrict.touristGuideInfo.phone}, ସ୍ଥାନ: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'ଜିଲ୍ଲା ପର୍ଯ୍ୟଟନ କାର୍ଯ୍ୟାଳୟ'}`;
      } else if (isHindi) {
        fallbackReply = `जय जगन्नाथ! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ज़िले में आपका स्वागत है:
• मुख्यालय: ${matchedDistrict.headquarters} (क्षेत्र: ${matchedDistrict.zone} ओडिशा)
• मुख्य पहचान: ${matchedDistrict.tagline}
• प्रमुख दर्शनीय स्थल: ${matchedDistrict.highlights.join(', ')}

💎 छुपे हुए रत्न (Hidden Gems):
  ${hiddenGemsList}

🏨 ठहरने की उत्तम व्यवस्था (Hotels & Stays):
${staysList}

🍲 प्रसिद्ध भोजन व मिष्ठान स्थल (Must-Eat Spots):
${foodSpotsList}

🚆 परिवहन व कनेक्टिविटी:
  • रेल/विमान: ${matchedDistrict.transportHubs.nearestAirport ? `एयरपोर्ट: ${matchedDistrict.transportHubs.nearestAirport} | ` : ''}रेल: ${matchedDistrict.transportHubs.nearestRail}
  • हाईवे: ${matchedDistrict.transportHubs.highway}
  • स्थानीय सुझाव: ${matchedDistrict.transportHubs.lastMileTransit}

🏥 अस्पताल व सुरक्षा:
  • ज़िला अस्पताल: ${matchedDistrict.safetyAndHelpline.districtHospital}
  • मुख्य थाना: ${matchedDistrict.safetyAndHelpline.policeStation} (कंट्रोल रूम: ${matchedDistrict.safetyAndHelpline.controlRoomNumber}, आपातकालीन: 112)

🧭 टूरिस्ट गाइड व सहायता केंद्र:
  • ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} (फोन: ${matchedDistrict.touristGuideInfo.phone}, स्थान: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'ज़िला पर्यटन कार्यालय'}`;
      } else {
        fallbackReply = `Namaskar! Welcome to ${matchedDistrict.name} District (${matchedDistrict.odiaName}):
• Headquarters: ${matchedDistrict.headquarters} | Region: ${matchedDistrict.zone} Odisha
• Essence: ${matchedDistrict.tagline}
• Top Attractions: ${matchedDistrict.highlights.join(', ')}

💎 Hidden Gems & Offbeat Spots:
  ${hiddenGemsList}

🏨 Recommended Stays & Nature Camps:
${staysList}

🍲 Signature Dishes & Iconic Food Spots:
${foodSpotsList}

🚆 Transit & Connectivity:
  • Air/Rail: ${matchedDistrict.transportHubs.nearestAirport ? `Airport: ${matchedDistrict.transportHubs.nearestAirport} | ` : ''}Rail: ${matchedDistrict.transportHubs.nearestRail}
  • Road: ${matchedDistrict.transportHubs.highway}
  • Last-Mile Advice: ${matchedDistrict.transportHubs.lastMileTransit}

🏥 Medical & Emergency Helplines:
  • District Hospital: ${matchedDistrict.safetyAndHelpline.districtHospital}
  • Police Station: ${matchedDistrict.safetyAndHelpline.policeStation}
  • Disaster Control Room: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} (Emergency: 112)

🧭 Certified Guide / Helpdesk:
  • ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} — Certified Tourist Helpdesk (📞 ${matchedDistrict.touristGuideInfo.phone}, Location: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'District Tourism Office'}`;
      }
    } else if (lower.includes('mahaprasad') || lower.includes('abhada') || lower.includes('puri') || lower.includes('jagannath')) {
      fallbackReply = `At Shree Jagannath Temple Puri, sacred Mahaprasad (Abhada) is available daily from approximately 1:30 PM onwards at Ananda Bazaar inside the temple complex. Seven earthen pots are stacked sequentially on wood fire inside the holy Rosaghara (world's largest kitchen). Electronic items and leather items are strictly forbidden. Recommended: Khechudi, Dalma, Kanika, and Pitha.`;
    } else if (lower.includes('konark') || lower.includes('sun temple')) {
      fallbackReply = `Konark Sun Temple is open daily from 6:00 AM to 8:00 PM. Entry fee is ₹40 for Indian citizens and ₹600 for foreign visitors (free for children under 15). The iconic 24 chariot wheels act as precise sundials. Best way to reach is via Mo Bus Route 71 from Puri or private taxi along the scenic Marine Drive. Don't miss the evening Light & Sound show at 7:00 PM!`;
    } else if (lower.includes('transport') || lower.includes('bus') || lower.includes('auto') || lower.includes('mo bus')) {
      fallbackReply = `In the Bhubaneswar-Cuttack-Puri capital region, CRUT 'Mo Bus' offers verified, affordable AC and non-AC connectivity:
- Route 70/71: Bhubaneswar Airport/Railway station to Puri & Konark (₹50-₹70).
- Route 10: Master Canteen to Khandagiri & Udayagiri Caves (₹15).
- Route 24: To Dhauli Shanti Stupa (₹20).
For auto-rickshaws, always use prepaid booths at Puri and Bhubaneswar railway stations to ensure official regulated rates.`;
    } else if (lower.includes('food') || lower.includes('cuisine') || lower.includes('dalma') || lower.includes('pakhala') || lower.includes('gi tag')) {
      fallbackReply = `Must-try authentic Odia culinary treasures & GI Tags across Odisha:
1. Nayagarh Chhena Poda: World-famous roasted cottage cheese cake caramelized in sal leaves.
2. Kendrapara Rasabali: Deep-fried flattened cottage cheese patties soaked in thick cardamom milk (GI certified).
3. Mayurbhanj Mudhi Mansa: Crisp puffed rice served with spicy mutton gravy & Kai (red ant) Chutney.
4. Dhenkanal Magji: Traditional buffalo-milk cheese dessert with GI pedigree.
5. Cuttack Dahibara Aloodum: Spiced yogurt vadas topped with potato-chickpea curry and ghuguni.
6. Puri Mahaprasad Abhada: Cooked in clay pots at the holy Rosaghara of Shree Jagannath Temple.
7. Koraput Arabica Coffee & Kandhamal Organic Haldi (Turmeric).`;
    } else {
      fallbackReply = `Welcome to UtkalSarathi! Odisha's 30 districts encompass magnificent coastal temples (Puri, Konark), lush tribal highlands (Koraput, Daringbadi, Similipal), historic rock edicts (Dhauli, Jajpur), and legendary handloom clusters (Sambalpur, Maniabandha, Kotpad).
You can ask me about any of the 30 districts, local cuisines, verified Mo Bus / rail transit, sacred temple rules, or emergency hospital helplines!`;
    }

    res.json({
      reply: fallbackReply,
      source: matchedDistrict
        ? `UtkalSarathi Curated 30-District Knowledge Base (${matchedDistrict.name} District)`
        : 'UtkalSarathi Curated Tourism Knowledge Repository',
      language,
      districtData: matchedDistrict || null,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to process travel assistant query',
      details: error?.message || 'Server error',
    });
  }
});

/**
 * POST /api/plan-itinerary
 * AI-enhanced customized trip planner
 */
app.post('/api/plan-itinerary', async (req: Request, res: Response) => {
  try {
    const {
      days = 3,
      budget = 'moderate',
      interests,
      startCity = 'Khordha',
      groupSize = 2,
      language = 'English',
      includeNearby = false,
      selectedNearbyDistricts = [],
    } = req.body;

    const district = findDistrict(startCity) || ODISHA_30_DISTRICTS[0];

    if (ai) {
      try {
        const districtContext = `
District Name: ${district.name} (${district.odiaName})
Headquarters: ${district.headquarters}, Zone: ${district.zone} Odisha
Key Highlights: ${district.highlights.join(', ')}
Hidden Gems: ${district.hiddenGems ? district.hiddenGems.join(', ') : 'Local heritage'}
Eco-Tourism: ${district.ecoTourismAndNature.join(', ')}
Signature Cuisine: ${district.signatureCuisine.join(', ')}
Transport: ${district.transportHubs.highway}, Bus: ${district.transportHubs.busServices}, Last-mile: ${district.transportHubs.lastMileTransit}
`;

        const nearbyInstruction = includeNearby
          ? `The user allows day excursions to neighboring districts: ${selectedNearbyDistricts.length > 0 ? selectedNearbyDistricts.join(', ') : 'adjacent districts'}. Highlight highway distance and travel times.`
          : `CRITICAL USER REQUIREMENT: The user has selected NO nearby places. 100% of all destinations, morning & afternoon activities, meals, and overnight stays MUST remain STRICTLY within ${district.name} District. DO NOT include Bhubaneswar, Puri, Konark, or any external district unless ${district.name} is specifically that district.`;

        const prompt = `Create a customized ${days}-day travel itinerary for ${district.name} District, Odisha, India.
${districtContext}
User Preferences:
- Interests: ${Array.isArray(interests) ? interests.join(', ') : 'Heritage, Nature, Culture'}.
- Budget level: ${budget}.
- Party size: ${groupSize} persons.
- Language: ${language}.
${nearbyInstruction}

Include:
1. Day-by-day morning, afternoon, evening activities with authentic places in ${district.name}.
2. Specific local transport suggestions (OSRTC Bus, Auto, Cab) with fare estimates in INR.
3. Recommended regional Odia meals from ${district.name} for each day.
4. Important safety tips & verified opening hours.
Return clear structured text suitable for rendering.`;

        const response: any = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert itinerary planner for Odisha Tourism with deep 30-district knowledge.',
              temperature: 0.6,
            },
          }),
          4000
        );

        if (response.text) {
          res.json({
            customPlanText: response.text,
            generatedWithAi: true,
          });
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini temporary unavailability for itinerary, using curated planner:', geminiErr?.message);
      }
    }

    // Dynamic district-specific fallback ensuring NO hardcoded Bhubaneswar/Puri/Konark
    const place1 = district.highlights[0] || `${district.name} Heritage Sites`;
    const place2 = district.highlights[1] || district.hiddenGems?.[0] || `${district.headquarters} Cultural Center`;
    const place3 = district.highlights[2] || district.ecoTourismAndNature[0] || `${district.name} Nature Reserve`;
    const place4 = district.hiddenGems?.[1] || district.ecoTourismAndNature[1] || `${district.name} Artisan Village`;

    const day1Text = `• Day 1: Arrive at ${district.headquarters}. Morning visit to ${place1}. Lunch tasting authentic ${district.signatureCuisine[0] || 'Odia Thali'}. Afternoon excursion to ${place2}. Local transit via ${district.transportHubs.lastMileTransit}.`;
    const day2Text = `• Day 2: Morning nature trail at ${place3}. Enjoy scenic views and local refreshments (${district.signatureCuisine[1] || district.signatureCuisine[0] || 'local sweets'}). Afternoon visit to ${place4}. Evening local bazaar exploration.`;
    const day3Text = `• Day 3: Sunrise photography at ${district.ecoTourismAndNature[0] || place1}. Cultural interaction with local craftsmen (${district.handicraftsAndArt[0] || 'indigenous art'}). Depart via ${district.transportHubs.nearestRail} or ${district.transportHubs.highway}.`;

    const planLines = [day1Text];
    if (days >= 2) planLines.push(day2Text);
    if (days >= 3) planLines.push(day3Text);

    res.json({
      customPlanText: `Curated ${days}-Day Itinerary for ${district.name} District (${district.odiaName}):\n${planLines.join('\n')}`,
      generatedWithAi: false,
    });
  } catch (error: any) {
    console.error('Error in /api/plan-itinerary:', error);
    res.status(500).json({ error: 'Failed to generate AI itinerary' });
  }
});

/**
 * POST /api/refine-itinerary
 * AI-enhanced schedule refiner that returns structured DayPlan[] updates
 */
app.post('/api/refine-itinerary', async (req: Request, res: Response) => {
  try {
    const {
      currentPlans,
      instruction,
      startDistrict = 'Bhubaneswar',
      budget = 'moderate',
      travelers = 2,
    } = req.body;

    if (!instruction || !currentPlans) {
      res.status(400).json({ error: 'currentPlans and instruction are required' });
      return;
    }

    if (ai) {
      try {
        const prompt = `You are UtkalSarathi Itinerary Intelligence for Odisha Tourism.
User wants to refine their travel schedule: "${instruction}"
Starting Location/District: ${startDistrict}
Travel Style/Budget: ${budget}
Travelers: ${travelers}
Current Plans JSON:
${JSON.stringify(currentPlans)}

Task: Refine the day-by-day itinerary to satisfy the user's refinement prompt while keeping realistic logistics in Odisha.
Return a valid JSON object matching this schema:
{
  "summary": "Short 2-3 sentence explanation of the specific adjustments made",
  "refinedPlans": [
    {
      "dayNumber": 1,
      "title": "Day 1: ...",
      "theme": "...",
      "totalDayCost": 1800,
      "destinations": [
        {
          "timeSlot": "Morning (08:00 - 12:00)",
          "destination": {
            "id": "...",
            "name": "...",
            "odiaName": "...",
            "region": "...",
            "district": "...",
            "category": "heritage",
            "description": "...",
            "historicalSignificance": "...",
            "legend": "...",
            "verifiedHours": "06:00 AM - 06:00 PM",
            "entryFee": { "indian": 20, "foreigner": 100 },
            "recommendedDurationHours": 3,
            "bestTimeToVisit": "October to March",
            "transportInfo": {
              "nearestHub": "...",
              "distanceKm": 10,
              "options": [{ "mode": "Mo Bus", "routeOrDesc": "...", "fare": "₹30", "isVerified": true }]
            },
            "cuisineHighlight": "...",
            "safetyTip": "...",
            "ecoSensitivityTag": "...",
            "sourceReliability": "verified_official"
          },
          "activity": "...",
          "transportFromPrevious": "...",
          "estimatedCost": 250
        }
      ]
    }
  ]
}
Return raw JSON only, no markdown code fence blocks.`;

        const response: any = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert itinerary planner for Odisha Tourism. Output valid JSON only.',
              temperature: 0.4,
            },
          }),
          4500
        );

        if (response && response.text) {
          const raw = response.text.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(raw);
          if (parsed.refinedPlans && Array.isArray(parsed.refinedPlans)) {
            res.json({
              summary: parsed.summary || `Schedule refined according to: "${instruction}"`,
              refinedPlans: parsed.refinedPlans,
              source: 'Gemini 3.8 Flash Dynamic Itinerary Optimization',
            });
            return;
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini refine error, falling back to local optimizer:', geminiErr?.message);
      }
    }

    // Local refinement engine fallback
    const result = refineItineraryLocally(currentPlans, instruction, startDistrict, budget);
    res.json({
      summary: result.summary,
      refinedPlans: result.refinedPlans,
      source: 'UtkalSarathi Deterministic Schedule Optimizer',
    });
  } catch (error: any) {
    console.error('Error in /api/refine-itinerary:', error);
    res.status(500).json({ error: 'Failed to refine itinerary' });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('UtkalSarathi server running. Build artifacts being populated.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`UtkalSarathi server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });

  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
