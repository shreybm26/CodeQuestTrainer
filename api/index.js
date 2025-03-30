// This is a simple API handler for Vercel serverless functions
// It provides mock data responses for development purposes

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the API route from the URL path
  const { url } = req;
  const route = url.replace(/^\/api\//, '').split('?')[0];

  console.log(`API request to: ${route}`);

  try {
    // Route the request to the appropriate handler
    if (route === 'user' || route === 'user/') {
      return handleUserRequest(req, res);
    } else if (route.startsWith('challenges')) {
      return handleChallengesRequest(req, res);
    } else if (route.startsWith('lessons')) {
      return handleLessonsRequest(req, res);
    } else if (route.startsWith('goals')) {
      return handleGoalsRequest(req, res);
    } else if (route.startsWith('recommendations')) {
      return handleRecommendationsRequest(req, res);
    } else if (route.startsWith('leaderboard')) {
      return handleLeaderboardRequest(req, res);
    } else if (route.startsWith('learning-paths')) {
      return handleLearningPathsRequest(req, res);
    } else {
      // Return 404 for unknown routes
      return res.status(404).json({ error: `API route '${route}' not found` });
    }
  } catch (error) {
    console.error(`Error handling request to ${route}:`, error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Handler functions for different API routes

function handleUserRequest(req, res) {
  const userData = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Williams',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    xp: 1240,
    streak: 12,
    readinessScore: '72%',
    badges: 9,
    level: 'Intermediate',
    notifications: 3
  };
  
  return res.status(200).json(userData);
}

function handleChallengesRequest(req, res) {
  // Extract the specific challenges endpoint
  const path = req.url.replace(/^\/api\/challenges\/?/, '').split('?')[0];
  
  if (path === 'daily' || path === '') {
    return res.status(200).json([
      {
        id: '1',
        title: 'Timer Bomb Challenge',
        description: 'Answer 10 quick MCQs before time runs out!',
        xp: 20,
        difficulty: 'Medium',
        type: 'timed',
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
    ]);
  } else if (/^\d+$/.test(path)) {
    // Handle specific challenge ID request
    return res.status(200).json({
      id: path,
      title: 'Algorithm Challenge',
      description: 'Implement a sorting algorithm from scratch',
      instructions: 'Your task is to implement a sorting algorithm from scratch.',
      difficulty: 'Medium',
      points: 50,
      timeLimit: 30, // minutes
      content: "# Sorting Algorithm Challenge\n\nImplement a sorting algorithm that sorts an array of integers in ascending order.\n\n## Requirements\n\n- Do not use built-in sort functions\n- Your solution should have O(n log n) time complexity or better\n- Handle edge cases such as empty arrays\n\n## Example\n\nInput: [5, 3, 8, 1, 2]\nOutput: [1, 2, 3, 5, 8]"
    });
  } else {
    return res.status(404).json({ error: 'Challenge not found' });
  }
}

function handleLessonsRequest(req, res) {
  // Extract the specific lessons endpoint
  const path = req.url.replace(/^\/api\/lessons\/?/, '').split('?')[0];
  
  if (path === '' || path === 'active') {
    return res.status(200).json([
      {
        id: '1',
        title: 'Sorting Algorithms',
        category: 'Data Structures & Algorithms',
        progress: 75,
        description: 'Learn about the most commonly used sorting algorithms',
        totalConcepts: 8,
        completedConcepts: 6,
        imageBg: 'bg-blue-100',
        pathColor: 'text-blue-500'
      },
      {
        id: '2',
        title: 'Memory Management',
        category: 'Operating Systems',
        progress: 30,
        description: 'Understanding how memory allocation works',
        totalConcepts: 10,
        completedConcepts: 3,
        imageBg: 'bg-purple-100',
        pathColor: 'text-purple-500'
      },
      {
        id: '3',
        title: 'Database Indexing',
        category: 'Databases',
        progress: 0,
        description: 'Learn how database indexes improve performance',
        totalConcepts: 6,
        completedConcepts: 0,
        imageBg: 'bg-green-100',
        pathColor: 'text-green-500'
      }
    ]);
  } else if (/^\d+$/.test(path)) {
    // Handle specific lesson ID request
    return res.status(200).json({
      id: path,
      title: 'Sorting Algorithms',
      category: 'Data Structures & Algorithms',
      description: 'Learn about the most commonly used sorting algorithms',
      cards: [
        { id: '1', question: 'What is the time complexity of Quicksort in the average case?', answer: 'O(n log n)' },
        { id: '2', question: 'What is the time complexity of Bubble Sort?', answer: 'O(n²)' },
        { id: '3', question: 'Which sorting algorithm is stable by default?', answer: 'Merge Sort' }
      ]
    });
  } else {
    return res.status(404).json({ error: 'Lesson not found' });
  }
}

function handleGoalsRequest(req, res) {
  return res.status(200).json([
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
  ]);
}

function handleRecommendationsRequest(req, res) {
  return res.status(200).json([
    {
      id: '1',
      title: 'Time Complexity',
      type: 'concept',
      description: 'Review Big O notation and algorithm efficiency',
      cta: 'Review Concept'
    },
    {
      id: '2',
      title: 'Binary Trees',
      type: 'practice',
      description: 'Your binary tree traversal needs practice',
      cta: 'Start Practice'
    },
    {
      id: '3',
      title: 'Memory Management',
      type: 'concept',
      description: 'Recommended based on your career goals',
      cta: 'Start Learning'
    }
  ]);
}

function handleLeaderboardRequest(req, res) {
  return res.status(200).json([
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
  ]);
}

function handleLearningPathsRequest(req, res) {
  return res.status(200).json([
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
  ]);
} 