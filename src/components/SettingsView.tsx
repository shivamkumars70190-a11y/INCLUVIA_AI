import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import {
  Settings,
  Languages,
  Type,
  Contrast,
  Volume2,
  Camera,
  Mic,
  MapPin,
  Lock,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { speakText, playAcousticAlert } from '../utils/speech';

interface SettingsViewProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (Default)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  updateSettings,
  resetSettings,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [dataClearedNotice, setDataClearedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestVoice = () => {
    playAcousticAlert('start');
    speakText(
      'This is a sample voice output from INCLUVIA AI. Your accessibility speech rate and pitch have been applied.',
      {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      }
    );
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to clear your saved accessibility preferences and cached conversation data?')) {
      localStorage.clear();
      resetSettings();
      setDataClearedNotice(true);
      setTimeout(() => setDataClearedNotice(false), 3000);
      playAcousticAlert('clear');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>User Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Accessibility & Hardware Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Personalize language, visual legibility, high contrast, text-to-speech rate, and device permissions.
          All settings are saved locally to your device.
        </p>
      </div>

      {dataClearedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Local storage preferences and cached history successfully reset.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Language & Visual Legibility */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            <span>Language & Display</span>
          </h2>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label htmlFor="preferred-lang-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Preferred User Interface & Output Language
            </label>
            <select
              id="preferred-lang-select"
              value={settings.preferredLanguage}
              onChange={(e) => updateSettings({ preferredLanguage: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Text Scaling (Font Size)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ textSize: size })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize min-h-[44px] transition-colors ${
                    settings.textSize === size
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {size === 'normal' ? 'Normal (100%)' : size === 'large' ? 'Large (115%)' : 'Extra Large (130%)'}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                <Contrast className="w-4 h-4 text-yellow-500" />
                <span>High Contrast Mode (WCAG AAA)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Enhances text contrast and sharp borders for low vision
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Reduced Motion
              </span>
              <span className="text-[11px] text-slate-500">
                Suppresses decorative transitions for vestibular sensitivities
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: Speech Output & Audio Parameters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>Speech Output (TTS) & Acoustic Feedback</span>
          </h2>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Automatic Speech Playback
              </span>
              <span className="text-[11px] text-slate-500">
                Speaks hazard alerts and navigation turns as they arrive
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Voice Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Speech Rate (Speed):</span>
              <span className="font-mono">{settings.speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>1.5x Fast</span>
            </div>
          </div>

          {/* Voice Pitch */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Speech Pitch:</span>
              <span className="font-mono">{settings.speechPitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.speechPitch}
              onChange={(e) => updateSettings({ speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Deep</span>
              <span>Balanced</span>
              <span>High</span>
            </div>
          </div>

          {/* Voice Test Action */}
          <div className="pt-2">
            <button
              onClick={handleTestVoice}
              className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 min-h-[44px]"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Speech Voice Synthesis</span>
            </button>
          </div>
        </div>

        {/* Section 3: Device Hardware Permissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Hardware Permissions Guide</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Camera className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Camera Feed</span>
                <p className="text-slate-500 mt-0.5">
                  Used by Drishti for live hazard detection and Shruti for Indian Sign Language.
                  Camera frames are processed in memory and never stored.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Mic className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Microphone</span>
                <p className="text-slate-500 mt-0.5">
                  Used by Shruti for live conversation transcription and Communication for two-way audio.
                  Microphone streams only activate when you tap the mic button.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">GPS Geolocation</span>
                <p className="text-slate-500 mt-0.5">
                  Used by Gati to determine starting position and compute step-free walking directions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Privacy & Data Retention */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Privacy & Local Data</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              INCLUVIA AI does not track users or store camera/audio recordings on third-party servers.
              Transcriptions, sign detection, and routes are calculated in-flight over secure HTTPS connections.
            </p>
            <p>
              Your settings and preferences are kept exclusively inside your browser's local storage.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleClearLocalData}
              className="py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-2 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All Saved Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
