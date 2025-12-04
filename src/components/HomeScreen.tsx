import React from 'react';

interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="40" height="40" rx="8" fill="url(#gradient1)" />
              <path d="M14 18h20M14 24h20M14 30h20" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="34" cy="14" r="6" fill="#4ade80" />
              <text x="34" y="17" textAnchor="middle" fill="#0a0a0f" fontSize="8" fontWeight="bold">%</text>
              <defs>
                <linearGradient id="gradient1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <h1 className="app-title">
          Business Mental
          <span className="title-highlight">Math Trainer</span>
        </h1>
        
        <p className="app-tagline">
          Sharpen your meeting math: fast, accurate, business-focused.
        </p>

        <button className="start-button" onClick={onStart}>
          <span>Start Training</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon accurate-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="feature-text">
              <span className="feature-title">Accurate</span>
              <span className="feature-desc">Exact answers</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon estimate-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="feature-text">
              <span className="feature-title">Estimated</span>
              <span className="feature-desc">±10% tolerance</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon timed-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="feature-text">
              <span className="feature-title">Timed</span>
              <span className="feature-desc">Race the clock</span>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon practice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div className="feature-text">
              <span className="feature-title">Practice</span>
              <span className="feature-desc">No time limit</span>
            </div>
          </div>
        </div>

        <div className="difficulty-preview">
          <span className="difficulty-label">Difficulty Levels:</span>
          <div className="difficulty-badges">
            <span className="badge badge-easy">Easy</span>
            <span className="badge badge-medium">Medium</span>
            <span className="badge badge-tough">Tough</span>
          </div>
        </div>
      </div>

      <div className="home-footer">
        <p>No signup required • 100% free • Works offline</p>
      </div>
    </div>
  );
};

export default HomeScreen;

