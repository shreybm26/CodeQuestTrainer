import OpenAI from "openai";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// API key from environment variable
const apiKey = process.env.OPENAI_API_KEY;

// Mock OpenAI implementation
const openai = {
  chat: {
    completions: {
      create: async () => {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({ recommendations: getFallbackRecommendations({}) })
              }
            }
          ]
        };
      }
    }
  }
};

// Function to generate learning recommendations based on user performance
export async function generateRecommendations(userPerformance: any): Promise<any[]> {
  try {
    // Use fallback recommendations directly
    return getFallbackRecommendations(userPerformance);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Use fallback recommendations on API error
    return getFallbackRecommendations(userPerformance);
  }
}

// Helper function to generate fallback recommendations based on user performance
function getFallbackRecommendations(userPerformance: any = {}): any[] {
  // We'll create smart recommendations based on the performance data
  // without relying on the OpenAI API
  const recommendations = [];
  
  // Find the lowest performing category
  const lowestCategory = userPerformance.categories?.reduce((lowest: any, current: any) => {
    if (!lowest || current.progress < lowest.progress) {
      return current;
    }
    return lowest;
  }, null);
  
  if (lowestCategory) {
    recommendations.push({
      id: '1',
      title: `${lowestCategory.name} Fundamentals`,
      description: `You're scoring ${lowestCategory.progress}% in this area, focus on building a stronger foundation.`,
      type: 'weak_area',
      cta: 'Study Now'
    });
  } else {
    recommendations.push({
      id: '1',
      title: 'Data Structures Foundations',
      description: 'Strengthen your understanding of fundamental data structures for better algorithm design.',
      type: 'weak_area',
      cta: 'Study Now'
    });
  }
  
  // Find a middle performing category for practice
  const middleCategory = userPerformance.categories?.find((cat: any) => 
    cat.progress >= 50 && cat.progress < 75
  );
  
  if (middleCategory) {
    recommendations.push({
      id: '2',
      title: `Advanced ${middleCategory.name}`,
      description: `With ${middleCategory.progress}% mastery, practicing more advanced concepts will help solidify your knowledge.`,
      type: 'needs_practice',
      cta: 'Practice Now'
    });
  } else {
    recommendations.push({
      id: '2',
      title: 'Algorithm Optimization',
      description: 'Learn techniques to optimize your algorithms for better performance in technical interviews.',
      type: 'needs_practice',
      cta: 'Practice Now'
    });
  }
  
  // Find the highest performing category
  const highestCategory = userPerformance.categories?.reduce((highest: any, current: any) => {
    if (!highest || current.progress > highest.progress) {
      return current;
    }
    return highest;
  }, null);
  
  if (highestCategory) {
    recommendations.push({
      id: '3',
      title: `${highestCategory.name} Mastery`,
      description: `Great job achieving ${highestCategory.progress}% mastery! Complete advanced challenges to fully master this topic.`,
      type: 'almost_mastered',
      cta: 'Continue Learning'
    });
  } else {
    recommendations.push({
      id: '3',
      title: 'Interview Preparation',
      description: 'Take mock interviews to practice explaining technical concepts clearly and confidently.',
      type: 'almost_mastered',
      cta: 'Continue Learning'
    });
  }
  
  return recommendations;
}

// Function to simplify complex concepts for confused students
export async function getSimplifiedExplanation(topic: string): Promise<string> {
  try {
    return getSimplifiedExplanationFallback(topic);
  } catch (error) {
    console.error("Error generating simplified explanation:", error);
    return getSimplifiedExplanationFallback(topic);
  }
}

// Fallback explanations for common CS topics
function getSimplifiedExplanationFallback(topic: string = ""): string {
  const topics: Record<string, string> = {
    'Data Structures': 'Data structures are organized ways to store and organize data for efficient use. Think of them like different types of containers - arrays are like rows of boxes, linked lists are chains where each link points to the next, and trees branch out like family trees with parent-child relationships.',
    
    'Trees and Graph Traversal': 'Tree traversal is like exploring a family tree - you can visit relatives in different orders. In Computer Science, you can go depth-first (explore one branch fully before moving to siblings) or breadth-first (visit all siblings before moving to children). Graph traversal is similar but handles more complex connections.',
    
    'Algorithms': 'Algorithms are step-by-step procedures or recipes for solving problems. Just like you follow a recipe to bake a cake, computers follow algorithms to sort data, find information, or make decisions. The efficiency of these steps determines how quickly the computer can solve the problem.',
    
    'Big O Notation': 'Big O Notation is a way to describe how long an algorithm takes to run as the input grows. Think of it like estimating delivery time - O(n) means delivery time grows directly with distance, while O(n²) means it grows much faster, like delivering to n addresses in n different cities.',
    
    'Recursion': 'Recursion is when a function calls itself to solve smaller versions of the same problem. It\'s like looking up a word in a dictionary, finding another unfamiliar word in the definition, and looking that up too, continuing until you understand all the words.',
    
    'Memory Management': 'Memory management is how computers keep track of and allocate memory. It\'s like managing desk space - you need to know what information you\'re using (in RAM), what you might need soon (cached), and what can be stored away (in storage).',
    
    'Process Scheduling': 'Process scheduling is how a computer\'s operating system decides which tasks to run when. It\'s like a chef deciding which dishes to cook in what order - some are urgent, some can wait, and sometimes you need to switch between tasks to keep everything moving forward efficiently.',
    
    'Database Management': 'Database management is organizing, storing, and retrieving data efficiently. Think of it as a highly organized library system - information is categorized, indexed, and structured so you can quickly find exactly what you need, even among millions of entries.',
    
    'Graph Algorithms': 'Graph algorithms help solve problems on networks of connected points. They\'re like finding the fastest route on a map - whether you\'re calculating the shortest path between cities, determining the most important person in a social network, or optimizing delivery routes.',
  };
  
  // Search for the topic or parts of it in our prepared explanations
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, explanation] of Object.entries(topics)) {
    if (lowerTopic.includes(key.toLowerCase())) {
      return explanation;
    }
  }
  
  // Generic fallback for topics not in our database
  return `${topic} is an important concept in computer science. While I can't provide a detailed explanation right now, I recommend breaking down the concept into smaller parts and using analogies to understand it better. Try searching for visual explanations or interactive tutorials online.`;
}

