import { useEffect, useState } from 'react';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import DailyGoals from '@/components/dashboard/DailyGoals';
import AIRecommendations from '@/components/dashboard/AIRecommendations';
import LearningPaths from '@/components/dashboard/LearningPaths';
import ChallengesList from '@/components/dashboard/ChallengesList';
import FlashcardPreview from '@/components/dashboard/FlashcardPreview';
import LeaderboardPreview from '@/components/dashboard/LeaderboardPreview';
import EmotionDetectionModal from '@/components/emotion/EmotionDetectionModal';
import WebcamEmotionTracker from '@/components/emotion/WebcamEmotionTracker';
import { useToast } from '@/hooks/use-toast';
import { apiGet } from '@/lib/queryClient';

// Type for goal from DailyGoals component
type Goal = {
  id: string;
  title: string;
  completed: number;
  total: number;
  isCompleted: boolean;
};

// Type for recommendation from AIRecommendations component
type Recommendation = {
  id: string;
  title: string;
  description: string;
  type: 'weak_area' | 'needs_practice' | 'almost_mastered';
  cta: string;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [emotionType, setEmotionType] = useState<'confused' | 'bored' | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('Process Scheduling in Operating Systems');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch goals
        const goalsData = await apiGet<Goal[]>('/api/goals');
        setGoals(goalsData);

        // Fetch recommendations
        try {
          const recommendationsData = await apiGet<Recommendation[]>('/api/recommendations?ai=true');
          setRecommendations(recommendationsData);
        } catch (error) {
          console.error('Error fetching AI recommendations:', error);
          toast({
            title: 'Unable to load AI recommendations',
            description: 'Falling back to standard recommendations',
            variant: 'destructive',
          });
          // Fallback to regular recommendations
          const fallbackData = await apiGet<Recommendation[]>('/api/recommendations');
          setRecommendations(fallbackData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle emotion detection
  const handleEmotionDetected = (emotion: 'confused' | 'bored') => {
    setEmotionType(emotion);
    setShowEmotionModal(true);
    
    // Track emotion events for analytics (in a real app)
    console.log(`Emotion detected: ${emotion}`);
  };

  // Set current topic based on active content
  useEffect(() => {
    // This would be connected to the actual content being viewed
    // For now, we'll use a fixed topic for demonstration
    const activeTopic = 'Data Structures: Trees and Graph Traversal';
    setCurrentTopic(activeTopic);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading your dashboard...</h2>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Webcam emotion tracker running in background */}
      <WebcamEmotionTracker onEmotionDetected={handleEmotionDetected} />
      
      {/* Welcome Section */}
      <WelcomeSection />
      
      {/* Daily Goals */}
      <DailyGoals goals={goals} />
      
      {/* AI Recommendations */}
      <AIRecommendations recommendations={recommendations} />
      
      {/* Learning Paths */}
      <LearningPaths />
      
      {/* Challenges & Flashcards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ChallengesList />
        </div>
        <div>
          <FlashcardPreview />
        </div>
      </div>
      
      {/* Leaderboard */}
      <LeaderboardPreview />
      
      {/* Emotion Detection Modal */}
      {showEmotionModal && (
        <EmotionDetectionModal 
          type={emotionType || 'confused'} 
          onClose={() => setShowEmotionModal(false)}
          currentTopic={currentTopic}
        />
      )}
    </div>
  );
}
