import React, { useState } from 'react';
import { Target, CheckCircle2, Volume2, ArrowRight, BookOpen, AlertCircle, Info, Play, Pause } from 'lucide-react';
import { MODAL_RULES_GUIDE } from '../utils/initialData';
import { AudioService } from '../utils/audioService';

interface EvidenceRequirementsProps {
  onContinue: () => void;
}

export const EvidenceRequirements: React.FC<EvidenceRequirementsProps> = ({ onContinue }) => {
  const [playingExample, setPlayingExample] = useState<string | null>(null);

  const handlePlayAudio = async (text: string, id: string) => {
    if (playingExample === id) {
      AudioService.stopAll();
      setPlayingExample(null);
      return;
    }

    setPlayingExample(id);
    await AudioService.speakText(text, {
      onEnd: () => setPlayingExample(null),
      onError: () => setPlayingExample(null),
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Guía de Aprendizaje Bilingüismo SENA
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                ¿Qué requiere la evidencia GA3-240202501-AA1-EV02?
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Formato: Audio MP3 / WAV
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Duración: 2 a 5 minutos
            </span>
          </div>
        </div>

        {/* The Two Parts Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PART 1 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PARTE 1
              </span>
              <span className="text-xs text-slate-400">Apertura e Identificación</span>
            </div>
            <h3 className="text-lg font-bold text-white">Información Personal del Aprendiz</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Debes realizar una breve introducción en inglés donde te presentes de forma profesional y clara ante tu instructor.
            </p>
            <ul className="text-xs sm:text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Nombre completo y número de identificación / cédula.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Programa formativo y número de Ficha SENA.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Nombre de tu instructor asignado.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Mención explícita del código de la evidencia.</span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 font-mono space-y-1">
              <div className="text-[11px] text-cyan-400 font-sans font-semibold mb-1">Modelo de partida (adaptable):</div>
              <p className="text-slate-400 italic">"Hello, my name is [NAME]. My ID is [ID]. I belong to the [FICHA] training group. My instructor is [INSTRUCTOR]. Today I am presenting the evidence GA3-240202501-AA1-EV02."</p>
            </div>
          </div>

          {/* PART 2 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                PARTE 2
              </span>
              <span className="text-xs text-slate-400">Contenido y Estructuras Clave</span>
            </div>
            <h3 className="text-lg font-bold text-white">Actitudes, Creencias y Obligaciones</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Desarrolla una opinión estructurada sobre tus actitudes, creencias y obligaciones en contextos académicos (SENA) y laborales.
            </p>
            <ul className="text-xs sm:text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Uso correcto de verbos modales de obligación y consejo.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Verbo siempre en su <strong>forma base (infinitivo sin "to")</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Ejemplos reales aplicados a tu profesión técnica o tecnológica.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Fluidez comprensible adecuada para niveles A1 - A2 / B1.</span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200">
              <div className="font-semibold text-purple-300 mb-1">¡Regla de oro SENA!</div>
              <p>
                No necesitas usar inglés rebuscado ni palabras excesivamente complejas. La claridad, la pronunciación entendible y la estructura correcta son lo primordial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grammar & Modal Verbs Interactive Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Estructuras gramaticales obligatorias de la evidencia
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Aprende y escucha la diferencia exacta entre cada una. Haz clic en el botón de audio para escuchar el modelo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODAL_RULES_GUIDE.map((rule, idx) => {
            const isPlaying = playingExample === `req-${idx}`;
            return (
              <div
                key={rule.modal}
                className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold text-cyan-400">
                      {rule.modal}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {rule.meaningEs}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-normal">
                    {rule.descriptionEs}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-purple-400 font-semibold">Estructura: </span>
                    {rule.structure}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-200 italic font-mono truncate max-w-[190px]">
                    "{rule.example}"
                  </span>
                  <button
                    onClick={() => handlePlayAudio(rule.example, `req-${idx}`)}
                    className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors shrink-0"
                    title="Escuchar pronunciación modelo"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Advice Callout */}
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900 to-indigo-950/30 border border-cyan-800/30 p-4 sm:p-5 flex items-start gap-4">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-300 space-y-1">
            <span className="font-bold text-white block">Resumen comparativo clave:</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
              <li><strong className="text-cyan-300">HAVE TO:</strong> obligación o necesidad laboral.</li>
              <li><strong className="text-blue-300">MUST:</strong> regla estricta o deber moral fuerte.</li>
              <li><strong className="text-purple-300">SHOULD:</strong> sugerencia o recomendación positiva.</li>
              <li><strong className="text-amber-300">SHOULDN'T:</strong> lo que se desaconseja hacer.</li>
              <li className="sm:col-span-2"><strong className="text-emerald-300">DON'T HAVE TO:</strong> no es obligatorio / no estás forzado.</li>
            </ul>
          </div>
        </div>

        {/* Navigation to next step */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onContinue}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>PASO 2: CONSTRUIR MI GUION PERSONALIZADO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
