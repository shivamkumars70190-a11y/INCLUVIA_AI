import React, { useState, useRef, useEffect } from 'react';
import { UserSettings, ConversationMessage } from '../types';
import {
  Languages,
  Mic,
  MicOff,
  Send,
  Volume2,
  Trash2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  User,
  UserCheck,
  RefreshCw,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';
import { speakText, stopSpeaking, playAcousticAlert } from '../utils/speech';

interface CommunicationViewProps {
  settings: UserSettings;
}

const QUICK_ACCESSIBILITY_PHRASES = [
  'I have a speech impairment. Please speak into this phone.',
  'Could you please guide me to the nearest elevator or ramp?',
  'Where is the accessible restroom?',
  'Thank you very much for your patience and assistance.',
  'Please wait a moment while I type my response.',
  'I am blind and using an assistive screen reader.',
];

const LANGUAGE_DISPLAY_MAP: Record<string, string> = {
  en: 'English',
  kn: 'Kannada (ಕನ್ನಡ)',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  ml: 'Malayalam (മലയാളം)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
};

export const CommunicationView: React.FC<CommunicationViewProps> = ({ settings }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'demo-1',
      speaker: 'speakerA',
      speakerName: 'Person A (Other Person)',
      originalText: 'ನಮಸ್ಕಾರ, ಈ ಬಸ್ ಮೆಜೆಸ್ಟಿಕ್ ಕಡೆಗೆ ಹೋಗುತ್ತದೆಯೇ?',
      detectedLanguage: 'Kannada',
      detectedLanguageCode: 'kn',
      translatedText: 'Hello, does this bus go towards Majestic?',
      targetLanguage: 'English',
      romanizedPronunciation: 'Namaskara, ee bus Majestic kadege hoguttadeye?',
      timestamp: Date.now() - 60000,
    },
    {
      id: 'demo-2',
      speaker: 'speakerB',
      speakerName: 'You (User)',
      originalText: 'Yes, this bus goes directly to Majestic bus station.',
      detectedLanguage: 'English',
      detectedLanguageCode: 'en',
      translatedText: 'ಹೌದು, ಈ ಬಸ್ ನೇರವಾಗಿ ಮೆಜೆಸ್ಟಿಕ್ ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗುತ್ತದೆ.',
      targetLanguage: 'Kannada',
      romanizedPronunciation: 'Haudu, ee bus neravagi Majestic bus nildanakke hoguttade.',
      timestamp: Date.now() - 30000,
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<'speakerA' | 'speakerB'>('speakerA');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [autoSpeakTranslation, setAutoSpeakTranslation] = useState<boolean>(true);
  const [otherPersonDetectedLanguage, setOtherPersonDetectedLanguage] = useState<string>('Kannada');

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTranslating]);

  // Determine target language based on speaker
  const userLanguageName = LANGUAGE_DISPLAY_MAP[settings.preferredLanguage] || 'English';

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setIsTranslating(true);
    setInputText('');
    playAcousticAlert('click');

    // If Speaker A (Other Person) is speaking, target language is user's preferred language (e.g. English)
    // If Speaker B (User) is responding, target language is the other person's detected language (e.g. Kannada)
    const targetLang =
      currentSpeaker === 'speakerA' ? userLanguageName : otherPersonDetectedLanguage || 'English';

    try {
      const response = await fetch('/api/communication/translate-and-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetLang,
          speakerRole: currentSpeaker,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const t = data.translation;

      const newMessage: ConversationMessage = {
        id: 'msg-' + Date.now(),
        speaker: currentSpeaker,
        speakerName: currentSpeaker === 'speakerA' ? 'Person A (Other Person)' : 'You (User)',
        originalText: text,
        detectedLanguage: t.detectedLanguage,
        detectedLanguageCode: t.detectedLanguageCode,
        translatedText: t.translatedText,
        targetLanguage: t.targetLanguage,
        romanizedPronunciation: t.romanizedPronunciation,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // If Person A spoke, save their detected language for Person B's subsequent reply
      if (currentSpeaker === 'speakerA') {
        setOtherPersonDetectedLanguage(t.detectedLanguage);
      }

      playAcousticAlert('clear');

      // Auto speak aloud
      if (autoSpeakTranslation && t.translatedText) {
        speakText(t.translatedText, {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
          lang: t.speechSynthesisRecommendedLang || 'en-US',
        });
      }

      // Switch active speaker for smooth two-way turn taking
      setCurrentSpeaker(currentSpeaker === 'speakerA' ? 'speakerB' : 'speakerA');
    } catch (err: any) {
      console.error('Translation error:', err);
      alert('Translation service error: ' + (err.message || 'Please check connection'));
    } finally {
      setIsTranslating(false);
    }
  };

  // Microphone speech input for current speaker
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is unavailable. Please type your message.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListeningMic(true);
      playAcousticAlert('start');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListeningMic(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListeningMic(false);
    };

    recognition.onend = () => {
      setIsListeningMic(false);
    };

    recognition.start();
  };

  const handleSpeakAloud = (msg: ConversationMessage) => {
    speakText(msg.translatedText, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  const clearConversation = () => {
    setMessages([]);
    stopSpeaking();
    playAcousticAlert('click');
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            <Languages className="w-4 h-4" />
            <span>Automatic Multilingual Communication</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            COMMUNICATION — Bidirectional Two-Way Dialogue
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automatic language detection across Kannada, Hindi, Tamil, Telugu, English, and more.
            No manual language selection required.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearConversation}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 min-h-[44px]"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Phrases & Speaker Mode Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Speaker Switcher */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Active Speaking Role
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentSpeaker('speakerA')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all min-h-[64px] ${
                  currentSpeaker === 'speakerA'
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Person A (Other)</span>
                <span className="text-[10px] font-normal opacity-80">Speaks Any Language</span>
              </button>

              <button
                onClick={() => setCurrentSpeaker('speakerB')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all min-h-[64px] ${
                  currentSpeaker === 'speakerB'
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>You (User)</span>
                <span className="text-[10px] font-normal opacity-80">In: {userLanguageName}</span>
              </button>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Other Person Detected Language:</span>
              <strong className="text-violet-600 dark:text-violet-400">{otherPersonDetectedLanguage}</strong>
            </div>
          </div>

          {/* Quick Phrase Cards for Non-Verbal / Mobility Users */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Quick Phrases (Speech Impaired)
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <div className="space-y-1.5">
              {QUICK_ACCESSIBILITY_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSpeaker('speakerB');
                    handleSendMessage(phrase);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-violet-500 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat History & Input Dock (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm min-h-[460px] flex flex-col justify-between">
            {/* Conversation Messages */}
            <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2" aria-live="polite">
              {messages.length === 0 ? (
                <div className="py-24 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No active conversation messages.
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Type a message or press the microphone below. The language will be identified
                    automatically and translated.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.speaker === 'speakerB';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {msg.speakerName}
                        </span>
                        <span>·</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                          Detected: {msg.detectedLanguage}
                        </span>
                      </div>

                      <div
                        className={`max-w-lg p-4 rounded-2xl space-y-2 shadow-sm ${
                          isUser
                            ? 'bg-violet-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Original Message */}
                        <div>
                          <span className={`text-[10px] uppercase font-bold block ${isUser ? 'text-violet-200' : 'text-slate-500'}`}>
                            Original ({msg.detectedLanguage}):
                          </span>
                          <p className="text-sm font-medium">{msg.originalText}</p>
                        </div>

                        {/* Translated Message */}
                        <div className={`pt-2 border-t ${isUser ? 'border-violet-500' : 'border-slate-200 dark:border-slate-700'}`}>
                          <span className={`text-[10px] uppercase font-bold block ${isUser ? 'text-violet-200' : 'text-slate-500'}`}>
                            Translated into {msg.targetLanguage}:
                          </span>
                          <p className="text-base font-bold">{msg.translatedText}</p>
                        </div>

                        {/* Romanized pronunciation if present */}
                        {msg.romanizedPronunciation && (
                          <div className={`text-[11px] italic ${isUser ? 'text-violet-200' : 'text-slate-500'}`}>
                            Pronunciation: "{msg.romanizedPronunciation}"
                          </div>
                        )}

                        {/* Action: Speak translation aloud */}
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            onClick={() => handleSpeakAloud(msg)}
                            className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                              isUser ? 'hover:bg-violet-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400'
                            }`}
                            title="Speak translated text aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Speak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {isTranslating && (
                <div className="flex items-center gap-2 p-3 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span>Detecting language and generating translation...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Dock */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Typing as: <strong>{currentSpeaker === 'speakerA' ? 'Person A (Other)' : 'You (User)'}</strong>
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeakTranslation}
                    onChange={(e) => setAutoSpeakTranslation(e.target.checked)}
                    className="w-3.5 h-3.5 text-violet-600 rounded"
                  />
                  <span>Auto-speak translated response</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    currentSpeaker === 'speakerA'
                      ? 'Person A speaks or types here (e.g. Kannada, Hindi, etc.)...'
                      : 'You reply here (e.g. in English)...'
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 min-h-[48px]"
                />

                <button
                  onClick={startSpeechRecognition}
                  className={`p-3 rounded-xl border min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors ${
                    isListeningMic
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-violet-600'
                  }`}
                  title="Speak through microphone"
                  aria-label="Speak through microphone"
                >
                  {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isTranslating || !inputText.trim()}
                  className="px-5 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 min-h-[48px]"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
