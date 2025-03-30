import dataStructuresQuestions from '../data/dataStructuresQuestions.json';
import operatingSystemsQuestions from '../data/operatingSystemsQuestions.json';
import dbmsQuestions from '../data/dbmsQuestions.json';
import computerNetworksQuestions from '../data/computerNetworksQuestions.json';

// Define empty placeholder structures for missing question banks
const algorithmQuestionsPlaceholder = {
  subject: "Algorithms",
  description: "Algorithm questions covering sorting, searching, and other common algorithms",
  topics: []
};

const systemDesignQuestionsPlaceholder = {
  subject: "System Design",
  description: "System design questions covering scalability, architecture, and system components",
  topics: []
};

// Define types for our question bank structure
export type QuizQuestion = {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  subcategory: string;
  options?: string[];
};

export type QuizTopic = {
  name: string;
  description: string;
  questions: QuizQuestion[];
};

export type QuestionBank = {
  subject: string;
  description: string;
  topics: QuizTopic[];
};

// Map subject IDs to their respective question banks
const SUBJECT_QUESTION_BANKS: Record<string, QuestionBank> = {
  '1': dataStructuresQuestions as QuestionBank,
  '2': operatingSystemsQuestions as QuestionBank,
  '3': dbmsQuestions as QuestionBank,
  '4': computerNetworksQuestions as QuestionBank,
  '5': algorithmQuestionsPlaceholder as QuestionBank,
  '6': systemDesignQuestionsPlaceholder as QuestionBank,
};

export const SUBJECT_IDS = {
  DATA_STRUCTURES: '1',
  OPERATING_SYSTEMS: '2',
  DBMS: '3',
  COMPUTER_NETWORKS: '4',
  ALGORITHMS: '5',
  SYSTEM_DESIGN: '6',
};

/**
 * Maps a lesson ID to its corresponding subject ID
 * Lesson IDs are used in the UI routing, while subject IDs correspond to specific question banks
 */
export function mapLessonToSubject(lessonId: string): string {
  // This mapping is based on the categories in your application
  const lessonSubjectMap: Record<string, string> = {
    '1': SUBJECT_IDS.DATA_STRUCTURES,  // Trees and Graph Traversal
    '2': SUBJECT_IDS.OPERATING_SYSTEMS, // Process Management
    '3': SUBJECT_IDS.DBMS,  // Database Management
    '4': SUBJECT_IDS.COMPUTER_NETWORKS, // Network Protocols
    '5': SUBJECT_IDS.ALGORITHMS, // Algorithm Design
    '6': SUBJECT_IDS.SYSTEM_DESIGN // System Architecture
  };
  
  return lessonSubjectMap[lessonId] || lessonId;
}

/**
 * Get the entire question bank for a specific subject
 */
export function getQuestionBank(subjectId: string): QuestionBank | null {
  return SUBJECT_QUESTION_BANKS[subjectId] || null;
}

/**
 * Get all questions for a specific subject
 */
export function getAllQuestionsForSubject(subjectId: string): QuizQuestion[] {
  const questionBank = getQuestionBank(subjectId);
  if (!questionBank) return [];
  
  return questionBank.topics.flatMap(topic => topic.questions);
}

/**
 * Get questions filtered by topic for a specific subject
 */
export function getQuestionsForTopic(subjectId: string, topicName: string): QuizQuestion[] {
  const questionBank = getQuestionBank(subjectId);
  if (!questionBank) return [];
  
  const topic = questionBank.topics.find(t => t.name === topicName);
  return topic?.questions || [];
}

/**
 * Get questions filtered by difficulty level for a subject
 */
export function getQuestionsByDifficulty(subjectId: string, difficulty: string): QuizQuestion[] {
  const allQuestions = getAllQuestionsForSubject(subjectId);
  return allQuestions.filter(q => q.difficulty === difficulty);
}

/**
 * Get questions for a specific subcategory within a subject
 */
export function getQuestionsBySubcategory(subjectId: string, subcategory: string): QuizQuestion[] {
  const allQuestions = getAllQuestionsForSubject(subjectId);
  return allQuestions.filter(q => q.subcategory === subcategory);
}

/**
 * Get all subcategories available for a subject
 */
