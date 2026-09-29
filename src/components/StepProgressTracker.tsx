import React from 'react';
import { Target, FileEdit, Volume2, Mic, Trophy, Check } from 'lucide-react';

export type StepId = 'requirements' | 'script' | 'pronunciation' | 'recording' | 'final';

interface StepProgressTrackerProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
  completedSteps: Record<StepId, boolean>;
}

export const StepProgressTracker: React.FC<StepProgressTrackerProps> = ({
  currentStep,
  onSelectStep,
  completedSteps,
}) => {
  const steps: Array<{
    id: StepId;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    number: number;
  }> = [
    {
      id: 'requirements',
      label: '1. Requisitos',
      sublabel: 'Evidence Requirements',
      icon: Target,
      number: 1,
    },
    {
      id: 'script',
      label: '2. Guion',
      sublabel: 'Build My Script',
      icon: FileEdit,
      number: 2,
    },
    {
      id: 'pronunciation',
      label: '3. Pronunciación',
      sublabel: 'Record & Compare',
      icon: Volume2,
      number: 3,
    },
    {
      id: 'recording',
      label: '4. Grabación',
      sublabel: 'Record & Transcribe',
      icon: Mic,
      number: 4,
    },
    {
      id: 'final',
      label: '5. Práctica Final',
      sublabel: 'SENA Checklist',
      icon: Trophy,
      number: 5,
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 sm:p-3 backdrop-blur shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = completedSteps[step.id];

            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`flex items-center sm:flex-col justify-start sm:justify-center gap-2 sm:gap-1.5 p-2.5 sm:py-3 sm:px-2 rounded-xl text-left sm:text-center transition-all cursor-pointer relative overflow-hidden group ${
                  isCurrent
                    ? 'bg-gradient-to-b from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : isCompleted
                    ? 'bg-slate-800/60 text-slate-300 border border-emerald-500/30 hover:bg-slate-800'
                    : 'bg-slate-950/40 text-slate-400 border border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                {/* Status indicator dot or check */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1 sm:justify-center">
                    <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {step.label}
                    </span>
                  </div>
                  <span className="hidden sm:block text-[10px] text-slate-400 truncate font-mono">
                    {step.sublabel}
                  </span>
                </div>

                {/* Subtle active pill line at bottom */}
                {isCurrent && (
                  <div className="hidden sm:block absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