// Function to generate AI mock interview questions
export async function generateMockInterviewQuestion(topic: string): Promise<{
  question: string;
  hints: string[];
  explanation: string;
}> {
  try {
    return getMockInterviewQuestionFallback(topic);
  } catch (error) {
    console.error("Error generating mock interview question:", error);
    return getMockInterviewQuestionFallback(topic);
  }
}

// Fallback function for interview questions
function getMockInterviewQuestionFallback(topic: string): {
  question: string;
  hints: string[];
  explanation: string;
} {
  // Common interview questions by topic
  const questions: Record<string, {
    question: string;
    hints: string[];
    explanation: string;
  }> = {
    'Data Structures': {
      question: 'Implement a function to determine if a binary tree is balanced. A balanced tree is defined as a tree where the heights of the two subtrees of any node never differ by more than one.',
      hints: [
        'Consider using a recursive approach to check the height of subtrees.',
        'You can use a depth-first traversal to calculate heights.',
        'Think about how to avoid recalculating heights for the same nodes multiple times.'
      ],
      explanation: 'A balanced binary tree has subtrees with heights that differ by at most 1. The efficient solution uses a bottom-up approach, checking balance as we calculate heights. The time complexity is O(n) where n is the number of nodes, as we visit each node once. The code would recursively calculate height, returning -1 for imbalanced subtrees and propagating this value upward.'
    },
    
    'Algorithms': {
      question: 'Implement an algorithm to find the kth largest element in an unsorted array without sorting the entire array.',
      hints: [
        'Consider using a modified version of quicksort\'s partition algorithm.',
        'Think about how the partition algorithm can be used to find elements in a specific position.',
        'You can eliminate portions of the array in each step to narrow down the search.'
      ],
      explanation: 'The optimal solution uses the QuickSelect algorithm, which is based on the partition step from quicksort. The average time complexity is O(n) where n is the array size. In each step, we partition the array and either return the pivot if it\'s in the kth position, or recursively search in the left or right portion based on the pivot\'s position relative to k.'
    },
    
    'Operating Systems': {
      question: 'Explain how a deadlock can occur in a system and describe an algorithm to detect deadlocks.',
      hints: [
        'Consider the four necessary conditions for a deadlock to occur.',
        'Think about how resources and processes can be represented as a graph.',
        'Consider how cycles in this graph relate to deadlocks.'
      ],
      explanation: 'A deadlock occurs when processes are waiting for resources held by each other, creating a circular wait. The four necessary conditions are: mutual exclusion, hold and wait, no preemption, and circular wait. Detection involves creating a resource allocation graph and checking for cycles. The banker\'s algorithm can be used for deadlock avoidance by checking if resource requests would lead to unsafe states.'
    }
  };
  
  // Search for the topic or parts of it in our prepared questions
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, question] of Object.entries(questions)) {
    if (lowerTopic.includes(key.toLowerCase())) {
      return question;
    }
  }
  
  // Generic fallback for topics not in our database
  return {
    question: `Given your knowledge of ${topic}, design an algorithm to solve a common problem in this domain. Explain your approach, time and space complexity analysis.`,
    hints: [
      'Start by identifying the key requirements and constraints of the problem.',
      'Consider breaking down the problem into smaller, more manageable subproblems.',
      'Think about edge cases and how your solution handles them.'
    ],
    explanation: 'Good algorithm design involves understanding the problem thoroughly, considering multiple approaches, analyzing trade-offs between time and space complexity, and handling edge cases appropriately. Testing your solution with different inputs helps validate your approach.'
  };
}

