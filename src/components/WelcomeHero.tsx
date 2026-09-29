import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Mic, Volume2, Award, BookOpen } from 'lucide-react';

interface WelcomeHeroProps {
  onStartPractice: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onStartPractice }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-10 mb-8 shadow-2xl">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SENA • GA3-240202501-AA1-EV02 – AUDIO</span>
        </div>

        {/* Main Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            ENGLISH AUDIO EVIDENCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">COACH</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Prepare, practice and improve your English audio before submitting your evidence.
          </p>
        </div>

        {/* Pedagogy Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left max-w-2xl mx-auto shadow-inner">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 space-y-1">
              <p className="font-semibold text-white">Objetivo pedagógico del entrenador:</p>
              <p className="text-slate-400 leading-normal">
                Esta herramienta <strong>no hace tu evidencia de forma automática</strong>. Su propósito es guiarte para que construyas tu propio guion, practiques pronunciación natural en inglés, grabes tu voz con confianza y recibas retroalimentación antes de entregar tu audio oficial en Territorium/Zajuna.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Feature highlight pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
              <Volume2 className="w-4 h-4" />
              <span>Pronunciación + Comparador</span>
            </div>
            <p className="text-[11px] text-slate-400">Graba cada frase con tu voz y compárala directamente contra el modelo nativo.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
              <Mic className="w-4 h-4" />
              <span>Grabación + Texto</span>
            </div>
            <p className="text-[11px] text-slate-400">Transcripción de voz habilitada en tiempo real y comparador con el guion.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Coach de Guion</span>
            </div>
            <p className="text-[11px] text-slate-400">Verifica modales: HAVE TO, MUST, SHOULD y sugerencias en español.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <Award className="w-4 h-4" />
              <span>Simulacro SENA</span>
            </div>
            <p className="text-[11px] text-slate-400">Lista de chequeo oficial de 8 puntos y descarga de audio en formato .wav.</p>
          </div>
        </div>

        {/* Start button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartPractice}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>COMENZAR MI PRÁCTICA PASO A PASO</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
