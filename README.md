# INCLUVIA AI — Unified AI-Powered Accessibility Platform

> **One Intelligence. Every Ability.**

INCLUVIA AI is a comprehensive, production-grade accessibility platform built to empower people with visual, hearing, mobility, and speech disabilities to interact with the world more independently.

---

## 🏛️ Platform Architecture & The Four Core Modules

### 1. DRISHTI — Real-Time AI Vision Assistant
*Target Users: Blind and Visually Impaired Individuals*
- **Live Camera Feed Guard:** Requests camera permissions, accesses the video stream at chest height, and captures frames periodically.
- **Ground Hazard & Pothole Detection:** Detects potholes, broken sidewalks, sudden steps/drop-offs, curbs, puddles, and ground obstacles.
- **Surrounding Entity Recognition:** Identifies pedestrians, oncoming vehicles, doors, walls, stairs, and furniture.
- **Smart Spoken Guidance:** Uses text-to-speech to deliver spoken guidance (e.g., *"Possible pothole detected ahead on your left. Suggest moving slightly to the right onto the smooth paved section. Proceed carefully."*).
- **Acoustic Audio Tones:** Web Audio API sound alerts (dual low-pitch warning pulses for hazards, pleasant rising chime for clear path).
- **Emergency Stop & Repetition:** One-tap audio muting and repeated instructions.
- **Test Scenarios:** Pre-loaded benchmark scenes (potholes, downward stairs, indoor corridor, urban crowd) for immediate verification without a webcam.

### 2. SHRUTI — Speech & Sign-Language Assistant
*Target Users: Deaf, Hard-of-Hearing Individuals, and Signers*
- **Gnani AI Prisma Speech-to-Text (STT):**
  - Integrated with official **Gnani AI Vachana Speech Platform** (`https://api.vachana.ai/stt/v3`) using server-side `GNANI_API_KEY`.
  - Supports audio formats: WAV, MP3, WebM, FLAC, AAC, OGG, and M4A.
  - Supports 10+ Indian languages: Kannada (`kn-IN`), Hindi (`hi-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Malayalam (`ml-IN`), Bengali (`bn-IN`), Marathi (`mr-IN`), Gujarati (`gu-IN`), Punjabi (`pa-IN`), and Indian English (`en-IN`), with auto-detection.
  - Automatic fallback to Gemini multimodal speech transcription if Gnani credentials are not supplied.
  - Real-time microphone recording, duration timer, file upload, copy transcript, and direct synthesis buttons.
- **Gnani AI Timbre Text-to-Speech (TTS):**
  - Integrated with official **Gnani AI Timbre TTS engine** (`https://api.vachana.ai/api/v1/tts/inference`).
  - Supported Models: `timbre-v2.5` and `timbre-v3.0` (with expressive audio tags like `<pauses>`, `<whispers>`, `<laugh>`).
  - Voice Catalog: *Nalini* (Hindi/Indic Female), *Kaveri* (Kannada Female), *Deepak* (Hindi/Indic Male), *Pranav* (South Indic Male), *Meera* (Tamil Female), *Rohan* (Marathi Male), *Sunita* (Bengali Female), *Suresh* (Telugu Male).
  - Configurable speech playback speed (0.5x to 1.5x) and 24kHz linear PCM WAV output with built-in player and WAV file download.
- **Indian Sign Language (ISL) Recognition:**
  - Live camera sign language recognition using Gemini 3.8 Flash multimodal posture and hand landmark analysis.
  - Recognizes supported vocabulary: Greetings (Namaste/Hello, Good Morning), Urgent Needs (Water, Food, Help/Emergency, Washroom), Responses (Yes, No, Thank You), and identity signs.
  - One-click output to both Browser TTS and Gnani Timbre natural Indic voice synthesis.
  - Visual confidence percentage meter, hand landmark anatomical notes, and speech readout.
  - Built-in ISL dictionary with interactive test sample presets.

### 3. GATI — Smart Mobility & Navigation
*Target Users: People with Mobility Difficulties and Wheelchair Users*
- **GPS Location Detection:** Geolocation API integration with automatic reverse geocoding via OpenStreetMap Nominatim.
- **Interactive OpenStreetMap:** Leaflet map with high-contrast tiles, custom user location marker, destination markers, and route polyline display.
- **Voice & Text Destination Search:** Search via voice input (Web Speech Recognition) or text with auto-suggestions.
- **Route Calculation via OSRM:** Real-time pedestrian and walking path routing with distance and estimated time calculation.
- **Wheelchair-Friendly Mode:** Toggle to highlight step-free, ramp-assisted paths.
- **Spoken Turn Navigation:** Turn-by-turn spoken audio guidance with step advancing and repeat buttons.

### 4. COMMUNICATION — Automatic Multilingual Two-Way Dialogue
*Target Users: Non-Verbal Individuals & Cross-Language Dialogue*
- **Zero-Manual Language Selection:** The other speaker's language is detected automatically using Gemini 3.8 Flash.
- **Two-Way Bidirectional Translation:**
  - Person A speaks their native tongue (e.g., Kannada).
  - INCLUVIA detects Kannada and translates it into Person B's preferred language (e.g., English).
  - Person B replies in English.
  - INCLUVIA detects English, translates it back into Kannada, and speaks it aloud with correct pronunciation.
- **Voice & Text Input:** Microphone input and typing available for both speakers.
- **Quick Phrase Cards:** Dedicated tap-to-speak phrases for speech-impaired individuals.

---

## ⚙️ Configuration & Environment Variables

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-side API key for Google Gemini (`gemini-3.8-flash`) | **Required** (Injected by AI Studio) |
| `GNANI_API_KEY` | Server-side API key for Gnani AI Prisma Speech-to-Text | *Optional* (Fallback to Gemini ASR active) |
| `PORT` | Web server port (Default: `3000`) | Optional |
| `APP_URL` | Application hosting URL | Automatically injected |

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# Starts full-stack Express server at http://localhost:3000 with Vite middleware
```

### Production Build
```bash
npm run build
npm run start
```

---

## ♿ Accessibility Compliance

- **WCAG 2.2 AA / AAA Standards:** High-contrast color palette, minimum 4.5:1 text contrast (up to 7:1 in High Contrast mode).
- **Keyboard Navigation:** Full focus ring indicators (`:focus-visible`), Tab navigation, and `Alt + 1..5` shortcuts.
- **Screen Reader Support:** Semantic HTML5 elements (`main`, `header`, `nav`, `footer`, `section`), `aria-live="polite"` and `aria-live="assertive"` announcements.
- **Dynamic Text Scaling:** Root font-size scaling for Normal, Large (115%), and Extra Large (130%).
- **Touch Friendly:** All touch targets $\ge 44\text{px}$.

---

## ⚠️ Safety & Assistive Technology Disclaimer

INCLUVIA AI is designed as an assistive supplementary tool. It **must never replace** primary mobility aids such as a white cane, a certified guide dog, or personal physical assistance. Always maintain tactile and situational awareness in unfamiliar or road environments.
