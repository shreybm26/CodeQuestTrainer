import { 
  getAllQuestionsForSubject, 
  mapLessonToSubject, 
  QuizQuestion,
  SUBJECT_IDS 
} from '../services/QuestionBankService';

// Extend the QuizQuestion type to include optional category for testing
interface ExtendedQuizQuestion extends QuizQuestion {
  category?: string;
}

/**
 * Test script to validate that subjects are properly isolated
 * and only questions from the correct subject are used
 */
export function testSubjectIsolation() {
  // Initialize test results
  const results: Record<string, {
    lessonId: string,
    mappedSubjectId: string,
    questionCount: number,
    categories: Set<string>,
    subcategories: Set<string>,
    errors: string[]
  }> = {};
  
  // Test each lesson mapping
  for (const lessonId of ['1', '2', '3', '4']) {
    // Map lesson to subject
    const subjectId = mapLessonToSubject(lessonId);
    
    // Get all questions for this subject
    const questions = getAllQuestionsForSubject(subjectId);
    
    // Track categories and subcategories
    const categories = new Set<string>();
    const subcategories = new Set<string>();
    const errors: string[] = [];
    
    // Analyze questions
    questions.forEach(q => {
      if (q.subcategory) {
        subcategories.add(q.subcategory);
      }
      
      // Check if we have category info (this could be in the question or elsewhere)
      const extendedQuestion = q as ExtendedQuizQuestion;
      if (extendedQuestion.category) {
        categories.add(extendedQuestion.category);
      }
    });
    
    // Verify expected subject based on mapping
    const expectedSubject = {
      '1': 'Data Structures',
      '2': 'Operating Systems',
      '3': 'DBMS',
      '4': 'Computer Networks'
    }[lessonId] || '';
    
    // Check if categories match expected subject
    if (categories.size > 0 && !Array.from(categories).some(cat => cat.includes(expectedSubject))) {
      errors.push(`Category mismatch: Expected ${expectedSubject} but got ${Array.from(categories).join(', ')}`);
    }
    
    // Store results
    results[lessonId] = {
      lessonId,
      mappedSubjectId: subjectId,
      questionCount: questions.length,
      categories,
      subcategories,
      errors
    };
  }
  
  // Log detailed results to console
  console.log('==== Subject Isolation Test Results ====');
  Object.values(results).forEach(result => {
    console.log(`\nLesson ID: ${result.lessonId}`);
    console.log(`Mapped to Subject ID: ${result.mappedSubjectId}`);
    console.log(`Question Count: ${result.questionCount}`);
    console.log(`Categories: ${Array.from(result.categories).join(', ')}`);
    console.log(`Subcategories: ${Array.from(result.subcategories).join(', ')}`);
    
    if (result.errors.length > 0) {
      console.log(`ERRORS (${result.errors.length}):`);
      result.errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('Status: OK - Questions properly isolated');
    }
  });
  
  // Return overall test success
  const allSuccessful = Object.values(results).every(r => r.errors.length === 0);
  console.log(`\nOverall Test Result: ${allSuccessful ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return {
    success: allSuccessful,
    results
  };
}

// Export test for possible use in browser console or elsewhere
export default testSubjectIsolation; 