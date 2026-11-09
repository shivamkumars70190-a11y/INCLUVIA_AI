import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize server-side Gemini client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for resilient Gemini API calls with exponential backoff on transient 503/429
async function callGeminiWithRetry(params: any, retries = 2): Promise<any> {
  const models = [params.model || 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of models) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const resp = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        return resp;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('429');
        if (isTransient && attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
        break; // try fallback model
      }
    }
  }
  throw lastError;
}

// Config & Health endpoint
app.get('/api/config', (req, res) => {
  res.json({
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    gnaniConfigured: !!process.env.GNANI_API_KEY,
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    supportedLanguages: [
      { code: 'en', name: 'English' },
      { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
      { code: 'hi', name: 'Hindi (हिन्दी)' },
      { code: 'ta', name: 'Tamil (தமிழ்)' },
      { code: 'te', name: 'Telugu (తెలుగు)' },
      { code: 'ml', name: 'Malayalam (മലയാളം)' },
      { code: 'bn', name: 'Bengali (বাংলা)' },
      { code: 'mr', name: 'Marathi (मराठी)' },
      { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    ],
  });
});

// 1. DRISHTI — Real-Time Computer Vision & Hazard Analysis
app.post('/api/drishti/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', walkingContext = 'indoor/outdoor sidewalk' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        provider: 'System Configuration',
      });
    }

    // Clean base64 payload if it has data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `You are DRISHTI, the core AI Vision & Mobility Safety Assistant for INCLUVIA AI, designed for blind and visually impaired individuals.
Analyze the user's camera feed immediately. Your highest priority is user physical safety:
1. Detect immediate hazards: potholes, open trenches, uneven ground, elevation drops, stairs (up/down), curbs, cables, puddles, overhead low-hanging obstacles.
2. Detect physical objects and beings: people, vehicles, doors (open/closed), walls, furniture, footpaths, pillars, road obstacles.
3. Determine walking clearance: is the path directly ahead safe to proceed?
4. Suggest directional adjustments: 'straight', 'shift_left', 'shift_right', 'stop_immediately', or 'caution_slow'.
5. Produce concise, clear spoken guidance suitable for Text-to-Speech (under 25 words). Never invent exact millimeter distances; use qualitative descriptors like 'ahead', 'to your left', 'to your right', 'close', 'in the distance'.
6. Remember: Do not claim an uncertain path is safe without valid evidence. Never issue unsafe instructions.

Return strictly JSON matching this structure:
{
  "primaryAlert": "Brief 1-sentence alert",
  "spokenGuidance": "Natural spoken sentence for audio TTS playback",
  "navSuggestion": "straight" | "shift_left" | "shift_right" | "stop_immediately" | "caution_slow",
  "clearPathAhead": true | false,
  "safetyScore": 0.0 to 1.0,
  "hazards": [
    {
      "type": "pothole" | "step" | "obstacle" | "curb" | "vehicle" | "uneven_surface" | "doorway",
      "severity": "high" | "medium" | "low",
      "location": "center" | "left" | "right" | "ground_ahead",
      "description": "Details"
    }
  ],
  "objectsDetected": [
    {
      "name": "Object name",
      "position": "left / center / right",
      "approxDistance": "close / medium / far"
    }
  ],
  "surfaceCondition": "Smooth paved" | "Uneven pavement" | "Gravel" | "Steps" | "Tiled floor" | "Wet surface"
}`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this scene for a visually impaired user walking in context: "${walkingContext}". Identify any potholes, obstacles, stairs, doorways, people, and provide safe navigational spoken guidance in JSON format.`,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible markdown code fences if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      analysis: parsedData,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Drishti analysis error:', err);
    res.status(500).json({
      error: 'Vision analysis failed: ' + (err.message || 'Unknown error'),
      fallbackGuidance: 'Unable to analyze frame. Please proceed with caution using your primary cane or guide.',
    });
  }
});

// Helper: map language code to Gnani locale
function mapToGnaniLocale(code: string): string {
  if (!code || code === 'auto') return 'hi-IN';
  if (code.includes('-')) return code;
  const map: Record<string, string> = {
    en: 'en-IN',
    kn: 'kn-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    or: 'or-IN',
  };
  return map[code.toLowerCase()] || 'hi-IN';
}

