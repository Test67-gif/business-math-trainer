import React, { useState } from 'react';
import { QuestionType, Difficulty, SessionMode, SessionSettings } from '../types';

interface SetupScreenProps {
  onBack: () => void;
  onStart: (settings: SessionSettings) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onBack, onStart }) => {
  const [questionType, setQuestionType] = useState<QuestionType>('accurate');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<SessionMode>('timed');
  const [timeLimit, setTimeLimit] = useState<number>(120); // 2 minutes in seconds
  const [numQuestions, setNumQuestions] = useState<number>(20);

  const handleStart = () => {
    const settings: SessionSettings = {
      type: questionType,
      difficulty,
      mode,
      ...(mode === 'timed' ? { timeLimitSeconds: timeLimit } : { numQuestionsTarget: numQuestions }),
    };
    onStart(settings);
  };

  return (
    <div className="setup-screen">
      <header className="setup-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <h1>Session Setup</h1>
      </header>

      <div className="setup-content">
        {/* Question Type */}
        <section className="setup-section">
          <h2 className="section-title">Question Type</h2>
          <p className="section-description">Choose how your answers will be validated</p>
          <div className="toggle-group">
            <button
              className={`toggle-option ${questionType === 'accurate' ? 'active' : ''}`}
              onClick={() => setQuestionType('accurate')}
            >
              <div className="toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <span className="toggle-label">Accurate</span>
              <span className="toggle-desc">Exact answer required</span>
            </button>
            <button
              className={`toggle-option ${questionType === 'estimate' ? 'active' : ''}`}
              onClick={() => setQuestionType('estimate')}
            >
              <div className="toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
              </div>
              <span className="toggle-label">Estimated</span>
              <span className="toggle-desc">±10% tolerance</span>
            </button>
          </div>
        </section>

        {/* Difficulty */}
        <section className="setup-section">
          <h2 className="section-title">Difficulty</h2>
          <p className="section-description">Select your challenge level</p>
          <div className="difficulty-group">
            {(['easy', 'medium', 'tough'] as Difficulty[]).map((level) => (
              <button
                key={level}
                className={`difficulty-option ${difficulty === level ? 'active' : ''} difficulty-${level}`}
                onClick={() => setDifficulty(level)}
              >
                <span className="difficulty-name">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                <span className="difficulty-info">
                  {level === 'easy' && 'Simple numbers & percents'}
                  {level === 'medium' && 'Complex calculations'}
                  {level === 'tough' && 'Large numbers & multi-step'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Mode */}
        <section className="setup-section">
          <h2 className="section-title">Mode</h2>
          <p className="section-description">How do you want to practice?</p>
          <div className="toggle-group">
            <button
              className={`toggle-option ${mode === 'timed' ? 'active' : ''}`}
              onClick={() => setMode('timed')}
            >
              <div className="toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="toggle-label">Timed</span>
              <span className="toggle-desc">Race against the clock</span>
            </button>
            <button
              className={`toggle-option ${mode === 'practice' ? 'active' : ''}`}
              onClick={() => setMode('practice')}
            >
              <div className="toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                </svg>
              </div>
              <span className="toggle-label">Practice</span>
              <span className="toggle-desc">Take your time</span>
            </button>
          </div>
        </section>

        {/* Conditional: Time Limit or Number of Questions */}
        {mode === 'timed' ? (
          <section className="setup-section">
            <h2 className="section-title">Time Limit</h2>
            <p className="section-description">How long do you want to practice?</p>
            <div className="option-buttons">
              {[60, 120, 180, 300].map((seconds) => (
                <button
                  key={seconds}
                  className={`option-button ${timeLimit === seconds ? 'active' : ''}`}
                  onClick={() => setTimeLimit(seconds)}
                >
                  {seconds / 60} min
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="setup-section">
            <h2 className="section-title">Number of Questions</h2>
            <p className="section-description">How many questions to complete?</p>
            <div className="option-buttons">
              {[10, 20, 50, 100].map((count) => (
                <button
                  key={count}
                  className={`option-button ${numQuestions === count ? 'active' : ''}`}
                  onClick={() => setNumQuestions(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="setup-footer">
        <button className="start-session-button" onClick={handleStart}>
          <span>Start Session</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;

