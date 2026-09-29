export interface ApprenticeInfo {
  name: string;
  id: string;
  ficha: string;
  instructor: string;
  program: string;
  workContext: string;
}

export type ModalCategory = 'intro' | 'have_to' | 'must' | 'should' | 'shouldnt' | 'dont_have_to' | 'belief' | 'custom';

export interface ScriptSentence {
  id: string;
  section: 'part1' | 'part2';
  category: ModalCategory;
  label: string;
  text: string;
  explanationEs?: string;
}

export interface WordAnalysisItem {
  word: string;
  status: 'correct' | 'warning' | 'missing';
  feedback?: string;
}

export interface PracticeRecommendation {
  category: 'Pronunciación' | 'Gramática' | 'Fluidez' | 'Contenido' | string;
  target: string;
  tip: string;
  practiceSentence: string;
}

export interface AnalysisScores {
  script: number;
  speaking: number;
  pronunciation: number;
  grammar: number;
  fluency: number;
}

export interface SpeakingAnalysis {
  scores: AnalysisScores;
  overallSummary: string;
  wordAnalysis: WordAnalysisItem[];
  categories: {
    scriptCompletion: {
      status: 'complete' | 'partial' | 'incomplete';
      feedback: string;
    };
    grammar: {
      hasModalVerbs: boolean;
      feedback: string;
    };
    pronunciation: {
      feedback: string;
    };
    fluency: {
      feedback: string;
    };
    vocabulary: {
      feedback: string;
    };
    clarity: {
      feedback: string;
    };
  };
  whatToPractice: PracticeRecommendation[];
  isReadyForFinal: boolean;
}

export interface EvidenceChecklist {
  part1Completed: boolean;
  part2Completed: boolean;
  clearIntro: boolean;
  usesModals: boolean;
  audibleVoice: boolean;
  completeRecording: boolean;
  pronunciationPracticed: boolean;
  finalRecordingReviewed: boolean;
}

export interface SentencePronunciationWord {
  word: string;
  status: 'correct' | 'warning' | 'missing';
  feedback?: string;
}

export interface SentencePronunciationResult {
  score: number;
  accuracy: 'excellent' | 'good' | 'needs_practice';
  recognizedText: string;
  words: SentencePronunciationWord[];
  feedbackEs: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
