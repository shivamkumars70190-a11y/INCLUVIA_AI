/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, UserSettings } from './types';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, applySettingsToDOM } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { DrishtiView } from './components/DrishtiView';
import { ShrutiView } from './components/ShrutiView';
import { GatiView } from './components/GatiView';
import { CommunicationView } from './components/CommunicationView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { PrivacyView } from './components/PrivacyView';
import { HelpView } from './components/HelpView';
import { speakText, stopSpeaking } from './utils/speech';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Apply visual styling settings on initial load and update
  useEffect(() => {
    applySettingsToDOM(settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  // Announce view changes for screen-reader users
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    stopSpeaking();

    const tabLabels: Record<ActiveTab, string> = {
      dashboard: 'Dashboard view',
      drishti: 'Drishti Real-Time Vision and Hazard Guidance',
      shruti: 'Shruti Speech-to-Text and Indian Sign Language Assistant',
      gati: 'Gati Smart Location and Wheelchair Mobility Navigation',
      communication: 'Two-Way Multilingual Communication',
      settings: 'Accessibility Settings',
      about: 'About INCLUVIA AI',
      privacy: 'Privacy and Sensor Governance',
      help: 'User Instructions and Help',
    };

    if (settings.autoSpeak) {
      speakText(`Switched to ${tabLabels[tab]}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    }
  };

  // Global keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1..5 for quick tab switching
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          handleTabChange('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          handleTabChange('drishti');
        } else if (e.key === '3') {
          e.preventDefault();
          handleTabChange('shruti');
        } else if (e.key === '4') {
          e.preventDefault();
          handleTabChange('gati');
        } else if (e.key === '5') {
          e.preventDefault();
          handleTabChange('communication');
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleTabChange('settings');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          handleTabChange('help');
        } else if (e.key === 'Escape') {
          // Emergency escape stops all speech immediately
          stopSpeaking();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Accessible Skip Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-xl focus:top-2 focus:left-2 font-bold text-sm"
      >
        Skip directly to primary content
      </a>

      {/* Primary Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        settings={settings}
        updateSettings={updateSettings}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {activeTab === 'dashboard' && (
          <DashboardView setActiveTab={handleTabChange} settings={settings} />
        )}
        {activeTab === 'drishti' && <DrishtiView settings={settings} />}
        {activeTab === 'shruti' && <ShrutiView settings={settings} />}
        {activeTab === 'gati' && <GatiView settings={settings} />}
        {activeTab === 'communication' && <CommunicationView settings={settings} />}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            updateSettings={updateSettings}
            resetSettings={resetSettings}
          />
        )}
        {activeTab === 'about' && <AboutView setActiveTab={handleTabChange} />}
        {activeTab === 'privacy' && <PrivacyView />}
        {activeTab === 'help' && <HelpView setActiveTab={handleTabChange} />}
      </main>

      {/* Primary Footer */}
      <Footer setActiveTab={handleTabChange} />
    </div>
  );
}
