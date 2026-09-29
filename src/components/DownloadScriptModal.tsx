import React, { useState } from 'react';
import { FileText, Download, Printer, Copy, Check, X } from 'lucide-react';
import { ApprenticeInfo, ScriptSentence } from '../types';

interface DownloadScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  apprenticeInfo: ApprenticeInfo;
  sentences: ScriptSentence[];
}

export const DownloadScriptModal: React.FC<DownloadScriptModalProps> = ({
  isOpen,
  onClose,
  apprenticeInfo,
  sentences,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const part1List = sentences.filter((s) => s.section === 'part1');
  const part2List = sentences.filter((s) => s.section === 'part2');

  const formattedDoc = `=====================================================
SENA - SERVICIO NACIONAL DE APRENDIZAJE
EVIDENCIA DE APRENDIZAJE BILINGÜISMO
GA3-240202501-AA1-EV02 – AUDIO
=====================================================

DATOS DEL APRENDIZ:
Name: ${apprenticeInfo.name || '__________________________'}
ID / Cédula: ${apprenticeInfo.id || '__________________________'}
Program: ${apprenticeInfo.program || '__________________________'}
Ficha: ${apprenticeInfo.ficha || '__________________________'}
Instructor: ${apprenticeInfo.instructor || '__________________________'}
Context: ${apprenticeInfo.workContext || '__________________________'}

-----------------------------------------------------
PART 1 – INTRODUCTION
-----------------------------------------------------
${part1List.map((s, i) => `${i + 1}. ${s.text}`).join('\n')}

-----------------------------------------------------
PART 2 – ATTITUDES, BELIEFS AND OBLIGATIONS
-----------------------------------------------------
${part2List.map((s, i) => `${i + 1}. [${s.category.toUpperCase()}] ${s.text}`).join('\n')}

=====================================================
Documento generado con English Audio Evidence Coach
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([formattedDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = (apprenticeInfo.name || 'APPRENTICE').trim().replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase();
    const cleanFicha = (apprenticeInfo.ficha || 'FICHA').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    a.href = url;
    a.download = `GA3-240202501-AA1-EV02_SCRIPT_${cleanName}_${cleanFicha}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                DOWNLOAD MY SCRIPT (Guion Final)
              </h3>
              <p className="text-xs text-slate-400">
                GA3-240202501-AA1-EV02 – AUDIO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Vista previa del documento oficial para entrega:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
            {formattedDoc}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Formato estándar compatible con Territorium / Zajuna SENA
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
            <button
              onClick={handleDownloadTxt}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              <span>DESCARGAR GUION (.TXT)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
