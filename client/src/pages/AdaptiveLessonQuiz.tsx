import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { useAdaptiveQuiz } from '@/utils/AdaptiveQuizEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AdaptiveSummaryCard } from '@/components/AdaptiveSummaryCard';
import testSubjectIsolation from '@/utils/testSubjectIsolation';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Info,
  Brain,
  Award,
  ChevronRight,
  ListChecks
} from 'lucide-react';

type LessonData = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  nextLesson: string;
};

export default function AdaptiveLessonQuiz() {
  const { lessonId } = useParams();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // UI states
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [showMasteryDetails, setShowMasteryDetails] = useState(false);

  // Fetch the lesson data
  const { data: lesson, isLoading, error } = useQuery<LessonData>({
    queryKey: [`/api/lessons/${lessonId}`],
  });

  // Initialize adaptive quiz engine with the lesson's subject ID
  const {
    currentQuestion,
    progress,
    totalQuestions,
    answeredQuestions,
    recordAnswer,
    moveToNextQuestion,
    isComplete,
    overallMastery,
    weakAreas,
    metrics
  } = useAdaptiveQuiz(lessonId || '1');

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
    },
  });

  // Handle completion when quiz is complete
  useEffect(() => {
    if (isComplete && lesson) {
      submitCompletionMutation.mutate({ 
        lessonId: lesson.id, 
        score: overallMastery 
      });
    }
  }, [isComplete, lesson]);

  // Run subject isolation test in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Run the test when the component mounts
      console.log('Running subject isolation test in development mode...');
      testSubjectIsolation();
    }
  }, []); // Only run once on mount

  // Function to handle user selecting an option (for multiple choice)
  const handleOptionSelect = (option: string) => {
    if (!showAnswer && currentQuestion) {
      setUserAnswer(option);
      setShowAnswer(true);
      
      // Record answer correctness
      const isCorrect = option === currentQuestion.answer;
      recordAnswer(currentQuestion.id, isCorrect);
    }
  };

  // Function to handle self-evaluation (for flashcards)
  const handleSelfEvaluation = (assessment: 'easy' | 'medium' | 'hard') => {
    if (currentQuestion) {
      setDifficulty(assessment);
      
      // Map self-assessment to correctness
      // 'easy' = fully correct, 'medium' = partially correct, 'hard' = incorrect
      const correctnessMapping = {
        easy: true,
        medium: false,
        hard: false
      };
      
      recordAnswer(currentQuestion.id, correctnessMapping[assessment]);
    }
  };

  // Function to move to the next question
  const handleNextQuestion = () => {
    setShowAnswer(false);
    setUserAnswer(null);
    setDifficulty(null);
    moveToNextQuestion();
  };

  // Function to restart the quiz
  const handleRestartQuiz = () => {
    window.location.reload();
  };

  // Function to go back to lessons page
  const handleBackToLessons = () => {
    setLocation('/lessons');
  };

  // Function to continue to next lesson
  const handleNextLesson = () => {
    if (lesson?.nextLesson) {
      // Extract next lesson ID from the nextLesson string
      const nextLessonId = Number(lessonId) + 1;
      setLocation(`/lessons/${nextLessonId}/adaptive`);
    }
  };

  // Show loading state
  if (isLoading || !lesson) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
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

  // Show completion screen
  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6 pb-8">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Lesson Mastered!</h2>
              <p className="mb-6">
                You've completed {lesson.title} with an overall mastery level of {overallMastery}%
              </p>
              
              <AdaptiveSummaryCard
                metrics={metrics}
                overallMastery={overallMastery}
                answeredQuestions={answeredQuestions}
                totalQuestions={totalQuestions}
                showDetails={showMasteryDetails}
              />
              
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMasteryDetails(!showMasteryDetails)}
                >
                  {showMasteryDetails ? 'Hide Details' : 'Show Mastery Details'}
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRestartQuiz} variant="outline">
                  <ListChecks className="w-4 h-4 mr-2" />
                  Restart Lesson
                </Button>
                <Button onClick={handleBackToLessons} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lessons
                </Button>
                {lesson.nextLesson && (
                  <Button onClick={handleNextLesson}>
                    Next Lesson
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={handleBackToLessons}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="flex items-center gap-1.5">
            <Brain className="w-4 h-4" />
            Adaptive Mode
          </Badge>
          <Badge variant="outline" className="bg-primary/5">
            {lesson.category}
          </Badge>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {currentQuestion ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="mb-8">
                  <div className="flex justify-between mb-4">
                    <Badge variant="outline">{currentQuestion.subcategory}</Badge>
                    <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
                  
                  {/* Multiple choice */}
                  {currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          className={`w-full text-left p-4 rounded-lg border ${
                            showAnswer
                              ? option === currentQuestion.answer
                                ? 'bg-green-50 border-green-300'
                                : option === userAnswer
                                  ? 'bg-red-50 border-red-300'
                                  : 'border-transparent'
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => handleOptionSelect(option)}
                          disabled={showAnswer}
                        >
                          <div className="flex items-start">
                            {showAnswer && option === currentQuestion.answer && (
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            )}
                            {showAnswer && option === userAnswer && option !== currentQuestion.answer && (
                              <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            )}
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Flashcard (no options) */}
                  {!currentQuestion.options && (
                    <div>
                      {showAnswer ? (
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-medium mb-4">{currentQuestion.answer}</p>
                          {currentQuestion.explanation && (
                            <div className="text-muted-foreground text-sm mt-2">
                              <strong>Explanation:</strong> {currentQuestion.explanation}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <Button onClick={() => setShowAnswer(true)} size="lg">
                            Show Answer
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Self-assessment for flashcards */}
                {showAnswer && !currentQuestion.options && (
                  <div className="mb-6">
                    <p className="text-center font-medium mb-3">How well did you know this?</p>
                    <div className="flex justify-center space-x-3">
                      <Button 
                        variant={difficulty === 'easy' ? 'default' : 'outline'} 
                        onClick={() => handleSelfEvaluation('easy')}
                        className={difficulty === 'easy' ? '' : 'border-green-200 text-green-700 hover:bg-green-50'}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        I knew it
                      </Button>
                      <Button 
                        variant={difficulty === 'medium' ? 'default' : 'outline'} 
                        onClick={() => handleSelfEvaluation('medium')}
                        className={difficulty === 'medium' ? '' : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Partially knew it
                      </Button>
                      <Button 
                        variant={difficulty === 'hard' ? 'default' : 'outline'} 
                        onClick={() => handleSelfEvaluation('hard')}
                        className={difficulty === 'hard' ? '' : 'border-red-200 text-red-700 hover:bg-red-50'}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Didn't know it
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Next button */}
                {(showAnswer || userAnswer) && (
                  <div className="flex justify-center">
                    <Button onClick={handleNextQuestion} size="lg">
                      Next Question
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading questions for {lesson.title}...</p>
              </div>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          {/* Progress Summary */}
          <AdaptiveSummaryCard
            metrics={metrics}
            overallMastery={overallMastery}
            answeredQuestions={answeredQuestions}
            totalQuestions={totalQuestions}
            showDetails={true}
          />
          
          {/* Subject Info */}
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">{lesson.category} Focus</h3>
                  <p className="text-sm text-muted-foreground">
                    This quiz features questions specific to {lesson.category} concepts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Weak areas info */}
          {weakAreas.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Areas needing more practice</h3>
                    <p className="text-sm text-muted-foreground">
                      {weakAreas.join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 