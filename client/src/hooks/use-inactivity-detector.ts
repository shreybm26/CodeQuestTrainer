import { useEffect } from 'react';

/**
 * A hook that detects user inactivity and triggers a callback after a specified timeout
 * @param timeout Timeout in milliseconds
 * @param callback Function to call when inactivity is detected
 */
export const useInactivityDetector = (
  timeout: number, 
  callback: (type: 'confused' | 'bored') => void
) => {
  useEffect(() => {
    let timer: number | null = null;
    
    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      
      timer = window.setTimeout(() => {
        // Randomly choose between 'confused' and 'bored' for this simulation
        // In a real app, you would have a more sophisticated detection method
        const emotionType = Math.random() > 0.5 ? 'confused' : 'bored';
        callback(emotionType as 'confused' | 'bored');
      }, timeout);
    };
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Set up event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Start the timer
    resetTimer();
    
    // Clean up
    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, callback]);
}; 