// Function to analyze user response to generate feedback
export async function analyzeUserAnswer(question: string, userAnswer: string): Promise<{
  correctness: number; // 0-100 scale
  feedback: string;
  improvementTips: string[];
}> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY && !apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return getAnalysisFallback(question, userAnswer);
    }
    
    const prompt = `
    Analyze this student response to a technical interview question.
    
    Question: "${question}"
    Student Answer: "${userAnswer}"
    
    Return your analysis as a JSON object with:
    - correctness: A score from 0-100 indicating how correct the answer is
    - feedback: A supportive but honest assessment of the answer
    - improvementTips: An array of 2-3 specific recommendations for improvement
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an experienced technical interviewer and mentor. You provide constructive feedback on interview answers to help students improve."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Error analyzing user answer:", error);
    return getAnalysisFallback(question, userAnswer);
  }
}

// Fallback for answer analysis when OpenAI is unavailable
function getAnalysisFallback(question: string, userAnswer: string): {
  correctness: number;
  feedback: string;
  improvementTips: string[];
} {
  // Basic analysis based on length and keywords
  const answerLength = userAnswer.length;
  let correctness = 50; // Start with a neutral score
  
  // Check if the answer is too short
  if (answerLength < 100) {
    correctness -= 20;
  } else if (answerLength > 500) {
    correctness += 10;
  }
  
  // Look for common technical terms in the answer
  const technicalTerms = [
    'algorithm', 'complexity', 'data structure', 'time complexity', 'space complexity', 
    'big o', 'optimization', 'efficiency', 'trade-off', 'implementation',
    'recursion', 'iteration', 'memory', 'performance', 'analysis'
  ];
  
  let termsFound = 0;
  
  technicalTerms.forEach(term => {
    if (userAnswer.toLowerCase().includes(term.toLowerCase())) {
      termsFound++;
    }
  });
  
  // Adjust score based on technical terms
  correctness += Math.min(termsFound * 5, 30);
  
  // Cap the score between 30 and 85 for fallback
  correctness = Math.max(30, Math.min(85, correctness));
  
  // Generate appropriate feedback
  let feedback = '';
  let improvementTips = [];
  
  if (correctness < 50) {
    feedback = "Your answer addresses some aspects of the question but needs more technical depth and clarity.";
    improvementTips = [
      "Include specific examples to illustrate your understanding of the concepts",
      "Focus on explaining the reasoning behind your approach",
      "Consider discussing time and space complexity analysis"
    ];
  } else if (correctness < 70) {
    feedback = "Good answer with some technical insights, but there's room for improvement in organization and depth.";
    improvementTips = [
      "Structure your answer with a clear introduction, explanation, and conclusion",
      "Provide more details about trade-offs in your solution",
      "Compare your approach with alternative solutions"
    ];
  } else {
    feedback = "Strong answer showing good technical understanding. Some minor refinements could make it excellent.";
    improvementTips = [
      "Consider edge cases that might affect your solution",
      "Explain how your approach could be optimized further",
      "Connect your answer to real-world applications or scenarios"
    ];
  }
  
  return {
    correctness,
    feedback,
    improvementTips
  };
}

// Function to generate a fun fact to re-engage bored students
export async function generateFunFact(): Promise<string> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY && !apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return getFunFactFallback();
    }
    
    const prompt = "Generate a surprising and interesting computer science fun fact that would re-engage a bored CS student. Keep it under 100 words.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a computer science educator who knows how to make learning fun and engaging."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || getFunFactFallback();
  } catch (error) {
    console.error("Error generating fun fact:", error);
    return getFunFactFallback();
  }
}

// Array of fallback fun facts
function getFunFactFallback(): string {
  const funFacts = [
    "Did you know? The first computer bug was an actual insect - a moth was found trapped in a Harvard Mark II computer in 1947, causing it to malfunction.",
    "The programming language Python wasn't named after a snake, but after Monty Python's Flying Circus, a British comedy group from the 1970s.",
    "The first 1GB hard disk drive was introduced in 1980, weighed about 550 pounds, and cost $40,000. Today, you can buy a 1TB drive (1,000 times larger) for under $50!",
    "CAPTCHA (those puzzles that verify you're human) is actually an acronym for 'Completely Automated Public Turing test to tell Computers and Humans Apart'.",
    "Nintendo was founded in 1889 as a playing card company, more than 60 years before the first commercial computers were created.",
    "The average human brain can store about 2.5 petabytes of memory – equivalent to 3 million hours of TV shows or about 300 years of continuous viewing.",
    "The first computer mouse was made of wood and invented by Doug Engelbart in 1964.",
    "About 90% of the world's currency exists only on computers. Only 10% is physical money.",
    "The world's first programmer was a woman. Ada Lovelace wrote the first algorithm for Charles Babbage's Analytical Engine in the 1840s.",
    "The entire Apollo 11 mission that landed humans on the moon used a computer with less processing power than a modern calculator."
  ];
  
  // Return a random fun fact from the array
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}