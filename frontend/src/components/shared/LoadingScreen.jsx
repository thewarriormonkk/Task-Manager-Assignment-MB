import { useEffect, useState } from 'react';

const LoadingScreen = ({ message = "Loading your dashboard", onComplete }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate dots
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // Simulate loading time and then call onComplete
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2500); // 2.5 seconds loading time

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          {message}{dots}
        </div>
        <div className="loading-subtext">
          Please wait while we prepare everything for you
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
