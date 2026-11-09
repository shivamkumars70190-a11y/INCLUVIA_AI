import React from 'react';
import { Lock, Shield, Camera, Mic, MapPin, Eye, Server, CheckCircle2 } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>User Data Protection & Privacy Charter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy, Camera & Sensor Governance
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          INCLUVIA AI is built on the principle of privacy by design for vulnerable users. We believe
          assistive technology must protect user dignity and personal physical safety above all else.
          Here is exactly how sensory data, recordings, and location coordinates are handled.
        </p>
      </div>

      {/* Sensor Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Camera Privacy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Camera Sensor</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>What it does:</strong> Live frames are analyzed solely to detect physical hazards
            (potholes, steps, obstacles) in Drishti and hand gestures in Shruti.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Data Lifecycle:</strong> Frames are processed ephemerally in RAM. Frames are never stored
            on permanent disk, saved in databases, or used to build facial recognition profiles.
          </p>
        </div>

        {/* Microphone Privacy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Microphone Sensor</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>What it does:</strong> Captures spoken speech during Shruti transcription or Communication
            dialogue when you tap the mic button.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Data Lifecycle:</strong> Audio is never recorded in the background. Stream stops immediately
            when the user taps Stop. Audio chunks are forwarded securely over TLS to speech engines.
          </p>
        </div>

        {/* Geolocation Privacy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">GPS Geolocation</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>What it does:</strong> Obtains your current device coordinates to plan wheelchair-friendly
            pedestrian walking routes in Gati.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Data Lifecycle:</strong> GPS coordinates are passed to OpenStreetMap Nominatim and OSRM
            for route generation and are not stored in any external tracking ledger.
          </p>
        </div>
      </div>

      {/* External Service Disclosures */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <span>External Processing Services & Cloud Disclosure</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            When sensory analysis requires machine learning inference, payload data leaves your device
            over encrypted HTTPS channels to the following dedicated endpoints:
          </p>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong>Google Gemini API:</strong> Processes visual frames for Drishti hazard analysis,
              ISL sign language posture evaluation, and automatic two-way translation.
            </li>
            <li>
              <strong>Gnani AI Prisma:</strong> Secure server-side enterprise speech-to-text processing for
              Indian languages when <code>GNANI_API_KEY</code> is enabled.
            </li>
            <li>
              <strong>OpenStreetMap (Nominatim & OSRM):</strong> Public geocoding and routing engine for
              calculating walking geometries and reverse address lookup.
            </li>
          </ul>
        </div>
      </div>

      {/* Zero Telemetry Commitment */}
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2 leading-relaxed">
        <div className="font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Zero Behavioral Tracking & No Telemetry Adware</span>
        </div>
        <p>
          INCLUVIA AI contains no third-party marketing trackers, no advertising cookies, and no background
          surveillance beacons. Your accessibility needs are strictly private to you.
        </p>
      </div>
    </div>
  );
};
