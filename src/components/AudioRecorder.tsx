import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Loader2,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';
import { ScriptSentence } from '../types';
import { AudioService } from '../utils/audioService';
import { compareScriptToSpoken, TokenComparison } from '../utils/textComparison';

interface AudioRecorderProps {
  sentences: ScriptSentence[];
  recordedBlob: Blob | null;
  onSaveRecording: (blob: Blob | null, audioUrl: string | null) => void;
  transcription: string;
  onSaveTranscription: (text: string) => void;
  onContinueToFinalPractice: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  sentences,
  recordedBlob,
  onSaveRecording,
  transcription,
  onSaveTranscription,
  onContinueToFinalPractice,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [manualTranscriptMode, setManualTranscriptMode] = useState(false);
  const [manualInputText, setManualInputText] = useState('');

  // Refs for audio media recording & waveform canvas
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const liveSpeechRecRef = useRef<any>(null);

  // Reconstruct full target script
  const fullTargetScript = sentences.map((s) => s.text).join(' ');

  // Computed token comparison comparing expected script vs what was spoken
  const tokenComparisons: TokenComparison[] = React.useMemo(() => {
    if (!fullTargetScript) return [];
    return compareScriptToSpoken(fullTargetScript, transcription);
  }, [fullTargetScript, transcription]);

  // Clean up object URLs and timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (liveSpeechRecRef.current) {
        try {
          liveSpeechRecRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Sync initial audioUrl if recordedBlob exists
  useEffect(() => {
    if (recordedBlob && !audioUrl) {
      setAudioUrl(URL.createObjectURL(recordedBlob));
    }
  }, [recordedBlob]);

  // Visual audio waveform drawing during recording
  const startWaveformVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(2 6 23)'; // slate-950
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;

          // Gradient color: Cyan to Indigo
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#06b6d4'); // cyan-500
          gradient.addColorStop(1, '#818cf8'); // indigo-400

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      };