// Gnani Platform Metadata Endpoint
app.get('/api/shruti/gnani-info', (req, res) => {
  res.json({
    gnaniConfigured: !!process.env.GNANI_API_KEY,
    sttEngine: 'Gnani AI Prisma (Vachana Speech Platform)',
    ttsEngine: 'Gnani AI Timbre TTS',
    supportedLanguages: [
      { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', defaultVoice: 'Kaveri' },
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', defaultVoice: 'Nalini' },
      { code: 'en-IN', name: 'English (India)', nativeName: 'English (IN)', defaultVoice: 'Deepak' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', defaultVoice: 'Meera' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', defaultVoice: 'Suresh' },
      { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', defaultVoice: 'Kaveri' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', defaultVoice: 'Sunita' },
      { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', defaultVoice: 'Rohan' },
      { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', defaultVoice: 'Nalini' },
      { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', defaultVoice: 'Deepak' },
    ],
    supportedVoices: [
      { name: 'Nalini', gender: 'Female', language: 'hi-IN', label: 'Nalini (Hindi / Indic - Female)' },
      { name: 'Kaveri', gender: 'Female', language: 'kn-IN', label: 'Kaveri (Kannada - Female)' },
      { name: 'Deepak', gender: 'Male', language: 'hi-IN', label: 'Deepak (Hindi / Indic - Male)' },
      { name: 'Pranav', gender: 'Male', language: 'kn-IN', label: 'Pranav (South Indic - Male)' },
      { name: 'Meera', gender: 'Female', language: 'ta-IN', label: 'Meera (Tamil - Female)' },
      { name: 'Rohan', gender: 'Male', language: 'mr-IN', label: 'Rohan (Marathi - Male)' },
      { name: 'Sunita', gender: 'Female', language: 'bn-IN', label: 'Sunita (Bengali - Female)' },
      { name: 'Suresh', gender: 'Male', language: 'te-IN', label: 'Suresh (Telugu - Male)' },
    ],
    supportedModels: ['timbre-v2.5', 'timbre-v3.0'],
    supportedAudioFormats: ['WAV', 'MP3', 'WebM', 'FLAC', 'AAC', 'OGG', 'M4A'],
  });
});

// 2. SHRUTI — Speech-To-Text (Gnani AI Prisma with Gemini Audio fallback)
app.post('/api/shruti/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', languageHint = 'auto' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const audioBuffer = Buffer.from(cleanBase64, 'base64');
    const gnaniLocale = mapToGnaniLocale(languageHint);

    // Check if Gnani AI Prisma API key is configured
    if (process.env.GNANI_API_KEY) {
      try {
        // 1. Primary: Official Gnani Vachana STT v3 REST endpoint
        const formData = new FormData();
        const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp3') ? 'mp3' : 'webm';
        const audioBlob = new Blob([audioBuffer], { type: mimeType });
        formData.append('audio_file', audioBlob, `audio.${ext}`);
        formData.append('language_code', gnaniLocale);

        let gnaniResponse = await fetch('https://api.vachana.ai/stt/v3', {
          method: 'POST',
          headers: {
            'X-API-Key-ID': process.env.GNANI_API_KEY,
          },
          body: formData,
        });

        // 2. Secondary fallback if vachana endpoint is down or legacy key format
        if (!gnaniResponse.ok && gnaniResponse.status !== 401) {
          try {
            gnaniResponse = await fetch('https://asr.gnani.ai/api/v1/stt', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'token': process.env.GNANI_API_KEY,
                'Authorization': `Bearer ${process.env.GNANI_API_KEY}`,
              },
              body: JSON.stringify({
                audio_data: cleanBase64,
                language: gnaniLocale,
                audio_format: ext,
              }),
            });
          } catch {
            // ignore secondary error
          }
        }

        if (gnaniResponse.ok) {
          const gnaniData = await gnaniResponse.json();
          const transcript = gnaniData.transcript || gnaniData.text || gnaniData.result || '';
          return res.json({
            success: true,
            provider: 'Gnani AI Prisma STT',
            transcript,
            detectedLanguage: gnaniData.language || gnaniLocale,
            detectedLanguageCode: gnaniLocale,
            confidence: gnaniData.confidence || 0.96,
            requestId: gnaniData.request_id || null,
            audioFormat: ext.toUpperCase(),
          });
        }
        console.warn('Gnani AI STT returned status', gnaniResponse.status, 'Falling back to Gemini Transcription.');
      } catch (gnaniErr) {
        console.warn('Gnani AI call failed, falling back to Gemini audio model:', gnaniErr);
      }
    }

    // Fallback: Multimodal Gemini 3.8 Flash Audio Transcription
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Neither GNANI_API_KEY nor GEMINI_API_KEY is configured on server.',
        provider: 'System Configuration',
      });
    }

    const prompt = `Transcribe the provided spoken audio accurately.
1. Automatically detect the spoken language (e.g. English, Kannada, Hindi, Tamil, Telugu, Malayalam, Bengali, etc.).
2. Return strictly JSON:
{
  "transcript": "Exact spoken text transcription",
  "detectedLanguage": "Detected language name",
  "detectedLanguageCode": "ISO code (en, kn, hi, ta, te, ml, bn, etc.)",
  "confidence": 0.0 to 1.0,
  "durationSeconds": approx duration
}`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.includes('wav') ? 'audio/wav' : mimeType.includes('mp3') ? 'audio/mp3' : 'audio/webm',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      provider: process.env.GNANI_API_KEY ? 'Gnani AI Prisma (Failover to Gemini Engine)' : 'Gemini Multimodal Audio (Active)',
      gnaniConfigured: !!process.env.GNANI_API_KEY,
      transcript: parsed.transcript || '',
      detectedLanguage: parsed.detectedLanguage || 'English',
      detectedLanguageCode: parsed.detectedLanguageCode || 'en',
      confidence: parsed.confidence || 0.92,
    });
  } catch (err: any) {
    console.error('Shruti transcription error:', err);
    res.status(500).json({ error: 'Speech transcription failed: ' + (err.message || 'Unknown error') });
  }
});

