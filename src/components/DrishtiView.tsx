import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserSettings, DrishtiAnalysis, HazardItem, DetectedObject } from '../types';
import {
  Camera,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ShieldAlert,
  Loader2,
  Eye,
  RefreshCw,
  HelpCircle,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { speakText, stopSpeaking, repeatLastSpokenInstruction, playAcousticAlert } from '../utils/speech';

interface DrishtiViewProps {
  settings: UserSettings;
}

// Built-in verified sample benchmark frames for testing hazard detection without webcam
const TEST_ENVIRONMENTS = [
  {
    id: 'pothole',
    name: 'Roadside Pothole & Broken Asphalt',
    description: 'Uneven broken walking path with 15cm pothole depression ahead.',
    sampleUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'stairs',
    name: 'Outdoor Downward Staircase',
    description: 'Sudden descent steps without high-visibility tactile edge strips.',
    sampleUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'hallway',
    name: 'Indoor Corridor with Closed Glass Door',
    description: 'Smooth polished flooring with obstacle cart on the right side.',
    sampleUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'crowd',
    name: 'Urban Sidewalk with Pedestrians & Pole',
    description: 'Approaching walkers on left side, metal signpost on the right.',
    sampleUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
  },
];

export const DrishtiView: React.FC<DrishtiViewProps> = ({ settings }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'stopped' | 'starting' | 'active' | 'paused'>('stopped');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analysis result
  const [currentAnalysis, setCurrentAnalysis] = useState<DrishtiAnalysis | null>(null);
  const [historyAlerts, setHistoryAlerts] = useState<string[]>([]);
  const [ttsMuted, setTtsMuted] = useState<boolean>(false);
  const [walkingMode, setWalkingMode] = useState<'outdoor' | 'indoor' | 'stairs'>('outdoor');

  // Continuous loop control
  const analysisInProgressRef = useRef(false);
  const timerRef = useRef<any>(null);

  // Capture frame as base64 JPEG
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = Math.min(video.videoWidth, 800);
    canvas.height = Math.floor((canvas.width / video.videoWidth) * video.videoHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Send frame to server-side Gemini 3.8 Flash
  const performAnalysis = useCallback(
    async (base64Image: string) => {
      if (analysisInProgressRef.current) return;
      analysisInProgressRef.current = true;
      setIsAnalyzing(true);
      setErrorMsg(null);

      try {
        const response = await fetch('/api/drishti/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Image,
            mimeType: 'image/jpeg',
            walkingContext: `${walkingMode} environment, focusing on potholes, obstacles, stairs, and walking hazards`,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        const analysis: DrishtiAnalysis = data.analysis;
        setCurrentAnalysis(analysis);

        // Acoustic feedback
        if (analysis.hazards && analysis.hazards.length > 0) {
          playAcousticAlert('hazard');
        } else if (!analysis.clearPathAhead) {
          playAcousticAlert('warning');
        } else {
          playAcousticAlert('clear');
        }

        // Voice output
        if (!ttsMuted && settings.autoSpeak && analysis.spokenGuidance) {
          speakText(analysis.spokenGuidance, {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
            lang: 'en-US',
          });
        }

        // Add to recent alerts
        if (analysis.primaryAlert) {
          setHistoryAlerts((prev) => [analysis.primaryAlert, ...prev.slice(0, 4)]);
        }
      } catch (err: any) {
        console.error('Vision analysis error:', err);
        setErrorMsg(err.message || 'Error communicating with vision analysis service.');
      } finally {
        setIsAnalyzing(false);
        analysisInProgressRef.current = false;
      }
    },
    [ttsMuted, settings.autoSpeak, settings.speechRate, settings.speechPitch, walkingMode]
  );

  // Periodic capture cycle
  const runAnalysisLoop = useCallback(() => {
    if (cameraState !== 'active') return;

    const frameBase64 = captureFrame();
    if (frameBase64) {
      performAnalysis(frameBase64);
    }

    // Schedule next frame in 2.8 seconds
    timerRef.current = setTimeout(runAnalysisLoop, 2800);
  }, [cameraState, captureFrame, performAnalysis]);

  useEffect(() => {
    if (cameraState === 'active') {
      // Small initial delay to let video stream stabilize
      timerRef.current = setTimeout(runAnalysisLoop, 1200);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cameraState, runAnalysisLoop]);

  // Start Camera
  const startCamera = async () => {
    setErrorMsg(null);
    setCameraState('starting');
    playAcousticAlert('start');

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraState('active');

      if (!ttsMuted) {
        speakText('Drishti live camera activated. Scanning surroundings for hazards.', {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
        });
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraState('stopped');
      setErrorMsg(
        'Unable to access camera: ' +
          (err.name === 'NotAllowedError'
            ? 'Permission denied. Please allow camera access in your browser settings.'
            : err.message || 'Camera not available.')
      );
      speakText('Camera permission was not granted. You can use the test environment samples below.', {
        rate: settings.speechRate,
      });
    }
  };

  // Pause
  const pauseCamera = () => {
    setCameraState('paused');
    if (timerRef.current) clearTimeout(timerRef.current);
    playAcousticAlert('warning');
    if (!ttsMuted) {
      speakText('Drishti vision feed paused.');
    }
  };

  // Resume
  const resumeCamera = () => {
    setCameraState('active');
    playAcousticAlert('start');
    if (!ttsMuted) {
      speakText('Drishti vision feed resumed.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('stopped');
    stopSpeaking();
    playAcousticAlert('click');
  };

  // Switch Camera
  const toggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraState === 'active') {
      stopCamera();
      setTimeout(startCamera, 300);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      stopSpeaking();
    };
  }, [stream]);

  // Test with sample environment
  const analyzeSampleEnvironment = async (sample: typeof TEST_ENVIRONMENTS[0]) => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    playAcousticAlert('start');
    speakText(`Analyzing test scenario: ${sample.name}`);

    try {
      // Fetch image from URL and convert to base64
      const imgRes = await fetch(sample.sampleUrl);
      const blob = await imgRes.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        performAnalysis(base64data);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setErrorMsg('Failed loading test environment image: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  // Custom image upload for evaluation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      performAnalysis(base64data);
    };
    reader.readAsDataURL(file);
  };

  const getDirectionIcon = (nav?: string) => {
    switch (nav) {
      case 'shift_left':
        return <ArrowLeft className="w-8 h-8 text-amber-500 animate-pulse" />;
      case 'shift_right':
        return <ArrowRight className="w-8 h-8 text-amber-500 animate-pulse" />;
      case 'stop_immediately':
        return <ShieldAlert className="w-8 h-8 text-rose-600 animate-bounce" />;
      case 'straight':
        return <ArrowUp className="w-8 h-8 text-emerald-500" />;
      default:
        return <ArrowUp className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Screen-Reader Anchor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>AI Computer Vision Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            DRISHTI — Real-Time Vision & Hazard Guidance
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Engineered for blind & visually impaired users. Continuous live camera analysis for potholes,
            ground drop-offs, stairs, obstacles, and directional audio guidance.
          </p>
        </div>

        {/* Quick Voice & Emergency Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTtsMuted(!ttsMuted)}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors min-h-[44px] ${
              ttsMuted
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-200'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            aria-label={ttsMuted ? 'Unmute spoken guidance' : 'Mute spoken guidance'}
          >
            {ttsMuted ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            <span>{ttsMuted ? 'TTS Muted' : 'TTS Active'}</span>
          </button>

          <button
            onClick={() => repeatLastSpokenInstruction({ rate: settings.speechRate })}
            className="px-3.5 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 min-h-[44px]"
            title="Repeat last spoken announcement"
            aria-label="Repeat last spoken announcement"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Repeat Guidance</span>
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              playAcousticAlert('hazard');
            }}
            className="px-3.5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 min-h-[44px] shadow-sm"
            aria-label="Emergency Audio Silence"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Emergency Stop</span>
          </button>
        </div>
      </div>

      {/* Error / Alert banner */}
      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-sm"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Camera / Processing Alert:</strong>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Vision Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Live Camera & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden relative shadow-xl border-2 border-slate-800 aspect-video flex items-center justify-center">
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraState === 'active' ? 'block' : 'hidden'}`}
              aria-label="Live camera feed for obstacle and pothole detection"
            />

            {/* Hidden canvas for snapshot rasterization */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Inactive Camera State Overlay */}
            {cameraState !== 'active' && (
              <div className="text-center p-6 space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Camera is Currently Stopped</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Press "Start Live Camera" below to grant camera permission and begin real-time
                    walking hazard analysis.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  disabled={cameraState === 'starting'}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg min-h-[48px]"
                >
                  {cameraState === 'starting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Requesting Permission...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Start Live Camera</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Active HUD Overlay */}
            {cameraState === 'active' && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top HUD bar */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white border border-white/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-semibold uppercase tracking-wider">LIVE GUARD ACTIVE</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-slate-200 border border-white/20">
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        <span>AI Analyzing Frame...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Scanning Every 2.8s</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Center Directional Guidance Cue */}
                {currentAnalysis && (
                  <div className="self-center bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-center flex items-center gap-3 shadow-2xl">
                    {getDirectionIcon(currentAnalysis.navSuggestion)}
                    <div className="text-left">
                      <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                        Navigation Advice
                      </span>
                      <span className="text-base font-extrabold text-white capitalize">
                        {currentAnalysis.navSuggestion?.replace('_', ' ') || 'Proceed Carefully'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom HUD bar */}
                <div className="bg-black/80 backdrop-blur-md p-2.5 rounded-xl text-xs text-white border border-white/20 flex items-center justify-between">
                  <span>Surface: {currentAnalysis?.surfaceCondition || 'Detecting...'}</span>
                  <span className="font-semibold text-emerald-400">
                    Clear Path: {currentAnalysis?.clearPathAhead ? 'YES' : 'ATTENTION REQUIRED'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Camera Action Control Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              {cameraState === 'stopped' ? (
                <button
                  onClick={startCamera}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 min-h-[44px]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Camera</span>
                </button>
              ) : cameraState === 'active' ? (
                <button
                  onClick={pauseCamera}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 min-h-[44px]"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Feed</span>
                </button>
              ) : (
                <button
                  onClick={resumeCamera}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 min-h-[44px]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Feed</span>
                </button>
              )}

              {cameraState !== 'stopped' && (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg flex items-center gap-2 min-h-[44px]"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              )}

              {cameraState === 'active' && (
                <button
                  onClick={toggleFacingMode}
                  className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 min-h-[44px]"
                  title="Switch between front and back camera"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flip ({facingMode === 'environment' ? 'Back' : 'Front'})</span>
                </button>
              )}
            </div>

            {/* Walking Environment Filter Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Context:</span>
              {(['outdoor', 'indoor', 'stairs'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setWalkingMode(mode)}
                  className={`px-2.5 py-1.5 rounded-md font-medium capitalize transition-colors ${
                    walkingMode === mode
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Test Environments & File Upload (Crucial for sandbox validation) */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Test Hazard Scenarios & Offline Samples</span>
              </h3>
              <label className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify pothole, stairs, and obstacle detection with pre-configured accessibility test scenes:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEST_ENVIRONMENTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => analyzeSampleEnvironment(sample)}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 text-left transition-all group"
                >
                  <span className="font-semibold text-xs block text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                    {sample.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {sample.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Spoken Guidance, Detected Hazards & Objects (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Spoken Guidance Card */}
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 border-2 border-blue-500/40 rounded-2xl p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>LATEST SPOKEN GUIDANCE</span>
              </span>
              <span className="bg-blue-950/80 border border-blue-400/30 px-2 py-0.5 rounded text-[11px]">
                {currentAnalysis?.navSuggestion || 'Standby'}
              </span>
            </div>

            <div
              aria-live="polite"
              className="text-lg sm:text-xl font-bold leading-relaxed tracking-tight text-white min-h-[70px] flex items-center"
            >
              {currentAnalysis?.spokenGuidance ? (
                `"${currentAnalysis.spokenGuidance}"`
              ) : (
                <span className="text-slate-400 font-normal text-sm">
                  Waiting for camera feed. Start camera or select a test scene to receive real-time spoken guidance.
                </span>
              )}
            </div>

            {currentAnalysis?.primaryAlert && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-300">
                <span className="font-semibold text-white">Alert Summary: </span>
                <span>{currentAnalysis.primaryAlert}</span>
              </div>
            )}
          </div>

          {/* Active Hazards Detected */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Ground & Path Hazards</span>
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                {currentAnalysis?.hazards?.length || 0} Detected
              </span>
            </div>

            {currentAnalysis?.hazards && currentAnalysis.hazards.length > 0 ? (
              <div className="space-y-2">
                {currentAnalysis.hazards.map((hazard: HazardItem, idx: number) => {
                  const isHigh = hazard.severity === 'high';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isHigh
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold capitalize">
                        <span>
                          {hazard.type.replace('_', ' ')} · {hazard.location}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-black/10">
                          {hazard.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs opacity-90">{hazard.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                {currentAnalysis
                  ? 'No immediate potholes or ground hazards detected ahead.'
                  : 'Hazard detection will appear once camera analysis runs.'}
              </div>
            )}
          </div>

          {/* Recognized Objects & Entities */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>Surrounding Objects & Entities</span>
            </h3>

            {currentAnalysis?.objectsDetected && currentAnalysis.objectsDetected.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {currentAnalysis.objectsDetected.map((obj: DetectedObject, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="font-semibold block text-slate-800 dark:text-slate-100">
                      {obj.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Position: {obj.position} ({obj.approxDistance})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                Recognizes people, vehicles, doors, walls, stairs, and furniture in real time.
              </p>
            )}
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Critical Mobility Safety Notice</span>
            </div>
            <p>
              Drishti is an assistive computer vision aid. It does not replace a physical white cane,
              guide dog, or human navigation partner. Always proceed slowly and verify footing on unfamiliar roads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