      draw();
    } catch (e) {
      console.warn('Waveform visualizer failed to initialize:', e);
    }
  };

  const stopWaveformVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleStartRecording = async () => {
    setTranscriptionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      startWaveformVisualizer(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      let liveSpokenTranscript = '';

      // Live SpeechRecognition in browser
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const liveRec = new SpeechRec();
          liveRec.lang = 'en-US';
          liveRec.continuous = true;
          liveRec.interimResults = true;
          liveRec.onresult = (e: any) => {
            let combined = '';
            for (let i = 0; i < e.results.length; i++) {
              combined += e.results[i][0].transcript + ' ';
            }
            liveSpokenTranscript = combined.trim();
            if (liveSpokenTranscript) {
              onSaveTranscription(liveSpokenTranscript);
            }
          };
          liveRec.start();
          liveSpeechRecRef.current = liveRec;
        }
      } catch (recErr) {
        console.warn('Live SpeechRecognition not supported or active:', recErr);
      }

      recorder.onstop = async () => {
        stopWaveformVisualizer();
        stream.getTracks().forEach((track) => track.stop());

        if (liveSpeechRecRef.current) {
          try {
            liveSpeechRecRef.current.stop();
          } catch {}
        }

        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const newUrl = URL.createObjectURL(finalBlob);
        setAudioUrl(newUrl);
        onSaveRecording(finalBlob, newUrl);

        // Auto trigger server-side Gemini transcription
        transcribeAudio(finalBlob, mimeType);
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setTranscriptionError(
        'Acceso al micrófono denegado o no disponible. Asegúrate de permitir el micrófono en tu navegador para grabar tu voz.'
      );
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

  const handleDeleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onSaveRecording(null, null);
    onSaveTranscription('');
    setRecordingSeconds(0);
    setIsPlayingRecording(false);
    setTranscriptionError(null);
  };

  const handlePlayRecording = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingRecording(false);
      audioElementRef.current.onerror = () => setIsPlayingRecording(false);
    }

    if (isPlayingRecording) {
      audioElementRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.play().then(() => setIsPlayingRecording(true)).catch(() => setIsPlayingRecording(false));
    }
  };

  // Convert Blob to Base64 and call server-side Gemini transcription
  const transcribeAudio = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64Data = (reader.result as string) || '';

        try {
          const res = await fetch('/api/gemini/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType,
            }),
          });

          if (!res.ok) {
            throw new Error('Error al transcribir con IA');
          }

          const data = await res.json();
          if (data.transcription) {
            onSaveTranscription(data.transcription);
          } else {
            throw new Error('No se detectaron palabras en el audio');
          }
        } catch (serverErr: any) {
          console.warn('Server transcribe failed:', serverErr);
          if (!transcription) {
            setTranscriptionError(
              'El servicio de transcripción tuvo un inconveniente o no pudo procesar el formato de audio. Puedes ingresar o ajustar manualmente lo que hablaste abajo.'
            );
          }
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (e: any) {
      setIsTranscribing(false);
      setTranscriptionError('No se pudo leer el archivo de audio grabado.');
    }
  };

  const handleManualRetranscribe = () => {
    if (!recordedBlob) return;
    transcribeAudio(recordedBlob, recordedBlob.type || 'audio/webm');
  };

  const handleSaveManualTranscript = () => {
    if (manualInputText.trim()) {
      onSaveTranscription(manualInputText.trim());
      setManualTranscriptMode(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Recording Studio Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                4. RECORD YOUR VOICE & TRANSCRIPTION
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Sistema de Grabación y Transcripción de Audio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Servicio de Transcripción Habilitado</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>2 a 5 minutos</span>
            </span>
          </div>
        </div>

        {/* Apprentice Voice Requirement Warning */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 space-y-1">
            <p className="font-bold text-amber-300">Requisito obligatorio de la evidencia SENA:</p>
            <p className="text-amber-200/90 leading-relaxed">
              El audio final debe ser grabado con tu <strong>propia voz real en inglés</strong>. No utilices voces sintéticas ni grabaciones de terceros, pues los instructores del SENA verifican la autenticidad del aprendiz.
            </p>
          </div>
        </div>

        {/* Audio Waveform Canvas & Timer */}
        <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          {/* Waveform Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={90}
            className="w-full max-w-xl h-24 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner"
          />

          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`} />
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-wider">
              {AudioService.formatTime(recordingSeconds)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {isRecording ? '(GRABANDO VOZ)' : recordedBlob ? '(AUDIO CAPTURADO)' : '(LISTO)'}
            </span>
          </div>

          {/* Action Buttons: START, STOP, PLAY, DELETE, RECORD AGAIN */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-lg shadow-rose-500/25 flex items-center gap-2 cursor-pointer transition-all"
              >
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>🔴 COMENZAR A GRABAR</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-rose-500/50 shadow-lg flex items-center gap-2 cursor-pointer transition-all animate-pulse"
              >
                <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>⏹ DETENER GRABACIÓN</span>
              </button>
            )}

            {recordedBlob && !isRecording && (
              <>
                <button
                  onClick={handlePlayRecording}
                  className="px-5 py-3.5 rounded-2xl font-semibold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isPlayingRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingRecording ? 'PAUSAR' : '▶ ESCUCHAR MI GRABACIÓN'}</span>
                </button>

                <button
                  onClick={handleManualRetranscribe}
                  disabled={isTranscribing}
                  className="px-4 py-3.5 rounded-2xl font-semibold text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Re-ejecutar transcripción de audio"
                >
                  {isTranscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>✨ TRANSCRIBIR CON IA</span>
                </button>

                <button
                  onClick={handleStartRecording}
                  className="px-4 py-3.5 rounded-2xl font-semibold text-xs bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Grabar de nuevo reemplazando la actual"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>🔄 GRABAR OTRA VEZ</span>
                </button>

                <button
                  onClick={handleDeleteRecording}
                  className="px-4 py-3.5 rounded-2xl font-semibold text-xs bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Eliminar grabación actual"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>🗑 ELIMINAR</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error notification */}
        {transcriptionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{transcriptionError}</p>
              <button
                onClick={() => setManualTranscriptMode(true)}
                className="underline text-rose-200 hover:text-white"
              >
                Ingresar transcripción de forma manual
              </button>
            </div>
          </div>
        )}

        {/* SPEECH-TO-TEXT & SCRIPT COMPARISON */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                LO QUE DIJISTE (SPEECH-TO-TEXT TRANSCRIPTION)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isTranscribing && (
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Transcribiendo audio con IA...
                </span>
              )}

              <button
                onClick={() => setManualTranscriptMode(!manualTranscriptMode)}
                className="text-xs text-slate-400 hover:text-cyan-300 underline"
              >
                {manualTranscriptMode ? 'Cerrar editor manual' : 'Editar transcripción manual'}
              </button>
            </div>
          </div>

          {/* Manual transcript editor if requested */}
          {manualTranscriptMode && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Ajustar transcripción de lo que pronunciaste:
              </label>
              <textarea
                rows={3}
                value={manualInputText || transcription}
                onChange={(e) => setManualInputText(e.target.value)}
                placeholder="Pega o escribe las palabras exactas que pronunciaste en tu grabación..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveManualTranscript}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Guardar transcripción
                </button>
              </div>
            </div>
          )}

          {/* Transcription Display */}
          {transcription.trim() ? (
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                <span className="font-semibold text-white">
                  Transcripción real de tu audio (solo lo pronunciado):
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {transcription.split(/\s+/).filter(Boolean).length} palabras pronunciadas
                </span>
              </div>

              <p className="text-sm font-mono text-cyan-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                "{transcription}"
              </p>

              {/* Script Comparison Visualizer matching image */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    COMPARACIÓN CONTRA TU GUION ESPERADO:
                  </span>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Correctamente hablado
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Posible detalle / reconocimiento
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Faltante o no detectada
                    </span>
                  </div>
                </div>

                {/* Token Highlights matching screenshot */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap gap-1.5">
                  {tokenComparisons.map((item, idx) => {
                    let colorClass = 'bg-slate-800 text-slate-400 border border-slate-700';
                    if (item.status === 'correct') {
                      colorClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
                    } else if (item.status === 'warning') {
                      colorClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
                    } else if (item.status === 'missing') {
                      colorClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                    }

                    return (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${colorClass}`}
                        title={
                          item.status === 'correct'
                            ? 'Palabra pronunciada y detectada con éxito'
                            : item.status === 'warning'
                            ? `Posible variación fonética (detectada: "${item.spokenWord || '?'}")`
                            : 'Palabra faltante en la grabación respecto al guion'
                        }
                      >
                        {item.word}
                      </span>
                    );
                  })}
                </div>

                {/* Pedagogical disclaimer on speech recognition */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex items-start gap-3">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-normal">
                    <strong className="text-slate-200">Nota pedagógica importante: </strong>
                    Los sistemas de reconocimiento de voz pueden cometer errores o verse afectados por el micrófono y el ruido ambiente. Una palabra marcada en amarillo o rojo no significa obligatoriamente que la hayas pronunciado mal. Tómalo como una guía para volver a escuchar esa sección y verificarla.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-2">
              <Mic className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Presiona "Comenzar a grabar" para capturar tu voz. La transcripción de lo que pronuncies aparecerá aquí.
              </p>
            </div>
          )}
        </div>

        {/* Action to proceed to Final Practice (Module 5 removed as requested) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {recordedBlob || transcription
              ? '✓ Grabación y transcripción completadas'
              : 'Graba tu voz para completar este paso'}
          </p>

          <button
            onClick={onContinueToFinalPractice}
            disabled={!recordedBlob && !transcription}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>PASO 5: PRÁCTICA FINAL Y SIMULACRO SENA (FINAL PRACTICE)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
