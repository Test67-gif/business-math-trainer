import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SessionState, Suffix, AnswerRecord } from '../types';
import { checkAnswer, getNumericAnswer } from '../questionGenerator';

interface QuizScreenProps {
  session: SessionState;
  onAnswer: (record: AnswerRecord) => void;
  onComplete: () => void;
  onExit: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  session,
  onAnswer,
  onComplete,
  onExit,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [suffix, setSuffix] = useState<Suffix>('none');
  const [timeRemaining, setTimeRemaining] = useState<number>(
    session.settings.mode === 'timed' ? session.settings.timeLimitSeconds! : 0
  );
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and question change
  useEffect(() => {
    inputRef.current?.focus();
  }, [session.currentQuestion]);

  // Timer effect for timed mode
  useEffect(() => {
    if (session.settings.mode !== 'timed') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session.settings.mode, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayAnswer = useCallback((): string => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return '—';
    const num = parseFloat(inputValue);
    const finalValue = getNumericAnswer(num, suffix);
    return finalValue.toLocaleString('en-US');
  }, [inputValue, suffix]);

  const handleSubmit = useCallback(() => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return;

    const mantissa = parseFloat(inputValue);
    const userAnswer = getNumericAnswer(mantissa, suffix);
    const { isCorrect, errorPercent } = checkAnswer(
      userAnswer,
      session.currentQuestion.correctAnswer,
      session.currentQuestion.type
    );

    const record: AnswerRecord = {
      question: session.currentQuestion,
      userAnswer,
      suffix,
      isCorrect,
      errorPercent,
      rawInput: inputValue,
    };

    onAnswer(record);
    setInputValue('');
    setSuffix('none');

    // Check if practice mode is complete
    if (
      session.settings.mode === 'practice' &&
      session.questionsAnsweredCount + 1 >= session.settings.numQuestionsTarget!
    ) {
      onComplete();
    }
  }, [inputValue, suffix, session, onAnswer, onComplete]);

  const handleSkip = useCallback(() => {
    const record: AnswerRecord = {
      question: session.currentQuestion,
      userAnswer: null,
      suffix: 'none',
      isCorrect: false,
      rawInput: '',
    };

    onAnswer(record);
    setInputValue('');
    setSuffix('none');

    if (
      session.settings.mode === 'practice' &&
      session.questionsAnsweredCount + 1 >= session.settings.numQuestionsTarget!
    ) {
      onComplete();
    }
  }, [session, onAnswer, onComplete]);

  const handleSuffixToggle = (newSuffix: Suffix) => {
    setSuffix(suffix === newSuffix ? 'none' : newSuffix);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const totalAttempted = session.questionsAnsweredCount;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  return (
    <div className="quiz-screen">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Exit Session?</h3>
            <p>Your progress will not be saved.</p>
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowExitConfirm(false)}>
                Continue
              </button>
              <button className="modal-confirm" onClick={onExit}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="quiz-header">
        <button className="exit-button" onClick={() => setShowExitConfirm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="quiz-status">
          {session.settings.mode === 'timed' ? (
            <div className={`timer ${timeRemaining <= 30 ? 'timer-warning' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="progress-indicator">
              <span className="current-q">Q {totalAttempted + 1}</span>
              <span className="total-q">of {session.settings.numQuestionsTarget}</span>
            </div>
          )}
        </div>

        <div className="accuracy-badge">
          <span className="accuracy-value">{accuracy}%</span>
          <span className="accuracy-label">Acc</span>
        </div>
      </header>

      {/* Question Area */}
      <div className="question-area">
        <div className="question-meta">
          <span className={`type-badge ${session.currentQuestion.type}`}>
            {session.currentQuestion.type === 'accurate' ? 'Accurate' : 'Estimate ±10%'}
          </span>
          <span className={`difficulty-badge ${session.currentQuestion.difficulty}`}>
            {session.currentQuestion.difficulty}
          </span>
        </div>
        <div className="question-text">
          {session.currentQuestion.prompt}
        </div>
      </div>

      {/* Answer Area */}
      <div className="answer-area">
        <div className="input-container">
          <input
            ref={inputRef}
            type="tel"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter number"
            className="answer-input"
            autoComplete="off"
          />
          
          <div className="suffix-buttons">
            {(['K', 'M', 'B'] as Suffix[]).map((s) => (
              <button
                key={s}
                className={`suffix-button ${suffix === s ? 'active' : ''}`}
                onClick={() => handleSuffixToggle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="answer-preview">
          <span className="preview-label">Your answer:</span>
          <span className="preview-value">{getDisplayAnswer()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="skip-button"
          onClick={handleSkip}
        >
          Skip
        </button>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!inputValue || isNaN(parseFloat(inputValue))}
        >
          Submit
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Bar (Practice Mode) */}
      {session.settings.mode === 'practice' && (
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${((totalAttempted + 1) / session.settings.numQuestionsTarget!) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QuizScreen;

