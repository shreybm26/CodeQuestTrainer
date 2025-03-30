import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Award, 
  Code, 
  User, 
  Brain,
  ChevronLeft,
  Timer,
  AlertCircle 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiPost } from '@/lib/queryClient';
import WebcamEmotionTracker from '@/components/emotion/WebcamEmotionTracker';
import EmotionDetectionModal from '@/components/emotion/EmotionDetectionModal';
import { useUser } from '@/context/UserContext';
import CodeEditor from '@/components/CodeEditor';
import { codeExecutionService, type TestResult, type CodeProblem, type TestCase } from '@/lib/codeExecutionService';
import ProblemLayout from '@/components/ProblemLayout';
import { CodingQuestion } from '@/components/CodeEditor';

// Create a basic inactivity detector hook if it's missing
const useInactivityDetector = (
  timeout: number, 
  callback: (type: 'confused' | 'bored') => void
) => {
  useEffect(() => {
    let timer: number | null = null;
    
    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      
      timer = window.setTimeout(() => {
        callback('bored');
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

// For technical interview questions
interface TechnicalQuestion {
  question: string;
  hints: string[];
  explanation: string;
}

// Challenge interface
interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: string;
  type: 'timed' | 'code' | 'interview';
  timeLimit?: number;
  content: {
    topics: string[];
    questions?: {
      id?: string;
      question?: string;
      title?: string;
      description?: string;
      difficulty?: string;
      starterCode?: string;
      options?: string[];
      examples?: {
        input: string;
        output: string;
        explanation?: string;
      }[];
    }[];
  };
  gradientFrom?: string;
  gradientTo?: string;
  border?: string;
  icon?: string;
  iconColor?: string;
  buttonColor?: string;
}

// Analysis result interface
interface AnalysisResult {
  correctness: number;
  feedback: string;
  improvementTips?: string[];
  // New fields for enhanced feedback
  earnedXP?: number;
  maxPossibleXP?: number;
  performance?: string;
  feedbackMessage?: string;
}

export default function ChallengeDetail() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const challengeId = params.id;
  const { user, updateUser } = useUser();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [shownHints, setShownHints] = useState(0);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [emotionType, setEmotionType] = useState<'confused' | 'bored'>('confused');
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  
  // Get challenge details
  const { data: challenge, isLoading, error } = useQuery<Challenge>({
    queryKey: [`/api/challenges/${challengeId}`],
  });
  
  // Get current question if it's an interview challenge
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewQuestion, setInterviewQuestion] = useState<TechnicalQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const handleStartChallenge = async () => {
    setIsStarted(true);
    
    // If it's an interview challenge, load the first question
    if (challenge?.type === 'interview') {
      await fetchInterviewQuestion();
    }
    
    // Start the timer for timed challenges
    if (challenge?.type === 'timed') {
      const interval = setInterval(() => {
        setRemainingTime(time => {
          if (time <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
      
      // Cleanup timer on unmount
      return () => clearInterval(interval);
    }
  };
  
  const fetchInterviewQuestion = async () => {
    try {
      setIsLoadingQuestion(true);
      if (!challenge || !challenge.content || !challenge.content.topics) {
        throw new Error("Challenge data is not available");
      }
      const topic = challenge.content.topics[currentQuestionIndex];
      const response = await apiPost<TechnicalQuestion>('/api/ai/interview-question', { topic });
      setInterviewQuestion(response);
    } catch (error) {
      console.error('Error fetching interview question:', error);
    } finally {
      setIsLoadingQuestion(false);
    }
  };
  
  const handleSubmitAnswer = async () => {
    if (!interviewQuestion || !userAnswer || !challenge || !challenge.content || !challenge.content.topics) return;
    
    try {
      const response = await apiPost('/api/ai/analyze-answer', {
        question: interviewQuestion.question,
        answer: userAnswer
      });
      
      // Ensure response has at least empty arrays for required fields
      const safeResponse = {
        ...response,
        improvementTips: response.improvementTips || []
      };
      
      setAnalysisResult(safeResponse);
      
      // After reviewing, if there are more questions, prepare for the next one
      if (currentQuestionIndex < challenge.content.topics.length - 1) {
        setSelectedTab('analysis');
      } else {
        setIsCompleted(true);
        // Submit challenge completion
        try {
          const result = await apiPost<{ 
            success: boolean, 
            xp?: number, 
            earnedXP?: number, 
            score?: number, 
            performance?: string,
            feedbackMessage?: string,
            maxPossibleXP?: number
          }>(`/api/challenges/${challengeId}/submit`, {
            userId: 1, // In a real app this would be the actual user ID
            score: response.correctness // Use the score from the analysis
          });
          
          console.log("Challenge completion result:", result);
          
          // Add the additional feedback to the analysis result
          setAnalysisResult(prevAnalysis => {
            if (!prevAnalysis) return prevAnalysis;
            
            return {
              ...prevAnalysis,
              earnedXP: result.earnedXP || 0,
              maxPossibleXP: result.maxPossibleXP || 0,
              performance: result.performance || '',
              feedbackMessage: result.feedbackMessage || ''
            };
          });
          
          // Update user XP in context if available
          if (result.xp !== undefined && updateUser) {
            updateUser({ xp: result.xp });
            console.log("Updated user XP to:", result.xp);
          }
        } catch (error) {
          console.error("Error submitting challenge:", error);
        }
      }
    } catch (error) {
      console.error('Error analyzing answer:', error);
    }
  };
  
  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setAnalysisResult(null);
    setShownHints(0);
    setSelectedTab('question');
    fetchInterviewQuestion();
  };
  
  const handleTimeUp = async () => {
    setIsCompleted(true);
    // Submit challenge with the score if time runs out
    // For timed out challenges, use a base score of 0 or the current progress
    // This way user still gets some XP if they answered some questions
    const timeoutScore = currentQuestionIndex > 0 && challenge?.content?.questions 
      ? Math.floor((currentQuestionIndex / challenge.content.questions.length) * 100) 
      : 0;
      
    try {
      const result = await apiPost<{ 
        success: boolean, 
        xp?: number, 
        earnedXP?: number, 
        score?: number, 
        performance?: string,
        feedbackMessage?: string,
        maxPossibleXP?: number
      }>(`/api/challenges/${challengeId}/submit`, {
        userId: 1, // In a real app this would be the actual user ID
        score: timeoutScore
      });
      
      console.log("Challenge timeout result:", result);
      
      // Set analysis result with feedback
      setAnalysisResult({
        correctness: timeoutScore,
        feedback: 'Time\'s up! Your score is based on the questions you managed to answer.',
        improvementTips: ['Try to manage your time better on timed tests.', 'Focus on answering questions quickly but accurately.'],
        earnedXP: result.earnedXP || 0,
        maxPossibleXP: result.maxPossibleXP || 0,
        performance: result.performance || '',
        feedbackMessage: result.feedbackMessage || ''
      });
      
      // Update user XP in context if available
      if (result.xp !== undefined && updateUser) {
        updateUser({ xp: result.xp });
        console.log("Updated user XP to:", result.xp);
      }
    } catch (error) {
      console.error("Error submitting challenge timeout:", error);
      
      // Even if submission fails, show some feedback to the user
      setAnalysisResult({
        correctness: timeoutScore,
        feedback: 'Time\'s up! There was an error submitting your results, but here\'s some feedback.',
        improvementTips: ['Try to manage your time better on timed tests.', 'Focus on answering questions quickly but accurately.']
      });
    }
  };
  
  const showNextHint = () => {
    if (interviewQuestion && shownHints < interviewQuestion.hints.length) {
      setShownHints(prev => prev + 1);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle emotion detection
  const handleEmotionDetected = (emotion: 'confused' | 'bored') => {
    setEmotionType(emotion);
    setShowEmotionModal(true);
    
    // Track emotion events for analytics (in a real app)
    console.log(`Challenge: Emotion detected: ${emotion}`);
  };
  
  // Use the inactivity detector (set to 30 seconds for testing)
  const testTimeout = 30 * 1000; // 30 seconds for testing
  const productionTimeout = 5 * 60 * 1000; // 5 minutes in production
  useInactivityDetector(testTimeout, handleEmotionDetected);
  
  const handleCodeChange = (code: string) => {
    setUserCode(code);
  };
  
  const handleRunTests = async (code: string) => {
    if (!challenge || !challenge.content || !challenge.content.questions) return;
    
    setIsRunningTests(true);
    try {
      // Convert the current question to a CodeProblem
      const currentProblem = challenge.content.questions[currentQuestionIndex];
      
      if (!currentProblem) {
        console.error('No current problem found');
        return;
      }
      
      const codeProblem: CodeProblem = {
        id: currentProblem.id,
        title: currentProblem.title || 'Coding Problem',
        description: currentProblem.description,
        examples: convertToTestCases(currentProblem.examples),
        testCases: convertToTestCases(currentProblem.examples) // In a real app, we'd have separate test cases
      };
      
      // Run the tests
      const results = await codeExecutionService.runTests(code, selectedLanguage, codeProblem);
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  // Helper function to convert example data to TestCase type
  const convertToTestCases = (examples?: any[]): TestCase[] => {
    if (!examples || !Array.isArray(examples)) return [];
    
    return examples.map(example => ({
      input: example.input || '',
      output: example.output || '',
      explanation: example.explanation
    }));
  };
  
  const handleSubmitCode = async (code: string) => {
    if (!challenge || !challenge.content || !challenge.content.questions) return;
    
    setIsSubmitting(true);
    try {
      // Convert the current question to a CodeProblem
      const currentProblem = challenge.content.questions[currentQuestionIndex];
      
      if (!currentProblem) {
        console.error('No current problem found');
        return;
      }
      
      const codeProblem: CodeProblem = {
        id: currentProblem.id,
        title: currentProblem.title || 'Coding Problem',
        description: currentProblem.description,
        examples: convertToTestCases(currentProblem.examples),
        testCases: convertToTestCases(currentProblem.examples)
      };
      
      // Submit the solution
      const result = await codeExecutionService.submitSolution(code, selectedLanguage, codeProblem);
      setTestResults(result.results);
      
      // If this is the last question or the user passed all tests, proceed to the next question
      if (result.success || currentQuestionIndex >= (challenge.content.questions.length - 1)) {
        // If this is the last question and it was successful, complete the challenge
        if (currentQuestionIndex >= (challenge.content.questions.length - 1)) {
          await handleTimeUp();
        } else {
          // Move to the next question
          setCurrentQuestionIndex(prev => prev + 1);
          setUserCode('');
          setTestResults([]);
        }
      }
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Keyboard navigation for coding challenges
  useEffect(() => {
    // Only add keyboard listeners when we're in a coding challenge
    if (!isStarted || isCompleted || challenge?.type !== 'code') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Left arrow key - previous problem
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0 && !isSubmitting) {
        setCurrentQuestionIndex(prev => prev - 1);
        setUserCode('');
        setTestResults([]);
      }
      
      // Right arrow key - next problem
      if (e.key === 'ArrowRight' && 
          challenge?.content?.questions && 
          currentQuestionIndex < challenge.content.questions.length - 1 && 
          !isSubmitting) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserCode('');
        setTestResults([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStarted, isCompleted, challenge, currentQuestionIndex, isSubmitting]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error || !challenge) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Challenge Not Found</h2>
          <p className="text-muted-foreground mb-4">The challenge you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => setLocation('/challenges')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Challenges
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Webcam emotion tracker running in background */}
      <WebcamEmotionTracker onEmotionDetected={handleEmotionDetected} />
      
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => setLocation('/challenges')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Challenges
      </Button>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-textDark mb-2">{challenge.title}</h1>
          <p className="text-muted-foreground">{challenge.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${
            challenge.type === 'timed' ? 'bg-red-500' : 
            challenge.type === 'code' ? 'bg-primary' : 'bg-blue-500'
          } px-3 py-1`}>
            {challenge.xp} XP
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {challenge.difficulty}
          </Badge>
        </div>
      </div>
      
      {!isStarted ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                challenge.type === 'timed' ? 'bg-red-100 text-red-500' : 
                challenge.type === 'code' ? 'bg-green-100 text-primary' : 'bg-blue-100 text-blue-500'
              }`}>
                {challenge.type === 'timed' && <Timer className="w-8 h-8" />}
                {challenge.type === 'code' && <Code className="w-8 h-8" />}
                {challenge.type === 'interview' && <User className="w-8 h-8" />}
              </div>
              
              <h2 className="text-xl font-bold mb-2">Ready to begin?</h2>
              <p className="text-muted-foreground text-center max-w-lg mb-6">
                {challenge.type === 'timed' && 'You will have 5 minutes to answer 10 multiple choice questions. The timer will start as soon as you begin.'}
                {challenge.type === 'code' && 'You will need to solve 3 coding challenges before the time runs out. The difficulty will increase with each problem.'}
                {challenge.type === 'interview' && `You will participate in a mock technical interview covering topics in ${challenge.content.topics.join(', ')}. An AI will analyze your responses.`}
              </p>
              
              <Button 
                className={`w-40 ${
                  challenge.type === 'timed' ? 'bg-red-500 hover:bg-red-600' : 
                  challenge.type === 'code' ? 'bg-primary hover:bg-primary/90' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                onClick={handleStartChallenge}
              >
                Start Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isCompleted ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-4">
                <Award className="w-8 h-8" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">Challenge Completed!</h2>
              
              {/* Performance Badge */}
              {analysisResult && analysisResult.performance && (
                <div className={`mb-4 ${
                  analysisResult.performance === 'Excellent' ? 'bg-green-500' :
                  analysisResult.performance === 'Good' ? 'bg-blue-500' :
                  analysisResult.performance === 'Average' ? 'bg-yellow-500' :
                  'bg-red-500'
                } text-white px-4 py-1 rounded-full`}>
                  {analysisResult.performance}
                </div>
              )}
              
              <p className="text-muted-foreground text-center max-w-lg mb-4">
                {analysisResult ? 
                  `You received a score of ${analysisResult.correctness}%. ${analysisResult.feedbackMessage || analysisResult.feedback}` : 
                  'You have completed this challenge. Your results have been recorded.'}
              </p>
              
              {/* XP Display */}
              {analysisResult && typeof analysisResult.earnedXP === 'number' && typeof analysisResult.maxPossibleXP === 'number' && (
                <div className="w-full max-w-lg mb-6 bg-primary/10 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    XP Earned
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{analysisResult.earnedXP} XP</span>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((analysisResult.earnedXP / analysisResult.maxPossibleXP) * 100)}% of possible {analysisResult.maxPossibleXP} XP
                      </span>
                      <Progress 
                        value={(analysisResult.earnedXP / analysisResult.maxPossibleXP) * 100} 
                        className="h-2 mt-1 w-40"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {analysisResult && analysisResult.improvementTips && analysisResult.improvementTips.length > 0 && (
                <div className="w-full max-w-lg mb-6">
                  <h3 className="font-semibold mb-2">Areas for improvement:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.improvementTips.map((tip: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/challenges')}
                >
                  Back to Challenges
                </Button>
                <Button
                  onClick={() => {
                    setIsStarted(false);
                    setIsCompleted(false);
                    setUserAnswer('');
                    setAnalysisResult(null);
                    setCurrentQuestionIndex(0);
                    setRemainingTime(300);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : challenge.type === 'interview' ? (
        <div className="space-y-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="question">Question</TabsTrigger>
              {analysisResult && <TabsTrigger value="analysis">Analysis</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Interview Format</h3>
                      <p className="text-muted-foreground">
                        This mock interview will cover technical topics in {challenge.content.topics.join(', ')}. 
                        You'll be given questions one at a time, and your answers will be analyzed.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Tips for Success</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Explain your thought process clearly</li>
                        <li>Consider different approaches before settling on a solution</li>
                        <li>Discuss time and space complexity</li>
                        <li>Use hints only if you're stuck</li>
                      </ul>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => setSelectedTab('question')}>
                        Go to Current Question
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="question">
              <Card>
                <CardContent className="pt-6">
                  {isLoadingQuestion ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : interviewQuestion ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Question {currentQuestionIndex + 1} of {challenge.content.topics.length}
                        </h3>
                        <p className="text-textDark">{interviewQuestion.question}</p>
                      </div>
                      
                      {shownHints > 0 && (
                        <div className="bg-primary/10 p-4 rounded-md">
                          <h4 className="font-semibold mb-2">Hints:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {interviewQuestion.hints.slice(0, shownHints).map((hint, index) => (
                              <li key={index}>{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-2">Your Answer:</h4>
                        <textarea
                          className="w-full min-h-32 p-3 border rounded-md"
                          placeholder="Type your answer here..."
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        {shownHints < interviewQuestion.hints.length ? (
                          <Button variant="outline" onClick={showNextHint}>
                            Show Hint ({shownHints + 1}/{interviewQuestion.hints.length})
                          </Button>
                        ) : (
                          <Button variant="outline" disabled>
                            All Hints Shown
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={userAnswer.trim().length < 10}
                        >
                          Submit Answer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-12">
                      <p>Failed to load interview question. Please try again.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {analysisResult && (
              <TabsContent value="analysis">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Analysis of Your Answer</h3>
                        <div className="flex items-center mb-4">
                          <div className="mr-4">
                            <span className="text-sm font-medium">Score:</span>
                            <span className="ml-2 text-lg font-bold">{analysisResult.correctness}%</span>
                          </div>
                          <Progress
                            value={analysisResult.correctness}
                            className="h-2 flex-1"
                          />
                        </div>
                        <p className="text-textDark">{analysisResult.feedback}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Improvement Tips:</h4>
                        {analysisResult && analysisResult.improvementTips && analysisResult.improvementTips.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {analysisResult.improvementTips.map((tip: string, index: number) => (
                              <li key={index}>{tip}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No specific improvement tips available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Explanation:</h4>
                        <div className="bg-neutral p-4 rounded-md">
                          <p>{interviewQuestion?.explanation}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        {currentQuestionIndex < challenge.content.topics.length - 1 ? (
                          <Button onClick={handleNextQuestion}>
                            Next Question
                          </Button>
                        ) : (
                          <Button onClick={() => setIsCompleted(true)}>
                            Complete Challenge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      ) : challenge.type === 'timed' ? (
        // For timed quiz challenges
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">
                Answer all questions before time runs out
              </h3>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-red-500" />
                <span className="font-mono font-bold">{formatTime(remainingTime)}</span>
              </div>
            </div>
            
            {challenge.content && challenge.content.questions && challenge.content.questions.length > 0 ? (
              <div className="space-y-8">
                {/* Sample question display - in a full implementation you would paginate through all questions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="font-semibold text-lg mb-4">
                    Question {currentQuestionIndex + 1} of {challenge.content?.questions?.length || 0}
                  </h4>
                  <p className="mb-4">{challenge.content.questions[currentQuestionIndex].question}</p>
                  
                  <div className="space-y-3">
                    {challenge.content?.questions?.[currentQuestionIndex]?.options?.map((option: string, index: number) => (
                      <div 
                        key={index}
                        className="p-3 border rounded-md hover:bg-primary/10 cursor-pointer transition-colors"
                        onClick={() => {
                          // In a real app, would track the user's answer
                          if (challenge.content?.questions && currentQuestionIndex < challenge.content.questions.length - 1) {
                            setCurrentQuestionIndex(prev => prev + 1);
                          } else {
                            handleTimeUp();
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-medium">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" onClick={handleTimeUp}>
                    Skip to End
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-neutral">
                <p className="text-center text-muted-foreground">No questions available for this challenge.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // For coding challenges
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              Speed Code Sprint Challenge
            </h3>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <span className="font-mono font-bold">{formatTime(remainingTime)}</span>
            </div>
          </div>
          
          {challenge.content && challenge.content.questions && challenge.content.questions.length > 0 ? (
            <div>
              {/* Convert the current question to a CodingQuestion format */}
              {(() => {
                const currentProblem = challenge.content.questions[currentQuestionIndex];
                if (!currentProblem) return null;
                
                const codingQuestion: CodingQuestion = {
                  id: currentProblem.id || `problem-${currentQuestionIndex}`,
                  title: currentProblem.title || 'Coding Problem',
                  description: currentProblem.description || 'Solve this coding problem.',
                  examples: (currentProblem.examples || []).map(example => ({
                    input: example.input,
                    output: example.output,
                    explanation: example.explanation
                  })),
                  difficulty: currentProblem.difficulty || 'Medium',
                  starterCode: currentProblem.starterCode || '// Write your solution here'
                };
                
                const handleProblemSubmit = async (code: string, language: string) => {
                  // Convert back to the existing handleSubmitCode function
                  setUserCode(code);
                  await handleSubmitCode(code);
                };
                
                return (
                  <ProblemLayout 
                    question={codingQuestion} 
                    onSubmit={handleProblemSubmit}
                    currentIndex={currentQuestionIndex}
                    totalProblems={challenge.content.questions.length}
                  />
                );
              })()}
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} 
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                >
                  Previous Problem
                </Button>

                <div className="flex gap-2">
                  <Button 
                    variant="default"
                    onClick={() => {
                      if (challenge.content?.questions && 
                          currentQuestionIndex < challenge.content.questions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                        // Reset state for the new problem
                        setUserCode('');
                        setTestResults([]);
                      }
                    }}
                    disabled={!challenge.content?.questions || 
                              currentQuestionIndex >= challenge.content.questions.length - 1 || 
                              isSubmitting}
                  >
                    Next Problem
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleTimeUp}
                  >
                    Skip to End
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-neutral">
              <p className="text-center text-muted-foreground">No coding problems available for this challenge.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Emotion Detection Modal */}
      {showEmotionModal && (
        <EmotionDetectionModal 
          type={emotionType} 
          onClose={() => setShowEmotionModal(false)}
          currentTopic={challenge.content?.topics ? challenge.content.topics[0] : 'Computer Science'}
        />
      )}
    </div>
  );
}