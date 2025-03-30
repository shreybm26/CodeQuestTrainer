import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/context/UserContext';

type FlashcardQuestion = {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  subcategory?: string;
};

type LessonData = {
  id: string;
  title: string;
  category: string;
  description?: string;
  flashcards: FlashcardQuestion[];
  duration: string;
  nextLesson: string;
};

export default function LessonFlashcard() {
  const [_, params] = useRoute('/lessons/:lessonId');
  const lessonId = params?.lessonId || '1';
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  // State for the lesson quiz
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [score, setScore] = useState(0);
  const [incorrectCards, setIncorrectCards] = useState<FlashcardQuestion[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch the lesson data
  const { data: lesson, isLoading, error } = useQuery<LessonData>({
    queryKey: [`/api/lessons/${lessonId}`],
  });

  // Calculate current progress
  const totalCards = lesson?.flashcards.length || 1;
  const progress = (completedCards.length / totalCards) * 100;

  // Mutation for submitting lesson completion
  const submitCompletionMutation = useMutation({
    mutationFn: async (scoreData: { lessonId: string; score: number }) => {
      const response = await fetch(`/api/lessons/${scoreData.lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 1,
          score: scoreData.score,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit lesson completion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/activity'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/stats'] });
      
      toast({
        title: "Lesson completed!",
        description: `You've earned 30 XP for completing this lesson.`,
      });
    },
  });

  // Function to handle card navigation
  const handleNextCard = () => {
    // Save user's performance on this card
    const currentCard = isReviewMode 
      ? incorrectCards[currentCardIndex] 
      : lesson?.flashcards[currentCardIndex];
    
    if (currentCard && !completedCards.includes(currentCard.id)) {
      setCompletedCards([...completedCards, currentCard.id]);
      
      // If user answered incorrectly and we're not in review mode, add to review stack
      if (userAnswer !== currentCard.answer && !isReviewMode) {
        setIncorrectCards([...incorrectCards, currentCard]);
      }
      
      // Update score if answer was correct
      if (userAnswer === currentCard.answer) {
        setScore(score + 1);
      }
    }
    
    // Reset state for next card
    setShowAnswer(false);
    setUserAnswer(null);
    setDifficulty(null);
    
    const cards = isReviewMode ? incorrectCards : lesson?.flashcards;
    if (cards && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else if (isReviewMode) {
      // End of review mode
      setIsReviewMode(false);
      setCurrentCardIndex(0);
      setQuizCompleted(true);
      
      // Calculate final score and submit
      const finalScore = Math.round((score / totalCards) * 100);
      submitCompletionMutation.mutate({ lessonId, score: finalScore });
    } else if (incorrectCards.length > 0) {
      // Switch to review mode if there are incorrect cards
      setIsReviewMode(true);
      setCurrentCardIndex(0);
      toast({
        title: "Review Mode",
        description: "Let's review the cards you had difficulty with.",
      });
    } else {
      // Complete the lesson if no cards need review
      setQuizCompleted(true);
      
      // Calculate final score and submit
      const finalScore = Math.round((score / totalCards) * 100);
      submitCompletionMutation.mutate({ lessonId, score: finalScore });
    }
  };

  // Function to handle option selection for multiple choice
  const handleOptionSelect = (option: string) => {
    if (!showAnswer) {
      setUserAnswer(option);
      setShowAnswer(true);
    }
  };

  // Function to handle difficulty rating
  const handleDifficultyRating = (difficultyLevel: 'easy' | 'medium' | 'hard') => {
    setDifficulty(difficultyLevel);
  };

  // Function to restart the quiz
  const handleRestartQuiz = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setUserAnswer(null);
    setDifficulty(null);
    setScore(0);
    setIncorrectCards([]);
    setCompletedCards([]);
    setIsReviewMode(false);
    setQuizCompleted(false);
  };

  // Function to go back to lessons page
  const handleBackToLessons = () => {
    setLocation('/lessons');
  };

  // Function to continue to next lesson
  const handleNextLesson = () => {
    if (lesson?.nextLesson) {
      setLocation(`/lessons/2`); // Using a hardcoded ID for simplicity, should be dynamic in real app
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-xl font-medium">Failed to load lesson</p>
          <Button onClick={handleBackToLessons} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  // Get current card
  const currentCard = isReviewMode 
    ? incorrectCards[currentCardIndex] 
    : lesson.flashcards[currentCardIndex];
  
  // Show completion screen
  if (quizCompleted) {
    const finalScore = Math.round((score / totalCards) * 100);
    
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6 pb-8">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Lesson Completed!</h2>
              <p className="text-muted-foreground mb-6">
                You've completed {lesson.title} with a score of {finalScore}%
              </p>
              
              <div className="mb-6">
                <Progress value={finalScore} className="h-3 mb-2" />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Your score</span>
                  <span className="text-sm font-medium">{finalScore}%</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Correct answers</span>
                  </div>
                  <span className="font-medium">{score}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span>Incorrect answers</span>
                  </div>
                  <span className="font-medium">{totalCards - score}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleRestartQuiz} className="flex-1">
                  Restart Lesson
                </Button>
                <Button onClick={handleBackToLessons} variant="outline" className="flex-1">
                  Back to Lessons
                </Button>
                <Button onClick={handleNextLesson} className="flex-1">
                  Next Lesson
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={handleBackToLessons} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary">
              {isReviewMode ? 'Review Mode' : `${currentCardIndex + 1} of ${isReviewMode ? incorrectCards.length : totalCards}`}
            </Badge>
            
            <Badge variant="outline" className="px-3 py-1 bg-gray-100">
              {lesson.category}
            </Badge>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
        <Progress value={progress} className="h-2 mb-6" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex + (isReviewMode ? 'review' : 'normal')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                {/* Question card */}
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2">
                    {currentCard.subcategory || currentCard.category}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-4">{currentCard.question}</h3>
                  
                  {currentCard.options ? (
                    // Multiple choice question
                    <div className="space-y-3">
                      {currentCard.options.map((option) => (
                        <div
                          key={option}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            showAnswer 
                              ? option === currentCard.answer 
                                ? 'bg-green-50 border-green-200'
                                : userAnswer === option 
                                ? 'bg-red-50 border-red-200'
                                : 'hover:bg-gray-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleOptionSelect(option)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showAnswer && option === currentCard.answer && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {showAnswer && userAnswer === option && option !== currentCard.answer && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Open-ended flashcard
                    <div>
                      {!showAnswer ? (
                        <Button 
                          onClick={() => setShowAnswer(true)} 
                          className="w-full"
                        >
                          Show Answer
                        </Button>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium">{currentCard.answer}</p>
                          {currentCard.explanation && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-muted-foreground">{currentCard.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Self-evaluation for open-ended flashcards */}
                {showAnswer && !currentCard.options && (
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <p className="text-sm font-medium">How well did you know this?</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant={difficulty === 'hard' ? 'default' : 'outline'}
                        onClick={() => handleDifficultyRating('hard')}
                        className={difficulty === 'hard' ? 'bg-red-500 text-white' : 'text-red-500'}
                      >
                        Difficult
                      </Button>
                      <Button 
                        variant={difficulty === 'medium' ? 'default' : 'outline'}
                        onClick={() => handleDifficultyRating('medium')}
                        className={difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'text-yellow-500'}
                      >
                        Medium
                      </Button>
                      <Button 
                        variant={difficulty === 'easy' ? 'default' : 'outline'}
                        onClick={() => handleDifficultyRating('easy')}
                        className={difficulty === 'easy' ? 'bg-green-500 text-white' : 'text-green-500'}
                      >
                        Easy
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="mt-6 flex justify-end">
                  {(showAnswer || userAnswer) && (
                    <Button onClick={handleNextCard}>
                      {currentCardIndex === (isReviewMode ? incorrectCards.length - 1 : totalCards - 1) 
                        ? isReviewMode ? 'Finish Review' : 'Complete Lesson' 
                        : 'Next'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 