// 2.5 SHRUTI — Text-To-Speech (Gnani AI Timbre TTS Engine)
app.post('/api/shruti/tts', async (req, res) => {
  try {
    const { text, language = 'hi-IN', voice = 'Nalini', speed = 1.0, model = 'timbre-v2.5' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS synthesis' });
    }

    const gnaniLocale = mapToGnaniLocale(language);

    if (!process.env.GNANI_API_KEY) {
      return res.status(503).json({
        success: false,
        gnaniConfigured: false,
        error: 'GNANI_API_KEY is not configured on the server. Please set GNANI_API_KEY in the environment or Secrets panel to enable Gnani Timbre TTS.',
        fallbackToSpeechSynthesis: true,
        text,
        language: gnaniLocale,
      });
    }

    // Call official Gnani Timbre TTS Inference endpoint
    const gnaniTtsResponse = await fetch('https://api.vachana.ai/api/v1/tts/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': process.env.GNANI_API_KEY,
      },
      body: JSON.stringify({
        text: text.trim(),
        model: model || 'timbre-v2.5',
        voice: voice || 'Nalini',
        language: gnaniLocale,
        speed: Number(speed) || 1.0,
        audio_config: {
          sample_rate: 24000,
          encoding: 'linear_pcm',
          container: 'wav',
        },
      }),
    });

    if (!gnaniTtsResponse.ok) {
      const errText = await gnaniTtsResponse.text();
      console.warn('Gnani TTS returned error status', gnaniTtsResponse.status, errText);
      return res.status(gnaniTtsResponse.status).json({
        success: false,
        gnaniConfigured: true,
        statusCode: gnaniTtsResponse.status,
        error: `Gnani TTS service responded with ${gnaniTtsResponse.status}: ${errText.slice(0, 150)}`,
        fallbackToSpeechSynthesis: true,
      });
    }

    // Gnani TTS inference returns raw binary WAV audio
    const arrayBuffer = await gnaniTtsResponse.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:audio/wav;base64,${base64Audio}`;

    res.json({
      success: true,
      provider: 'Gnani AI Timbre TTS',
      audioBase64: dataUri,
      language: gnaniLocale,
      voice: voice || 'Nalini',
      model: model || 'timbre-v2.5',
      textLength: text.length,
    });
  } catch (err: any) {
    console.error('Gnani TTS synthesis error:', err);
    res.status(500).json({
      success: false,
      error: 'Gnani TTS synthesis failed: ' + (err.message || 'Unknown error'),
      fallbackToSpeechSynthesis: true,
    });
  }
});

// 3. SHRUTI — Sign Language Recognition (Indian Sign Language & Universal Gestures)
app.post('/api/shruti/sign-recognize', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', supportedVocabulary } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 frame is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `You are an expert Indian Sign Language (ISL) and Universal Sign Language recognition system.
Analyze the user's hand gestures, finger configurations, orientation, and facial/body posture in the camera frame.
Recognize supported sign language vocabulary, especially:
- Greetings: "Namaste / Hello", "Good Morning", "Goodbye"
- Needs: "Water", "Food / Eat", "Medicine / Doctor", "Washroom / Toilet", "Help / Emergency"
- Responses: "Yes / Agree", "No / Disagree", "Thank You", "Please", "Sorry"
- Identity & Questions: "I am deaf / hard of hearing", "What is your name?", "Where?", "Safe", "Stop"
- Numbers / Alphabets: Standard ISL two-handed & single-handed manual alphabet and counting signs.

If no intentional sign gesture is being formed or hands are at rest, accurately output "none" or "hands_at_rest" with 0.0 confidence.
Do not hallucinate random signs if the user is merely waving or resting.

Return strictly JSON:
{
  "detectedSign": "Name of sign (or 'No Sign Detected')",
  "englishMeaning": "Full translation meaning of the sign",
  "confidence": 0.0 to 1.0,
  "category": "Greeting" | "Emergency / Need" | "Conversation" | "Navigation" | "Number" | "None",
  "spokenText": "Clean text for spoken audio read-out",
  "handNotes": "Brief anatomical description of observed hand shape/pose",
  "alternativePossibilities": [
    { "sign": "Alternative sign name", "confidence": 0.0 to 1.0 }
  ]
}`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Analyze the signer in this frame for Indian Sign Language (ISL) or supported assistive gestures. Return JSON.',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      result: parsed,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Sign recognition error:', err);
    res.status(500).json({ error: 'Sign recognition failed: ' + (err.message || 'Unknown error') });
  }
});

// 4. COMMUNICATION — Automatic Language Detection and Bidirectional Translation
app.post('/api/communication/translate-and-detect', async (req, res) => {
  try {
    const { text, targetLanguage = 'English', speakerRole = 'speakerA' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server.' });
    }

    const systemPrompt = `You are INCLUVIA's Automatic Multilingual Accessibility Engine.
1. Automatically detect the language of the input text accurately (especially Indian languages: Kannada, Hindi, Tamil, Telugu, Malayalam, Bengali, Marathi, Gujarati, English, etc.).
2. Translate the text into the requested target language: "${targetLanguage}".
3. Provide a natural, culturally accurate translation suitable for spoken two-way accessibility conversation.
4. Provide a romanized phonetic transliteration so non-native speakers can pronounce the original or translated phrase.
5. Return strictly JSON:
{
  "detectedLanguage": "Full language name (e.g. Kannada, Hindi, Tamil, English)",
  "detectedLanguageCode": "Language code (kn, hi, ta, te, ml, bn, mr, gu, en)",
  "detectedConfidence": 0.0 to 1.0,
  "originalText": "Original input text",
  "translatedText": "Accurate translated text in target language",
  "targetLanguage": "${targetLanguage}",
  "romanizedPronunciation": "Roman phonetic guide for pronunciation",
  "speechSynthesisRecommendedLang": "BCP-47 language tag (e.g. kn-IN, hi-IN, ta-IN, en-US)"
}`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: `Input message from ${speakerRole}: "${text.trim()}". Identify source language automatically and translate to ${targetLanguage}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const cleaned = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      translation: parsed,
    });
  } catch (err: any) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed: ' + (err.message || 'Unknown error') });
  }
});

