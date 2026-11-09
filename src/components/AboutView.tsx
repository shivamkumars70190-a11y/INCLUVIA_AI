import React from 'react';
import { ActiveTab } from '../types';
import { Eye, Ear, Navigation, Languages, Shield, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setActiveTab }) => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Product Mission & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          About INCLUVIA AI
        </h1>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          One Intelligence. Every Ability.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          INCLUVIA AI is a unified, real-time accessibility platform designed to empower people with
          visual, hearing, mobility, and speech disabilities to interact with the world more independently.
          By combining edge sensory inputs with multimodal artificial intelligence, INCLUVIA bridges physical
          and communication barriers in a single, accessible, private workspace.
        </p>
      </div>

      {/* The 4 Core Modules Detailed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          The Four Pillars of INCLUVIA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Drishti */}
          <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center gap-2.5 text-blue-600">
              <Eye className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                1. DRISHTI — AI Vision Assistant
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Designed for blind and visually impaired individuals. Prioritizes continuous live camera
              sensing to identify ground hazards (potholes, cracks, drop-offs, stairs), surrounding
              pedestrians, doorways, vehicles, and provides smart spoken directional instructions ("shift right", "proceed straight").
            </p>
            <button
              onClick={() => setActiveTab('drishti')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Explore Drishti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Shruti */}
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <Ear className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                2. SHRUTI — Speech & Sign Language
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tailored for deaf, hard-of-hearing individuals, and signers. Delivers real-time speech-to-text
              transcription with automatic language detection (integrating Gnani AI Prisma backend with Gemini audio failover)
              and live camera Indian Sign Language (ISL) recognition with confidence indicators.
            </p>
            <button
              onClick={() => setActiveTab('shruti')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Explore Shruti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gati */}
          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <Navigation className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                3. GATI — Smart Mobility & GPS
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Empowers wheelchair users and navigators with mobility challenges. Combines OpenStreetMap
              geocoding, OSRM routing, step-free wheelchair path filters, and spoken turn-by-turn guidance.
            </p>
            <button
              onClick={() => setActiveTab('gati')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Explore Gati</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Communication */}
          <div className="p-5 rounded-2xl border border-violet-200 dark:border-violet-900 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center gap-2.5 text-violet-600">
              <Languages className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                4. COMMUNICATION — Multilingual Dialogue
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Enables seamless two-way conversation between non-verbal individuals or speakers of different
              languages. Automatically detects the other speaker's language (Kannada, Hindi, Tamil, Telugu, English, etc.)
              without manual toggling, translates bidirectionally, and speaks the translated response aloud.
            </p>
            <button
              onClick={() => setActiveTab('communication')}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Explore Communication</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Safety Commitment Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 text-xs leading-relaxed">
        <h4 className="font-bold text-sm flex items-center gap-2 text-amber-400">
          <Shield className="w-4 h-4" />
          <span>Ethical & Safe Assistive Technology Standard</span>
        </h4>
        <p className="text-slate-300">
          INCLUVIA AI adheres strictly to non-hallucinatory accessibility design. When sensory models
          have low visual confidence, they do not pretend a path is clear. The platform acts as an augmenting
          companion and actively instructs users to rely on primary white canes, physical guide dogs,
          and tactile ground markers.
        </p>
      </div>
    </div>
  );
};
