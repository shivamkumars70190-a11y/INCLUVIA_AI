import React, { useState } from 'react';
import { ActiveTab, UserSettings } from '../types';
import {
  Eye,
  Ear,
  Navigation,
  Languages,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Menu,
  X,
  VolumeX,
  Contrast,
  AlertOctagon,
} from 'lucide-react';
import { stopSpeaking, playAcousticAlert } from '../utils/speech';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'drishti', label: 'Drishti Vision', icon: <Eye className="w-4 h-4" /> },
    { id: 'shruti', label: 'Shruti Speech & Sign', icon: <Ear className="w-4 h-4" /> },
    { id: 'gati', label: 'Gati Mobility', icon: <Navigation className="w-4 h-4" /> },
    { id: 'communication', label: 'Communication', icon: <Languages className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    playAcousticAlert('click');
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleEmergencyStop = () => {
    stopSpeaking();
    playAcousticAlert('hazard');
  };

  const toggleContrast = () => {
    playAcousticAlert('click');
    updateSettings({ highContrast: !settings.highContrast });
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-left group flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md p-1"
              aria-label="INCLUVIA AI Home Dashboard"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
                IN
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-none">
                  INCLUVIA <span className="text-blue-400 font-extrabold">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal tracking-wide">
                  One Intelligence. Every Ability.
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md whitespace-nowrap transition-colors min-h-[40px] ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Accessibility Tools & Emergency Stop Action */}
          <div className="flex items-center gap-2 shrink-0">
            {/* High Contrast Toggle */}
            <button
              onClick={toggleContrast}
              className={`p-2 rounded-lg border transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${
                settings.highContrast
                  ? 'bg-yellow-400 border-yellow-300 text-black font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={settings.highContrast ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode'}
              aria-label={settings.highContrast ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode'}
            >
              <Contrast className="w-4 h-4" />
            </button>

            {/* Quick Silence Speech / Emergency Stop */}
            <button
              onClick={handleEmergencyStop}
              className="px-3 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors min-h-[40px] whitespace-nowrap"
              title="Stop all audio speech immediately"
              aria-label="Silence all speech output immediately"
            >
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">Silence Audio</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-5 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium min-h-[48px] text-left transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => handleNavClick('help')}
              className="flex-1 py-2.5 px-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-sm flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Instructions</span>
            </button>
            <button
              onClick={handleEmergencyStop}
              className="flex-1 py-2.5 px-3 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Emergency Silence</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
