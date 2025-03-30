// Define interfaces for the code execution service

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestResult {
  passing: boolean;
  output?: string;
  expected?: string;
  error?: string;
  executionTime?: string;
}

export interface CodeProblem {
  id?: string;
  title: string;
  description?: string;
  examples?: TestCase[];
  testCases?: TestCase[];
}

/**
 * Mock code execution service that simulates running code
 * 
 * In a real application, this would send the code to a backend service
 * that would execute it in a sandbox environment and return the results.
 */
class CodeExecutionService {
  /**
   * Run tests on the provided code
   * @param code The user's code
   * @param language The programming language
   * @param problem The coding problem
   * @returns An array of test results
   */
  async runTests(
    code: string, 
    language: string, 
    problem: CodeProblem
  ): Promise<TestResult[]> {
    // This is a mock implementation
    // In a real app, you would send the code to a backend service for execution
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const testCases = problem.testCases || problem.examples || [];
    
    if (!testCases || testCases.length === 0) {
      return [{
        passing: false,
        error: "No test cases available for this problem."
      }];
    }
    
    // Generate random test results for demonstration
    return testCases.map(test => {
      const passing = Math.random() > 0.3; // 70% chance of passing
      const executionTime = `${(Math.random() * 100).toFixed(2)}ms`;
      
      if (passing) {
        return {
          passing: true,
          output: test.output,
          executionTime
        };
      } else {
        // Randomly generate different types of failures
        const failureType = Math.floor(Math.random() * 3);
        
        if (failureType === 0) {
          // Wrong output
          return {
            passing: false,
            output: `"${test.output}xyz"`, // Slightly modified output
            expected: test.output,
            executionTime
          };
        } else if (failureType === 1) {
          // Runtime error
          return {
            passing: false,
            error: language === 'javascript' 
              ? "TypeError: Cannot read property 'length' of undefined"
              : language === 'python'
                ? "AttributeError: 'NoneType' object has no attribute 'length'"
                : "NullPointerException",
            executionTime
          };
        } else {
          // Timeout
          return {
            passing: false,
            error: "Execution timed out after 5000ms",
            executionTime: "5000ms"
          };
        }
      }
    });
  }
  
  /**
   * Submit a solution for evaluation
   * @param code The user's code
   * @param language The programming language
   * @param problem The coding problem
   * @returns Results and success status
   */
  async submitSolution(
    code: string, 
    language: string, 
    problem: CodeProblem
  ): Promise<{ 
    results: TestResult[], 
    success: boolean,
    score: number,
    message: string
  }> {
    // Run the tests
    const results = await this.runTests(code, language, problem);
    
    // Calculate success and score
    const passingTests = results.filter(r => r.passing).length;
    const totalTests = results.length;
    const success = passingTests === totalTests;
    const score = Math.round((passingTests / totalTests) * 100);
    
    // Generate a feedback message
    let message = "";
    if (success) {
      message = "Great job! All tests passed.";
    } else if (score > 70) {
      message = "Almost there! Just a few tests failing.";
    } else if (score > 30) {
      message = "You're making progress, but there are still several failing tests.";
    } else {
      message = "Keep trying! Your solution needs more work to pass the tests.";
    }
    
    return { results, success, score, message };
  }
}

export const codeExecutionService = new CodeExecutionService(); 