export type ActiveTab =
  | 'dashboard'
  | 'drishti'
  | 'shruti'
  | 'gati'
  | 'communication'
  | 'settings'
  | 'about'
  | 'privacy'
  | 'help';

export interface UserSettings {
  preferredLanguage: string; // 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'bn' | 'mr' | 'gu'
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  autoSpeak: boolean;
  speechRate: number; // 0.5 to 1.5
  speechPitch: number; // 0.5 to 1.5
  voiceURI: string;
  soundAlerts: boolean;
  emergencyContact: string;
}

// DRISHTI Types
export interface HazardItem {
  type: 'pothole' | 'step' | 'obstacle' | 'curb' | 'vehicle' | 'uneven_surface' | 'doorway' | 'puddle';
  severity: 'high' | 'medium' | 'low';
  location: 'center' | 'left' | 'right' | 'ground_ahead';
  description: string;
}

export interface DetectedObject {
  name: string;
  position: 'left' | 'center' | 'right';
  approxDistance: 'close' | 'medium' | 'far';
}

export interface DrishtiAnalysis {
  primaryAlert: string;
  spokenGuidance: string;
  navSuggestion: 'straight' | 'shift_left' | 'shift_right' | 'stop_immediately' | 'caution_slow';
  clearPathAhead: boolean;
  safetyScore: number;
  hazards: HazardItem[];
  objectsDetected: DetectedObject[];
  surfaceCondition: string;
}

// SHRUTI Types
export interface TranscriptionResult {
  transcript: string;
  detectedLanguage: string;
  detectedLanguageCode: string;
  confidence: number;
  provider: string;
  requestId?: string;
  audioFormat?: string;
}

export interface GnaniTtsResult {
  audioBase64: string;
  provider: string;
  language: string;
  voice: string;
  model: string;
  duration?: number;
}

export interface GnaniLanguage {
  code: string;
  name: string;
  nativeName: string;
  defaultVoice: string;
}

export interface SignRecognitionResult {
  detectedSign: string;
  englishMeaning: string;
  confidence: number;
  category: string;
  spokenText: string;
  handNotes: string;
  alternativePossibilities?: Array<{ sign: string; confidence: number }>;
}

export interface SignVocabItem {
  id: string;
  name: string;
  category: 'Greeting' | 'Emergency & Need' | 'Common Phrases' | 'Responses' | 'Numbers';
  meaning: string;
  gestureDescription: string;
  sampleImageUrl?: string;
}

// GATI Types
export interface GeoLocation {
  lat: number;
  lon: number;
  accuracy?: number;
  displayName?: string;
}

export interface SearchResultPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuverType: string;
  modifier?: string;
  name?: string;
}

export interface RouteData {
  distance: number; // meters
  duration: number; // seconds
  coordinates: [number, number][]; // [lat, lon]
  steps: RouteStep[];
  isWheelchairFriendly: boolean;
}

// COMMUNICATION Types
export interface ConversationMessage {
  id: string;
  speaker: 'speakerA' | 'speakerB'; // Speaker A: other person / user; Speaker B: recipient
  speakerName: string;
  originalText: string;
  detectedLanguage: string;
  detectedLanguageCode: string;
  translatedText: string;
  targetLanguage: string;
  romanizedPronunciation?: string;
  timestamp: number;
}