export function getSubcategoriesForSubject(subjectId: string): string[] {
  const allQuestions = getAllQuestionsForSubject(subjectId); 
  return Array.from(new Set(allQuestions.map(q => q.subcategory)));
}

/**
 * Get the total number of questions for a subject
 */
export function getTotalQuestionCount(subjectId: string): number {
  return getAllQuestionsForSubject(subjectId).length;
}

/**
 * Get a balanced initial question set for a subject
 * Ensures questions come from different subcategories and start with beginner level
 */
export function getInitialQuestionSet(subjectId: string, count: number = 5): QuizQuestion[] {
  const allQuestions = getAllQuestionsForSubject(subjectId);
  if (allQuestions.length === 0) return [];
  
  // Get all subcategories
  const subcategories = Array.from(new Set(allQuestions.map(q => q.subcategory)));
  
  // Start with beginner questions from different subcategories
  const beginnerQuestions = allQuestions.filter(q => q.difficulty === 'beginner');
  
  let initialSet: QuizQuestion[] = [];
  
  // Try to get at least one question from each subcategory
  subcategories.forEach(subcategory => {
    const subcatBeginnerQuestions = beginnerQuestions.filter(q => q.subcategory === subcategory);
    if (subcatBeginnerQuestions.length > 0) {
      initialSet.push(subcatBeginnerQuestions[0]);
    }
  });
  
  // If we don't have enough, add more beginner questions
  if (initialSet.length < count && beginnerQuestions.length > initialSet.length) {
    const remainingBeginners = beginnerQuestions.filter(q => !initialSet.includes(q));
    initialSet = [...initialSet, ...remainingBeginners.slice(0, count - initialSet.length)];
  }
  
  // If we still don't have enough, add intermediate questions
  if (initialSet.length < count) {
    const intermediateQuestions = allQuestions.filter(
      q => q.difficulty === 'intermediate' && !initialSet.includes(q)
    );
    initialSet = [...initialSet, ...intermediateQuestions.slice(0, count - initialSet.length)];
  }
  
  // If we still don't have enough, add any remaining questions
  if (initialSet.length < count) {
    const remainingQuestions = allQuestions.filter(q => !initialSet.includes(q));
    initialSet = [...initialSet, ...remainingQuestions.slice(0, count - initialSet.length)];
  }
  
  return initialSet.slice(0, count);
}

/**
 * Get the next logical question based on user performance
 * - If struggling, provide more questions from the same difficulty and subcategory
 * - If doing well, progress to more difficult questions
 */
