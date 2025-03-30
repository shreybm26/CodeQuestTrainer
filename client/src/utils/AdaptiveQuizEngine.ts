import { useState, useEffect } from 'react';
import {
  QuizQuestion,
  getAllQuestionsForSubject,
  getNextQuestion,
  calculateMastery,
  getInitialQuestionSet,
  mapLessonToSubject
} from '../services/QuestionBankService';

// Track performance metrics for a subcategory
export type PerformanceMetrics = {
  subcategory: string;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  masteryLevel: number; // percentage 0-100
  needsReinforcement: boolean;
};

// Track overall lesson progress
export type LessonProgress = {
  subjectId: string;
  currentQuestionIndex: number;
  answeredQuestions: { id: string; isCorrect: boolean }[];
  metrics: Record<string, PerformanceMetrics>;
  weakAreas: string[];
  isComplete: boolean;
  overallMastery: number;
  totalQuestionsInSubject: number;
};

// Mastery thresholds
const MASTERY_THRESHOLD = 80; // 80% correct answers needed for mastery
const MIN_QUESTIONS_PER_SUBCATEGORY = 3; // Minimum questions to attempt before determining mastery

export function useAdaptiveQuiz(lessonId: string) {
  // Map lesson ID to subject ID to ensure we get the correct question bank
  const subjectId = mapLessonToSubject(lessonId);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [progress, setProgress] = useState<LessonProgress>({
    subjectId,
    currentQuestionIndex: 0,
    answeredQuestions: [],
    metrics: {},
    weakAreas: [],
    isComplete: false,
    overallMastery: 0,
    totalQuestionsInSubject: 0
  });
  
  // Initialize with questions from the specific subject
  useEffect(() => {
    // Get all questions for this subject
    const allQuestions = getAllQuestionsForSubject(subjectId);
    setQuestions(allQuestions);
    
    // Get a balanced initial set of questions instead of just starting with the first one
    const initialQuestionSet = getInitialQuestionSet(subjectId, 1); // Get just one to start
    
    if (initialQuestionSet.length > 0) {
      setCurrentQuestion(initialQuestionSet[0]);
    } else if (allQuestions.length > 0) {
      // Fallback to the first question if initial set fails
      setCurrentQuestion(allQuestions[0]);
    }
    
    // Set total questions in subject for progress tracking
    setProgress(prev => ({
      ...prev,
      totalQuestionsInSubject: allQuestions.length
    }));
    
    // Initialize metrics for each subcategory
    const subcategories = Array.from(new Set(allQuestions.map(q => q.subcategory)));
    const initialMetrics: Record<string, PerformanceMetrics> = {};
    
    subcategories.forEach(subcategory => {
      initialMetrics[subcategory] = {
        subcategory,
        totalAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        masteryLevel: 0,
        needsReinforcement: false,
      };
    });
    
    setProgress(prev => ({
      ...prev,
      metrics: initialMetrics,
    }));
  }, [subjectId]); // Re-run if subjectId changes
  
  // Record an answer and update metrics
  const recordAnswer = (questionId: string, isCorrect: boolean) => {
    if (!currentQuestion) return;
    
    const subcategory = currentQuestion.subcategory;
    const metrics = { ...progress.metrics };
    
    if (!metrics[subcategory]) {
      metrics[subcategory] = {
        subcategory,
        totalAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        masteryLevel: 0,
        needsReinforcement: false,
      };
    }
    
    // Update metrics for this subcategory
    metrics[subcategory].totalAttempts += 1;
    if (isCorrect) {
      metrics[subcategory].correctAnswers += 1;
    } else {
      metrics[subcategory].incorrectAnswers += 1;
    }
    
    // Calculate mastery level (as percentage)
    metrics[subcategory].masteryLevel = Math.round(
      (metrics[subcategory].correctAnswers / metrics[subcategory].totalAttempts) * 100
    );
    
    // Determine if this subcategory needs reinforcement
    metrics[subcategory].needsReinforcement = 
      metrics[subcategory].totalAttempts >= MIN_QUESTIONS_PER_SUBCATEGORY && 
      metrics[subcategory].masteryLevel < MASTERY_THRESHOLD;
    
    // Add to answered questions
    const updatedAnsweredQuestions = [
      ...progress.answeredQuestions,
      { id: questionId, isCorrect }
    ];
    
    // Calculate overall mastery using the service
    const { overallMastery, weakAreas } = calculateMastery(
      subjectId,
      updatedAnsweredQuestions
    );
    
    // Update progress state
    setProgress(prev => ({
      ...prev,
      answeredQuestions: updatedAnsweredQuestions,
      metrics,
      weakAreas,
      overallMastery,
    }));
  };
  
  // Move to the next question based on performance
  const moveToNextQuestion = () => {
    if (!currentQuestion) return;
    
    // Check if the user is struggling with the current subcategory
    const subcategory = currentQuestion.subcategory;
    const subcategoryMetrics = progress.metrics[subcategory];
    const isStruggling = subcategoryMetrics && 
                         subcategoryMetrics.totalAttempts >= 2 && 
                         subcategoryMetrics.masteryLevel < 70;
    
    // Get completed question IDs
    const completedQuestionIds = progress.answeredQuestions.map(aq => aq.id);
    
    // Get the next question using the enhanced service
    const nextQuestion = getNextQuestion(
      subjectId,
      currentQuestion.difficulty,
      subcategory,
      completedQuestionIds,
      isStruggling
    );
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
    } else {
      // No more questions available, mark as complete
      checkCompletion();
    }
  };
  
  // Check if the lesson should be considered complete
  const checkCompletion = () => {
    // Consider the lesson complete if:
    // 1. All subcategories with enough attempts have reached mastery threshold, OR
    // 2. All questions have been answered
    
    // Only consider subcategories with enough attempts
    const subcategoriesWithEnoughAttempts = Object.values(progress.metrics).filter(
      m => m.totalAttempts >= MIN_QUESTIONS_PER_SUBCATEGORY
    );
    
    const allMeasuredSubcategoriesMastered = subcategoriesWithEnoughAttempts.length > 0 && 
      subcategoriesWithEnoughAttempts.every(m => m.masteryLevel >= MASTERY_THRESHOLD);
    
    const allQuestionsAnswered = progress.answeredQuestions.length === questions.length && questions.length > 0;
    const minimumQuestionsAnswered = progress.answeredQuestions.length >= Math.min(15, questions.length);
    
    if (allMeasuredSubcategoriesMastered || allQuestionsAnswered || 
        (minimumQuestionsAnswered && progress.overallMastery >= MASTERY_THRESHOLD)) {
      setProgress(prev => ({
        ...prev,
        isComplete: true,
      }));
    }
  };
  
  // Get completion percentage based on answered questions vs. total available
  const getCompletionPercentage = (): number => {
    if (progress.totalQuestionsInSubject === 0) return 0;
    
    // Calculate based on the ratio of answered questions to total
    // But cap at 100% since we might not need to answer all questions to achieve mastery
    const percentage = Math.round((progress.answeredQuestions.length / Math.min(15, progress.totalQuestionsInSubject)) * 100);
    return Math.min(percentage, 100);
  };
  
  return {
    currentQuestion,
    progress: getCompletionPercentage(),
    totalQuestions: Math.min(15, progress.totalQuestionsInSubject), // Cap displayed total at 15
    answeredQuestions: progress.answeredQuestions.length,
    recordAnswer,
    moveToNextQuestion,
    isComplete: progress.isComplete,
    overallMastery: progress.overallMastery,
    weakAreas: progress.weakAreas,
    metrics: progress.metrics
  };
} 