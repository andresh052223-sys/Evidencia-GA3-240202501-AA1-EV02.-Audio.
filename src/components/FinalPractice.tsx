import React, { useState, useRef, useEffect } from 'react';
import { 
  Trophy, 
  Eye, 
  EyeOff, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Download, 
  FileText, 
  CheckSquare, 
  Square as SquareIcon, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Award,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApprenticeInfo, ScriptSentence, EvidenceChecklist } from '../types';
import { AudioService } from '../utils/audioService';

interface FinalPracticeProps {
  apprenticeInfo: ApprenticeInfo;
  sentences: ScriptSentence[];
  checklist: EvidenceChecklist;
  onUpdateChecklist: (checklist: EvidenceChecklist) => void;
  recordedAudioBlob: Blob | null;
  onSaveFinalAudio: (blob: Blob) => void;
  onOpenScriptExport: () => void;
}

export const FinalPractice: React.FC<FinalPracticeProps> = ({
  apprenticeInfo,
  sentences,
  checklist,
  onUpdateChecklist,
  recordedAudioBlob,
  onSaveFinalAudio,
  onOpenScriptExport,
}) => {
  const [practiceMode, setPracticeMode] = useState<'guided' | 'challenge'>('guided');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [finalAudioBlob, setFinalAudioBlob] = useState<Blob | null>(recordedAudioBlob);
  const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(
    recordedAudioBlob ? URL.createObjectURL(recordedAudioBlob) : null
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartFinalRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setFinalAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setFinalAudioUrl(url);
        onSaveFinalAudio(blob);

        // Update checklist
        onUpdateChecklist({
          ...checklist,
          completeRecording: true,
          audibleVoice: true,
          finalRecordingReviewed: true,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error in final practice:', err);
    }
  };

  const handleStopFinalRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handlePlayFinalAudio = () => {
    if (!finalAudioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(finalAudioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
      audioElementRef.current.onerror = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.src = finalAudioUrl;
      audioElementRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
    }
  };

  const handleDownloadFinalWav = () => {
    if (!finalAudioBlob) return;
    AudioService.downloadAudioBlob(finalAudioBlob, apprenticeInfo.name, apprenticeInfo.ficha);
  };

  const toggleChecklistItem = (key: keyof EvidenceChecklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    onUpdateChecklist(updated);

    // If all checked, trigger celebratory confetti
    const allChecked = Object.values(updated).every(Boolean);
    if (allChecked) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const isAllReady = completedCount === 8;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Simulation Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                5. FINAL PRACTICE & EVIDENCE SUBMISSION
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Simulacro Final y Lista de Chequeo SENA
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPracticeMode('guided')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                practiceMode === 'guided'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>MODO GUIADO</span>
            </button>
            <button
              onClick={() => setPracticeMode('challenge')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                practiceMode === 'challenge'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>CHALLENGE MODE (GUION OCULTO)</span>
            </button>
          </div>
        </div>

        {/* Motivational Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-900 border border-amber-500/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 space-y-1">
            <p className="font-bold text-white text-sm">
              "Your final practice should be as similar as possible to your real evidence."
            </p>
            <p className="text-slate-300">
              En este simulacro definitivo, pronuncia con calma, proyecta tu voz con seguridad y respeta la estructura de Parte 1 (datos) y Parte 2 (modales).
            </p>
          </div>
        </div>

        {/* RECORDING AREA */}
        <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 flex flex-col items-center justify-center text-center">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
              Tiempo de grabación de la evidencia
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-wider">
              {AudioService.formatTime(recordingSeconds)}
            </div>
          </div>

          {/* Recording buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={handleStartFinalRecording}
                className="px-7 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-xl shadow-rose-500/25 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>🔴 COMENZAR TOMA DEFINITIVA</span>
              </button>
            ) : (
              <button
                onClick={handleStopFinalRecording}
                className="px-7 py-4 rounded-2xl font-bold text-sm bg-slate-800 text-white border border-rose-500 hover:bg-slate-700 shadow-xl flex items-center gap-2 cursor-pointer transition-all animate-pulse"
              >
                <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>⏹ FINALIZAR TOMA</span>
              </button>
            )}

            {finalAudioBlob && !isRecording && (
              <>
                <button
                  onClick={handlePlayFinalAudio}
                  className="px-5 py-4 rounded-2xl font-semibold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingAudio ? 'PAUSAR' : '▶ ESCUCHAR TOMA FINAL'}</span>
                </button>

                <button
                  onClick={handleDownloadFinalWav}
                  className="px-5 py-4 rounded-2xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR AUDIO (GA3-240202501-AA1-EV02.wav)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* PROMPTER / SCRIPT VISIBILITY BASED ON MODE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              {practiceMode === 'guided' ? 'Teleprónter Guiado (Guion en Pantalla)' : 'Modo Reto: Guion Oculto'}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {practiceMode === 'guided' ? 'Visible durante la grabación' : 'Oculto para entrenar memoria'}
            </span>
          </div>

          {practiceMode === 'guided' ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 max-h-80 overflow-y-auto font-mono text-sm leading-relaxed text-slate-200">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                PARTE 1 – INFORMACIÓN PERSONAL
              </div>
              <div className="space-y-1 text-slate-300">
                {sentences
                  .filter((s) => s.section === 'part1')
                  .map((s) => (
                    <p key={s.id}>• {s.text}</p>
                  ))}
              </div>

              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-1 pt-2">
                PARTE 2 – ATTITUDES, BELIEFS AND OBLIGATIONS
              </div>
              <div className="space-y-1 text-slate-300">
                {sentences
                  .filter((s) => s.section === 'part2')
                  .map((s) => (
                    <p key={s.id}>• {s.text}</p>
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-purple-500/30 text-center space-y-2">
              <EyeOff className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-sm font-bold text-white">Guion oculto activado</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                ¡Gran desafío! Intenta hablar recordando tus ideas clave y los modales (have to, must, should) sin leer directamente.
              </p>
            </div>
          )}
        </div>

        {/* READY FOR SUBMISSION CHECKLIST (REQUIREMENT #14 & #15) */}
        <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                VERIFICACIÓN PREVIA A LA ENTREGA
              </span>
              <h3 className="text-lg font-bold text-white">
                READY FOR SUBMISSION PRACTICE (Lista de Chequeo de la Evidencia)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                {completedCount} de 8 cumplidos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                key: 'part1Completed' as const,
                title: 'Part 1 completed',
                desc: 'Nombre, ID, Ficha, Instructor y código de evidencia.',
              },
              {
                key: 'part2Completed' as const,
                title: 'Part 2 completed',
                desc: 'Opinión sobre actitudes, creencias y obligaciones.',
              },
              {
                key: 'clearIntro' as const,
                title: 'Clear introduction',
                desc: 'Saludo inicial cordial y presentación clara.',
              },
              {
                key: 'usesModals' as const,
                title: 'Uses HAVE TO / MUST / SHOULD',
                desc: 'Estructuras modales con verbo en forma base.',
              },
              {
                key: 'audibleVoice' as const,
                title: 'Voice is audible',
                desc: 'Voz propia en inglés, volumen adecuado y sin ruidos fuertes.',
              },
              {
                key: 'completeRecording' as const,
                title: 'Recording is complete',
                desc: 'Duración entre 2 y 5 minutos sin cortes abruptos.',
              },
              {
                key: 'pronunciationPracticed' as const,
                title: 'Pronunciation has been practiced',
                desc: 'Palabras difíciles ensayadas previamente en el coach.',
              },
              {
                key: 'finalRecordingReviewed' as const,
                title: 'Final recording reviewed',
                desc: 'Escuchaste tu audio final y confirmaste su calidad.',
              },
            ].map((item) => {
              const isChecked = checklist[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleChecklistItem(item.key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <SquareIcon className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* All Ready Status */}
          {isAllReady ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    ¡Tu preparación para la evidencia está completa!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Descarga tu archivo de audio y tu guion para subirlo en la plataforma formativa SENA.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFinalWav}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                >
                  Descargar Audio
                </button>
                <button
                  onClick={onOpenScriptExport}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700"
                >
                  Exportar Guion
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Marca todos los puntos de la lista de chequeo a medida que los completes.</span>
              <button
                onClick={onOpenScriptExport}
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver documento de guion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
