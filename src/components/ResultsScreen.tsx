import React, { useState } from 'react';
import { SessionState, AnswerRecord } from '../types';

interface ResultsScreenProps {
  session: SessionState;
  onRetry: () => void;
  onChangeSettings: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  session,
  onRetry,
  onChangeSettings,
  onHome,
}) => {
  const [showIncorrect, setShowIncorrect] = useState(true);

  const totalQuestions = session.answers.length;
  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = session.answers.filter((a) => !a.isCorrect);
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const getPerformanceMessage = (): { title: string; message: string; emoji: string } => {
    if (accuracy >= 95) {
      return {
        title: 'Outstanding!',
        message: 'This level of accuracy will make you shine in any meeting.',
        emoji: '🌟',
      };
    } else if (accuracy >= 85) {
      return {
        title: 'Great work!',
        message: 'Solid performance that would feel confident in most meetings.',
        emoji: '💪',
      };
    } else if (accuracy >= 70) {
      return {
        title: 'Good effort!',
        message: 'Keep practicing to build more confidence in high-stakes discussions.',
        emoji: '📈',
      };
    } else if (accuracy >= 50) {
      return {
        title: 'Keep going!',
        message: 'More practice will help—aim for 85%+ for confident meeting math.',
        emoji: '🎯',
      };
    } else {
      return {
        title: 'Room to grow',
        message: 'Try an easier difficulty or slower pace to build your foundation.',
        emoji: '📚',
      };
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const formatUserAnswer = (record: AnswerRecord): string => {
    if (record.userAnswer === null) return 'Skipped';
    return formatNumber(record.userAnswer);
  };

  const performance = getPerformanceMessage();

  return (
    <div className="results-screen">
      <div className="results-content">
        {/* Performance Header */}
        <div className="performance-header">
          <span className="performance-emoji">{performance.emoji}</span>
          <h1 className="performance-title">{performance.title}</h1>
          <p className="performance-message">{performance.message}</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <span className="stat-value">{accuracy.toFixed(1)}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{correctCount}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalQuestions - correctCount}</span>
            <span className="stat-label">Incorrect</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalQuestions}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        {/* Session Info */}
        <div className="session-info">
          <div className="info-row">
            <span className="info-label">Mode</span>
            <span className="info-value">{session.settings.mode === 'timed' ? 'Timed' : 'Practice'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Type</span>
            <span className="info-value">{session.settings.type === 'accurate' ? 'Accurate' : 'Estimated (±10%)'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Difficulty</span>
            <span className={`info-value difficulty-${session.settings.difficulty}`}>
              {session.settings.difficulty.charAt(0).toUpperCase() + session.settings.difficulty.slice(1)}
            </span>
          </div>
          {session.settings.mode === 'timed' && (
            <div className="info-row">
              <span className="info-label">Time</span>
              <span className="info-value">{session.settings.timeLimitSeconds! / 60} min</span>
            </div>
          )}
        </div>

        {/* Incorrect Answers */}
        {incorrectAnswers.length > 0 && (
          <div className="incorrect-section">
            <button
              className="section-toggle"
              onClick={() => setShowIncorrect(!showIncorrect)}
            >
              <span>Incorrect Answers ({incorrectAnswers.length})</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={showIncorrect ? 'rotated' : ''}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showIncorrect && (
              <div className="incorrect-list">
                {incorrectAnswers.map((record, index) => (
                  <div key={index} className="incorrect-item">
                    <div className="incorrect-question">
                      {record.question.prompt}
                    </div>
                    <div className="incorrect-answers">
                      <div className="answer-row">
                        <span className="answer-label">Your answer:</span>
                        <span className="answer-value wrong">
                          {formatUserAnswer(record)}
                        </span>
                      </div>
                      <div className="answer-row">
                        <span className="answer-label">Correct:</span>
                        <span className="answer-value correct">
                          {formatNumber(record.question.correctAnswer)}
                        </span>
                      </div>
                      {record.question.type === 'estimate' && record.errorPercent !== undefined && (
                        <div className="answer-row">
                          <span className="answer-label">Your error:</span>
                          <span className="answer-value error">
                            {record.errorPercent.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {incorrectAnswers.length === 0 && (
          <div className="perfect-score">
            <span className="perfect-icon">🎉</span>
            <span className="perfect-text">Perfect score! No mistakes!</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="action-button primary" onClick={onRetry}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
          <span>Retry</span>
        </button>
        <button className="action-button secondary" onClick={onChangeSettings}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          <span>Settings</span>
        </button>
        <button className="action-button tertiary" onClick={onHome}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <span>Home</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;

