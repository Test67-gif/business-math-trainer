import React from 'react';

interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <div className="home-screen">
      <div className="home-content">
        {/* Logo */}
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle with gradient */}
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            
            {/* Main circle */}
            <circle cx="40" cy="40" r="36" fill="url(#logoGrad)" />
            
            {/* Calculator/chart lines */}
            <rect x="22" y="28" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.9)" />
            <rect x="22" y="36" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.7)" />
            <rect x="22" y="44" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
            
            {/* Percentage badge */}
            <circle cx="54" cy="28" r="10" fill="url(#accentGrad)" />
            <text x="54" y="32" textAnchor="middle" fill="#1a1a2e" fontSize="11" fontWeight="bold" fontFamily="system-ui">%</text>
            
            {/* Upward trend arrow */}
            <path d="M48 52 L56 44 L56 48 L62 48 L62 56 L56 56 L56 52 Z" fill="rgba(255,255,255,0.85)" />
          </svg>
        </div>
        
        {/* Title */}
        <h1 className="app-title">
          <span className="title-main">Mental Math</span>
          <span className="title-accent">Trainer</span>
        </h1>

        {/* Start Button */}
        <button className="start-button" onClick={onStart}>
          <span>Start Practice</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Feature Pills */}
        <div className="feature-pills">
          <div className="pill">
            <span className="pill-icon">⚡</span>
            <span>Timed</span>
          </div>
          <div className="pill">
            <span className="pill-icon">🎯</span>
            <span>Precise</span>
          </div>
          <div className="pill">
            <span className="pill-icon">📊</span>
            <span>Estimate</span>
          </div>
        </div>

        {/* Difficulty indicators */}
        <div className="difficulty-row">
          <span className="diff-dot easy"></span>
          <span className="diff-dot medium"></span>
          <span className="diff-dot tough"></span>
          <span className="diff-label">3 Difficulty Levels</span>
        </div>
      </div>

      <div className="home-footer">
        <p>Business-focused mental math practice</p>
      </div>
    </div>
  );
};

export default HomeScreen;
