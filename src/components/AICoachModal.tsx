import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, Volume2, ArrowRight, Lightbulb, RefreshCw } from 'lucide-react';
import { ScriptSentence } from '../types';
import { AudioService } from '../utils/audioService';

interface AICoachModalProps {
  sentence: ScriptSentence | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyCorrection: (sentenceId: string, newText: string) => void;
  fullScriptText: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  sentence,
  isOpen,
  onClose,
  onApplyCorrection,
  fullScriptText,
}) => {
  if (!isOpen || !sentence) return null;

  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('check-grammar');
  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [result, setResult] = useState<{
    original: string;
    correction: string;
    explanation: string;
    alternatives?: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const actions = [
    { id: 'check-grammar', label: 'Verificar gramática', icon: '📝' },
    { id: 'make-easier', label: 'Hacerla más sencilla (A1-A2)', icon: '🟢' },
    { id: 'make-natural', label: 'Hacerla más natural', icon: '✨' },
    { id: 'check-have-to', label: 'Revisar uso de HAVE TO', icon: '⚡' },
    { id: 'check-must', label: 'Revisar uso de MUST', icon: '🛡️' },
    { id: 'check-should', label: 'Revisar uso de SHOULD / SHOULDN\'T', icon: '💡' },
    { id: 'vocabulary-ideas', label: 'Ideas de vocabulario profesional', icon: '📚' },
    { id: 'help-express', label: 'Ayúdame a expresar esta idea', icon: '🗣️' },
  ];

  const handleRunCoach = async (actionId = selectedAction) => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedAction(actionId);

    try {
      const sentenceToReview = actionId === 'help-express' && customIdeaInput.trim() 
        ? customIdeaInput.trim() 
        : sentence.text;

      const res = await fetch('/api/gemini/script-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionId,
          sentence: sentenceToReview,
          context: sentence.label,
          fullScript: fullScriptText,
        }),
      });

      if (!res.ok) {
        throw new Error('No se pudo conectar con el Coach de Guion IA');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Error al procesar la sugerencia');
    } finally {
      setLoading(false);
    }
  };

  const handleListenText = async (text: string) => {
    await AudioService.speakText(text);
  };

  const handleApply = (textToApply: string) => {
    onApplyCorrection(sentence.id, textToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>AI SCRIPT COACH</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Pedagogical Coach
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Mejora tu oración en inglés paso a paso respetando las reglas de la evidencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Current Sentence Card */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                Oración seleccionada ({sentence.label}):
              </span>
              <button
                onClick={() => handleListenText(sentence.text)}
                className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                title="Escuchar"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar</span>
              </button>
            </div>
            <p className="text-sm font-mono text-white bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              "{sentence.text}"
            </p>
          </div>

          {/* Quick Coach Action Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              ¿Qué deseas consultar al Coach?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {actions.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleRunCoach(act.id)}
                  disabled={loading}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                    selectedAction === act.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-base">{act.icon}</span>
                  <span className="leading-tight">{act.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* If "help-express" is selected, allow student to type their idea in Spanish or rough English */}
          {selectedAction === 'help-express' && (
            <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-xs font-medium text-slate-300">
                Escribe tu idea (puedes escribirla en español o inglés básico):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIdeaInput}
                  onChange={(e) => setCustomIdeaInput(e.target.value)}
                  placeholder="Ej: Tengo que entregar el informe antes de las 5 pm..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleRunCoach('help-express')}
                  disabled={loading || !customIdeaInput.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 transition-colors"
                >
                  Traducir/Mejorar
                </button>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-cyan-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs text-slate-400">El Coach IA está analizando tu oración...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* AI Response Card */}
          {result && !loading && (
            <div className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Sugerencia del Coach IA
                </span>
                <span className="text-[11px] text-slate-400">Nivel recomendado: A1-A2 SENA</span>
              </div>

              {/* ORIGINAL */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ORIGINAL:
                </span>
                <p className="text-xs font-mono text-slate-300 line-through decoration-rose-500/60 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {result.original}
                </p>
              </div>

              {/* CORRECTION */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    CORRECCIÓN SUGERIDA:
                  </span>
                  <button
                    onClick={() => handleListenText(result.correction)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                    title="Escuchar corrección"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar</span>
                  </button>
                </div>
                <p className="text-sm font-mono text-emerald-300 font-semibold bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30">
                  "{result.correction}"
                </p>
              </div>

              {/* WHY / EXPLANATION */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  ¿POR QUÉ? (EXPLICACIÓN PEDAGÓGICA):
                </span>
                <p className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* ALTERNATIVES */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    OTRAS FORMAS NATURALES DE DECIRLO:
                  </span>
                  <div className="space-y-1">
                    {result.alternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                      >
                        <span className="truncate">"{alt}"</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleListenText(alt)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-400"
                            title="Escuchar"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApply(alt)}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px]"
                          >
                            Usar esta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APPLY BUTTON */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleApply(result.correction)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>APLICAR CORRECCIÓN A MI GUION</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
