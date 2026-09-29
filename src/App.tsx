import React, { useState, useEffect } from 'react';
import { 
  ApprenticeInfo, 
  ScriptSentence, 
  EvidenceChecklist, 
  SpeakingAnalysis 
} from './types';
import { 
  DEFAULT_APPRENTICE_INFO, 
  DEFAULT_SCRIPT_SENTENCES, 
  DEFAULT_CHECKLIST 
} from './utils/initialData';
import { Header } from './components/Header';
import { WelcomeHero } from './components/WelcomeHero';
import { StepProgressTracker, StepId } from './components/StepProgressTracker';
import { EvidenceRequirements } from './components/EvidenceRequirements';
import { ScriptBuilder } from './components/ScriptBuilder';
import { AICoachModal } from './components/AICoachModal';
import { PronunciationPractice } from './components/PronunciationPractice';
import { AudioRecorder } from './components/AudioRecorder';
import { FinalPractice } from './components/FinalPractice';
import { AIChatCoach } from './components/AIChatCoach';
import { DownloadScriptModal } from './components/DownloadScriptModal';
import { AudioService } from './utils/audioService';

// Storage keys
const STORAGE_PREFIX = 'sena_evidence_coach_';
const KEY_INFO = `${STORAGE_PREFIX}apprentice_info`;
const KEY_SCRIPT = `${STORAGE_PREFIX}script_sentences`;
const KEY_CHECKLIST = `${STORAGE_PREFIX}checklist`;
const KEY_TRANSCRIPTION = `${STORAGE_PREFIX}transcription`;
const KEY_ANALYSIS = `${STORAGE_PREFIX}analysis`;

