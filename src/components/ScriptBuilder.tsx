import React, { useState } from 'react';
import { 
  FileEdit, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Volume2, 
  Sparkles, 
  User, 
  BookOpen, 
  Layers, 
  Check, 
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { ApprenticeInfo, ScriptSentence, ModalCategory } from '../types';
import { PRESET_SENTENCE_IDEAS } from '../utils/initialData';
import { AudioService } from '../utils/audioService';

interface ScriptBuilderProps {
  apprenticeInfo: ApprenticeInfo;
  onUpdateApprenticeInfo: (info: ApprenticeInfo) => void;
  sentences: ScriptSentence[];
  onUpdateSentences: (sentences: ScriptSentence[]) => void;
  onOpenCoachForSentence: (sentence: ScriptSentence) => void;
  onContinueToPronunciation: () => void;
}

export const ScriptBuilder: React.FC<ScriptBuilderProps> = ({
  apprenticeInfo,
  onUpdateApprenticeInfo,
  sentences,
  onUpdateSentences,
  onOpenCoachForSentence,
  onContinueToPronunciation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // New sentence modal / form state
  const [isAddingSentence, setIsAddingSentence] = useState(false);
  const [newSentenceSection, setNewSentenceSection] = useState<'part1' | 'part2'>('part2');
  const [newSentenceCategory, setNewSentenceCategory] = useState<ModalCategory>('have_to');
  const [newSentenceLabel, setNewSentenceLabel] = useState('');
  const [newSentenceText, setNewSentenceText] = useState('');

  // Handle personal info fields and auto-sync intro if needed
  const handleInfoChange = (field: keyof ApprenticeInfo, val: string) => {
    const updatedInfo = { ...apprenticeInfo, [field]: val };
    onUpdateApprenticeInfo(updatedInfo);

    // Optional quick sync for intro sentences that match default patterns
    if (field === 'name' && val) {
      updateSentenceById('s-intro-1', `Hello, my name is ${val}.`);
    } else if (field === 'id' && val) {
      updateSentenceById('s-intro-2', `My ID number is ${val}.`);
    } else if (field === 'ficha' && val) {
      updateSentenceById('s-intro-4', `I belong to the ${val} training group.`);
    } else if (field === 'instructor' && val) {
      updateSentenceById('s-intro-5', `My instructor is ${val}.`);
    }
  };

  const updateSentenceById = (id: string, newText: string) => {
    const updated = sentences.map((s) => (s.id === id ? { ...s, text: newText } : s));
    onUpdateSentences(updated);
  };

  const handleDeleteSentence = (id: string) => {
    if (sentences.length <= 1) return;
    onUpdateSentences(sentences.filter((s) => s.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sentences.length) return;

    const copy = [...sentences];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onUpdateSentences(copy);
  };

  const handlePlaySentence = async (id: string, text: string) => {
    if (playingId === id) {
      AudioService.stopAll();
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    await AudioService.speakText(text, {
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const handleCreateSentence = () => {
    if (!newSentenceText.trim()) return;

    const newSentence: ScriptSentence = {
      id: `s-${Date.now()}`,
      section: newSentenceSection,
      category: newSentenceCategory,
      label: newSentenceLabel.trim() || 'Oración personalizada',
      text: newSentenceText.trim(),
    };

    onUpdateSentences([...sentences, newSentence]);
    setNewSentenceText('');
    setNewSentenceLabel('');
    setIsAddingSentence(false);
  };

  const handleAddPreset = (preset: typeof PRESET_SENTENCE_IDEAS[0]) => {
    const newSentence: ScriptSentence = {
      id: `s-preset-${Date.now()}`,
      section: 'part2',
      category: preset.category,
      label: preset.label,
      text: preset.text,
    };
    onUpdateSentences([...sentences, newSentence]);
  };

  const part1Sentences = sentences.filter((s) => s.section === 'part1');
  const part2Sentences = sentences.filter((s) => s.section === 'part2');

  const getCategoryColor = (cat: ModalCategory) => {
    switch (cat) {
      case 'have_to':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'must':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'should':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'shouldnt':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'dont_have_to':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'intro':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: Apprentice Information */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Datos del Aprendiz SENA
              </h2>
              <p className="text-xs text-slate-400">
                Estos datos se incorporan de inmediato a la Parte 1 de tu guion oficial.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full self-start sm:self-auto">
            GA3-240202501-AA1-EV02
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nombre Completo del Aprendiz</label>
            <input
              type="text"
              value={apprenticeInfo.name}
              onChange={(e) => handleInfoChange('name', e.target.value)}
              placeholder="Ej: Carlos Mario Gómez"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Número de Identificación (ID/Cédula)</label>
            <input
              type="text"
              value={apprenticeInfo.id}
              onChange={(e) => handleInfoChange('id', e.target.value)}
              placeholder="Ej: 1098765432"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Número de Ficha SENA</label>
            <input
              type="text"
              value={apprenticeInfo.ficha}
              onChange={(e) => handleInfoChange('ficha', e.target.value)}
              placeholder="Ej: 2834912"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nombre del Instructor(a)</label>
            <input
              type="text"
              value={apprenticeInfo.instructor}
              onChange={(e) => handleInfoChange('instructor', e.target.value)}
              placeholder="Ej: Claudia Morales"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Programa de Formación SENA</label>
            <input
              type="text"
              value={apprenticeInfo.program}
              onChange={(e) => handleInfoChange('program', e.target.value)}
              placeholder="Ej: Análisis y Desarrollo de Software (ADSO)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Contexto Laboral o Académico</label>
            <input
              type="text"
              value={apprenticeInfo.workContext}
              onChange={(e) => handleInfoChange('workContext', e.target.value)}
              placeholder="Ej: Empresa de software / Centro formativo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Interactive Script Framework */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                1. BUILD YOUR SCRIPT
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Constructor de Guion en Inglés
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personaliza cada frase. Puedes editarlas, moverlas, agregar nuevas oraciones y pedirle ayuda al Coach IA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingSentence(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ AGREGAR ORACIÓN</span>
            </button>
          </div>
        </div>

        {/* PART 1 SENTENCES LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                PART 1 – INTRODUCTION (INFORMACIÓN PERSONAL)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {part1Sentences.length} oraciones
            </span>
          </div>

          <div className="space-y-3">
            {part1Sentences.map((sentence, index) => {
              const globalIdx = sentences.findIndex((s) => s.id === sentence.id);
              const isEditing = editingId === sentence.id;
              const isPlaying = playingId === sentence.id;

              return (
                <div
                  key={sentence.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4 space-y-3 hover:border-slate-700 transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      <span className="text-xs font-semibold text-slate-300">{sentence.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio Play */}
                      <button
                        onClick={() => handlePlaySentence(sentence.id, sentence.text)}
                        className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
                        title="Escuchar pronunciación"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* AI Coach Button */}
                      <button
                        onClick={() => onOpenCoachForSentence(sentence)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold transition-all"
                        title="Abrir Coach de Guion IA"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Coach IA</span>
                      </button>

                      {/* Move Up */}
                      <button
                        onClick={() => handleMove(globalIdx, 'up')}
                        disabled={globalIdx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMove(globalIdx, 'down')}
                        disabled={globalIdx === sentences.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSentence(sentence.id)}
                        className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar oración"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sentence Text Input / Display */}
                  <div>
                    <input
                      type="text"
                      value={sentence.text}
                      onChange={(e) => updateSentenceById(sentence.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PART 2 SENTENCES LIST */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                PART 2 – ATTITUDES, BELIEFS AND OBLIGATIONS (OBLIGACIONES Y ACTITUDES)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {part2Sentences.length} oraciones
            </span>
          </div>

          <div className="space-y-3">
            {part2Sentences.map((sentence, index) => {
              const globalIdx = sentences.findIndex((s) => s.id === sentence.id);
              const isPlaying = playingId === sentence.id;

              return (
                <div
                  key={sentence.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4 space-y-3 hover:border-slate-700 transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border ${getCategoryColor(sentence.category)}`}>
                        {sentence.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio Play */}
                      <button
                        onClick={() => handlePlaySentence(sentence.id, sentence.text)}
                        className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
                        title="Escuchar pronunciación"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* AI Coach Button */}
                      <button
                        onClick={() => onOpenCoachForSentence(sentence)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 text-xs font-semibold transition-all"
                        title="Abrir Coach de Guion IA"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Coach IA</span>
                      </button>

                      {/* Move Up */}
                      <button
                        onClick={() => handleMove(globalIdx, 'up')}
                        disabled={globalIdx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMove(globalIdx, 'down')}
                        disabled={globalIdx === sentences.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSentence(sentence.id)}
                        className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar oración"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sentence Text Input */}
                  <div>
                    <input
                      type="text"
                      value={sentence.text}
                      onChange={(e) => updateSentenceById(sentence.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-purple-200 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Sentence Idea Presets */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Plantillas sugeridas con verbos modales (clic para añadir a tu guion):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {PRESET_SENTENCE_IDEAS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleAddPreset(preset)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <span className="text-[11px] font-bold text-cyan-400 mb-1">{preset.label}</span>
                <span className="text-xs text-slate-300 font-mono italic truncate">
                  "{preset.text}"
                </span>
                <span className="text-[10px] text-slate-500 mt-2 group-hover:text-cyan-400 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Añadir
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation to next step */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onContinueToPronunciation}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>PASO 3: PRACTICAR PRONUNCIACIÓN DE ORACIONES</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Sentence Modal */}
      {isAddingSentence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Agregar nueva oración al guion</span>
              </h3>
              <button
                onClick={() => setIsAddingSentence(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Sección</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewSentenceSection('part1')}
                    className={`p-2 rounded-xl text-xs font-medium border ${
                      newSentenceSection === 'part1'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Parte 1: Introducción
                  </button>
                  <button
                    onClick={() => setNewSentenceSection('part2')}
                    className={`p-2 rounded-xl text-xs font-medium border ${
                      newSentenceSection === 'part2'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Parte 2: Obligaciones / Actitudes
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Estructura / Categoría</label>
                <select
                  value={newSentenceCategory}
                  onChange={(e) => setNewSentenceCategory(e.target.value as ModalCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="have_to">HAVE TO (Obligación / Necesidad)</option>
                  <option value="must">MUST (Regla estricta / Obligación fuerte)</option>
                  <option value="should">SHOULD (Recomendación positiva)</option>
                  <option value="shouldnt">SHOULDN'T (Recomendación negativa)</option>
                  <option value="dont_have_to">DON'T HAVE TO (No es necesario)</option>
                  <option value="belief">Creencia u Opinión</option>
                  <option value="intro">Información Personal</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Etiqueta breve (Español)</label>
                <input
                  type="text"
                  value={newSentenceLabel}
                  onChange={(e) => setNewSentenceLabel(e.target.value)}
                  placeholder="Ej: Obligación con los entregables SENA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Texto en inglés</label>
                <textarea
                  rows={3}
                  value={newSentenceText}
                  onChange={(e) => setNewSentenceText(e.target.value)}
                  placeholder="Ej: I must keep my technical documentation up to date."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAddingSentence(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSentence}
                disabled={!newSentenceText.trim()}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Agregar al guion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
