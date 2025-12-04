export type QuestionType = 'accurate' | 'estimate';
export type Difficulty = 'easy' | 'medium' | 'tough';
export type SessionMode = 'timed' | 'practice';
export type Suffix = 'none' | 'K' | 'M' | 'B';

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  correctAnswer: number;
  meta?: {
    baseValue?: number;
    percent?: number;
    operation?: string;
    secondValue?: number;
  };
}

export interface SessionSettings {
  type: QuestionType;
  difficulty: Difficulty;
  mode: SessionMode;
  timeLimitSeconds?: number;
  numQuestionsTarget?: number;
}

export interface AnswerRecord {
  question: Question;
  userAnswer: number | null;
  suffix: Suffix;
  isCorrect: boolean;
  errorPercent?: number;
  rawInput?: string;
}

export interface SessionState {
  settings: SessionSettings;
  startedAt: number;
  endsAt?: number;
  currentQuestion: Question;
  answers: AnswerRecord[];
  questionsAnsweredCount: number;
}

export type Screen = 'home' | 'setup' | 'quiz' | 'results';

