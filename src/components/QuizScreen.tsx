import React, { useState, useEffect, useCallback } from 'react';
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
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

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
    animateKeyPress(newSuffix);
  };

  const animateKeyPress = (key: string) => {
    setLastKeyPressed(key);
    setTimeout(() => setLastKeyPressed(null), 150);
  };

  const handleNumpadPress = (key: string) => {
    animateKeyPress(key);
    
    if (key === 'backspace') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (key === 'clear') {
      setInputValue('');
      setSuffix('none');
    } else if (key === '.') {
      if (!inputValue.includes('.')) {
        setInputValue(prev => prev + '.');
      }
    } else {
      // Limit input length
      if (inputValue.length < 12) {
        setInputValue(prev => prev + key);
      }
    }
  };

  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const totalAttempted = session.questionsAnsweredCount;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  const canSubmit = inputValue && !isNaN(parseFloat(inputValue));

  return (
    <div className="quiz-screen">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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
              <span className="timer-value">{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="progress-indicator">
              <span className="current-q">{totalAttempted + 1}</span>
              <span className="total-q">/ {session.settings.numQuestionsTarget}</span>
            </div>
          )}
        </div>

        <div className="accuracy-badge">
          <span className="accuracy-value">{accuracy}%</span>
        </div>
      </header>

      {/* Question Area */}
      <div className="question-area">
        <div className="question-meta">
          <span className={`type-badge ${session.currentQuestion.type}`}>
            {session.currentQuestion.type === 'accurate' ? 'Precise' : 'Estimate ±10%'}
          </span>
        </div>
        <div className="question-text">
          {session.currentQuestion.prompt}
        </div>
      </div>

      {/* Answer Display */}
      <div className="answer-display-area">
        <div className="answer-display">
          <span className="answer-value">{inputValue || '0'}</span>
          {suffix !== 'none' && <span className="answer-suffix">{suffix}</span>}
        </div>
        <div className="answer-preview">
          = {getDisplayAnswer()}
        </div>
      </div>

      {/* Suffix Buttons */}
      <div className="suffix-row">
        {(['K', 'M', 'B'] as Suffix[]).map((s) => (
          <button
            key={s}
            className={`suffix-btn ${suffix === s ? 'active' : ''} ${lastKeyPressed === s ? 'pressed' : ''}`}
            onClick={() => handleSuffixToggle(s)}
          >
            {s}
            <span className="suffix-label">
              {s === 'K' ? 'thousand' : s === 'M' ? 'million' : 'billion'}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Numpad */}
      <div className="numpad">
        <div className="numpad-row">
          {['1', '2', '3'].map(key => (
            <button
              key={key}
              className={`numpad-key ${lastKeyPressed === key ? 'pressed' : ''}`}
              onClick={() => handleNumpadPress(key)}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="numpad-row">
          {['4', '5', '6'].map(key => (
            <button
              key={key}
              className={`numpad-key ${lastKeyPressed === key ? 'pressed' : ''}`}
              onClick={() => handleNumpadPress(key)}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="numpad-row">
          {['7', '8', '9'].map(key => (
            <button
              key={key}
              className={`numpad-key ${lastKeyPressed === key ? 'pressed' : ''}`}
              onClick={() => handleNumpadPress(key)}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="numpad-row">
          <button
            className={`numpad-key key-dot ${lastKeyPressed === '.' ? 'pressed' : ''}`}
            onClick={() => handleNumpadPress('.')}
          >
            .
          </button>
          <button
            className={`numpad-key ${lastKeyPressed === '0' ? 'pressed' : ''}`}
            onClick={() => handleNumpadPress('0')}
          >
            0
          </button>
          <button
            className={`numpad-key key-backspace ${lastKeyPressed === 'backspace' ? 'pressed' : ''}`}
            onClick={() => handleNumpadPress('backspace')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-row">
        <button className="action-btn skip-btn" onClick={handleSkip}>
          Skip
        </button>
        <button
          className={`action-btn submit-btn ${canSubmit ? 'active' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default QuizScreen;
