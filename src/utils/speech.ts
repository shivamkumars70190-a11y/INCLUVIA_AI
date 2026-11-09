/**
 * INCLUVIA AI — Accessible Audio & Speech Synthesis Engine
 */

let lastSpokenText: string = '';
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play subtle, accessible acoustic tones for visually impaired navigation cues
 */
export function playAcousticAlert(type: 'hazard' | 'warning' | 'clear' | 'click' | 'start') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'hazard') {
      // Rapid urgent double low-pitch beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(220, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'warning') {
      // Single attention pulse
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'clear') {
      // Pleasant rising high chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      // Soft tactile click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (e) {
    // Non-fatal if audio context is blocked
    console.warn('Acoustic tone error:', e);
  }
}

/**
 * Text-to-Speech synthesizer with language selection and queue management
 */
export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    interrupt?: boolean;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this browser environment');
    return;
  }

  if (!text || !text.trim()) return;

  lastSpokenText = text;

  const { rate = 1.0, pitch = 1.0, lang = 'en-US', interrupt = true, onEnd } = options || {};

  if (interrupt) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

  // Determine best matching voice
  const voices = window.speechSynthesis.getVoices();
  const langLower = lang.toLowerCase();

  // Try exact match or language prefix match (e.g. 'kn', 'hi', 'ta', 'te', 'en')
  const matchedVoice = voices.find(
    (v) =>
      v.lang.toLowerCase() === langLower ||
      v.lang.toLowerCase().startsWith(langLower.slice(0, 2))
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  } else {
    utterance.lang = lang;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
  }

  // Workaround for Chrome voice garbage collection bug
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function repeatLastSpokenInstruction(options?: { rate?: number; pitch?: number }) {
  if (lastSpokenText) {
    speakText(lastSpokenText, options);
  }
}

export function getLastSpokenText(): string {
  return lastSpokenText;
}

export function isSpeaking(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis?.speaking;
}
