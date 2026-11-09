import React, { useState, useRef, useEffect } from 'react';
import { UserSettings, TranscriptionResult, SignRecognitionResult, SignVocabItem, GnaniTtsResult } from '../types';
import {
  Ear,
  Mic,
  Square,
  Upload,
  Volume2,
  Camera,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Languages,
  BookOpen,
  Sparkles,
  Loader2,
  Hand,
  VolumeX,
  AudioWaveform,
  Download,
  Settings2,
  ChevronDown,
  Info,
  Radio,
} from 'lucide-react';
import { speakText, stopSpeaking, playAcousticAlert } from '../utils/speech';

interface ShrutiViewProps {
  settings: UserSettings;
}

// Supported languages for Gnani AI Vachana Speech Platform
const GNANI_SUPPORTED_LANGUAGES = [
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', sample: 'ನಮಸ್ಕಾರ, ಇನ್ಕ್ಲೂವಿಯಾ ಎಐಗೆ ಸುಸ್ವಾಗತ.', defaultVoice: 'Kaveri' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', sample: 'नमस्ते, इन्क्लूविया एआई में आपका स्वागत है।', defaultVoice: 'Nalini' },
  { code: 'en-IN', name: 'English (Indian)', sample: 'Welcome to INCLUVIA AI, unified accessibility platform.', defaultVoice: 'Deepak' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', sample: 'வணக்கம், இன்க்ளூவியா ஏஐ-க்கு வரவேற்கிறோம்.', defaultVoice: 'Meera' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', sample: 'నమస్కారం, ఇంక్లూవియా ఏఐకి స్వాగతం.', defaultVoice: 'Suresh' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)', sample: 'നമസ്കാരം, ഇൻക്ലൂവിയ എഐയിലേക്ക് സ്വാഗതം.', defaultVoice: 'Kaveri' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', sample: 'নমস্কার, ইনক্লুভিয়া এআই-তে স্বাগতম।', defaultVoice: 'Sunita' },
  { code: 'mr-IN', name: 'Marathi (मराठी)', sample: 'नमस्कार, इनक्लुव्हिया एआय मध्ये आपले स्वागत आहे.', defaultVoice: 'Rohan' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)', sample: 'નમસ્તે, ઇન્ક્લુવિયા એઆઇમાં આપનું સ્વાગત છે.', defaultVoice: 'Nalini' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)', sample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਇਨਕਲੂਵੀਆ ਏਆਈ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।', defaultVoice: 'Deepak' },
];

const GNANI_VOICES = [
  { name: 'Nalini', gender: 'Female', lang: 'hi-IN', label: 'Nalini (Female · Hindi / Indic Natural)' },
  { name: 'Kaveri', gender: 'Female', lang: 'kn-IN', label: 'Kaveri (Female · Kannada / South Indic)' },
  { name: 'Deepak', gender: 'Male', lang: 'hi-IN', label: 'Deepak (Male · Hindi / Indian English)' },
  { name: 'Pranav', gender: 'Male', lang: 'kn-IN', label: 'Pranav (Male · South Indic Natural)' },
  { name: 'Meera', gender: 'Female', lang: 'ta-IN', label: 'Meera (Female · Tamil Expressive)' },
  { name: 'Rohan', gender: 'Male', lang: 'mr-IN', label: 'Rohan (Male · Marathi Warm)' },
  { name: 'Sunita', gender: 'Female', lang: 'bn-IN', label: 'Sunita (Female · Bengali Clear)' },
  { name: 'Suresh', gender: 'Male', lang: 'te-IN', label: 'Suresh (Male · Telugu Professional)' },
];

