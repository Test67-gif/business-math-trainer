import { useState, useCallback } from 'react';
import { Screen, SessionSettings, SessionState, AnswerRecord } from './types';
import { generateQuestion, clearRecentQuestions } from './questionGenerator';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [sessionSettings, setSessionSettings] = useState<SessionSettings | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);

  // Navigation handlers
  const handleGoToSetup = useCallback(() => {
    setCurrentScreen('setup');
  }, []);

  const handleGoToHome = useCallback(() => {
    setCurrentScreen('home');
    setSessionSettings(null);
    setSessionState(null);
  }, []);

  const handleStartSession = useCallback((settings: SessionSettings) => {
    setSessionSettings(settings);
    clearRecentQuestions(); // Ensure fresh questions for new session
    
    const now = Date.now();
    const firstQuestion = generateQuestion(settings.type, settings.difficulty);
    
    const newSession: SessionState = {
      settings,
      startedAt: now,
      endsAt: settings.mode === 'timed' ? now + settings.timeLimitSeconds! * 1000 : undefined,
      currentQuestion: firstQuestion,
      answers: [],
      questionsAnsweredCount: 0,
    };
    
    setSessionState(newSession);
    setCurrentScreen('quiz');
  }, []);

  const handleAnswer = useCallback((record: AnswerRecord) => {
    if (!sessionState || !sessionSettings) return;

    const newQuestion = generateQuestion(sessionSettings.type, sessionSettings.difficulty);
    
    setSessionState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: [...prev.answers, record],
        questionsAnsweredCount: prev.questionsAnsweredCount + 1,
        currentQuestion: newQuestion,
      };
    });
  }, [sessionState, sessionSettings]);

  const handleCompleteSession = useCallback(() => {
    setCurrentScreen('results');
  }, []);

  const handleExitSession = useCallback(() => {
    setCurrentScreen('home');
    setSessionState(null);
  }, []);

  const handleRetry = useCallback(() => {
    if (!sessionSettings) return;
    handleStartSession(sessionSettings);
  }, [sessionSettings, handleStartSession]);

  const handleChangeSettings = useCallback(() => {
    setSessionState(null);
    setCurrentScreen('setup');
  }, []);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onStart={handleGoToSetup} />;
      
      case 'setup':
        return (
          <SetupScreen
            onBack={handleGoToHome}
            onStart={handleStartSession}
          />
        );
      
      case 'quiz':
        if (!sessionState) return null;
        return (
          <QuizScreen
            session={sessionState}
            onAnswer={handleAnswer}
            onComplete={handleCompleteSession}
            onExit={handleExitSession}
          />
        );
      
      case 'results':
        if (!sessionState) return null;
        return (
          <ResultsScreen
            session={sessionState}
            onRetry={handleRetry}
            onChangeSettings={handleChangeSettings}
            onHome={handleGoToHome}
          />
        );
      
      default:
        return <HomeScreen onStart={handleGoToSetup} />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
    </div>
  );
}

export default App;