// 5. GATI — OpenStreetMap Nominatim Geocoding & Search Proxy
app.get('/api/navigation/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6`;
    const osmResponse = await fetch(url, {
      headers: {
        'User-Agent': 'IncluviaAI-Accessibility-Platform/1.0 (contact: info@incluvia.org)',
      },
    });

    if (!osmResponse.ok) {
      throw new Error(`Nominatim returned status ${osmResponse.status}`);
    }

    const places = await osmResponse.json();
    res.json(places);
  } catch (err: any) {
    console.error('Search geocode error:', err);
    res.status(500).json({ error: 'Place search failed: ' + (err.message || 'Network error') });
  }
});

app.get('/api/navigation/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const osmResponse = await fetch(url, {
      headers: {
        'User-Agent': 'IncluviaAI-Accessibility-Platform/1.0 (contact: info@incluvia.org)',
      },
    });

    if (!osmResponse.ok) {
      throw new Error(`Nominatim reverse returned status ${osmResponse.status}`);
    }

    const data = await osmResponse.json();
    res.json(data);
  } catch (err: any) {
    console.error('Reverse geocode error:', err);
    res.status(500).json({ error: 'Reverse geocode failed: ' + (err.message || 'Network error') });
  }
});

// 6. GATI — OSRM Routing Proxy (Walking / Wheelchair-Friendly Mode)
app.get('/api/navigation/route', async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon, profile = 'foot' } = req.query;
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ error: 'Coordinates fromLat, fromLon, toLat, toLon are required' });
    }

    // OSRM walking/foot router endpoint
    const osrmProfile = profile === 'driving' ? 'driving' : 'foot';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&steps=true&annotations=true`;

    const osrmResponse = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'IncluviaAI-Accessibility-Platform/1.0',
      },
    });

    if (!osrmResponse.ok) {
      throw new Error(`OSRM router error: status ${osrmResponse.status}`);
    }

    const routeData = await osrmResponse.json();
    res.json(routeData);
  } catch (err: any) {
    console.error('OSRM route error:', err);
    res.status(500).json({ error: 'Routing calculation failed: ' + (err.message || 'Network error') });
  }
});

// Dev vs Production Setup with Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Incluvia AI server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