export function getNextQuestion(
  subjectId: string,
  currentDifficulty: string,
  subcategory: string,
  completedQuestionIds: string[],
  isStruggling: boolean
): QuizQuestion | null {
  // Ensure we're only working with questions from the specified subject
  const allQuestions = getAllQuestionsForSubject(subjectId);
  
  // Filter out completed questions
  const availableQuestions = allQuestions.filter(q => !completedQuestionIds.includes(q.id));
  
  if (availableQuestions.length === 0) return null;
  
  // If struggling, prioritize questions from the same subcategory and difficulty
  if (isStruggling) {
    const sameSubcategoryAndDifficulty = availableQuestions.filter(
      q => q.subcategory === subcategory && q.difficulty === currentDifficulty
    );
    
    if (sameSubcategoryAndDifficulty.length > 0) {
      // Shuffle to get different questions each time
      return sameSubcategoryAndDifficulty[Math.floor(Math.random() * sameSubcategoryAndDifficulty.length)];
    }
    
    // If no more questions at same difficulty and subcategory, try easier questions in same subcategory
    const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentDifficultyIndex = difficultyLevels.indexOf(currentDifficulty as any);
    
    if (currentDifficultyIndex > 0) {
      const easierDifficulty = difficultyLevels[currentDifficultyIndex - 1];
      const easierQuestions = availableQuestions.filter(
        q => q.subcategory === subcategory && q.difficulty === easierDifficulty
      );
      
      if (easierQuestions.length > 0) {
        return easierQuestions[Math.floor(Math.random() * easierQuestions.length)];
      }
    }
    
    // If no easier questions, try any question from same subcategory
    const sameSubcategory = availableQuestions.filter(q => q.subcategory === subcategory);
    if (sameSubcategory.length > 0) {
      return sameSubcategory[Math.floor(Math.random() * sameSubcategory.length)];
    }
  }
  
  // Identify subcategories with weak mastery and low attempt counts
  // Note: This logic would need to be updated if you pass performance metrics here
  const weakSubcategories = availableQuestions
    .filter(q => q.subcategory !== subcategory)
    .map(q => q.subcategory);
  
  const uniqueWeakSubcategories = Array.from(new Set(weakSubcategories));
  
  // If there are weak subcategories that need attention, focus on them
  if (uniqueWeakSubcategories.length > 0) {
    // Randomly select a weak subcategory to focus on
    const targetSubcategory = uniqueWeakSubcategories[Math.floor(Math.random() * uniqueWeakSubcategories.length)];
    
    // Try to find beginner questions in this subcategory first
    const beginnerQuestions = availableQuestions.filter(
      q => q.subcategory === targetSubcategory && q.difficulty === 'beginner'
    );
    
    if (beginnerQuestions.length > 0) {
      return beginnerQuestions[Math.floor(Math.random() * beginnerQuestions.length)];
    }
    
    // If no beginner questions, try any question in this subcategory
    const subcategoryQuestions = availableQuestions.filter(q => q.subcategory === targetSubcategory);
    if (subcategoryQuestions.length > 0) {
      return subcategoryQuestions[Math.floor(Math.random() * subcategoryQuestions.length)];
    }
  }
  
  // If not struggling or no weak subcategories, progress based on difficulty
  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentDifficultyIndex = difficultyLevels.indexOf(currentDifficulty as any);
  
  // Try to find a question at the next difficulty level
  if (currentDifficultyIndex < difficultyLevels.length - 1) {
    const nextDifficulty = difficultyLevels[currentDifficultyIndex + 1];
    const nextLevelQuestions = availableQuestions.filter(q => q.difficulty === nextDifficulty);
    
    if (nextLevelQuestions.length > 0) {
      // Randomly select to ensure variety
      return nextLevelQuestions[Math.floor(Math.random() * nextLevelQuestions.length)];
    }
  }
  
  // If no questions at the next level, return any available question
  if (availableQuestions.length > 0) {
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }
  
  return null;
}

/**
 * Calculate mastery level based on correct answers per subcategory
 */
export function calculateMastery(
  subjectId: string, 
  answeredQuestions: { id: string; isCorrect: boolean }[]
): { 
  overallMastery: number; 
  subcategoryMastery: Record<string, number>;
  weakAreas: string[] 
} {
  // Make sure we only use questions from the specified subject
  const allQuestions = getAllQuestionsForSubject(subjectId);
  const subcategories = Array.from(new Set(allQuestions.map(q => q.subcategory)));
  
  // Initialize mastery tracking
  const subcategoryMastery: Record<string, number> = {};
  const subcategoryAnswers: Record<string, { correct: number; total: number }> = {};
  
  // Initialize subcategories
  subcategories.forEach(sub => {
    subcategoryMastery[sub] = 0;
    subcategoryAnswers[sub] = { correct: 0, total: 0 };
  });
  
  // Calculate subcategory mastery for questions from this subject only
  answeredQuestions.forEach(({ id, isCorrect }) => {
    const question = allQuestions.find(q => q.id === id);
    if (question) {
      const subcat = question.subcategory;
      subcategoryAnswers[subcat].total++;
      if (isCorrect) {
        subcategoryAnswers[subcat].correct++;
      }
    }
  });
  
  // Calculate percentages
  let totalCorrect = 0;
  let totalAnswered = 0;
  
  Object.keys(subcategoryAnswers).forEach(subcat => {
    const { correct, total } = subcategoryAnswers[subcat];
    totalCorrect += correct;
    totalAnswered += total;
    
    if (total > 0) {
      subcategoryMastery[subcat] = Math.round((correct / total) * 100);
    }
  });
  
  // Calculate overall mastery
  const overallMastery = totalAnswered > 0 
    ? Math.round((totalCorrect / totalAnswered) * 100) 
    : 0;
  
  // Identify weak areas (subcategories with less than 70% mastery and at least one attempt)
  const weakAreas = Object.entries(subcategoryMastery)
    .filter(([_, mastery]) => mastery < 70 && mastery > 0)
    .map(([subcat]) => subcat);
  
  return { overallMastery, subcategoryMastery, weakAreas };
} 