import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Pause, 
  RotateCcw, 
  Mic, 
  Square, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Headphones, 
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  UserCheck,
  Radio
} from 'lucide-react';
import { ScriptSentence } from '../types';
import { AudioService } from '../utils/audioService';
import { WordPractice } from './WordPractice';

interface PronunciationPracticeProps {
  sentences: ScriptSentence[];
  onContinueToRecording: () => void;
}

export const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({
  sentences,
  onContinueToRecording,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);

  // Recording state for active sentence
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const currentSentence = sentences[currentIndex] || sentences[0];

  // Reset user recording when switching sentences
  useEffect(() => {
    AudioService.stopAll();
    setIsPlayingModel(false);
    setIsPlayingUserAudio(false);
    setRecordedAudioUrl(null);
    setRecordedBlob(null);
    setRecordingSeconds(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [currentIndex]);

  const handlePlayModel = async () => {
    // If playing user audio, pause it first
    if (userAudioElementRef.current && isPlayingUserAudio) {
      userAudioElementRef.current.pause();
      setIsPlayingUserAudio(false);
    }

    if (isPlayingModel) {
      AudioService.stopAll();
      setIsPlayingModel(false);
      return;
    }

    setIsPlayingModel(true);
    await AudioService.speakText(currentSentence.text, {
      rate: playbackSpeed,
      onEnd: () => setIsPlayingModel(false),
      onError: () => setIsPlayingModel(false),
    });
  };

  const handleStartRecording = async () => {
    // Stop any ongoing playback
    AudioService.stopAll();
    setIsPlayingModel(false);
    if (userAudioElementRef.current && isPlayingUserAudio) {
      userAudioElementRef.current.pause();
      setIsPlayingUserAudio(false);
    }

    setRecordedAudioUrl(null);
    setRecordedBlob(null);
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedAudioUrl(url);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error in pronunciation practice:', err);
      alert('Por favor habilita los permisos del micrófono en tu navegador para grabar tu voz.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const handlePlayUserAudio = () => {
    // If playing model, pause it first
    if (isPlayingModel) {
      AudioService.stopAll();
      setIsPlayingModel(false);
    }

    if (!recordedAudioUrl) return;
    if (!userAudioElementRef.current) {
      userAudioElementRef.current = new Audio(recordedAudioUrl);
      userAudioElementRef.current.onended = () => setIsPlayingUserAudio(false);
      userAudioElementRef.current.onerror = () => setIsPlayingUserAudio(false);
    }

    if (isPlayingUserAudio) {
      userAudioElementRef.current.pause();
      setIsPlayingUserAudio(false);
    } else {
      userAudioElementRef.current.src = recordedAudioUrl;
      userAudioElementRef.current.play().then(() => setIsPlayingUserAudio(true)).catch(() => setIsPlayingUserAudio(false));
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentSentence) {
    return (
      <div className="p-8 text-center text-slate-400">
        No hay oraciones en el guion para practicar. Agrega oraciones en el Paso 2.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Studio Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                3. PRACTICE PRONUNCIATION & VOICE COMPARISON
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Laboratorio de Pronunciación y Comparador de Voz
              </h2>
            </div>
          </div>

          {/* Speed selector and sentence index */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="px-2 text-slate-400">Velocidad modelo:</span>
              <button
                onClick={() => setPlaybackSpeed(0.75)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  playbackSpeed === 0.75
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                0.75x
              </button>
              <button
                onClick={() => setPlaybackSpeed(0.85)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  playbackSpeed === 0.85
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                0.85x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.0)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  playbackSpeed === 1.0
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1.0x
              </button>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
              {currentIndex + 1} de {sentences.length}
            </span>
          </div>
        </div>

        {/* Current Active Sentence Focused Practice Card */}
        <div className="rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                {currentSentence.section === 'part1' ? 'PARTE 1: INTRODUCCIÓN' : 'PARTE 2: OBLIGACIONES'}
              </span>
              <span className="text-xs font-semibold text-purple-400">
                {currentSentence.label}
              </span>
            </div>
            {currentSentence.explanationEs && (
              <span className="hidden sm:inline-block text-xs text-slate-400">
                {currentSentence.explanationEs}
              </span>
            )}
          </div>

          {/* Large Sentence Display */}
          <div className="py-4 text-center sm:text-left">
            <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white tracking-wide leading-relaxed">
              "{currentSentence.text}"
            </p>
          </div>

          {/* Recording Trigger Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2">
              {isRecording ? (
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span>Grabando tu voz ({recordingSeconds}s)... Habla claro hacia tu micrófono</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>
                    {recordedAudioUrl
                      ? '✓ Frase grabada. Ahora puedes compararla abajo con el modelo nativo.'
                      : 'Presiona "Grabar mi voz" para registrar cómo pronuncias esta frase.'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Mic className="w-4 h-4 text-white" />
                  <span>{recordedAudioUrl ? 'GRABAR DE NUEVO' : '🎙 GRABAR MI VOZ'}</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-rose-600 text-white animate-pulse flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>⏹ DETENER GRABACIÓN</span>
                </button>
              )}
            </div>
          </div>

          {/* DEDICATED SIDE-BY-SIDE COMPARISON PANEL (REQUESTED BY USER) */}
          <div className="rounded-2xl bg-slate-950 border border-cyan-500/30 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  COMPARADOR DE AUDIO (TU VOZ vs. MODELO NATIVO)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Escucha alternadamente ambas opciones para afinar tu entonación
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* OPTION 1: USER'S RECORDED VOICE */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                recordedAudioUrl
                  ? 'bg-slate-900/90 border-cyan-500/40'
                  : 'bg-slate-950 border-slate-800/80 opacity-60'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      Opción 1: Tu Grabación
                    </span>
                    {recordedAudioUrl && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {recordingSeconds > 0 ? `${recordingSeconds}s` : 'Audio listo'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tu propia voz grabada para esta oración.
                  </p>
                </div>

                <div className="pt-2">
                  {recordedAudioUrl ? (
                    <button
                      onClick={handlePlayUserAudio}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isPlayingUserAudio
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20 animate-pulse'
                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
                      }`}
                    >
                      {isPlayingUserAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{isPlayingUserAudio ? 'PAUSAR MI GRABACIÓN' : '▶ ESCUCHAR MI GRABACIÓN'}</span>
                    </button>
                  ) : (
                    <div className="text-center py-2.5 px-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-xs text-slate-500">
                      Presiona "🎙 GRABAR MI VOZ" arriba para habilitar tu audio
                    </div>
                  )}
                </div>
              </div>

              {/* OPTION 2: NATIVE MODEL VOICE */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      Opción 2: Modelo Nativo
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Vel: {playbackSpeed}x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pronunciación nativa de referencia con ritmo claro.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePlayModel}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isPlayingModel
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20 animate-pulse'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                    }`}
                  >
                    {isPlayingModel ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlayingModel ? 'PAUSAR MODELO NATIVO' : '▶ ESCUCHAR MODELO NATIVO'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Advice Card */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Técnica pedagógica de autorreflexión:</span>
                <p className="text-slate-400 leading-normal">
                  Escucha primero tu grabación y luego el modelo nativo. Fíjate especialmente en qué sílabas se eleva la voz (acentuación), qué palabras se enlazan suavemente y dónde haces las pausas de respiración.
                </p>
              </div>
            </div>
          </div>

          {/* WORD-BY-WORD BREAKDOWN */}
          <div className="pt-2">
            <WordPractice sentenceText={currentSentence.text} />
          </div>

          {/* Navigation Prev / Next sentence */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oración anterior</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === sentences.length - 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Siguiente oración</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Sentence Picker Carousel */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Explorar todas las oraciones del guion:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {sentences.map((sent, idx) => (
              <button
                key={sent.id}
                onClick={() => setCurrentIndex(idx)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  currentIndex === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono">#{idx + 1}</span>
                  <span className="truncate max-w-[120px]">{sent.label}</span>
                </div>
                <p className="text-xs font-mono truncate text-slate-200">"{sent.text}"</p>
              </button>
            ))}
          </div>
        </div>

        {/* Continue to Step 4 button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onContinueToRecording}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>PASO 4: GRABAR MI VOZ COMPLETA (RECORD MY VOICE)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
