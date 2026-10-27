export interface MonumentVoiceProfile {
  id: string; // matches story.id (e.g. 'story-konark')
  placeName: {
    en: string;
    or: string;
    hi: string;
  };
  narratorName: {
    en: string;
    or: string;
    hi: string;
  };
  voicePersonaTitle: {
    en: string;
    or: string;
    hi: string;
  };
  timbreDescription: string;
  basePitch: number; // 0.80 to 1.15 for distinct pitch identity
  rateMultiplier: number; // 0.88 to 1.08 for distinct speaking tempo
  droneRootFreqs: [number, number, number, number]; // Harmonic frequencies for Web Audio Tanpura
  preferredVoiceGender: 'male' | 'female';
  culturalGreeting: {
    or: string;
    hi: string;
    en: string;
  };
  curatedQuestions: {
    en: string;
    or: string;
    hi: string;
  }[];
}

export const MONUMENT_VOICE_PROFILES: Record<string, MonumentVoiceProfile> = {
  'story-konark': {
    id: 'story-konark',
    placeName: {
      en: 'Konark Sun Temple',
      or: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର',
      hi: 'कोणार्क सूर्य मंदिर',
    },
    narratorName: {
      en: 'Master Sthapati Bisu Maharana',
      or: 'ମୁଖ୍ୟ ସ୍ଥପତି ବିଶୁ ମହାରଣା',
      hi: 'मुख्य वास्तुकार बिशु महाराणा',
    },
    voicePersonaTitle: {
      en: 'Imperial Sthapati & Master Guild Architect',
      or: 'କଳିଙ୍ଗର ପ୍ରଧାନ ଶିଳ୍ପୀ ଓ ସ୍ଥାପତ୍ୟ ଗୁରୁ',
      hi: 'कलिंग के मुख्य वास्तुकार व शिल्पी गुरु',
    },
    timbreDescription: 'Deep, resonant architectural baritone with majestic imperial gravitas (D2/A2 tanpura resonance).',
    basePitch: 0.88,
    rateMultiplier: 0.94,
    droneRootFreqs: [73.42, 110.0, 146.83, 220.0], // D2 + A2 Royal Raga Bhairav root
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ମୁଁ ମୁଖ୍ୟ ସ୍ଥପତି ବିଶୁ ମହାରଣା, କୋଣାର୍କ ସୂର୍ଯ୍ୟ ରଥର ଅମର ଶିଳ୍ପୀ।',
      hi: 'नमस्कार! मैं मुख्य वास्तुकार बिशु महाराणा, कोणार्क सूर्य रथ का अमर शिल्पी।',
      en: 'Namaskar! I am Master Sthapati Bisu Maharana, chief architect of the Konark Solar Chariot.',
    },
    curatedQuestions: [
      {
        or: '୧୨୦୦ ବଢ଼େଇ କାହିଁକି ଦଧିନଉତି ବସାଇ ପାରିନଥିଲେ ଏବଂ ଧର୍ମପଦ କିପରି ସଫଳ ହେଲେ?',
        hi: '1200 शिल्पकार कलश क्यों नहीं बैठा पाए और धर्मपद ने इसे कैसे संभव किया?',
        en: 'Why did the 1,200 sculptors struggle with the crown, and how did 12-year-old Dharmapada solve it?',
      },
      {
        or: 'କୋଣାର୍କର ୨୪ଟି ଚକ୍ର କିପରି ସୂର୍ଯ୍ୟଘଣ୍ଟା ଭାବରେ ପ୍ରତି ମିନିଟର ସମୟ କୁହେ?',
        hi: 'कोणार्क के 24 चक्र किस प्रकार धूपघड़ी बनकर मिनट-दर-मिनट समय बताते हैं?',
        en: 'How do the 24 stone wheels of Konark function as precise astronomical sundials?',
      },
      {
        or: '୧୯୦୧ ମସିହାରେ ବ୍ରିଟିଶ ସରକାର ଜଗମୋହନ ଭିତରେ ବାଲି କାହିଁକି ଭର୍ତ୍ତି କରିଥିଲେ?',
        hi: '1901 में ब्रिटिश प्रशासन ने जगमोहन के अंदर रेत भरकर इसे सील क्यों किया था?',
        en: 'Why did British conservators backfill and seal the Jagamohana with sand in 1901?',
      },
    ],
  },

  'story-puri-jagannath': {
    id: 'story-puri-jagannath',
    placeName: {
      en: 'Shree Jagannath Temple, Puri',
      or: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, ପୁରୀ',
      hi: 'श्री जगन्नाथ मंदिर, पुरी',
    },
    narratorName: {
      en: 'Daitapati Sevayat & Temple Chronicler',
      or: 'ଦଇତାପତି ସେବାୟତ ଓ ମାଦଳା ପାଞ୍ଜି ଗବେଷକ',
      hi: 'दैतापति सेवायत एवं मदला पांजी शोधकर्ता',
    },
    voicePersonaTitle: {
      en: 'Sacred Temple Chronicler & Daru Brahma Guardian',
      or: 'ଶ୍ରୀମନ୍ଦିର ଗୁପ୍ତ ଲୀଳା ଓ ଦାରୁବ୍ରହ୍ମ ସୁରକ୍ଷାକାରୀ',
      hi: 'श्रीमंदिर गुप्त लीला व दारू ब्रह्म संरक्षक',
    },
    timbreDescription: 'Devotional, lyrical, reverent tenor echoing ancient Madala Panji palm-leaf chants (F#2/C#3 drone).',
    basePitch: 1.08,
    rateMultiplier: 0.95,
    droneRootFreqs: [92.5, 138.6, 185.0, 277.2], // F#2 + C#3 Devotional Raga Bhairavi
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୟ ଜଗନ୍ନାଥ! ମୁଁ ଶ୍ରୀମନ୍ଦିରର ଦଇତାପତି ସେବାୟତ, ପୁରୁଷୋତ୍ତମ କ୍ଷେତ୍ରର ଚିରନ୍ତନ ସେବକ।',
      hi: 'जय जगन्नाथ! मैं श्रीमंदिर का दैतापति सेवायत, पुरुषोत्तम क्षेत्र का चिरंतन सेवक।',
      en: 'Jay Jagannath! I am the Daitapati Sevayat and chronicler of Purushottama Kshetra.',
    },
    curatedQuestions: [
      {
        or: 'ଶ୍ରୀମନ୍ଦିର ଉପରେ ହୋଇଥିବା ୧୮ ଥର ଆକ୍ରମଣ ସମୟରେ ଦାରୁବ୍ରହ୍ମଙ୍କୁ କିପରି ସୁରକ୍ଷିତ ରଖାଯାଇଥିଲା?',
        hi: 'श्रीमंदिर पर हुए 18 हमलों के दौरान दारू ब्रह्म को किस प्रकार सुरक्षित रखा गया?',
        en: 'How did the Sevayats protect Daru Brahma across Chilika and hills during the 18 invasions?',
      },
      {
        or: 'ନବକଳେବର ଓ ବ୍ରହ୍ମ ପରିବର୍ତ୍ତନର ଗୂଢ଼ ରହସ୍ୟ କ’ଣ?',
        hi: 'नवकलेवर और ब्रह्म परिवर्तन का गूढ़ रहस्य क्या है?',
        en: 'What is the sacred mystery and ritual of Nabakalebara and Brahma Paribartan?',
      },
      {
        or: 'ଶ୍ରୀମନ୍ଦିର ରୋଷଘରେ ୫୬ ଭୋଗ କିପରି ମାଟି ପାତ୍ରରେ ପାକ ହୁଏ?',
        hi: 'श्रीमंदिर रसोई में मिट्टी के 7 बर्तनों में छप्पन भोग कैसे पकाया जाता है?',
        en: 'How does the world-largest traditional earthen kitchen prepare Mahaprasad on 240 hearths?',
      },
    ],
  },

  'story-dhauli': {
    id: 'story-dhauli',
    placeName: {
      en: 'Dhauli Shanti Stupa & Ashokan Edicts',
      or: 'ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ଅଶୋକୀୟ ଶିଳାଲେଖ',
      hi: 'धौली शांति स्तूप एवं अशोक शिलालेख',
    },
    narratorName: {
      en: 'Buddhist Monk Elder Upagupta',
      or: 'ସ୍ଥବିର ବୌଦ୍ଧ ଭିକ୍ଷୁ ଉପଗୁପ୍ତ',
      hi: 'स्थविर बौद्ध भिक्षु उपगुप्त',
    },
    voicePersonaTitle: {
      en: 'Enlightened Buddhist Hermit & Peace Sage',
      or: 'ଅହିଂସା ଓ ଧର୍ମବିଜୟର ମାର୍ଗଦର୍ଶକ ସନ୍ନ୍ୟାସୀ',
      hi: 'अहिंसा व धर्म-विजय के मार्गदर्शक संन्यासी',
    },
    timbreDescription: 'Whispered serenity, meditative calm, and solemn philosophical warmth (E2/B2 singing bowl resonance).',
    basePitch: 0.94,
    rateMultiplier: 0.90,
    droneRootFreqs: [82.41, 123.47, 164.81, 246.94], // E2 + B2 Meditative Zen Bowl
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମୋ ବୁଦ୍ଧାୟ! ମୁଁ ଭିକ୍ଷୁ ଉପଗୁପ୍ତ, ଦୟା ନଦୀ ତଟରେ ସମ୍ରାଟ ଅଶୋକଙ୍କ ହୃଦୟ ପରିବର୍ତ୍ତନର ସାକ୍ଷୀ।',
      hi: 'नमो बुद्धाय! मैं भिक्षु उपगुप्त, दया नदी तट पर सम्राट अशोक के हृदय परिवर्तन का साक्षी।',
      en: 'Namo Buddhaya! I am Monk Upagupta, witness to Emperor Ashoka’s conversion at Daya River.',
    },
    curatedQuestions: [
      {
        or: 'ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ କଳିଙ୍ଗ ଯୁଦ୍ଧ କିପରି ସମ୍ରାଟ ଅଶୋକଙ୍କୁ ଚଣ୍ଡାଶୋକରୁ ଧର୍ମାଶୋକ କଲା?',
        hi: 'ईसा पूर्व 261 के कलिंग युद्ध ने सम्राट अशोक को चंडाशोक से धर्माशोक कैसे बनाया?',
        en: 'How did the Kalinga War of 261 BCE transform Ashoka from conqueror to apostle of peace?',
      },
      {
        or: 'ଧଉଳିର ପଥର-ଖୋଦିତ ପ୍ରାଚୀନ ହାତୀ ମୂର୍ତ୍ତିର ଐତିହାସିକ ଗୁରୁତ୍ୱ କ’ଣ?',
        hi: 'धौली की चट्टान से तराशी गई प्राचीन हाथी प्रतिमा का ऐतिहासिक महत्व क्या है?',
        en: 'What is the significance of the 3rd century BCE rock-cut elephant at Dhauli?',
      },
      {
        or: '୧୯୭୨ ମସିହାରେ ନିର୍ମିତ ଭାରତ-ଜାପାନ ଶାନ୍ତି ସ୍ତୂପର ବାର୍ତ୍ତା କ’ଣ?',
        hi: '1972 में बने भारत-जापान शांति स्तूप का विश्व शांति संदेश क्या है?',
        en: 'What is the history of the 1972 Indo-Japanese White Peace Pagoda atop Dhauli?',
      },
    ],
  },

  'story-khandagiri-udayagiri': {
    id: 'story-khandagiri-udayagiri',
    placeName: {
      en: 'Udayagiri & Khandagiri Caves',
      or: 'ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ପ୍ରାଚୀନ ଗୁମ୍ଫା',
      hi: 'उदयगिरि एवं खंडगिरि प्राचीन गुफाएं',
    },
    narratorName: {
      en: 'Imperial Herald of Emperor Kharavela',
      or: 'ମହାମେଘବାହନ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ରାଜଦୂତ',
      hi: 'महामेघवाहन सम्राट खारवेल के राजघोषक',
    },
    voicePersonaTitle: {
      en: 'Imperial Royal Herald & Hathigumpha Epigraphist',
      or: 'କଳିଙ୍ଗର ବିଜୟୀ ରାଜଦୂତ ଓ ଶିଳାଲେଖ ପ୍ରବକ୍ତା',
      hi: 'कलिंग के विजयी राजघोषक व शिलालेख प्रवक्ता',
    },
    timbreDescription: 'Commanding, triumphant martial herald reciting Hathigumpha Prakrit edicts with brass resonance (G2/D3).',
    basePitch: 0.86,
    rateMultiplier: 1.04,
    droneRootFreqs: [98.0, 146.83, 196.0, 293.66], // G2 + D3 Triumphant Raga Bilawal
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୟତୁ କଳିଙ୍ଗ! ମୁଁ ମହାମେଘବାହନ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ରାଜଦୂତ, କଳିଙ୍ଗର ଗୌରବ ଗାଥାର ଉଦ୍‌ଘୋଷକ।',
      hi: 'जयतु कलिंग! मैं महामेघवाहन सम्राट खारवेल का राजघोषक, कलिंग के शौर्य का उद्घोषक।',
      en: 'Jayatu Kalinga! I am the Imperial Herald of Emperor Kharavela of the Mahameghavahanas.',
    },
    curatedQuestions: [
      {
        or: 'ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖର ୧୭ ଧାଡ଼ିରେ ସମ୍ରାଟ ଖାରବେଳଙ୍କ କେଉଁ ବିଜୟ ବର୍ଣ୍ଣନା ଅଛି?',
        hi: 'हाथीगुम्फा शिलालेख की 17 पंक्तियों में सम्राट खारवेल के किन अभियानों का वर्णन है?',
        en: 'What do the 17 lines of the Hathigumpha Brahmi inscription reveal about Kharavela’s reign?',
      },
      {
        or: 'ରାଣୀ ଗୁମ୍ଫା ଦ୍ୱିତଳ ନାଟ୍ୟଶାଳାର ସ୍ଥାପତ୍ୟ ଏବଂ ଧ୍ୱନି ବିଜ୍ଞାନ କିପରି କାର୍ଯ୍ୟ କରୁଥିଲା?',
        hi: 'रानी गुम्फा की दो-मंजिला रंगशाला का ध्वनिशास्त्र (Acoustics) कैसे काम करता था?',
        en: 'How was the double-storied Rani Gumpha engineered as an acoustic royal amphitheatre?',
      },
      {
        or: 'ଖଣ୍ଡଗିରିର ବାରଭୁଜୀ ଓ ନବମୁନି ଗୁମ୍ଫାରେ ଜୈନ ତୀର୍ଥଙ୍କର ମୂର୍ତ୍ତିଗୁଡ଼ିକର ବିଶେଷତା କ’ଣ?',
        hi: 'खंडगिरि की गुफाओं में 24 जैन तीर्थंकरों की मूर्तियों की क्या विशेषता है?',
        en: 'What is the significance of the 24 Jain Tirthankara relief carvings in Khandagiri?',
      },
    ],
  },

  'story-lingaraj': {
    id: 'story-lingaraj',
    placeName: {
      en: 'Lingaraj Temple, Bhubaneswar',
      or: 'ଶ୍ରୀ ଲିଙ୍ଗରାଜ ମହାପ୍ରଭୁ ମନ୍ଦିର, ଭୁବନେଶ୍ୱର',
      hi: 'श्री लिंगराज मंदिर, भुवनेश्वर',
    },
    narratorName: {
      en: 'Somavamshi Shaiva Rajaguru',
      or: 'ସୋମବଂଶୀ ଶୈବ ରାଜଗୁରୁ',
      hi: 'सोमवंशी शैव राजगुरु',
    },
    voicePersonaTitle: {
      en: 'Vedic Shaivite High Priest & Ekamra Kshetra Sage',
      or: 'ଏକାମ୍ର କ୍ଷେତ୍ରର ବେଦଜ୍ଞ ପ୍ରଧାନ ପୂଜକ',
      hi: 'एकाम्र क्षेत्र के वेदज्ञ मुख्य पुजारी',
    },
    timbreDescription: 'Deep, reverberating incantation cadence with bell and conch echoes of Hari-Hara (C2/G2).',
    basePitch: 1.02,
    rateMultiplier: 0.93,
    droneRootFreqs: [65.41, 98.0, 130.81, 196.0], // C2 + G2 Omkar Temple Bell
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ନମଃ ଶିବାୟ! ମୁଁ ଏକାମ୍ର କ୍ଷେତ୍ରର ସୋମବଂଶୀ ରାଜଗୁରୁ, ହରି-ହର ଉପାସନାର ସେବକ।',
      hi: 'ॐ नमः शिवाय! मैं एकाम्र क्षेत्र का सोमवंशी राजगुरु, हरि-हर उपासना का सेवक।',
      en: 'Om Namah Shivaya! I am the Somavamshi Shaiva Rajaguru of Ekamra Kshetra Bhubaneswar.',
    },
    curatedQuestions: [
      {
        or: 'ଲିଙ୍ଗରାଜ ମନ୍ଦିରରେ ହରି (ବିଷ୍ଣୁ) ଓ ହର (ଶିବ)ଙ୍କ ସମନ୍ୱିତ ପୂଜାର ରହସ୍ୟ କ’ଣ?',
        hi: 'लिंगराज मंदिर में हरि (विष्णु) और हर (शिव) की समन्वित पूजा का क्या रहस्य है?',
        en: 'Why is the deity of Lingaraj worshipped as both Hari (Vishnu) and Hara (Shiva)?',
      },
      {
        or: 'ସୋମବଂଶୀ ରାଜା ଯଯାତି କେଶରୀ ଓ ଲଲାଟେନ୍ଦୁ କେଶରୀଙ୍କ ନିର୍ମାଣ ଇତିହାସ କ’ଣ?',
        hi: 'राजा ययाति केशरी और ललाटेंदु केशरी द्वारा लिंगराज निर्माण का इतिहास क्या है?',
        en: 'What is the documented 11th century building history by Jajati and Lalatendu Keshari?',
      },
      {
        or: 'ବିନ୍ଦୁସାଗର ହ୍ରଦରେ ଭାରତର ସମସ୍ତ ପବିତ୍ର ତୀର୍ଥ ଜଳ କିପରି ସଂରକ୍ଷିତ ହୋଇଛି?',
        hi: 'बिंदुसागर सरोवर में भारत के सभी पवित्र तीर्थों का जल कैसे समाहित है?',
        en: 'How was the sacred Bindusagar Lake sanctified with waters from every holy tirtha of India?',
      },
    ],
  },

  'story-cuttack-barabati': {
    id: 'story-cuttack-barabati',
    placeName: {
      en: 'Barabati Fort & Cuttack Millennial City',
      or: 'ବାରବାଟୀ ଦୁର୍ଗ ଓ କଟକ ହଜାର ବର୍ଷର ଐତିହ୍ୟ',
      hi: 'बारबाटी किला एवं कटक सहस्राब्दी नगर',
    },
    narratorName: {
      en: 'Buxi Jagabandhu & Gajapati Paika General',
      or: 'ବକ୍ସି ଜଗବନ୍ଧୁ ଓ ପାଇକ ସେନାପତି',
      hi: 'बक्सी जगबंधु व पाइक सेनापति',
    },
    voicePersonaTitle: {
      en: 'Paika Martial Commander & Fortress Defender',
      or: 'ବୀର ପାଇକ ସେନାଧ୍ୟକ୍ଷ ଓ ଗଜପତି ଦୁର୍ଗରକ୍ଷକ',
      hi: 'वीर पाइक सेनाध्यक्ष व गजपति दुर्ग रक्षक',
    },
    timbreDescription: 'Fierce, heroic, urgent war-cry resonance echoing the 9-storey fortress defense (D#2/A#2).',
    basePitch: 0.84,
    rateMultiplier: 1.06,
    droneRootFreqs: [77.78, 116.54, 155.56, 233.08], // D#2 + A#2 Martial Battle Drone
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ବନ୍ଦେ ଉତ୍କଳ ଜନନୀ! ମୁଁ ବାରବାଟୀର ପାଇକ ସେନାପତି, ମହାନଦୀ କୂଳର ବୀର ପ୍ରହରୀ।',
      hi: 'वंदे उत्कल जननी! मैं बारबाटी का पाइक सेनापति, महानदी तट का वीर प्रहरी।',
      en: 'Vande Utkala Janani! I am the Paika Commander of Barabati Fort on the Mahanadi.',
    },
    curatedQuestions: [
      {
        or: 'ଅନଙ୍ଗଭୀମ ଦେବ ତୃତୀୟ କିପରି ୧୨୧୧ ମସିହାରେ ବାରବାଟୀ ଦୁର୍ଗ ନିର୍ମାଣ କରିଥିଲେ?',
        hi: 'अनंगभीम देव तृतीय ने 1211 ईस्वी में बारबाटी किले की नींव कैसे रखी?',
        en: 'How did King Anangabhima Deva III construct Barabati Fort in 1211 CE?',
      },
      {
        or: 'ନବତଳ ପ୍ରାସାଦ ଓ ଗଡ଼ଖାଇର ପ୍ରତିରକ୍ଷା ରଣନୀତି କିପରି ବିଦେଶୀ ସେନାକୁ ଅଟକାଉଥିଲା?',
        hi: 'बारबाटी के 9-मंजिला महल और गहरी खाई की सैन्य सुरक्षा प्रणाली कैसी थी?',
        en: 'How did the nine-storey citadel and all-surrounding moat repel Mughal and British sieges?',
      },
      {
        or: 'କଟକର ତାରକସି ରୂପା କାମ ଏବଂ ଦହିବରା-ଆଳୁଦମର ସାଂସ୍କୃତିକ ପରମ୍ପରା କ’ଣ?',
        hi: 'कटक की चांदी की तारकशी (फिलिग्री) और प्रसिद्ध दहीबड़ा-आलूदम का इतिहास क्या है?',
        en: 'What is the millennium-old tradition of Cuttack Tarakasi silver filigree and street food?',
      },
    ],
  },

  'story-diamond-triangle': {
    id: 'story-diamond-triangle',
    placeName: {
      en: 'Diamond Triangle (Lalitgiri, Ratnagiri, Udayagiri)',
      or: 'ହୀରାକ ଚତୁର୍ଭୁଜ (ଲଳିତଗିରି, ରତ୍ନଗିରି, ଉଦୟଗିରି)',
      hi: 'डायमंड ट्राएंगल (ललितगिरि, रत्नगिरि, उदयगिरि)',
    },
    narratorName: {
      en: 'Mahayana Abbot of Ratnagiri Mahavihara',
      or: 'ରତ୍ନଗିରି ମହାବିହାରର ମହାଯାନ ଆଚାର୍ଯ୍ୟ',
      hi: 'रत्नगिरि महाविहार के महायान आचार्य',
    },
    voicePersonaTitle: {
      en: 'Vajrayana Buddhist Abbot & Nalanda Contemporary Scholar',
      or: 'ବଜ୍ରଯାନ ବୌଦ୍ଧ ଆଚାର୍ଯ୍ୟ ଓ ପ୍ରାଚୀନ ବିଶ୍ୱବିଦ୍ୟାଳୟ ମୁଖ୍ୟ',
      hi: 'वज्रयान बौद्ध आचार्य व प्राचीन विश्वविद्यालय प्रमुख',
    },
    timbreDescription: 'Gentle, erudite philosophical cadence analyzing Tantric Vajrayana manuscripts (A2/E3).',
    basePitch: 0.98,
    rateMultiplier: 0.92,
    droneRootFreqs: [110.0, 164.81, 220.0, 329.63], // A2 + E3 Scholastic Contemplation
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ମଣିପଦ୍ମେ ହୁଁ! ମୁଁ ରତ୍ନଗିରି ମହାବିହାରର ବୌଦ୍ଧ ଆଚାର୍ଯ୍ୟ, ପୁଷ୍ପଗିରି ଜ୍ଞାନପୀଠର ଗବେଷକ।',
      hi: 'ॐ मणिपद्मे हूँ! मैं रत्नगिरि महाविहार का बौद्ध आचार्य, पुष्पगिरि ज्ञानपीठ का शोधकर्ता।',
      en: 'Om Mani Padme Hum! I am the Abbot of Ratnagiri Mahavihara in the sacred Diamond Triangle.',
    },
    curatedQuestions: [
      {
        or: 'ଲଳିତଗିରି ସ୍ତୂପ ଖନନରୁ ମିଳିଥିବା ସ୍ୱର୍ଣ୍ଣ ପେଟିକା ଭିତରେ ବୁଦ୍ଧଙ୍କ ଅସ୍ଥିଧାତୁ କିପରି ସୁରକ୍ଷିତ ଥିଲା?',
        hi: 'ललितगिरि स्तूप की खुदाई में मिली स्वर्ण मंजूषा में तथागत बुद्ध की अस्थियां कैसे मिलीं?',
        en: 'How were the authentic bone relics of Lord Buddha discovered inside the gold casket at Lalitgiri?',
      },
      {
        or: 'ରତ୍ନଗିରିର ସୁନ୍ଦର କ୍ଲୋରାଇଟ୍ ପ୍ରବେଶ ଦ୍ୱାର ଓ ତନ୍ତ୍ର ବଜ୍ରଯାନର ପ୍ରମୁଖ କେନ୍ଦ୍ର ବିଷୟରେ କୁହନ୍ତୁ?',
        hi: 'रत्नगिरि का अद्भुत नक्काशीदार द्वार और तिब्बती बौद्ध धर्म (कालचक्र तंत्र) का संबंध क्या है?',
        en: 'Why was Ratnagiri the supreme cradle of Kalachakra Tantra and Tibetan Buddhist learning?',
      },
      {
        or: 'ଚୀନ ପରିବ୍ରାଜକ ହୁଏନସାଂ (Xuanzang) ପୁଷ୍ପଗିରି ବିଶ୍ୱବିଦ୍ୟାଳୟ ବିଷୟରେ କ’ଣ ଲେଖିଛନ୍ତି?',
        hi: 'चीनी यात्री ह्वेनसांग ने ओडिशा के पुष्पगिरि महाविहार के बारे में क्या लिखा था?',
        en: 'What did 7th-century Chinese pilgrim Xuanzang record about the glory of Pushpagiri?',
      },
    ],
  },

  'story-chilika': {
    id: 'story-chilika',
    placeName: {
      en: 'Chilika Lake & Ancient Maritime Ports',
      or: 'ଚିଲିକା ହ୍ରଦ, ପାଲୁର ବନ୍ଦର ଓ ସାଧବପୁଅଙ୍କ ନୌବାଣିଜ୍ୟ',
      hi: 'चिलिका झील, पालुर बंदरगाह व कलिंग का समुद्री व्यापार',
    },
    narratorName: {
      en: 'Sadhabapua Sea Captain of Palur Port',
      or: 'ପାଲୁର ବନ୍ଦରର ପ୍ରଧାନ ସାଧବ ନାବିକ',
      hi: 'पालुर बंदरगाह के प्रधान साधव नाविक',
    },
    voicePersonaTitle: {
      en: 'Ancient Maritime Merchant & Indian Ocean Navigator',
      or: 'ପ୍ରାଚୀନ କଳିଙ୍ଗର ବୋଇତ ନାବିକ ଓ ଦରିଆପାରି ବଣିକ',
      hi: 'प्राचीन कलिंग के बोइत नाविक व समुद्री व्यापारी',
    },
    timbreDescription: 'Weathered oceanic baritone, rhythmic like tidal waves of Boita Bandana (C#2/G#2).',
    basePitch: 0.92,
    rateMultiplier: 1.00,
    droneRootFreqs: [69.3, 103.83, 138.59, 207.65], // C#2 + G#2 Oceanic Sea Drone
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଆ କା ମା ବୈ, ପାନ ଗୁଆ ଥୋଇ! ମୁଁ ଚିଲିକାର ସାଧବପୁଅ, ଜାଭା, ବାଲି, ସୁମାତ୍ରା ଯାତ୍ରାର ନାବିକ।',
      hi: 'आ का मा बै! मैं चिलिका का प्राचीन साधव नाविक, जावा, बाली, सुमात्रा व्यापार का अनुभवी कैप्टन।',
      en: 'Aa Kaa Maa Bai! I am the Sadhabapua sea captain who sailed Boitas to Java, Bali, and Sumatra.',
    },
    curatedQuestions: [
      {
        or: 'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମାର ବୋଇତ ବନ୍ଦାଣ ଉତ୍ସବ ଏବଂ ପ୍ରାଚୀନ ଓଡ଼ିଶାର ସମୁଦ୍ର ବାଣିଜ୍ୟ ଇତିହାସ କ’ଣ?',
        hi: 'कार्तिक पूर्णिमा का "बोइत बंदाण" और प्राचीन ओडिशा के समुद्री व्यापार का क्या महत्व है?',
        en: 'What is the history behind Boita Bandana and Kalinga’s maritime voyages across Southeast Asia?',
      },
      {
        or: 'ଗ୍ରୀକ୍ ଭୂଗୋଳବିତ୍ ଟଲେମି (Ptolemy) ଚିଲିକାର ପାଲୁର (Paloura) ବନ୍ଦର ବିଷୟରେ କ’ଣ କହିଥିଲେ?',
        hi: 'ग्रीक भूगोलवेत्ता टॉलेमी ने चिलिका के पालुर (Paloura) बंदरगाह का क्या वर्णन किया था?',
        en: 'What did Greco-Roman geographer Ptolemy in 150 CE record about the international port of Palur?',
      },
      {
        or: 'ଇରାୱାଡ଼ି ଡଲଫିନ ଏବଂ ନଳବଣ ପକ୍ଷୀ ଅଭୟାରଣ୍ୟର ପ୍ରାକୃତିକ ସମ୍ପଦ କିପରି ସଂରକ୍ଷିତ?',
        hi: 'इरावती डॉल्फिन और प्रवासी पक्षियों के लिए चिलिका झील क्यों प्रसिद्ध है?',
        en: 'How does Asia’s largest brackish lagoon protect the endangered Irrawaddy dolphins and migratory birds?',
      },
    ],
  },

  'story-similipal': {
    id: 'story-similipal',
    placeName: {
      en: 'Similipal Biosphere Reserve & Mayurbhanj Royal Heritage',
      or: 'ଶିମିଳିପାଳ ଜୈବମଣ୍ଡଳ ଓ ମୟୂରଭଞ୍ଜ ରାଜବଂଶ ଐତିହ୍ୟ',
      hi: 'शिमिलिपाल बायोस्फीयर रिजर्व व मयूरभंज राजघराना',
    },
    narratorName: {
      en: 'Santhal Forest Elder & Wildlife Ranger',
      or: 'ସାନ୍ତାଳ ଜଙ୍ଗଲ ମୁଖିଆ ଓ ଅରଣ୍ୟ ପ୍ରହରୀ',
      hi: 'संथाल वन संरक्षक व वन्यजीव प्रहरी',
    },
    voicePersonaTitle: {
      en: 'Ancient Forest Elder & UNESCO Biosphere Guardian',
      or: 'ପ୍ରାଚୀନ ଶାଳ ବନର ରକ୍ଷକ ଓ ଆଦିବାସୀ ମୁଖିଆ',
      hi: 'प्राचीन शाल वन संरक्षक व आदिवासी मुखिया',
    },
    timbreDescription: 'Earthy, deep, resonant voice whispering like the Sal canopy and barefoot tiger trackers (B1/F#2).',
    basePitch: 0.90,
    rateMultiplier: 0.90,
    droneRootFreqs: [61.74, 92.5, 123.47, 185.0], // B1 + F#2 Primal Earth Drone
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୋହାର! ମୁଁ ଶିମିଳିପାଳର ସାନ୍ତାଳ ଅରଣ୍ୟ ପ୍ରହରୀ, ମେଘାସନୀ ଶୃଙ୍ଗ ଓ ବାଘମାନଙ୍କ ସାଥି।',
      hi: 'जोहार! मैं शिमिलिपाल का वन संरक्षक, मेघासनी पर्वत और बाघों की पावन भूमि का पहरेदार।',
      en: 'Johar! I am the Santhal Elder and forest guardian of the sacred Sal canopies of Similipal.',
    },
    curatedQuestions: [
      {
        or: 'ବରେହିପାଣି ଓ ଯୋରନ୍ଦା ଜଳପ୍ରପାତର ଭୌଗୋଳିକ ଚମତ୍କାରିତା କ’ଣ?',
        hi: 'बारेहीपानी (399 मीटर) और जोरंदा जलप्रपात की क्या विशेषताएं हैं?',
        en: 'What makes Barehipani and Joranda among the most spectacular waterfalls in India?',
      },
      {
        or: 'ମେଲାନିଷ୍ଟିକ (କଳା) ବାଘ ବିଶ୍ୱରେ କେବଳ ଶିମିଳିପାଳରେ କାହିଁକି ଦେଖାଯାଆନ୍ତି?',
        hi: 'काले (मेलानिस्टिक) रॉयल बंगाल टाइगर दुनिया में केवल शिमिलिपाल में ही क्यों पाए जाते हैं?',
        en: 'Why is Similipal the exclusive natural habitat of pseudo-melanistic black tigers in the world?',
      },
      {
        or: 'ମୟୂରଭଞ୍ଜର ଛଉ ନୃତ୍ୟ ଏବଂ ମୁଢ଼ି ମାଂସର ଲୋକପ୍ରିୟତା କାହିଁକି ଏତେ ଅଧିକ?',
        hi: 'मयूरभंज का यूनेस्को छाऊ नृत्य और मुढ़ी मांसा की परंपरा क्या है?',
        en: 'What is the royal heritage behind Mayurbhanj Chhau martial dance and Mudhi Mansa cuisine?',
      },
    ],
  },

  'story-hirakud-sambalpur': {
    id: 'story-hirakud-sambalpur',
    placeName: {
      en: 'Hirakud Dam & Sambalpur Heritage',
      or: 'ହୀରାକୁଦ ମହାବନ୍ଧ ଓ ସମ୍ବଲପୁରର ଗୌରବ',
      hi: 'हीराकुड बांध एवं संबलपुर की धरोहर',
    },
    narratorName: {
      en: 'Chief Hydrological Engineer & Sambalpuri Balladeer',
      or: 'ମୁଖ୍ୟ ଜଳସମ୍ପଦ ଯନ୍ତ୍ରୀ ଓ ସମ୍ବଲପୁରୀ କବି',
      hi: 'मुख्य जल अभियंता व संबलपुरी लोक गायक',
    },
    voicePersonaTitle: {
      en: 'Visionary Builder & Folk Heritage Balladeer',
      or: 'ହୀରାକୁଦର ମୁଖ୍ୟ ଯନ୍ତ୍ରୀ ଓ ସମ୍ବଲପୁରୀ ସଂସ୍କୃତି ରକ୍ଷକ',
      hi: 'हीराकुड के मुख्य अभियंता व संबलपुरी संस्कृति संरक्षक',
    },
    timbreDescription: 'Inspiring, clear, resonant voice blending post-independence engineering marvel with Sambalpuri folk pride (E2/A2).',
    basePitch: 1.04,
    rateMultiplier: 1.02,
    droneRootFreqs: [82.41, 110.0, 164.81, 220.0], // E2 + A2 Mahanadi River Drone
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୁହାର! ମୁଁ ମହାନଦୀ ବକ୍ଷରେ ବିଶ୍ୱର ଦୀର୍ଘତମ ମାଟିବନ୍ଧ ହୀରାକୁଦର କାହାଣୀକାର।',
      hi: 'जुहार! मैं महानदी पर बने विश्व के सबसे लंबे मिट्टी के बांध हीराकुड का कथाकार।',
      en: 'Juhar! I bring you the saga of Hirakud, the longest earthen dam in the world on the Mahanadi.',
    },
    curatedQuestions: [
      {
        or: '୧୯୪୮-୧୯୫୭ ମସିହାରେ ୨୫ କିଲୋମିଟର ଦୀର୍ଘ ହୀରାକୁଦ ବନ୍ଧ କିପରି ନିର୍ମିତ ହୋଇଥିଲା?',
        hi: '1948 से 1957 के बीच 25 किमी लंबे हीराकुड बांध का निर्माण कैसे संभव हुआ?',
        en: 'How was the 25.8 km Hirakud Dam engineered as post-independence India’s greatest river valley project?',
      },
      {
        or: 'ମା ସମଲେଶ୍ୱରୀ ମନ୍ଦିର ଏବଂ ନୂଆଁଖାଇ ପର୍ବର କୃଷି ସାଂସ୍କୃତିକ ମହତ୍ତ୍ୱ କ’ଣ?',
        hi: 'मां समलेश्वरी मंदिर और संबलपुर के नुआं खाई त्योहार का क्या महत्व है?',
        en: 'What is the sacred origin of Maa Samaleswari Temple and the agrarian Nuakhai festival?',
      },
      {
        or: 'ସମ୍ବଲପୁରୀ ବନ୍ଧା (Ikat) ହସ୍ତତନ୍ତ ବୁଣାକାରୀର ବିଶେଷତା କ’ଣ?',
        hi: 'संबलपुरी इकत (बांधकला) हथकरघा की विश्वव्यापी प्रसिद्धि का क्या कारण है?',
        en: 'What is the mathematical precision behind Sambalpuri tie-and-dye (Bandhakala) Ikat weaving?',
      },
    ],
  },

  'story-daringbadi': {
    id: 'story-daringbadi',
    placeName: {
      en: 'Daringbadi: Kashmir of Odisha & Eastern Ghats',
      or: 'ଦାରିଙ୍ଗବାଡ଼ି: ଓଡ଼ିଶାର କାଶ୍ମୀର ଓ ପାଇନ ଉପତ୍ୟକା',
      hi: 'दारिंगबाड़ी: ओडिशा का कश्मीर एवं पूर्वी घाट',
    },
    narratorName: {
      en: 'Eastern Ghats Highlands Mist Storyteller',
      or: 'ପୂର୍ବଘାଟ ପର୍ବତମାଳାର ଉପତ୍ୟକା କବି',
      hi: 'पूर्वी घाट पर्वतमाला के घाटी कवि',
    },
    voicePersonaTitle: {
      en: 'Highland Pine & Coffee Valley Storyteller',
      or: 'ଶୀତଳ ପାଇନ ବନ ଓ କଫି ବଗିଚାର କଥାକାର',
      hi: 'शीतल पाइन वन व कॉफी बगानों के कथाकार',
    },
    timbreDescription: 'Crisp, airy, poetic mountain cadence carrying pine breeze and hill mist (F2/C3).',
    basePitch: 1.06,
    rateMultiplier: 0.96,
    droneRootFreqs: [87.31, 130.81, 174.61, 261.63], // F2 + C3 Highland Mist Drone
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ୩୦୦୦ ଫୁଟ ଉଚ୍ଚତା ବିଶିଷ୍ଟ ଦାରିଙ୍ଗବାଡ଼ିର କୁହୁଡ଼ି ଘେରା ପାଇନ ବଣରୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! 3000 फीट की ऊंचाई पर स्थित दारिंगबाड़ी के पाइन वनों से आपका स्वागत है।',
      en: 'Greetings from the misty pine highlands of Daringbadi, 3000 feet above the Eastern Ghats.',
    },
    curatedQuestions: [
      {
        or: 'ଦାରିଙ୍ଗବାଡ଼ିକୁ କାହିଁକି ‘ଓଡ଼ିଶାର କାଶ୍ମୀର’ କୁହାଯାଏ ଏବଂ ଶୀତଦିନେ ବରଫ ପଡ଼େ କି?',
        hi: 'दारिंगबाड़ी को ‘ओडिशा का कश्मीर’ क्यों कहा जाता है और क्या यहाँ पाला (sub-zero dew) गिरता है?',
        en: 'Why is Daringbadi nicknamed the Kashmir of Odisha, and how cold does winter get?',
      },
      {
        or: 'ବ୍ରିଟିଶ ଅଧିକାରୀ ଡାରିଂ ସାହେବଙ୍କ ସ୍ମୃତିରେ ଏହାର ନାମ କିପରି ହେଲା?',
        hi: 'ब्रिटिश अधिकारी डेरिंग के नाम पर इस स्थान का नामकरण कैसे हुआ?',
        en: 'What is the historical origin of the town name derived from British officer Daring Saheb?',
      },
      {
        or: 'କନ୍ଧମାଳ ହଳଦୀ (GI Tag) ଏବଂ ଜୈବିକ କଫି ଚାଷର ଲାଭ କ’ଣ?',
        hi: 'कंधमाल हल्दी (GI टैग) और जैविक कॉफी की खेती की क्या विशेषताएं हैं?',
        en: 'What gives Kandhamal organic turmeric its coveted GI tag and medicinal curcumin richness?',
      },
    ],
  },

  'story-gupteswar-koraput': {
    id: 'story-gupteswar-koraput',
    placeName: {
      en: 'Gupteswar Cave Temple & Ramagiri Hills',
      or: 'ଗୁପ୍ତେଶ୍ୱର ଗୁମ୍ଫା ମନ୍ଦିର ଓ ରାମଗିରି ପାହାଡ଼, କୋରାପୁଟ',
      hi: 'गुप्तेश्वर गुफा मंदिर एवं रामगिरि पर्वत, कोरापुट',
    },
    narratorName: {
      en: 'Saura Cave Hermit of Ramagiri Forest',
      or: 'ରାମଗିରି ଅରଣ୍ୟର ପ୍ରାଚୀନ ଶୌରା ସନ୍ନ୍ୟାସୀ',
      hi: 'रामगिरि वन के प्राचीन सौरा संन्यासी',
    },
    voicePersonaTitle: {
      en: 'Mystic Cavern Hermit & Tribal Sacred Guardian',
      or: 'ଚୁନପଥର ଗୁମ୍ଫାର ରହସ୍ୟମୟ ଶୈବ ସାଧକ',
      hi: 'चूना पत्थर गुफा के रहस्यमय शैव साधक',
    },
    timbreDescription: 'Deep, hollow, cavernous echo resonance evoking dripping subterranean stalagmites (Eb2/Bb2).',
    basePitch: 0.82,
    rateMultiplier: 0.86,
    droneRootFreqs: [77.78, 116.54, 155.56, 233.08], // Eb2 + Bb2 Subterranean Echo Drone
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ନମୋ ଗୁପ୍ତେଶ୍ୱରାୟ! ମୁଁ କୋରାପୁଟର ରାମଗିରି ଚୁନପଥର ଗୁମ୍ଫାର ପ୍ରାଚୀନ ପ୍ରହରୀ।',
      hi: 'ॐ नमो गुप्तेश्वराय! मैं कोरापुट के रामगिरि चूना-पत्थर गुफा का प्राचीन साधु।',
      en: 'Om Namo Gupteshwaraya! I speak from the sacred limestone cavern of Lord Gupteswar.',
    },
    curatedQuestions: [
      {
        or: 'ଗୁପ୍ତେଶ୍ୱରର ପ୍ରାକୃତିକ ଶିବଲିଙ୍ଗ ଚୁନପଥର ଗୁମ୍ଫାରେ କିପରି ସ୍ୱୟଂଭୂ ହୋଇ ବଢ଼ିଥାଏ?',
        hi: 'गुप्तेश्वर का प्राकृतिक शिवलिंग चूना पत्थर (Stalagmite) से कैसे निर्मित हुआ?',
        en: 'How was the growing subterranean stalagmite Shiva Lingam formed in Ramagiri forest?',
      },
      {
        or: 'ଭଗବାନ ଶ୍ରୀରାମ ବନବାସ ସମୟରେ ଏହି ଗୁମ୍ଫାରେ ପୂଜା କରିଥିବା ଲୋକକଥା କ’ଣ?',
        hi: 'भगवान श्रीराम द्वारा वनवास के दौरान गुप्तेश्वर में पूजा करने की लोककथा क्या है?',
        en: 'What is the Treta Yuga legend of Lord Rama worshipping the hidden Lingam during exile?',
      },
      {
        or: 'ଦେଓମାଳୀ ଶୃଙ୍ଗ (ଓଡ଼ିଶାର ସର୍ବୋଚ୍ଚ ପର୍ବତ) ଏବଂ କୋରାପୁଟ ଆରାବିକା କଫି ବିଷୟରେ କୁହନ୍ତୁ?',
        hi: 'देवमाली चोटी (1672 मी) और कोरापुट की प्रसिद्ध अरेबिका कॉफी की क्या विशेषता है?',
        en: 'What makes Deomali Peak (Odisha’s highest mountain) and tribal organic Arabica coffee famous?',
      },
    ],
  },

  'story-raghurajpur': {
    id: 'story-raghurajpur',
    placeName: {
      en: 'Raghurajpur Heritage Crafts Village',
      or: 'ରଘୁରାଜପୁର ଐତିହ୍ୟ ଶିଳ୍ପ ଗ୍ରାମ',
      hi: 'रघुराजपुर धरोहर शिल्प ग्राम',
    },
    narratorName: {
      en: 'Master Pattachitra Chitrakar & Gotipua Guru',
      or: 'ମୁଖ୍ୟ ପଟ୍ଟଚିତ୍ର ଶିଳ୍ପୀ ଓ ଗୋଟିପୁଅ ଗୁରୁ',
      hi: 'मुख्य पट्टचित्र शिल्पी व गोटीपुआ गुरु',
    },
    voicePersonaTitle: {
      en: 'Living Heritage Artisan & Gotipua Dance Patriarch',
      or: 'ରଘୁରାଜପୁରର ଅମର ପଟ୍ଟଚିତ୍ର କାରିଗର',
      hi: 'रघुराजपुर के अमर पट्टचित्र कारीगर',
    },
    timbreDescription: 'Melodic, rhythmic, lyrical artisan cadence timed to the beats of Odissi Mardala (A2/D3).',
    basePitch: 1.12,
    rateMultiplier: 0.98,
    droneRootFreqs: [110.0, 146.83, 220.0, 293.66], // A2 + D3 Mardala Rhythm Drone
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ମୁଁ ରଘୁରାଜପୁରର ପଟ୍ଟଚିତ୍ର କାରିଗର, ତାଳପତ୍ର ଓ କପଡ଼ାରେ ରଙ୍ଗ ଭରୁଥିବା ଶିଳ୍ପୀ।',
      hi: 'नमस्कार! मैं रघुराजपुर का पट्टचित्र शिल्पी, ताड़पत्र और वस्त्रों पर अमर रंग भरने वाला कारीगर।',
      en: 'Namaskar! I am the Master Pattachitra Chitrakar of Raghurajpur living heritage crafts village.',
    },
    curatedQuestions: [
      {
        or: 'ରଘୁରାଜପୁରର ପ୍ରତ୍ୟେକ ଘର କିପରି ଏକ ଜୀବନ୍ତ କଳା ଗ୍ୟାଲେରୀ?',
        hi: 'रघुराजपुर का हर घर एक जीवंत आर्ट गैलरी कैसे है?',
        en: 'How does every single home in Raghurajpur function as an open artisan studio and gallery?',
      },
      {
        or: 'ପଟ୍ଟଚିତ୍ର ନିର୍ମାଣ ପାଇଁ ପ୍ରାକୃତିକ ପଥର, ଶଙ୍ଖ ଓ ଗଛର ରଙ୍ଗ କିପରି ପ୍ରସ୍ତୁତ ହୁଏ?',
        hi: 'पट्टचित्र के लिए शंख, समुद्री पत्थर और पत्तियों से 100% प्राकृतिक रंग कैसे बनाए जाते हैं?',
        en: 'How are 100% natural organic mineral pigments prepared from conch shells and wild stones?',
      },
      {
        or: 'ଗୋଟିପୁଅ ନୃତ୍ୟ କିପରି ଆଧୁନିକ ଶାସ୍ତ୍ରୀୟ ଓଡ଼ିଶୀ ନୃତ୍ୟର ମାତୃକା ଅଟେ?',
        hi: 'गोटीपुआ नृत्य किस प्रकार शास्त्रीय ओडिसी नृत्य की जननी माना जाता है?',
        en: 'How did the acrobatic Gotipua dance form preserve the roots of classical Odissi dance?',
      },
    ],
  },
};

export function getMonumentVoiceProfile(storyId: string): MonumentVoiceProfile {
  return MONUMENT_VOICE_PROFILES[storyId] || MONUMENT_VOICE_PROFILES['story-konark'];
}
