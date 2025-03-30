import { 
  users, User, InsertUser, 
  LearningPath, Challenge, Flashcard, 
  DailyGoal, Recommendation, LeaderboardEntry
} from "@shared/schema";

// Interface defining all the storage methods needed for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: number, lessonId: string, progress: number): Promise<boolean>;
  updateUserXP(userId: number, xp: number): Promise<boolean>;
  updateUserStreak(userId: number): Promise<boolean>;
  
  // Learning paths methods
  getLearningPaths(): Promise<any[]>;
  getLearningPathById(pathId: string): Promise<any>;
  
  // Daily goals methods
  getDailyGoals(): Promise<any[]>;
  updateDailyGoal(goalId: string, progress: number): Promise<boolean>;
  
  // Recommendations methods
  getRecommendations(): Promise<any[]>;
  
  // Challenges methods
  getChallenges(): Promise<any[]>;
  getChallengeById(challengeId: string): Promise<any>;
  getDailyChallenges(): Promise<any[]>;
  submitChallengeResult(userId: number, challengeId: string, score: number): Promise<boolean>;
  
  // Flashcards methods
  getDailyFlashcards(): Promise<any[]>;
  getFlashcardsByCategory(category: string): Promise<any[]>;
  submitFlashcardResponse(userId: number, flashcardId: string, isCorrect: boolean): Promise<boolean>;
  
  // Leaderboard methods
  getTopLeaderboard(): Promise<any[]>;
  getWeeklyLeaderboard(): Promise<any[]>;
  
  // Profile methods
  getProfileStats(): Promise<any>;
  getProfileActivity(): Promise<any[]>;
  getUserBadges(userId: number): Promise<any[]>;
  
  // Lessons methods
  getLessonCategories(): Promise<any[]>;
  getLessonById(lessonId: string): Promise<any>;
  getActiveLesson(): Promise<any>;
  getNextLesson(currentLessonId: string): Promise<any>;
  submitLessonCompletion(userId: number, lessonId: string, score: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningPaths: any[];
  private dailyGoals: any[];
  private recommendations: any[];
  private challenges: any[];
  private dailyChallenges: any[];
  private flashcards: any[];
  private topLeaderboard: any[];
  private weeklyLeaderboard: any[];
  private lessonCategories: any[];
  private activeLesson: any;
  private profileActivity: any[];
  
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Add a demo user that matches the hard-coded ID (1) used in challenge submissions
    const demoUser: User = {
      id: 1,
      username: "sarah_williams",
      password: "hashed_password_here", // In a real app, this would be properly hashed
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@example.com",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      xp: 1240,
      streak: 12,
      readinessScore: 72,
      level: "Intermediate",
      badges: 9,
      notifications: 3,
      createdAt: new Date()
    };
    this.users.set(1, demoUser);
    
    // Initialize with mock data for development
    this.learningPaths = [
      {
        id: '1',
        title: 'Data Structures',
        level: 'Intermediate',
        progress: 65,
        currentLesson: 'Trees & Graph Traversal',
        color: 'primary',
        buttonColor: 'primary'
      },
      {
        id: '2',
        title: 'Operating Systems',
        level: 'Beginner',
        progress: 35,
        currentLesson: 'Process Management',
        color: 'secondary',
        buttonColor: 'yellow-500'
      },
      {
        id: '3',
        title: 'System Design',
        level: 'Advanced',
        progress: 20,
        currentLesson: 'Database Scaling',
        color: 'purple-500',
        buttonColor: 'purple-500'
      }
    ];
    
    this.dailyGoals = [
      {
        id: '1',
        title: 'Complete 3 Flashcard Sets',
        completed: 3,
        total: 3,
        isCompleted: true
      },
      {
        id: '2',
        title: 'Solve 5 MCQs',
        completed: 5,
        total: 5,
        isCompleted: true
      },
      {
        id: '3',
        title: 'Complete 1 Challenge',
        completed: 0,
        total: 1,
        isCompleted: false
      }
    ];
    
    this.recommendations = [
      {
        id: '1',
        title: 'Memory Management in OS',
        description: 'You\'ve scored below 60% in this topic consistently.',
        type: 'weak_area',
        cta: 'Study Now'
      },
      {
        id: '2',
        title: 'Graph Algorithms',
        description: 'Try more graph-based DSA problems to improve.',
        type: 'needs_practice',
        cta: 'Practice Now'
      },
      {
        id: '3',
        title: 'Time Complexity Analysis',
        description: 'You\'re getting better! Just a few more practices.',
        type: 'almost_mastered',
        cta: 'Continue Learning'
      }
    ];
    
    this.challenges = [
      {
        id: '1',
        title: 'Timer Bomb Challenge',
        description: 'Answer 10 quick MCQs before time runs out!',
        xp: 20,
        difficulty: 'Medium',
        type: 'timed',
        timeLimit: 300, // 5 minutes
        content: {
          topics: ['Data Structures', 'Algorithms', 'Operating Systems'],
          questions: [
            {
              id: '1',
              question: 'Which data structure follows the Last In First Out (LIFO) principle?',
              options: ['Queue', 'Stack', 'Linked List', 'Tree'],
              correctAnswer: 'Stack'
            },
            {
              id: '2',
              question: 'Which sorting algorithm has the best average-case time complexity?',
              options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
              correctAnswer: 'Quick Sort'
            },
            {
              id: '3',
              question: 'What is the worst-case time complexity of binary search?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
              correctAnswer: 'O(log n)'
            },
            {
              id: '4',
              question: 'Which of the following is not a process state?',
              options: ['Ready', 'Running', 'Blocked', 'Suspended', 'Crashed'],
              correctAnswer: 'Crashed'
            },
            {
              id: '5',
              question: 'What is the primary purpose of a mutex?',
              options: ['Memory allocation', 'Mutual exclusion', 'Scheduling processes', 'Interrupt handling'],
              correctAnswer: 'Mutual exclusion'
            }
          ]
        },
        gradientFrom: 'from-red-100',
        gradientTo: 'to-yellow-100',
        border: 'border-red-200',
        icon: 'zap',
        iconColor: 'text-red-500',
        buttonColor: 'bg-red-500 hover:bg-red-600'
      },
      {
        id: '2',
        title: 'Speed Code Sprint',
        description: 'Solve 3 coding puzzles before the clock runs out.',
        xp: 30,
        difficulty: 'Hard',
        type: 'code',
        timeLimit: 1800, // 30 minutes
        content: {
          topics: ['Algorithms', 'Data Structures', 'Problem Solving'],
          questions: [
            {
              id: '1',
              title: 'Two Sum',
              description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
              examples: [
                { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
                { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
              ],
              difficulty: 'Easy',
              starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}'
            },
            {
              id: '2',
              title: 'Valid Parentheses',
              description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
              examples: [
                { input: 's = "()"', output: 'true' },
                { input: 's = "()[]{}"', output: 'true' },
                { input: 's = "(]"', output: 'false' }
              ],
              difficulty: 'Medium',
              starterCode: 'function isValid(s) {\n  // Your code here\n}'
            },
            {
              id: '3',
              title: 'Maximum Subarray Sum',
              description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
              examples: [
                { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
                { input: 'nums = [1]', output: '1' }
              ],
              difficulty: 'Medium',
              starterCode: 'function maxSubArray(nums) {\n  // Your code here\n}'
            }
          ]
        },
        gradientFrom: 'from-green-100',
        gradientTo: 'to-yellow-100',
        border: 'border-green-200',
        icon: 'code',
        iconColor: 'text-primary',
        buttonColor: 'bg-primary hover:bg-green-600'
      },
      {
        id: '3',
        title: 'AI Mock Interview',
        description: 'Practice interview questions with our AI interviewer.',
        xp: 50,
        difficulty: 'Advanced',
        type: 'interview',
        timeLimit: 900, // 15 minutes
        content: {
          topics: ['Data Structures', 'Algorithms', 'System Design']
        }
      },
      {
        id: '4',
        title: 'Speed Code Sprint',
        description: 'Race against the clock to solve coding challenges of increasing difficulty.',
        xp: 300,
        difficulty: 'Medium',
        type: 'code',
        timeLimit: 30 * 60, // 30 minutes
        content: {
          topics: ['Algorithms', 'Data Structures'],
          questions: [
            {
              id: 'two-sum',
              title: 'Two Sum',
              difficulty: 'Easy',
              description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
              examples: [
                {
                  input: 'nums = [2,7,11,15], target = 9',
                  output: '[0,1]',
                  explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                },
                {
                  input: 'nums = [3,2,4], target = 6',
                  output: '[1,2]',
                  explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
                }
              ],
              starterCode: 
`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    
}`
            },
            {
              id: 'valid-palindrome',
              title: 'Valid Palindrome',
              difficulty: 'Easy',
              description: 'Given a string `s`, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases. A palindrome reads the same backward as forward.',
              examples: [
                {
                  input: 's = "A man, a plan, a canal: Panama"',
                  output: 'true',
                  explanation: '"amanaplanacanalpanama" is a palindrome.'
                },
                {
                  input: 's = "race a car"',
                  output: 'false',
                  explanation: '"raceacar" is not a palindrome.'
                }
              ],
              starterCode:
`/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Write your code here
    
}`
            },
            {
              id: 'maximum-subarray',
              title: 'Maximum Subarray',
              difficulty: 'Medium',
              description: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
              examples: [
                {
                  input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
                  output: '6',
                  explanation: '[4,-1,2,1] has the largest sum = 6.'
                },
                {
                  input: 'nums = [1]',
                  output: '1'
                }
              ],
              starterCode:
`/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your code here
    
}`
            }
          ]
        },
        gradientFrom: 'from-orange-500',
        gradientTo: 'to-pink-500',
        border: 'border-amber-400',
        icon: 'code',
        iconColor: 'text-amber-300',
        buttonColor: 'bg-amber-500'
      }
    ];
    
    // Daily challenges - a subset of the main challenges for the day
    this.dailyChallenges = [
      {
        id: '1',
        title: 'Timer Bomb Challenge',
        description: 'Answer 10 quick MCQs before time runs out!',
        xp: 20,
        difficulty: 'Medium',
        type: 'timed',
        timeLimit: 300, // 5 minutes
        content: {
          topics: ['Data Structures', 'Algorithms', 'Operating Systems'],
          questions: [
            {
              id: '1',
              question: 'Which data structure follows the Last In First Out (LIFO) principle?',
              options: ['Queue', 'Stack', 'Linked List', 'Tree'],
              correctAnswer: 'Stack'
            },
            {
              id: '2',
              question: 'Which sorting algorithm has the best average-case time complexity?',
              options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
              correctAnswer: 'Quick Sort'
            },
            {
              id: '3',
              question: 'What is the worst-case time complexity of binary search?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
              correctAnswer: 'O(log n)'
            },
            {
              id: '4',
              question: 'Which of the following is not a process state?',
              options: ['Ready', 'Running', 'Blocked', 'Suspended', 'Crashed'],
              correctAnswer: 'Crashed'
            },
            {
              id: '5',
              question: 'What is the primary purpose of a mutex?',
              options: ['Memory allocation', 'Mutual exclusion', 'Scheduling processes', 'Interrupt handling'],
              correctAnswer: 'Mutual exclusion'
            }
          ]
        },
        gradientFrom: 'from-red-100',
        gradientTo: 'to-yellow-100',
        border: 'border-red-200',
        icon: 'zap',
        iconColor: 'text-red-500',
        buttonColor: 'bg-red-500 hover:bg-red-600'
      },
      {
        id: '2',
        title: 'Speed Code Sprint',
        description: 'Solve 3 coding puzzles before the clock runs out.',
        xp: 30,
        difficulty: 'Hard',
        type: 'code',
        timeLimit: 1800, // 30 minutes
        content: {
          topics: ['Algorithms', 'Data Structures', 'Problem Solving'],
          questions: [
            {
              id: '1',
              title: 'Two Sum',
              description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
              examples: [
                { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
                { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
              ],
              difficulty: 'Easy',
              starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}'
            },
            {
              id: '2',
              title: 'Valid Parentheses',
              description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
              examples: [
                { input: 's = "()"', output: 'true' },
                { input: 's = "()[]{}"', output: 'true' },
                { input: 's = "(]"', output: 'false' }
              ],
              difficulty: 'Medium',
              starterCode: 'function isValid(s) {\n  // Your code here\n}'
            },
            {
              id: '3',
              title: 'Maximum Subarray Sum',
              description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
              examples: [
                { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
                { input: 'nums = [1]', output: '1' }
              ],
              difficulty: 'Medium',
              starterCode: 'function maxSubArray(nums) {\n  // Your code here\n}'
            }
          ]
        },
        gradientFrom: 'from-green-100',
        gradientTo: 'to-yellow-100',
        border: 'border-green-200',
        icon: 'code',
        iconColor: 'text-primary',
        buttonColor: 'bg-primary hover:bg-green-600'
      },
      {
        id: '3',
        title: 'AI Mock Interview',
        description: 'Practice interview questions with our AI interviewer.',
        xp: 50,
        difficulty: 'Hard',
        type: 'interview',
        gradientFrom: 'from-blue-100',
        gradientTo: 'to-purple-100',
        border: 'border-blue-200',
        icon: 'user',
        iconColor: 'text-blue-500',
        buttonColor: 'bg-blue-500 hover:bg-blue-600'
      }
    ];
    
    this.flashcards = [
      {
        id: '1',
        category: 'Operating Systems',
        question: 'What is a Deadlock?',
        answer: 'A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.'
      },
      {
        id: '2',
        category: 'Data Structures',
        question: 'What is the difference between a stack and a queue?',
        answer: 'A stack follows Last In First Out (LIFO) principle where the element inserted at the last is removed first, while a queue follows First In First Out (FIFO) where the element inserted at the first is removed first.'
      },
      {
        id: '3',
        category: 'Computer Networks',
        question: 'What is the purpose of DNS?',
        answer: 'Domain Name System (DNS) is a hierarchical decentralized naming system for computers, services, or other resources connected to the Internet. It translates domain names to IP addresses.'
      }
    ];
    
    this.topLeaderboard = [
      {
        id: '1',
        name: 'Alex Johnson',
        title: 'CS Senior',
        xp: '3,240',
        streak: 24,
        badges: 12,
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        rank: 1
      },
      {
        id: '2',
        name: 'Sarah Williams',
        title: 'CS Junior',
        xp: '2,850',
        streak: 12,
        badges: 9,
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        rank: 2
      },
      {
        id: '3',
        name: 'Mike Chen',
        title: 'CS Senior',
        xp: '2,640',
        streak: 8,
        badges: 7,
        avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
        rank: 3
      },
      {
        id: '4',
        name: 'Priya Sharma',
        title: 'CS Sophomore',
        xp: '2,210',
        streak: 5,
        badges: 5,
        avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
        rank: 4
      }
    ];
    
    this.weeklyLeaderboard = [
      {
        id: '1',
        name: 'Alex Johnson',
        title: 'CS Senior',
        xp: '3,240',
        streak: 24,
        badges: 12,
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        rank: 1
      },
      {
        id: '2',
        name: 'Sarah Williams',
        title: 'CS Junior',
        xp: '2,850',
        streak: 12,
        badges: 9,
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        rank: 2
      },
      {
        id: '3',
        name: 'Mike Chen',
        title: 'CS Senior',
        xp: '2,640',
        streak: 8,
        badges: 7,
        avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
        rank: 3
      },
      {
        id: '4',
        name: 'Priya Sharma',
        title: 'CS Sophomore',
        xp: '2,210',
        streak: 5,
        badges: 5,
        avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
        rank: 4
      },
      {
        id: '5',
        name: 'David Kim',
        title: 'CS Junior',
        xp: '1,980',
        streak: 3,
        badges: 4,
        avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
        rank: 5
      },
      {
        id: '6',
        name: 'Emily Johnson',
        title: 'CS Sophomore',
        xp: '1,780',
        streak: 4,
        badges: 3,
        avatarUrl: 'https://randomuser.me/api/portraits/women/23.jpg',
        rank: 6
      },
      {
        id: '7',
        name: 'Michael Rodriguez',
        title: 'CS Senior',
        xp: '1,690',
        streak: 6,
        badges: 2,
        avatarUrl: 'https://randomuser.me/api/portraits/men/28.jpg',
        rank: 7
      },
      {
        id: '8',
        name: 'Jessica Martinez',
        title: 'CS Junior',
        xp: '1,540',
        streak: 2,
        badges: 2,
        avatarUrl: 'https://randomuser.me/api/portraits/women/29.jpg',
        rank: 8
      }
    ];
    
    this.lessonCategories = [
      {
        id: '1',
        name: 'Data Structures',
        level: 'Intermediate',
        progress: 65,
        lessonCount: 24,
        topics: [
          { name: 'Arrays and Strings', completed: true },
          { name: 'Linked Lists', completed: true },
          { name: 'Trees and Graphs', completed: false }
        ]
      },
      {
        id: '2',
        name: 'Operating Systems',
        level: 'Beginner',
        progress: 35,
        lessonCount: 18,
        topics: [
          { name: 'Process Management', completed: true },
          { name: 'Memory Management', completed: false },
          { name: 'File Systems', completed: false }
        ]
      },
      {
        id: '3',
        name: 'Database Management',
        level: 'Intermediate',
        progress: 70,
        lessonCount: 15,
        topics: [
          { name: 'SQL Basics', completed: true },
          { name: 'Normalization', completed: true },
          { name: 'Indexing and Optimization', completed: false }
        ]
      },
      {
        id: '4',
        name: 'Computer Networks',
        level: 'Beginner',
        progress: 50,
        lessonCount: 20,
        topics: [
          { name: 'OSI Model', completed: true },
          { name: 'TCP/IP', completed: false },
          { name: 'Network Security', completed: false }
        ]
      },
      {
        id: '5',
        name: 'System Design',
        level: 'Advanced',
        progress: 20,
        lessonCount: 12,
        topics: [
          { name: 'Scalability', completed: false },
          { name: 'Load Balancing', completed: false },
          { name: 'Database Sharding', completed: false }
        ]
      },
      {
        id: '6',
        name: 'Algorithms',
        level: 'Intermediate',
        progress: 45,
        lessonCount: 22,
        topics: [
          { name: 'Sorting Algorithms', completed: true },
          { name: 'Graph Algorithms', completed: false },
          { name: 'Dynamic Programming', completed: false }
        ]
      }
    ];
    
    this.activeLesson = {
      id: '1',
      title: 'Trees and Graph Traversal',
      category: 'Data Structures',
      progress: 65,
      duration: '30 minutes',
      nextLesson: 'Graph Algorithms'
    };
    
    this.profileActivity = [
      {
        id: '1',
        type: 'lesson',
        title: 'Completed Linked Lists',
        description: 'Finished the lesson on Linked Lists with an excellent score',
        xp: 30,
        score: 92,
        date: 'Today'
      },
      {
        id: '2',
        type: 'challenge',
        title: 'Timer Bomb Challenge',
        description: 'Completed the timed MCQ challenge',
        xp: 20,
        score: 80,
        date: 'Yesterday'
      },
      {
        id: '3',
        type: 'flashcard',
        title: 'OS Concepts Flashcards',
        description: 'Completed a set of Operating Systems flashcards',
        xp: 15,
        score: 85,
        date: '2 days ago'
      },
      {
        id: '4',
        type: 'quiz',
        title: 'DBMS Quiz',
        description: 'Took the Database Management Systems quiz',
        xp: 25,
        score: 75,
        date: '3 days ago'
      }
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // Ensure all fields have appropriate defaults
    const user: User = { 
      ...insertUser, 
      id,
      avatarUrl: insertUser.avatarUrl || null,
      xp: insertUser.xp || 0,
      streak: insertUser.streak || 0,
      readinessScore: insertUser.readinessScore || null,
      level: insertUser.level || 'Beginner',
      badges: insertUser.badges || 0,
      notifications: insertUser.notifications || 0,
      createdAt: insertUser.createdAt || new Date()
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getLearningPaths(): Promise<any[]> {
    return this.learningPaths;
  }
  
  async getDailyGoals(): Promise<any[]> {
    return this.dailyGoals;
  }
  
  async getRecommendations(): Promise<any[]> {
    return this.recommendations;
  }
  
  async getChallenges(): Promise<any[]> {
    return this.challenges;
  }
  
  async getDailyChallenges(): Promise<any[]> {
    return this.dailyChallenges;
  }
  
  async getDailyFlashcards(): Promise<any[]> {
    return this.flashcards;
  }
  
  async getTopLeaderboard(): Promise<any[]> {
    return this.topLeaderboard;
  }
  
  async getWeeklyLeaderboard(): Promise<any[]> {
    return this.weeklyLeaderboard;
  }
  
  async getProfileStats(): Promise<any> {
    return {
      overall: 72,
      categories: [
        { name: 'Data Structures & Algorithms', progress: 85 },
        { name: 'Operating Systems', progress: 65 },
        { name: 'Database Management', progress: 70 },
        { name: 'Computer Networks', progress: 50 },
        { name: 'System Design', progress: 40 }
      ],
      performance: [
        { name: 'MCQs', score: 85 },
        { name: 'Flashcards', score: 78 },
        { name: 'Coding', score: 62 },
        { name: 'Mock Interview', score: 70 }
      ]
    };
  }
  
  async getProfileActivity(): Promise<any[]> {
    return this.profileActivity;
  }
  
  async getLessonCategories(): Promise<any[]> {
    return this.lessonCategories;
  }
  
  async getActiveLesson(): Promise<any> {
    return this.activeLesson;
  }
  
  async updateUserProgress(userId: number, lessonId: string, progress: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // In a real app, this would update a user_progress table
    // For now, we'll just return true to indicate success
    return true;
  }

  async updateUserXP(userId: number, xp: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Update the user's XP
    user.xp = xp;
    this.users.set(userId, user);
    
    return true;
  }

  async updateUserStreak(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // In a real app, this would update the user's streak in the database
    // For now, we'll just return true to indicate success
    return true;
  }

  async getLearningPathById(pathId: string): Promise<any> {
    return this.learningPaths.find(path => path.id === pathId);
  }

  async updateDailyGoal(goalId: string, progress: number): Promise<boolean> {
    const goalIndex = this.dailyGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return false;
    
    const goal = this.dailyGoals[goalIndex];
    const completed = Math.min(progress, goal.total);
    
    // Create a new object to ensure UI updates
    const updatedGoal = {
      ...goal,
      completed,
      isCompleted: completed === goal.total
    };
    
    // Replace the goal in the array
    this.dailyGoals = [
      ...this.dailyGoals.slice(0, goalIndex),
      updatedGoal,
      ...this.dailyGoals.slice(goalIndex + 1)
    ];
    
    return true;
  }

  async getChallengeById(challengeId: string): Promise<any> {
    return this.challenges.find(challenge => challenge.id === challengeId);
  }

  async submitChallengeResult(userId: number, challengeId: string, score: number): Promise<boolean> {
    console.log(`Submitting challenge result - userId: ${userId}, challengeId: ${challengeId}, score: ${score}`);
    
    // Always return true for now to unblock the challenge flow
    // In a real app, this would store the challenge result in the database
    
    // Add to profile activity
    const challenge = await this.getChallengeById(challengeId);
    if (challenge) {
      const newActivity = {
        id: String(this.profileActivity.length + 1),
        type: 'challenge',
        title: challenge.title,
        description: `Completed the ${challenge.title} with a score of ${score}%`,
        xp: challenge.xp,
        score,
        date: 'Today'
      };
      
      this.profileActivity.unshift(newActivity);
      
      // Update the daily goal for challenges - find the challenge goal by ID
      const challengeGoalId = '3'; // The ID of the "Complete 1 Challenge" goal
      const challengeGoal = this.dailyGoals.find(goal => goal.id === challengeGoalId);
      
      if (challengeGoal) {
        // Mark the goal as completed
        challengeGoal.completed = 1;
        challengeGoal.isCompleted = true;
        
        // Force the UI to update by returning new object
        this.dailyGoals = [...this.dailyGoals.filter(g => g.id !== challengeGoalId), challengeGoal]
          .sort((a, b) => parseInt(a.id) - parseInt(b.id));
      }
    }
    
    return true;
  }

  async getFlashcardsByCategory(category: string): Promise<any[]> {
    return this.flashcards.filter(card => card.category === category);
  }

  async submitFlashcardResponse(userId: number, flashcardId: string, isCorrect: boolean): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const flashcard = this.flashcards.find(card => card.id === flashcardId);
    if (!flashcard) return false;
    
    // In a real app, this would store the flashcard response in the database
    // For now, we'll update the daily goal for flashcards
    const flashcardGoal = this.dailyGoals.find(goal => goal.title.includes('Flashcard'));
    if (flashcardGoal) {
      await this.updateDailyGoal(flashcardGoal.id, flashcardGoal.completed + 1);
    }
    
    return true;
  }

  async getUserBadges(userId: number): Promise<any[]> {
    // In a real app, this would fetch user badges from the database
    return [
      {
        id: '1',
        name: 'DSA Expert',
        description: 'Mastered Data Structures and Algorithms',
        unlockedDate: '2025-02-10'
      },
      {
        id: '2',
        name: 'Streak Master',
        description: 'Maintained a 10-day learning streak',
        unlockedDate: '2025-03-15'
      },
      {
        id: '3',
        name: 'Challenge Champion',
        description: 'Completed 5 challenges in a single day',
        unlockedDate: '2025-03-01'
      }
    ];
  }

  async getLessonById(lessonId: string): Promise<any> {
    // Data Structures lesson
    if (lessonId === '1') {
      return {
        id: '1',
        title: 'Trees and Graph Traversal',
        category: 'Data Structures',
        progress: 0,
        duration: '45 minutes',
        nextLesson: 'Dynamic Programming Basics',
        description: 'Learn how to traverse tree and graph data structures with different algorithms.',
        flashcards: [
          {
            id: '1',
            question: 'What is a binary tree?',
            answer: 'A binary tree is a tree data structure in which each node has at most two children, referred to as the left child and the right child.',
            explanation: 'Binary trees are fundamental data structures that provide an efficient way to store and search for data.',
            difficulty: 'beginner',
            category: 'Data Structures',
            subcategory: 'Trees'
          },
          {
            id: '2',
            question: 'What is the difference between Depth-First Search (DFS) and Breadth-First Search (BFS)?',
            answer: 'DFS explores as far as possible along each branch before backtracking, while BFS explores all neighbors at the present depth before moving to nodes at the next depth level.',
            explanation: 'Both are graph traversal algorithms with different approaches to exploring nodes.',
            difficulty: 'intermediate',
            category: 'Data Structures',
            subcategory: 'Graph Traversal'
          },
          {
            id: '3',
            question: 'Which of the following is NOT a valid tree traversal method?',
            options: ['Inorder', 'Preorder', 'Postorder', 'Linearorder'],
            answer: 'Linearorder',
            explanation: 'The valid tree traversal methods are Inorder (left, root, right), Preorder (root, left, right), and Postorder (left, right, root).',
            difficulty: 'intermediate',
            category: 'Data Structures',
            subcategory: 'Tree Traversal'
          },
          {
            id: '4',
            question: 'What data structure is commonly used to implement BFS?',
            options: ['Queue', 'Stack', 'Array', 'Linked List'],
            answer: 'Queue',
            explanation: 'BFS uses a queue (FIFO) to keep track of nodes to visit next, ensuring level-by-level traversal.',
            difficulty: 'beginner',
            category: 'Data Structures',
            subcategory: 'Graph Traversal'
          },
          {
            id: '5',
            question: 'What is a graph cycle?',
            answer: 'A graph cycle is a path in which the starting and ending vertices are the same, with no other vertices repeating.',
            explanation: 'Detecting cycles is important in many graph algorithms to avoid infinite loops during traversal.',
            difficulty: 'advanced',
            category: 'Data Structures',
            subcategory: 'Graphs'
          },
          {
            id: '6',
            question: 'What is the time complexity of DFS on an adjacency list representation?',
            options: ['O(V)', 'O(E)', 'O(V+E)', 'O(V*E)'],
            answer: 'O(V+E)',
            explanation: 'DFS visits each vertex once (O(V)) and traverses each edge once (O(E)), resulting in O(V+E) complexity for an adjacency list.',
            difficulty: 'advanced',
            category: 'Data Structures',
            subcategory: 'Graph Algorithms'
          },
          {
            id: '7',
            question: 'What is a binary search tree (BST)?',
            answer: 'A binary search tree is a binary tree where for each node, all elements in the left subtree are less than the node, and all elements in the right subtree are greater than the node.',
            explanation: 'BSTs provide efficient searching, insertion, and deletion operations when balanced.',
            difficulty: 'intermediate',
            category: 'Data Structures',
            subcategory: 'Trees'
          },
          {
            id: '8',
            question: 'Which of these graph traversal algorithms is guaranteed to find the shortest path in an unweighted graph?',
            options: ['DFS', 'BFS', 'Preorder Traversal', 'Postorder Traversal'],
            answer: 'BFS',
            explanation: 'BFS explores nodes level by level, ensuring the first time a node is discovered is via the shortest path from the source in an unweighted graph.',
            difficulty: 'intermediate',
            category: 'Data Structures',
            subcategory: 'Graph Traversal'
          }
        ]
      };
    }
    
    // Operating Systems lesson
    else if (lessonId === '2') {
      return {
        id: '2',
        title: 'Process Management',
        category: 'Operating Systems',
        progress: 0,
        duration: '40 minutes',
        nextLesson: 'Memory Management',
        description: 'Learn about process states, scheduling algorithms, and process synchronization.',
        flashcards: [
          {
            id: '1',
            question: 'What is a process in operating systems?',
            answer: 'A process is an instance of a program in execution. It includes the program code, current activity, and all the resources it needs.',
            explanation: 'Processes are the fundamental unit of work in an operating system.',
            difficulty: 'beginner',
            category: 'Operating Systems',
            subcategory: 'Process Concepts'
          },
          {
            id: '2',
            question: 'What are the main states of a process?',
            answer: 'The main states of a process are: New, Ready, Running, Waiting/Blocked, and Terminated.',
            explanation: 'Processes move between these states as they execute, wait for resources, or complete.',
            difficulty: 'intermediate',
            category: 'Operating Systems',
            subcategory: 'Process States'
          },
          {
            id: '3',
            question: 'Which of the following is NOT a CPU scheduling algorithm?',
            options: ['Round Robin', 'Shortest Job First', 'First Come First Served', 'Indexed Allocation'],
            answer: 'Indexed Allocation',
            explanation: 'Indexed Allocation is a file allocation method, not a CPU scheduling algorithm. The others are valid scheduling algorithms.',
            difficulty: 'intermediate',
            category: 'Operating Systems',
            subcategory: 'CPU Scheduling'
          },
          {
            id: '4',
            question: 'What is context switching?',
            answer: 'Context switching is the process of saving the state of a currently running process and loading the state of another process so that it can run.',
            explanation: 'Context switching allows multiple processes to share a single CPU by saving and restoring their execution contexts.',
            difficulty: 'intermediate',
            category: 'Operating Systems',
            subcategory: 'Process Management'
          },
          {
            id: '5',
            question: 'What is a deadlock in operating systems?',
            options: ['When a process is waiting for a resource indefinitely', 'When two processes are competing for CPU time', 'When a set of processes are blocked because each is holding resources needed by others', 'When a process consumes too much memory'],
            answer: 'When a set of processes are blocked because each is holding resources needed by others',
            explanation: 'Deadlock occurs when processes are unable to proceed because each is waiting for resources held by another process in the set.',
            difficulty: 'advanced',
            category: 'Operating Systems',
            subcategory: 'Process Synchronization'
          },
          {
            id: '6',
            question: 'What are the four necessary conditions for a deadlock to occur?',
            answer: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
            explanation: 'All four conditions must be present simultaneously for a deadlock to occur. Preventing any one of them can prevent deadlocks.',
            difficulty: 'advanced',
            category: 'Operating Systems',
            subcategory: 'Deadlocks'
          },
          {
            id: '7',
            question: 'What is a semaphore in operating systems?',
            answer: 'A semaphore is a synchronization tool that controls access to shared resources by multiple processes using a counter.',
            explanation: 'Semaphores can be binary (mutex) or counting, allowing controlled access to critical sections or resources.',
            difficulty: 'intermediate',
            category: 'Operating Systems',
            subcategory: 'Process Synchronization'
          },
          {
            id: '8',
            question: 'What is the difference between a thread and a process?',
            answer: 'A process is an independent program in execution with its own memory space, while threads are lighter-weight execution units that share the same memory space within a process.',
            explanation: 'Threads have less overhead than processes but require synchronization to avoid conflicts when accessing shared data.',
            difficulty: 'intermediate',
            category: 'Operating Systems',
            subcategory: 'Process Concepts'
          }
        ]
      };
    }
    
    // DBMS lesson
    else if (lessonId === '3') {
      return {
        id: '3',
        title: 'Relational Database Fundamentals',
        category: 'DBMS',
        progress: 0,
        duration: '50 minutes',
        nextLesson: 'SQL Advanced Queries',
        description: 'Learn about relational database concepts, normalization, and basic SQL operations.',
        flashcards: [
          {
            id: '1',
            question: 'What is a primary key in a relational database?',
            answer: 'A primary key is a column or a set of columns that uniquely identifies each row in a table.',
            explanation: 'Primary keys ensure row uniqueness and provide a way to reference specific records.',
            difficulty: 'beginner',
            category: 'DBMS',
            subcategory: 'Relational Model'
          },
          {
            id: '2',
            question: 'What is normalization in database design?',
            answer: 'Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.',
            explanation: 'It involves dividing larger tables into smaller ones and defining relationships between them.',
            difficulty: 'intermediate',
            category: 'DBMS',
            subcategory: 'Database Design'
          },
          {
            id: '3',
            question: 'Which normal form requires that all non-key attributes are fully functionally dependent on the primary key?',
            options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
            answer: 'Second Normal Form (2NF)',
            explanation: '2NF eliminates partial dependencies by requiring that all non-key attributes depend on the entire primary key.',
            difficulty: 'advanced',
            category: 'DBMS',
            subcategory: 'Normalization'
          },
          {
            id: '4',
            question: 'What is a transaction in database systems?',
            answer: 'A transaction is a sequence of operations performed as a single logical unit of work, which must exhibit ACID properties.',
            explanation: 'Transactions ensure data consistency and integrity even in the event of system failures.',
            difficulty: 'intermediate',
            category: 'DBMS',
            subcategory: 'Transactions'
          },
          {
            id: '5',
            question: 'What are the ACID properties of database transactions?',
            answer: 'Atomicity, Consistency, Isolation, and Durability.',
            explanation: 'ACID properties ensure that database transactions are processed reliably and maintain data integrity.',
            difficulty: 'intermediate',
            category: 'DBMS',
            subcategory: 'Transactions'
          },
          {
            id: '6',
            question: 'Which SQL command is used to retrieve data from a database?',
            options: ['UPDATE', 'INSERT', 'SELECT', 'DELETE'],
            answer: 'SELECT',
            explanation: 'The SELECT statement is used to query and retrieve data from one or more tables in a database.',
            difficulty: 'beginner',
            category: 'DBMS',
            subcategory: 'SQL'
          },
          {
            id: '7',
            question: 'What is the difference between a clustered and non-clustered index?',
            answer: 'A clustered index determines the physical order of data in a table, and a table can have only one. A non-clustered index creates a separate structure for indexing and doesn\'t affect the physical order of the table data.',
            explanation: 'Indexes improve query performance by providing faster access paths to data.',
            difficulty: 'advanced',
            category: 'DBMS',
            subcategory: 'Indexing'
          },
          {
            id: '8',
            question: 'What is the purpose of an ER diagram in database design?',
            answer: 'An Entity-Relationship (ER) diagram is a visual representation of the structure of a database, showing entities, attributes, and relationships between entities.',
            explanation: 'ER diagrams help in designing and communicating the logical structure of databases before implementation.',
            difficulty: 'beginner',
            category: 'DBMS',
            subcategory: 'Database Design'
          }
        ]
      };
    }
    
    // Computer Networks lesson
    else if (lessonId === '4') {
      return {
        id: '4',
        title: 'Network Protocols and Architecture',
        category: 'Computer Networks',
        progress: 0,
        duration: '45 minutes',
        nextLesson: 'Wireless Networks',
        description: 'Learn about the OSI model, TCP/IP, and fundamental networking protocols.',
        flashcards: [
          {
            id: '1',
            question: 'What is the OSI model?',
            answer: 'The OSI (Open Systems Interconnection) model is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven distinct layers.',
            explanation: 'The OSI model helps in understanding and designing network architecture and communication between different systems.',
            difficulty: 'beginner',
            category: 'Computer Networks',
            subcategory: 'Network Models'
          },
          {
            id: '2',
            question: 'Which layer of the OSI model is responsible for routing and forwarding packets?',
            options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
            answer: 'Network Layer',
            explanation: 'The Network Layer (Layer 3) handles logical addressing, routing, and forwarding of packets between different networks.',
            difficulty: 'intermediate',
            category: 'Computer Networks',
            subcategory: 'OSI Model'
          },
          {
            id: '3',
            question: 'What is the difference between TCP and UDP?',
            answer: 'TCP (Transmission Control Protocol) is connection-oriented, reliable, and guarantees delivery with error checking and flow control. UDP (User Datagram Protocol) is connectionless, unreliable, and provides no guarantees for delivery, sequencing, or error checking.',
            explanation: 'TCP is used when reliability is critical (like web browsing), while UDP is preferred for time-sensitive applications where some data loss is acceptable (like streaming video).',
            difficulty: 'intermediate',
            category: 'Computer Networks',
            subcategory: 'Transport Protocols'
          },
          {
            id: '4',
            question: 'What is the purpose of the IP protocol?',
            answer: 'The Internet Protocol (IP) is responsible for addressing and routing packets of data so that they can travel across networks and arrive at the correct destination.',
            explanation: 'IP operates at the Network Layer and provides the foundation for internet communication.',
            difficulty: 'beginner',
            category: 'Computer Networks',
            subcategory: 'Internet Protocols'
          },
          {
            id: '5',
            question: 'What is a subnet mask and what is its purpose?',
            answer: 'A subnet mask is a 32-bit number that masks an IP address, dividing it into network address and host address parts. It determines which portion of an IP address refers to the network and which refers to the host.',
            explanation: 'Subnet masks help in network organization, security, and efficient IP address allocation.',
            difficulty: 'intermediate',
            category: 'Computer Networks',
            subcategory: 'IP Addressing'
          },
          {
            id: '6',
            question: 'What is a DNS server and what is its primary function?',
            answer: 'A Domain Name System (DNS) server translates domain names (like example.com) into IP addresses that computers use to identify each other.',
            explanation: 'DNS servers eliminate the need for humans to memorize numeric IP addresses, allowing us to use human-readable domain names instead.',
            difficulty: 'beginner',
            category: 'Computer Networks',
            subcategory: 'Network Services'
          },
          {
            id: '7',
            question: 'What is a firewall and what is its primary purpose?',
            answer: 'A firewall is a network security device or software that monitors and filters incoming and outgoing network traffic based on an organization\'s security policies.',
            explanation: 'Firewalls act as a barrier between a trusted internal network and untrusted external networks, helping to protect against unauthorized access.',
            difficulty: 'intermediate',
            category: 'Computer Networks',
            subcategory: 'Network Security'
          },
          {
            id: '8',
            question: 'What is the purpose of ICMP protocol?',
            answer: 'The Internet Control Message Protocol (ICMP) is used for diagnostic and error reporting functions in IP networks. It helps troubleshoot network connectivity issues.',
            explanation: 'ICMP is the protocol behind the ping command, which tests if a host is reachable across a network.',
            difficulty: 'intermediate',
            category: 'Computer Networks',
            subcategory: 'Internet Protocols'
          }
        ]
      };
    }
    
    // Default fallback lesson with empty flashcards
    return {
      id: lessonId,
      title: "Unknown Lesson",
      category: "Miscellaneous",
      progress: 0,
      duration: "30 minutes",
      description: "This lesson could not be found",
      flashcards: []
    };
  }

  async getNextLesson(currentLessonId: string): Promise<any> {
    const currentLesson = await this.getLessonById(currentLessonId);
    if (!currentLesson) return null;
    
    // In a real app, this would fetch the next lesson in sequence
    return {
      id: '2',
      title: currentLesson.nextLesson,
      category: currentLesson.category,
      progress: 0,
      duration: '45 minutes',
      nextLesson: 'Dynamic Programming Basics'
    };
  }

  async submitLessonCompletion(userId: number, lessonId: string, score: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const lesson = await this.getLessonById(lessonId);
    if (!lesson) return false;
    
    // In a real app, this would store the lesson completion in the database
    // Add to profile activity
    const newActivity = {
      id: String(this.profileActivity.length + 1),
      type: 'lesson',
      title: `Completed ${lesson.title}`,
      description: `Finished the lesson on ${lesson.title} with a score of ${score}%`,
      xp: 30,
      score,
      date: 'Today'
    };
    
    this.profileActivity.unshift(newActivity);
    
    return true;
  }
}

export const storage = new MemStorage();
