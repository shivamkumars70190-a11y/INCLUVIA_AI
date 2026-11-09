import React from 'react';
import { ActiveTab } from '../types';
import { Shield, Info, HelpCircle, Lock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                INCLUVIA <span className="text-blue-400">AI</span>
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">One Intelligence. Every Ability.</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-lg">
              Unified, real-time AI accessibility platform built to empower individuals with visual,
              hearing, mobility, and speech disabilities. Engineered for privacy, real-time edge processing,
              and multilingual support.
            </p>
            <div className="pt-2 text-[11px] text-amber-400/90 flex items-start gap-1.5 leading-snug">
              <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <strong>Safety Notice:</strong> Assistive aid only. Never disregard white canes, guide animals,
                wheelchair safety protocols, or physical indicators.
              </span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('drishti')}
                  className="hover:text-white transition-colors"
                >
                  Drishti — Real-Time Vision & Hazard AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('shruti')}
                  className="hover:text-white transition-colors"
                >
                  Shruti — Speech & Indian Sign Language
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('gati')}
                  className="hover:text-white transition-colors"
                >
                  Gati — Mobility & Wheelchair Navigation
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('communication')}
                  className="hover:text-white transition-colors"
                >
                  Communication — Multilingual Two-Way
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Help */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Governance & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>About INCLUVIA</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privacy & Camera Security</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('help')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>User Guides & Accessibility</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="hover:text-white transition-colors"
                >
                  Accessibility Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 INCLUVIA AI. Dedicated to universal human accessibility.</p>
          <div className="flex items-center gap-4">
            <span>WCAG 2.2 AA Compliant</span>
            <span>·</span>
            <span>Zero Unverified Fallbacks</span>
            <span>·</span>
            <span>Server-Encrypted API Pipelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