// Comprehensive Indian Sign Language (ISL) Supported Signs Dictionary
const SUPPORTED_ISL_SIGNS: SignVocabItem[] = [
  {
    id: 'hello',
    name: 'Namaste / Hello',
    category: 'Greeting',
    meaning: 'Traditional respectful greeting or welcoming gesture.',
    gestureDescription: 'Palms pressed together at chest height with slight nod, or open right palm raised facing forward waving gently.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'help',
    name: 'Help / Emergency',
    category: 'Emergency & Need',
    meaning: 'Urgent request for assistance or medical support.',
    gestureDescription: 'Closed fist with thumb upright placed on the flat open palm of the non-dominant hand, lifting upwards together.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'water',
    name: 'Water (पानी / ನೀರು)',
    category: 'Emergency & Need',
    meaning: 'Requesting drinking water.',
    gestureDescription: 'Form a "W" shape with three extended fingers (index, middle, ring) held near the mouth and tapped gently.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'food',
    name: 'Food / Eat (खाना / ಊಟ)',
    category: 'Emergency & Need',
    meaning: 'Requesting food or indicating hunger.',
    gestureDescription: 'Fingertips brought together into a point and tapped near the lips repeatedly.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'thank_you',
    name: 'Thank You (धन्यवाद / ಧನ್ಯವಾದಗಳು)',
    category: 'Common Phrases',
    meaning: 'Expressing gratitude and politeness.',
    gestureDescription: 'Fingertips of dominant flat hand touch chin and move forward and slightly downward toward the listener.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'yes',
    name: 'Yes / Agree (हाँ / ಹೌದು)',
    category: 'Responses',
    meaning: 'Affirmative response or agreement.',
    gestureDescription: 'Fist held forward nodding up and down from the wrist like a head nodding.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'no',
    name: 'No / Disagree (नहीं / ಇಲ್ಲ)',
    category: 'Responses',
    meaning: 'Negative response or decline.',
    gestureDescription: 'Index and middle fingers snap shut against the thumb, or index finger waving gently side to side.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'deaf_identity',
    name: 'I am Deaf / Hard of Hearing',
    category: 'Common Phrases',
    meaning: 'Informing listeners of hearing impairment.',
    gestureDescription: 'Index finger touches ear, then moves forward to touch near mouth or chest.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
  },
];