export default function App() {
  // 1. Apprentice Info State
  const [apprenticeInfo, setApprenticeInfo] = useState<ApprenticeInfo>(() => {
    try {
      const saved = localStorage.getItem(KEY_INFO);
      return saved ? JSON.parse(saved) : DEFAULT_APPRENTICE_INFO;
    } catch {
      return DEFAULT_APPRENTICE_INFO;
    }
  });

  // 2. Script Sentences State
  const [sentences, setSentences] = useState<ScriptSentence[]>(() => {
    try {
      const saved = localStorage.getItem(KEY_SCRIPT);
      return saved ? JSON.parse(saved) : DEFAULT_SCRIPT_SENTENCES;
    } catch {
      return DEFAULT_SCRIPT_SENTENCES;
    }
  });

  // 3. Checklist State
  const [checklist, setChecklist] = useState<EvidenceChecklist>(() => {
    try {
      const saved = localStorage.getItem(KEY_CHECKLIST);
      return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST;
    } catch {
      return DEFAULT_CHECKLIST;
    }
  });

  // 4. Transcription & Audio State
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY_TRANSCRIPTION) || '';
    } catch {
      return '';
    }
  });

  // 5. Analysis State
  const [analysis, setAnalysis] = useState<SpeakingAnalysis | null>(() => {
    try {
      const saved = localStorage.getItem(KEY_ANALYSIS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation and UI state
  const [currentStep, setCurrentStep] = useState<StepId>('requirements');
  const [showWelcomeHero, setShowWelcomeHero] = useState(true);

  // Modals state
  const [activeCoachSentence, setActiveCoachSentence] = useState<ScriptSentence | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(KEY_INFO, JSON.stringify(apprenticeInfo));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [apprenticeInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_SCRIPT, JSON.stringify(sentences));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [sentences]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_CHECKLIST, JSON.stringify(checklist));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [checklist]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_TRANSCRIPTION, transcription);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [transcription]);

  useEffect(() => {
    try {
      if (analysis) {
        localStorage.setItem(KEY_ANALYSIS, JSON.stringify(analysis));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [analysis]);

  // Derived step completions (5 steps)
  const completedSteps: Record<StepId, boolean> = {
    requirements: true,
    script: sentences.length >= 6,
    pronunciation: true,
    recording: !!(recordedAudioBlob || transcription),
    final: checklist.finalRecordingReviewed,
  };

  const handleStartPractice = () => {
    setShowWelcomeHero(false);
    setCurrentStep('requirements');
  };

  const handleApplyCoachCorrection = (sentenceId: string, newText: string) => {
    setSentences((prev) =>
      prev.map((s) => (s.id === sentenceId ? { ...s, text: newText } : s))
    );
  };

  const handleDownloadCurrentAudio = () => {
    if (!recordedAudioBlob) return;
    AudioService.downloadAudioBlob(recordedAudioBlob, apprenticeInfo.name, apprenticeInfo.ficha);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        apprenticeInfo={apprenticeInfo}
        onOpenChat={() => setIsAIChatOpen(true)}
        onOpenScriptExport={() => setIsScriptModalOpen(true)}
        recordedAudioBlob={recordedAudioBlob}
        onDownloadAudio={handleDownloadCurrentAudio}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Starting Experience / Welcome Hero Banner */}
        {showWelcomeHero && (
          <WelcomeHero onStartPractice={handleStartPractice} />
        )}

        {/* Step Progress Tracker */}
        <StepProgressTracker
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          completedSteps={completedSteps}
        />

        {/* Step 1: Evidence Requirements */}
        {currentStep === 'requirements' && (
          <EvidenceRequirements
            onContinue={() => setCurrentStep('script')}
          />
        )}

        {/* Step 2: Build My Script */}
        {currentStep === 'script' && (
          <ScriptBuilder
            apprenticeInfo={apprenticeInfo}
            onUpdateApprenticeInfo={setApprenticeInfo}
            sentences={sentences}
            onUpdateSentences={setSentences}
            onOpenCoachForSentence={(s) => setActiveCoachSentence(s)}
            onContinueToPronunciation={() => setCurrentStep('pronunciation')}
          />
        )}

        {/* Step 3: Practice Pronunciation */}
        {currentStep === 'pronunciation' && (
          <PronunciationPractice
            sentences={sentences}
            onContinueToRecording={() => setCurrentStep('recording')}
          />
        )}

        {/* Step 4: Record My Voice & Transcription */}
        {currentStep === 'recording' && (
          <AudioRecorder
            sentences={sentences}
            recordedBlob={recordedAudioBlob}
            onSaveRecording={(blob, url) => {
              setRecordedAudioBlob(blob);
              setRecordedAudioUrl(url);
            }}
            transcription={transcription}
            onSaveTranscription={setTranscription}
            onContinueToFinalPractice={() => setCurrentStep('final')}
          />
        )}

        {/* Step 5: Final Practice Mode & Checklist */}
        {currentStep === 'final' && (
          <FinalPractice
            apprenticeInfo={apprenticeInfo}
            sentences={sentences}
            checklist={checklist}
            onUpdateChecklist={setChecklist}
            recordedAudioBlob={recordedAudioBlob}
            onSaveFinalAudio={(blob) => {
              setRecordedAudioBlob(blob);
              setRecordedAudioUrl(URL.createObjectURL(blob));
            }}
            onOpenScriptExport={() => setIsScriptModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ENGLISH AUDIO EVIDENCE COACH</span>
            <span>•</span>
            <span>GA3-240202501-AA1-EV02</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Plataforma pedagógica de práctica para aprendices del Servicio Nacional de Aprendizaje (SENA).
          </p>
        </div>
      </footer>

      {/* AI Script Coach Sentence Modal */}
      <AICoachModal
        sentence={activeCoachSentence}
        isOpen={!!activeCoachSentence}
        onClose={() => setActiveCoachSentence(null)}
        onApplyCorrection={handleApplyCoachCorrection}
        fullScriptText={sentences.map((s) => s.text).join(' ')}
      />

      {/* AI Chat Coach Drawer */}
      <AIChatCoach
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        apprenticeInfo={apprenticeInfo}
      />

      {/* Download Script Modal */}
      <DownloadScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        apprenticeInfo={apprenticeInfo}
        sentences={sentences}
      />
    </div>
  );
}
