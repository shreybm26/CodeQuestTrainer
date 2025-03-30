import { useEffect, useRef, useState } from 'react';
import { detectEmotion } from '@/lib/emotionDetection';

type WebcamEmotionTrackerProps = {
  onEmotionDetected: (emotion: 'confused' | 'bored') => void;
};

export default function WebcamEmotionTracker({ onEmotionDetected }: WebcamEmotionTrackerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const emotionCheckIntervalRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);
  
  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        // Ask for user permission to access the webcam
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 320, 
            height: 240,
            facingMode: 'user',
            frameRate: { ideal: 15 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsWebcamActive(true);
          };
        }
      } catch (err) {
        console.log('Error accessing webcam:', err);
        // We won't show an error to the user as emotion detection is a supplementary feature
        setIsWebcamActive(false);
      }
    };

    initWebcam();

    // Cleanup function to stop webcam when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      if (emotionCheckIntervalRef.current) {
        window.clearInterval(emotionCheckIntervalRef.current);
      }
    };
  }, []);

  // Set up emotion detection interval when webcam is active
  useEffect(() => {
    if (isWebcamActive && videoRef.current) {
      // Run emotion detection more frequently (every 2 seconds)
      // Our detection logic in emotionDetection.ts handles throttling internally
      emotionCheckIntervalRef.current = window.setInterval(async () => {
        if (videoRef.current) {
          try {
            // Process emotion from video frame
            const emotion = await detectEmotion(videoRef.current);
            
            // If an emotion is detected, notify the parent component
            if (emotion) {
              console.log(`Emotion detected by tracker: ${emotion}`);
              onEmotionDetected(emotion);
              // Store the timestamp of the last successful detection
              lastDetectionRef.current = Date.now();
            }
          } catch (error) {
            console.error('Error in emotion detection:', error);
          }
        }
      }, 2000); // Check every 2 seconds for more responsive detection
    }

    return () => {
      if (emotionCheckIntervalRef.current) {
        window.clearInterval(emotionCheckIntervalRef.current);
        emotionCheckIntervalRef.current = null;
      }
    };
  }, [isWebcamActive, onEmotionDetected]);

  return (
    <div style={{ position: 'absolute', left: '-9999px', pointerEvents: 'none' }}>
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        width="320"
        height="240"
      />
    </div>
  );
}
