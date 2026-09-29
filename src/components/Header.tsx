import React from 'react';
import { Headphones, Download, FileText, MessageSquareQuote, ShieldAlert } from 'lucide-react';
import { ApprenticeInfo } from '../types';

interface HeaderProps {
  apprenticeInfo: ApprenticeInfo;
  onOpenChat: () => void;
  onOpenScriptExport: () => void;
  recordedAudioBlob: Blob | null;
  onDownloadAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apprenticeInfo,
  onOpenChat,
  onOpenScriptExport,
  recordedAudioBlob,
  onDownloadAudio,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand and SENA badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold ring-1 ring-white/20">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                ENGLISH AUDIO EVIDENCE COACH
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                SENA Bilingüismo
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-cyan-400 font-medium">GA3-240202501-AA1-EV02</span>
              <span>•</span>
              <span className="truncate max-w-[200px] sm:max-w-xs text-slate-300">
                {apprenticeInfo.name ? `${apprenticeInfo.name} (Ficha: ${apprenticeInfo.ficha || '---'})` : 'Entrenador de Pronunciación'}
              </span>
            </div>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2">
          {recordedAudioBlob && (
            <button
              onClick={onDownloadAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors shadow-sm"
              title="Descargar grabación actual de audio"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Descargar Audio</span>
            </button>
          )}

          <button
            onClick={onOpenScriptExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            title="Ver y descargar guion completo"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Guion</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
            title="Hacer preguntas al Coach de Inglés IA"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Coach IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