export const ShrutiView: React.FC<ShrutiViewProps> = ({ settings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'stt' | 'tts' | 'sign'>('stt');

  // Gnani system configuration status
  const [gnaniConfigured, setGnaniConfigured] = useState<boolean>(false);

  // 1. STT State (Gnani Prisma STT)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedSttLanguage, setSelectedSttLanguage] = useState<string>('auto');
  const [transcriptionLoading, setTranscriptionLoading] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<any>(null);

  // 2. TTS State (Gnani Timbre TTS)
  const [ttsInputText, setTtsInputText] = useState<string>('ನಮಸ್ಕಾರ, ಇನ್ಕ್ಲೂವಿಯಾ ಎಐ ನೈಸರ್ಗಿಕ ಧ್ವನಿಗೆ ಸುಸ್ವಾಗತ.');
  const [selectedTtsLanguage, setSelectedTtsLanguage] = useState<string>('kn-IN');
  const [selectedTtsVoice, setSelectedTtsVoice] = useState<string>('Kaveri');
  const [selectedTtsModel, setSelectedTtsModel] = useState<string>('timbre-v2.5');
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [ttsResult, setTtsResult] = useState<GnaniTtsResult | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const ttsAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 3. Sign Recognition State
  const signVideoRef = useRef<HTMLVideoElement | null>(null);
  const signCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signCameraActive, setSignCameraActive] = useState<boolean>(false);
  const [signLoading, setSignLoading] = useState<boolean>(false);
  const [signResult, setSignResult] = useState<SignRecognitionResult | null>(null);
  const [signError, setSignError] = useState<string | null>(null);
  const [signAutoSpeak, setSignAutoSpeak] = useState<boolean>(true);
  const signStreamRef = useRef<MediaStream | null>(null);

  // Fetch Gnani configuration on mount
  useEffect(() => {
    fetch('/api/shruti/gnani-info')
      .then((res) => res.json())
      .then((data) => {
        setGnaniConfigured(!!data.gnaniConfigured);
      })
      .catch((err) => console.warn('Gnani info error:', err));
  }, []);

  // Update default voice when TTS language changes
  const handleTtsLanguageChange = (langCode: string) => {
    setSelectedTtsLanguage(langCode);
    const matched = GNANI_SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    if (matched) {
      setSelectedTtsVoice(matched.defaultVoice);
      setTtsInputText(matched.sample);
    }
  };

  // 1. SPEECH-TO-TEXT LOGIC
  const startRecording = async () => {
    setSttError(null);
    audioChunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscriptionResult(null);
    setRecordingDuration(0);
    playAcousticAlert('start');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(fullBlob);
        setAudioUrl(URL.createObjectURL(fullBlob));
        stream.getTracks().forEach((track) => track.stop());

        // Process transcription automatically
        await submitAudioForTranscription(fullBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Duration ticker
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setSttError(
        'Unable to access microphone: ' +
          (err.name === 'NotAllowedError'
            ? 'Permission denied. Please allow microphone access in your browser settings.'
            : err.message)
      );
    }
  };

  const stopRecording = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      playAcousticAlert('click');
    }
  };

  const submitAudioForTranscription = async (blob: Blob) => {
    setTranscriptionLoading(true);
    setSttError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const response = await fetch('/api/shruti/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type || 'audio/webm',
            languageHint: selectedSttLanguage,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Transcription failed with code ${response.status}`);
        }

        const data = await response.json();
        setTranscriptionResult({
          transcript: data.transcript,
          detectedLanguage: data.detectedLanguage,
          detectedLanguageCode: data.detectedLanguageCode,
          confidence: data.confidence,
          provider: data.provider || 'Gnani AI Prisma STT',
          requestId: data.requestId,
          audioFormat: data.audioFormat || (blob.type.includes('wav') ? 'WAV' : 'WebM'),
        });
        playAcousticAlert('clear');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('STT error:', err);
      setSttError(err.message || 'Error occurred while transcribing speech with Gnani AI Prisma.');
    } finally {
      setTranscriptionLoading(false);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    submitAudioForTranscription(file);
  };

  const handleCopyTranscript = () => {
    if (transcriptionResult?.transcript) {
      navigator.clipboard.writeText(transcriptionResult.transcript);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    }
  };

  // Transfer transcript directly to Gnani TTS for immediate synthesis
  const sendTranscriptToTts = (text: string, langCode?: string) => {
    setTtsInputText(text);
    if (langCode && langCode !== 'auto') {
      setSelectedTtsLanguage(langCode);
      const matched = GNANI_SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      if (matched) setSelectedTtsVoice(matched.defaultVoice);
    }
    setActiveSubTab('tts');
    playAcousticAlert('click');
  };

  // 2. TEXT-TO-SPEECH (GNANI TIMBRE) LOGIC
  const handleSynthesizeTts = async (textToSpeak?: string) => {
    const text = (textToSpeak || ttsInputText).trim();
    if (!text) return;

    setTtsLoading(true);
    setTtsError(null);
    setTtsResult(null);
    playAcousticAlert('start');

    try {
      const response = await fetch('/api/shruti/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: selectedTtsLanguage,
          voice: selectedTtsVoice,
          speed: ttsSpeed,
          model: selectedTtsModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fallbackToSpeechSynthesis) {
          // Playback via browser speech synthesis fallback
          speakText(text, {
            rate: ttsSpeed,
            lang: selectedTtsLanguage,
          });
          setTtsError(
            (data.error || 'Gnani API key not configured or returned error.') +
              ' Fallback voice output was played via browser speech synthesis.'
          );
        } else {
          throw new Error(data.error || 'TTS generation failed');
        }
      } else {
        // Gnani synthesized raw WAV audio returned!
        setTtsResult({
          audioBase64: data.audioBase64,
          provider: data.provider || 'Gnani AI Timbre TTS',
          language: data.language,
          voice: data.voice,
          model: data.model,
        });

        playAcousticAlert('clear');

        // Play audio directly
        setTimeout(() => {
          if (ttsAudioPlayerRef.current) {
            ttsAudioPlayerRef.current.play().catch((e) => console.warn('Audio auto-play blocked:', e));
          }
        }, 150);
      }
    } catch (err: any) {
      console.error('Gnani TTS error:', err);
      setTtsError(err.message || 'Error occurred while contacting Gnani Timbre TTS service.');
      // Fallback
      speakText(text, { rate: ttsSpeed, lang: selectedTtsLanguage });
    } finally {
      setTtsLoading(false);
    }
  };

  // 3. SIGN LANGUAGE RECOGNITION LOGIC
  const startSignCamera = async () => {
    setSignError(null);
    playAcousticAlert('start');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      signStreamRef.current = mediaStream;
      if (signVideoRef.current) {
        signVideoRef.current.srcObject = mediaStream;
        await signVideoRef.current.play();
      }
      setSignCameraActive(true);
    } catch (err: any) {
      setSignError('Unable to open camera for sign recognition: ' + err.message);
    }
  };

  const stopSignCamera = () => {
    if (signStreamRef.current) {
      signStreamRef.current.getTracks().forEach((track) => track.stop());
      signStreamRef.current = null;
    }
    if (signVideoRef.current) {
      signVideoRef.current.srcObject = null;
    }
    setSignCameraActive(false);
    playAcousticAlert('click');
  };

  const captureAndRecognizeSign = async () => {
    if (!signVideoRef.current || !signCanvasRef.current) return;
    const video = signVideoRef.current;
    const canvas = signCanvasRef.current;

    canvas.width = Math.min(video.videoWidth || 640, 640);
    canvas.height = Math.floor((canvas.width / (video.videoWidth || 640)) * (video.videoHeight || 480));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    await analyzeSignFrame(base64);
  };

  const analyzeSignFrame = async (base64Image: string) => {
    setSignLoading(true);
    setSignError(null);
    playAcousticAlert('click');

    try {
      const response = await fetch('/api/shruti/sign-recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed sign recognition');
      }

      const data = await response.json();
      const result: SignRecognitionResult = data.result;
      setSignResult(result);
      playAcousticAlert('clear');

      if (signAutoSpeak && result.spokenText && result.detectedSign !== 'No Sign Detected') {
        // If Gnani configured, try Gnani TTS, otherwise browser TTS
        if (gnaniConfigured) {
          handleSynthesizeTts(result.spokenText);
        } else {
          speakText(result.spokenText, { rate: settings.speechRate, pitch: settings.speechPitch });
        }
      }
    } catch (err: any) {
      setSignError(err.message || 'Sign recognition error');
    } finally {
      setSignLoading(false);
    }
  };

  const testSignPreset = async (item: SignVocabItem) => {
    if (!item.sampleImageUrl) return;
    setSignLoading(true);
    setSignError(null);
    speakText(`Analyzing sign: ${item.name}`);

    try {
      const res = await fetch(item.sampleImageUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        analyzeSignFrame(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setSignError('Failed loading preset sign: ' + err.message);
      setSignLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (signStreamRef.current) {
        signStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      stopSpeaking();
    };
  }, []);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Ear className="w-4 h-4" />
            <span>Gnani AI Speech Platform & Indian Sign Language</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            SHRUTI — Speech & Sign Assistant
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Integrated with <strong>Gnani AI Prisma (STT)</strong> and <strong>Gnani AI Timbre (TTS)</strong> across 10 Indian languages,
            plus live camera Indian Sign Language (ISL) recognition.
          </p>
        </div>

        {/* 3-Way Sub-tab Switcher: STT, TTS, Sign */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveSubTab('stt')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all min-h-[40px] flex items-center gap-1.5 ${
              activeSubTab === 'stt'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>1. Gnani STT (Speech-to-Text)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('tts')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all min-h-[40px] flex items-center gap-1.5 ${
              activeSubTab === 'tts'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>2. Gnani TTS (Text-to-Speech)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sign')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all min-h-[40px] flex items-center gap-1.5 ${
              activeSubTab === 'sign'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>3. Sign-Language Camera</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SPEECH-TO-TEXT (GNANI PRISMA STT) */}
      {activeSubTab === 'stt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Audio Recording & Input Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Mic className="w-5 h-5 text-indigo-600" />
                    <span>Gnani AI Prisma Speech Recognition</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enterprise speech-to-text supporting Kannada, Hindi, Tamil, Telugu, and more.
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    gnaniConfigured
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                  }`}
                >
                  {gnaniConfigured ? 'Gnani Prisma Active' : 'Gemini Fallback Ready'}
                </span>
              </div>

              {/* Language Selection Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Audio Language / Accent:
                </label>
                <select
                  value={selectedSttLanguage}
                  onChange={(e) => setSelectedSttLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                >
                  <option value="auto">Auto-Detect Language (Recommended)</option>
                  {GNANI_SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recording Action Button */}
              <div className="text-center py-6 space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={transcriptionLoading}
                    className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 disabled:opacity-50"
                    aria-label="Start recording speech"
                  >
                    <Mic className="w-9 h-9" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-600/40 transition-transform active:scale-95 animate-pulse"
                    aria-label="Stop recording speech"
                  >
                    <Square className="w-8 h-8 fill-current" />
                  </button>
                )}

                <div>
                  <span className="font-bold text-sm block text-slate-800 dark:text-slate-100">
                    {isRecording ? 'Recording Speech...' : 'Tap Microphone to Record'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {isRecording
                      ? `Recording time: 00:${recordingDuration < 10 ? '0' : ''}${recordingDuration}`
                      : 'Audio is streamed securely to backend Gnani STT API'}
                  </span>
                </div>
              </div>

              {/* Alternative: Audio Upload (Supports all Gnani Formats) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Upload Audio File (WAV, MP3, WebM, FLAC, M4A, OGG)</span>
                  <input
                    type="file"
                    accept=".wav,.mp3,.webm,.ogg,.flac,.aac,.m4a,audio/*"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Audio Playback Player if blob exists */}
              {audioUrl && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Source Audio Playback:
                  </span>
                  <audio src={audioUrl} controls className="w-full h-10 rounded-lg" />
                </div>
              )}

              {/* STT Error Alert */}
              {sttError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{sttError}</span>
                </div>
              )}
            </div>

            {/* Backend Integration Info Card */}
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs space-y-2 text-indigo-900 dark:text-indigo-200">
              <span className="font-bold block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Gnani Vachana Speech Platform Details</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                Connects to Gnani's official REST endpoint (<code>https://api.vachana.ai/stt/v3</code>)
                authenticated with <code>X-API-Key-ID</code> on the server. If credentials are not present,
                INCLUVIA seamlessly routes audio to Gemini 3.8 Flash multimodal transcription.
              </p>
            </div>
          </div>

          {/* Right Column: Live Readable Captions & Transcription Results (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[380px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <AudioWaveform className="w-4 h-4 text-indigo-600" />
                    <span>Live Transcribed Captions</span>
                  </h3>
                  {transcriptionResult && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                        {transcriptionResult.detectedLanguage}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {Math.round(transcriptionResult.confidence * 100)}% Confidence
                      </span>
                    </div>
                  )}
                </div>

                {/* Main Large Transcript Display */}
                {transcriptionLoading ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      Transcribing audio through Gnani AI Prisma engine...
                    </p>
                  </div>
                ) : transcriptionResult ? (
                  <div className="space-y-4">
                    <div
                      aria-live="polite"
                      className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed"
                    >
                      {transcriptionResult.transcript || '(No speech detected in audio)'}
                    </div>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                      <div className="space-x-2">
                        <span>Provider: <strong>{transcriptionResult.provider}</strong></span>
                        {transcriptionResult.audioFormat && (
                          <span>· Format: {transcriptionResult.audioFormat}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyTranscript}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 min-h-[36px]"
                        >
                          {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTranscript ? 'Copied' : 'Copy Text'}</span>
                        </button>

                        {/* Send to Gnani TTS button */}
                        <button
                          onClick={() =>
                            sendTranscriptToTts(
                              transcriptionResult.transcript,
                              transcriptionResult.detectedLanguageCode
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 font-semibold min-h-[36px]"
                          title="Speak this transcript using Gnani Timbre natural TTS voice"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Synthesize with Gnani TTS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-2 text-slate-400">
                    <Ear className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-medium">Ready to transcribe speech.</p>
                    <p className="text-xs max-w-sm mx-auto">
                      Press the microphone button on the left or upload an audio file to generate live
                      accessible captions powered by Gnani AI Prisma.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer instruction */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Optimized for low-latency Indian speech recognition</span>
                <span>ISO/IEC 40500 Compliant High-Contrast Captions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TEXT-TO-SPEECH (GNANI TIMBRE TTS) */}
      {activeSubTab === 'tts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: TTS Input & Model Parameters (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    <span>Gnani AI Timbre Text-to-Speech</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Natural, expressive Indic speech synthesis with custom localized voices.
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    gnaniConfigured
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                  }`}
                >
                  {gnaniConfigured ? 'Gnani Timbre Active' : 'Fallback Active'}
                </span>
              </div>

              {/* Text Input Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Text to Synthesize:</span>
                  <span className="text-[11px] font-normal text-slate-400">{ttsInputText.length} characters</span>
                </label>
                <textarea
                  value={ttsInputText}
                  onChange={(e) => setTtsInputText(e.target.value)}
                  rows={4}
                  placeholder="Enter or paste text in Kannada, Hindi, Tamil, Telugu, English, etc..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Sample Phrases */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Sample Indic Phrases:</span>
                <div className="flex flex-wrap gap-1.5">
                  {GNANI_SUPPORTED_LANGUAGES.slice(0, 5).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleTtsLanguageChange(l.code)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                        selectedTtsLanguage === l.code
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {l.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Language:
                </label>
                <select
                  value={selectedTtsLanguage}
                  onChange={(e) => handleTtsLanguageChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                >
                  {GNANI_SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Gnani Voice Persona:
                </label>
                <select
                  value={selectedTtsVoice}
                  onChange={(e) => setSelectedTtsVoice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                >
                  {GNANI_VOICES.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model & Speed Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Timbre Model:
                  </label>
                  <select
                    value={selectedTtsModel}
                    onChange={(e) => setSelectedTtsModel(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="timbre-v2.5">timbre-v2.5 (Stable)</option>
                    <option value="timbre-v3.0">timbre-v3.0 (Expressive)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Speed:</span>
                    <span className="font-mono">{ttsSpeed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Action: Generate Audio */}
              <div className="pt-2">
                <button
                  onClick={() => handleSynthesizeTts()}
                  disabled={ttsLoading || !ttsInputText.trim()}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 min-h-[46px] shadow-sm"
                >
                  {ttsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Audio via Gnani Timbre...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Generate & Play Gnani Speech</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Alert */}
              {ttsError && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{ttsError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Audio Playback, Player & Waveform Visualizer (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[380px] flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <AudioWaveform className="w-4 h-4 text-indigo-600" />
                    <span>Synthesized Audio Output</span>
                  </h3>
                  {ttsResult && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300">
                      WAV Linear PCM 24kHz
                    </span>
                  )}
                </div>

                {ttsLoading ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Gnani Timbre engine is generating natural voice waveform...
                    </p>
                    <p className="text-xs text-slate-400">
                      Voice: {selectedTtsVoice} · Language: {selectedTtsLanguage} · Model: {selectedTtsModel}
                    </p>
                  </div>
                ) : ttsResult ? (
                  <div className="space-y-5">
                    {/* Audio Player Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-lg space-y-4">
                      <div className="flex items-center justify-between text-xs text-indigo-300">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                          <Radio className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{ttsResult.provider}</span>
                        </span>
                        <span>Voice: {ttsResult.voice}</span>
                      </div>

                      <div className="text-sm font-medium italic text-slate-200">
                        "{ttsInputText}"
                      </div>

                      {/* Native Audio Element */}
                      <audio
                        ref={ttsAudioPlayerRef}
                        src={ttsResult.audioBase64}
                        controls
                        className="w-full h-11 rounded-xl"
                      />

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-400">Format: 24kHz WAV Audio</span>
                        <a
                          href={ttsResult.audioBase64}
                          download={`gnani-timbre-${ttsResult.voice}-${Date.now()}.wav`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download WAV</span>
                        </a>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Model</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{ttsResult.model}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Language</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{ttsResult.language}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Voice Persona</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{ttsResult.voice}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-2 text-slate-400">
                    <Volume2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-medium">No speech synthesized yet.</p>
                    <p className="text-xs max-w-sm mx-auto">
                      Choose an Indic language, select a Gnani voice (Nalini, Kaveri, Deepak, Pranav),
                      and click "Generate & Play Gnani Speech".
                    </p>
                  </div>
                )}
              </div>

              {/* Expressive Audio Tags Tip */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pro-tip for Timbre-v3.0:</strong> You can embed expressive audio tags into your text
                  such as <code>&lt;pauses&gt;</code>, <code>&lt;whispers&gt;</code>, or <code>&lt;laugh&gt;</code> to create
                  lifelike emotional nuances in conversational speech.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SIGN-LANGUAGE RECOGNITION (ISL) */}
      {activeSubTab === 'sign' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Sign Recognition Camera (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-black rounded-2xl overflow-hidden relative shadow-xl border-2 border-slate-800 aspect-video flex items-center justify-center">
              <video
                ref={signVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${signCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={signCanvasRef} className="hidden" />

              {!signCameraActive && (
                <div className="text-center p-6 space-y-3 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-indigo-400">
                    <Hand className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Indian Sign Language Camera</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Activate camera to perform sign language gesture translation for greetings,
                      emergencies, daily needs, and common communication phrases.
                    </p>
                  </div>
                  <button
                    onClick={startSignCamera}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg min-h-[44px]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Sign Camera</span>
                  </button>
                </div>
              )}

              {/* Active Sign Camera HUD */}
              {signCameraActive && (
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>ISL Camera Active</span>
                    </div>

                    {signLoading && (
                      <div className="flex items-center gap-1.5 bg-indigo-600 px-3 py-1 rounded-full text-white font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Recognizing Hand Pose...</span>
                      </div>
                    )}
                  </div>

                  <div className="self-center bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/80 text-xs border border-white/20">
                    Frame hands clearly within camera view
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                {signCameraActive ? (
                  <>
                    <button
                      onClick={captureAndRecognizeSign}
                      disabled={signLoading}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Hand Sign</span>
                    </button>
                    <button
                      onClick={stopSignCamera}
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs min-h-[44px]"
                    >
                      <span>Close Camera</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startSignCamera}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2 text-xs min-h-[44px]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signAutoSpeak}
                    onChange={(e) => setSignAutoSpeak(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Speak translation aloud</span>
                </label>
              </div>
            </div>

            {signError && (
              <div className="p-3 rounded-xl bg-rose-50 text-xs text-rose-800 border border-rose-300">
                {signError}
              </div>
            )}

            {/* Supported ISL Signs Quick Presets */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Test Presets (Indian Sign Language Dictionary)</span>
                </h4>
                <span className="text-[11px] text-slate-500">Tap to evaluate model</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUPPORTED_ISL_SIGNS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => testSignPreset(item)}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recognized Sign Meaning & Speech Output (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Recognized Sign Translation
              </h3>

              {signLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Analyzing hand geometry and posture...</p>
                </div>
              ) : signResult ? (
                <div className="space-y-4">
                  {/* Recognized Sign Header */}
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                        {signResult.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        {Math.round(signResult.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <h4 className="text-2xl font-extrabold text-indigo-950 dark:text-white">
                      {signResult.detectedSign}
                    </h4>
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                      "{signResult.englishMeaning}"
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Model Confidence</span>
                      <span className="font-mono">{Math.round(signResult.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round(signResult.confidence * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Anatomical Notes */}
                  {signResult.handNotes && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <span className="font-semibold block text-slate-800 dark:text-slate-100">
                        Hand Landmark Observations:
                      </span>
                      <p>{signResult.handNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons: Browser Speech & Gnani Timbre Voice */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() =>
                        speakText(signResult.spokenText || signResult.englishMeaning, {
                          rate: settings.speechRate,
                          pitch: settings.speechPitch,
                        })
                      }
                      className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      <span>Browser Voice</span>
                    </button>

                    <button
                      onClick={() =>
                        sendTranscriptToTts(signResult.spokenText || signResult.englishMeaning, 'en-IN')
                      }
                      className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Gnani Voice</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <Hand className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No sign gesture analyzed yet.
                  </p>
                  <p>Hold up your hands to the camera and click "Analyze Hand Sign".</p>
                </div>
              )}
            </div>

            {/* Scope & Dictionary Disclosure Notice */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Trained Vocabulary & Scope Disclosure:
              </span>
              <p>
                Sign language recognition currently covers core Indian Sign Language (ISL) vocabulary,
                urgent medical/safety requests, and everyday greetings. Complex fingerspelling and rapid
                regional dialects are continuously expanding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
