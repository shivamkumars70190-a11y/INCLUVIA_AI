import React from 'react';
import { ActiveTab } from '../types';
import { HelpCircle, Eye, Ear, Navigation, Languages, Keyboard, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { speakText } from '../utils/speech';

interface HelpViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ setActiveTab }) => {
  const handleReadGuide = () => {
    speakText(
      'INCLUVIA AI Help Guide. Drishti provides live camera guidance and pothole alerts. Shruti provides live transcription and sign language recognition. Gati provides wheelchair route navigation. Communication translates between speakers automatically. Settings lets you adjust high contrast and speech rate.',
      { rate: 1.0 }
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span>Operational User Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            How to Use INCLUVIA AI
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Step-by-step instructions for each module, keyboard shortcuts, and screen-reader tips.
          </p>
        </div>

        <button
          onClick={handleReadGuide}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 min-h-[44px] shadow-sm shrink-0"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen to Voice Guide</span>
        </button>
      </div>

      {/* Module Guides */}
      <div className="space-y-6">
        {/* Drishti Guide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600">
            <Eye className="w-5 h-5" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              1. Using DRISHTI (AI Vision & Hazard Guidance)
            </h2>
          </div>
          <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Start Camera:</strong> Click "Start Live Camera" and allow browser camera permission.
            </li>
            <li>
              <strong>Hold Device at Chest Height:</strong> Point the rear camera forward toward your walking path.
            </li>
            <li>
              <strong>Listen for Spoken Guidance:</strong> Drishti scans continuously every 2.8 seconds and speaks immediate hazard warnings (e.g. "Pothole ahead on your left. Suggest shifting right.").
            </li>
            <li>
              <strong>Acoustic Tones:</strong> Low double-beeps indicate hazards; pleasant rising chimes indicate a clear path ahead.
            </li>
            <li>
              <strong>Controls:</strong> Use "Repeat Guidance" to hear instructions again, or "Emergency Stop" to silence audio instantly.
            </li>
          </ol>
        </div>

        {/* Shruti Guide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <Ear className="w-5 h-5" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              2. Using SHRUTI (Speech-to-Text & Indian Sign Language)
            </h2>
          </div>
          <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Speech-to-Text:</strong> Tap the big purple microphone button to start recording. Speak naturally in English, Kannada, Hindi, or other languages. Tap Stop to generate live accessible captions.
            </li>
            <li>
              <strong>Indian Sign Language Camera:</strong> Switch to the "Sign-Language Camera" tab. Position hands clearly in front of the camera and click "Analyze Hand Sign" to translate gestures into text and spoken audio.
            </li>
            <li>
              <strong>Preset Dictionary:</strong> Tap any sign preset (Namaste, Help, Water, Food) to evaluate the sign recognition model with sample images.
            </li>
          </ol>
        </div>

        {/* Gati Guide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-600">
            <Navigation className="w-5 h-5" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              3. Using GATI (Smart Location & Wheelchair Mobility)
            </h2>
          </div>
          <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Current GPS Location:</strong> Tap "Refresh GPS" to locate yourself. Your location will appear on the map with reverse-geocoded landmark details.
            </li>
            <li>
              <strong>Destination Search:</strong> Type a landmark name or tap the microphone icon to speak your destination (e.g., "City Metro Station").
            </li>
            <li>
              <strong>Wheelchair Mode:</strong> Toggle "Wheelchair-Friendly Routing" to highlight step-free, ramp-accessible walking paths.
            </li>
            <li>
              <strong>Spoken Turn Navigation:</strong> Tap "Start Spoken Turn Navigation" to receive audio turn instructions as you travel.
            </li>
          </ol>
        </div>

        {/* Communication Guide */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-violet-600">
            <Languages className="w-5 h-5" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              4. Using COMMUNICATION (Automatic Two-Way Dialogue)
            </h2>
          </div>
          <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Two-Person Setup:</strong> Person A speaks their native language (e.g. Kannada). INCLUVIA automatically detects Kannada and translates it into English for Person B.
            </li>
            <li>
              <strong>Replying:</strong> Person B replies in English. INCLUVIA automatically translates the response back into Kannada and speaks it aloud.
            </li>
            <li>
              <strong>Quick Phrases:</strong> Speech-impaired users can tap preset accessibility cards to speak immediate requests without typing.
            </li>
          </ol>
        </div>

        {/* Keyboard & Accessibility Tips */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
            <Keyboard className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-base">Keyboard Navigation & Screen Reader Support</h2>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
            <li><strong>Tab / Shift+Tab:</strong> Move between interactive controls and buttons.</li>
            <li><strong>Space / Enter:</strong> Activate the focused button or toggle switch.</li>
            <li><strong>High Contrast Mode:</strong> Tap the contrast icon in the top navbar or Settings to toggle high-contrast WCAG AAA theme.</li>
            <li><strong>ARIA Live Regions:</strong> Spoken warnings and captions are tagged with <code>aria-live="polite"</code> for screen readers like NVDA, JAWS, and VoiceOver.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
