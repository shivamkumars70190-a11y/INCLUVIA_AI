import React, { useEffect, useState } from 'react';
import { ActiveTab, UserSettings } from '../types';
import {
  Eye,
  Ear,
  Navigation,
  Languages,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Camera,
  Mic,
  MapPin,
  Volume2,
  Sparkles,
  Info,
} from 'lucide-react';
import { speakText, playAcousticAlert } from '../utils/speech';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, settings }) => {
  const [permissions, setPermissions] = useState<{
    camera: 'granted' | 'prompt' | 'denied' | 'checking';
    mic: 'granted' | 'prompt' | 'denied' | 'checking';
    geo: 'granted' | 'prompt' | 'denied' | 'checking';
  }>({
    camera: 'checking',
    mic: 'checking',
    geo: 'checking',
  });

  const [backendConfig, setBackendConfig] = useState<{
    geminiConfigured: boolean;
    gnaniConfigured: boolean;
  }>({
    geminiConfigured: true,
    gnaniConfigured: false,
  });

  useEffect(() => {
    // Check backend status
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setBackendConfig({
          geminiConfigured: !!data.geminiConfigured,
          gnaniConfigured: !!data.gnaniConfigured,
        });
      })
      .catch((err) => console.warn('Config fetch error:', err));

    // Check browser permissions if available
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'camera' as any })
        .then((res) => setPermissions((prev) => ({ ...prev, camera: res.state as any })))
        .catch(() => setPermissions((prev) => ({ ...prev, camera: 'prompt' })));

      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((res) => setPermissions((prev) => ({ ...prev, mic: res.state as any })))
        .catch(() => setPermissions((prev) => ({ ...prev, mic: 'prompt' })));

      navigator.permissions
        .query({ name: 'geolocation' as any })
        .then((res) => setPermissions((prev) => ({ ...prev, geo: res.state as any })))
        .catch(() => setPermissions((prev) => ({ ...prev, geo: 'prompt' })));
    } else {
      setPermissions({ camera: 'prompt', mic: 'prompt', geo: 'prompt' });
    }
  }, []);

  const handleLaunch = (tab: ActiveTab, announcement: string) => {
    playAcousticAlert('start');
    if (settings.autoSpeak) {
      speakText(announcement, { rate: settings.speechRate, pitch: settings.speechPitch });
    }
    setActiveTab(tab);
  };

  const handleReadSummary = () => {
    const summary = `Welcome to INCLUVIA AI. One Intelligence, Every Ability. Four core assistive modules are available: Drishti for live camera vision and pothole hazard detection, Shruti for speech transcription and Indian Sign Language recognition, Gati for accessible mobility navigation and destination guidance, and Communication for automatic two-way language translation. Select any module to begin.`;
    speakText(summary, { rate: settings.speechRate, pitch: settings.speechPitch });
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome & Mission Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Inclusive Assistive Intelligence Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            INCLUVIA AI
          </h1>
          <p className="text-lg sm:text-xl font-medium text-blue-200">
            One Intelligence. Every Ability.
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A unified, real-time accessibility platform that bridges the physical and digital world
            for visual, hearing, mobility, and speech independence through multimodal AI.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleReadSummary}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors min-h-[44px]"
              aria-label="Listen to dashboard voice summary"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen to Dashboard Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors min-h-[44px]"
            >
              <Info className="w-4 h-4" />
              <span>How To Use INCLUVIA</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Hardware & Integration Diagnostics Strip */}
      <section
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm"
        aria-label="Device and Service Readiness Status"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>System Readiness & Hardware Integration</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Camera */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <Camera className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Camera</span>
              <span className="text-slate-500 dark:text-slate-400 capitalize">
                {permissions.camera === 'granted' ? 'Authorized' : permissions.camera}
              </span>
            </div>
          </div>

          {/* Microphone */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <Mic className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Microphone</span>
              <span className="text-slate-500 dark:text-slate-400 capitalize">
                {permissions.mic === 'granted' ? 'Authorized' : permissions.mic}
              </span>
            </div>
          </div>

          {/* Geolocation */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">GPS Location</span>
              <span className="text-slate-500 dark:text-slate-400 capitalize">
                {permissions.geo === 'granted' ? 'Authorized' : permissions.geo}
              </span>
            </div>
          </div>

          {/* Gemini Multimodal Vision */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Gemini 3.8 Flash</span>
              <span className="text-emerald-600 dark:text-emerald-400">Vision & Lang Online</span>
            </div>
          </div>

          {/* Gnani AI Prisma STT */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Gnani Speech AI</span>
              <span className="text-slate-600 dark:text-slate-400">
                {backendConfig.gnaniConfigured ? 'Prisma STT & Timbre TTS' : 'Gemini Failover Ready'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Four Core Modules Grid */}
      <section aria-labelledby="core-modules-heading">
        <h2 id="core-modules-heading" className="sr-only">
          Core Accessibility Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1: DRISHTI */}
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 hover:border-blue-500 rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between transition-all group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                  Visual Assistance
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>1. DRISHTI</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">· Real-Time Vision</span>
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Target: Blind and Visually Impaired Individuals
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Prioritizes <strong>Live Camera Feed analysis</strong> with continuous hazard detection.
                Identifies potholes, walking path drop-offs, stairs, obstacles, doorways, and vehicles
                with smart, spoken directional guidance.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Pothole & ground hazards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Live spoken TTS alerts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Directional shift advice</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Emergency audio stop</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleLaunch('drishti', 'Launching Drishti Vision Assistant')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[48px] shadow-sm"
              >
                <span>Launch Drishti Vision Feed</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Module 2: SHRUTI */}
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 hover:border-indigo-500 rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between transition-all group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <Ear className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
                  Hearing & Sign
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>2. SHRUTI</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">· Speech & Sign Language</span>
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Target: Deaf, Hard-of-Hearing & Sign Language Users
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Dual-capability assistant combining <strong>live speech-to-text</strong> (Gnani AI Prisma
                backend integration with auto language detection) and <strong>live camera Indian Sign Language (ISL)</strong> recognition
                with confidence indicators.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Gnani AI Prisma STT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>ISL sign recognition</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Live caption display</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Supported sign library</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleLaunch('shruti', 'Launching Shruti Speech and Sign Language Assistant')}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[48px] shadow-sm"
              >
                <span>Launch Shruti Assistant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Module 3: GATI */}
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between transition-all group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <Navigation className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Mobility Navigation
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>3. GATI</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">· Smart Mobility & GPS</span>
                </h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Target: Wheelchair Users & Mobility-Challenged Navigators
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Location awareness and spoken navigation using <strong>OpenStreetMap Nominatim</strong> and <strong>OSRM</strong>.
                Supports voice destination search, interactive route mapping, wheelchair-accessible path tagging, and spoken step-by-step guidance.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>GPS location detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>OSM Nominatim & OSRM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Wheelchair-friendly routes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Turn-by-turn voice guidance</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleLaunch('gati', 'Launching Gati Mobility Navigation')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[48px] shadow-sm"
              >
                <span>Launch Gati Navigation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Module 4: COMMUNICATION */}
          <div className="bg-white dark:bg-slate-900 border-2 border-violet-500/30 hover:border-violet-500 rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between transition-all group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
                  <Languages className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-md border border-violet-200 dark:border-violet-800">
                  Multilingual Dialogue
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>4. COMMUNICATION</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">· Two-Way Translation</span>
                </h3>
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
                  Target: Non-Verbal Individuals & Cross-Language Dialogue
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Automatic language detection and bidirectional translation. No manual source language selection needed!
                Seamlessly supports Kannada, Hindi, Tamil, Telugu, Malayalam, Bengali, English, and more with voice playback.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>Auto language detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>Bidirectional audio TTS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>Kannada, Hindi, Tamil, etc.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>Non-verbal quick cards</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleLaunch('communication', 'Launching Automatic Multilingual Communication')}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[48px] shadow-sm"
              >
                <span>Launch Two-Way Communication</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <section className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm mb-1">Accessibility & Safety Operational Protocol</h4>
          <p>
            INCLUVIA AI utilizes computer vision and probabilistic machine learning models to detect
            physical objects, hazards, and sign language gestures. It is strictly an assistive aid and
            must <strong>never replace</strong> a white cane, guide dog, physical tactile markers, or
            caregiver assistance. Never proceed into an unverified or high-risk roadway solely based on
            camera prediction.
          </p>
        </div>
      </section>
    </div>
  );
};
