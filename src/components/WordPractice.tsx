import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Check } from 'lucide-react';
import { AudioService } from '../utils/audioService';
import { PHONETIC_GUIDE, tokenizeWords } from '../utils/textComparison';

interface WordPracticeProps {
  sentenceText: string;
}

export const WordPractice: React.FC<WordPracticeProps> = ({ sentenceText }) => {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const rawWords = sentenceText
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const handlePlayWord = async (word: string) => {
    // Clean punctuation
    const clean = word.toLowerCase().replace(/[^a-z']/g, '');
    setPlayingWord(clean);
    await AudioService.speakText(clean, {
      rate: 0.8, // Slightly slower for single word phonetics
      onEnd: () => setPlayingWord(null),
      onError: () => setPlayingWord(null),
    });
  };

  const getWordGuide = (word: string) => {
    const clean = word.toLowerCase().replace(/[^a-z']/g, '');
    return PHONETIC_GUIDE[clean] || null;
  };

  return (
    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Pronunciación Palabra por Palabra (Word-by-Word Breakdown)
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Haz clic en cualquier palabra para escucharla y ver su guía fonética fácil
        </span>
      </div>

      {/* Words Chips Grid */}
      <div className="flex flex-wrap gap-2 pt-1">
        {rawWords.map((raw, idx) => {
          const clean = raw.toLowerCase().replace(/[^a-z']/g, '');
          const guide = getWordGuide(raw);
          const isSelected = activeWord === clean;
          const isPlaying = playingWord === clean;

          return (
            <div
              key={`${clean}-${idx}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                  : guide
                  ? 'bg-slate-900 border-purple-500/30 text-slate-200 hover:border-purple-400/60'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              onClick={() => {
                setActiveWord(clean);
                handlePlayWord(raw);
              }}
            >
              <button
                type="button"
                className={`p-1 rounded-lg transition-colors ${
                  isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-cyan-300'
                }`}
                title={`Pronunciar ${raw}`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs sm:text-sm font-mono font-semibold">{raw}</span>
              {guide && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" title="Palabra clave con tip" />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail card if active word has phonetic guide */}
      {activeWord && (
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 text-xs space-y-2 animate-fadeIn">
          {getWordGuide(activeWord) ? (
            (() => {
              const guide = getWordGuide(activeWord)!;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white capitalize">
                        {activeWord}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[11px]">
                        Pronunciación fácil: [{guide.easy}]
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {guide.ipa}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePlayWord(activeWord)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Repetir</span>
                    </button>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    <strong className="text-cyan-300">Consejo en español: </strong>
                    {guide.tipEs}
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white capitalize">{activeWord}</span>
                <span className="text-slate-400">— Sonido regular en inglés americano.</span>
              </div>
              <button
                onClick={() => handlePlayWord(activeWord)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Repetir</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
