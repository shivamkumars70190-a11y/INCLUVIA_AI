import { UserSettings } from '../types';

const STORAGE_KEY = 'incluvia_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  preferredLanguage: 'en',
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  autoSpeak: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  soundAlerts: true,
  emergencyContact: '',
};

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applySettingsToDOM(settings);
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function applySettingsToDOM(settings: UserSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // High contrast mode
  if (settings.highContrast) {
    root.classList.add('high-contrast-mode');
  } else {
    root.classList.remove('high-contrast-mode');
  }

  // Reduced motion
  if (settings.reducedMotion) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }

  // Text size scaling
  root.classList.remove('text-size-large', 'text-size-xlarge');
  if (settings.textSize === 'large') {
    root.style.fontSize = '18px';
  } else if (settings.textSize === 'xlarge') {
    root.style.fontSize = '20px';
  } else {
    root.style.fontSize = '16px';
  }
}
