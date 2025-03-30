import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { 
  generateRecommendations, 
  getSimplifiedExplanation, 
  generateMockInterviewQuestion, 
  analyzeUserAnswer,
  generateFunFact
} from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      // Get user from storage instead of using a hardcoded object
      // Using userId 1 for demo purposes
      const userId = 1;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Format the user data for the frontend
      const userData = {
        id: String(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        streak: user.streak,
        readinessScore: user.readinessScore ? `${user.readinessScore}%` : "0%",
        badges: user.badges,
        level: user.level,
        notifications: user.notifications
      };
      
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // User progress update
  app.post("/api/user/progress", async (req, res) => {
    try {
      const { userId, lessonId, progress } = req.body;
      
      if (!userId || !lessonId || progress === undefined) {
        return res.status(400).json({ message: "userId, lessonId, and progress are required" });
      }
      
      const success = await storage.updateUserProgress(Number(userId), lessonId, progress);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "User or lesson not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update user XP
  app.post("/api/user/xp", async (req, res) => {
    try {
      const { userId, xp } = req.body;
      
      if (!userId || xp === undefined) {
        return res.status(400).json({ message: "userId and xp are required" });
      }
      
      const success = await storage.updateUserXP(Number(userId), xp);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update user streak
  app.post("/api/user/streak", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const success = await storage.updateUserStreak(Number(userId));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user badges
  app.get("/api/user/badges/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Learning paths routes
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const learningPaths = await storage.getLearningPaths();
      res.json(learningPaths);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });
  
  app.get("/api/learning-paths/:pathId", async (req, res) => {
    try {
      const { pathId } = req.params;
      
      if (!pathId) {
        return res.status(400).json({ message: "Path ID is required" });
      }
      
      const learningPath = await storage.getLearningPathById(pathId);
      
      if (!learningPath) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      res.json(learningPath);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning path" });
    }
  });

  // Daily goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getDailyGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily goals" });
    }
  });
  
  app.post("/api/goals/:goalId/update", async (req, res) => {
    try {
      const { goalId } = req.params;
      const { progress } = req.body;
      
      if (!goalId || progress === undefined) {
        return res.status(400).json({ message: "Goal ID and progress are required" });
      }
      
      const success = await storage.updateDailyGoal(goalId, progress);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Recommendations routes
  app.get("/api/recommendations", async (req, res) => {
    try {
      // Get stored recommendations first
      let recommendations = await storage.getRecommendations();
      
      // If AI-powered recommendations are requested
      if (req.query.ai === 'true') {
        try {
          // Get user performance to generate personalized recommendations
          const profileStats = await storage.getProfileStats();
          const aiRecommendations = await generateRecommendations(profileStats);
          
          if (aiRecommendations && aiRecommendations.length > 0) {
            recommendations = aiRecommendations;
          }
        } catch (aiError) {
          console.error("Error generating AI recommendations:", aiError);
          // Fall back to stored recommendations if AI generation fails
        }
      }
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Challenges routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });
  
  // IMPORTANT: Specific routes must come before parameterized routes
  app.get("/api/challenges/daily", async (req, res) => {
    try {
      const dailyChallenges = await storage.getDailyChallenges();
      res.json(dailyChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily challenges" });
    }
  });
  
  app.get("/api/challenges/:challengeId", async (req, res) => {
    try {
      const { challengeId } = req.params;
      
      if (!challengeId) {
        return res.status(400).json({ message: "Challenge ID is required" });
      }
      
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });
  
  app.post("/api/challenges/:challengeId/submit", async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { userId, score } = req.body;
      
      if (!challengeId || !userId || score === undefined) {
        return res.status(400).json({ message: "Challenge ID, user ID and score are required" });
      }
      
      const success = await storage.submitChallengeResult(Number(userId), challengeId, score);
      
      if (success) {
        // Get the challenge to calculate XP
        const challenge = await storage.getChallengeById(challengeId);
        if (!challenge) {
          return res.status(404).json({ message: "Challenge not found" });
        }
        
        // Calculate earned XP based on score percentage
        const maxPossibleXP = challenge.xp;
        const earnedXP = Math.round((score / 100) * maxPossibleXP);
        
        // Determine performance rating based on score
        let performance = "Needs Improvement";
        if (score >= 90) {
          performance = "Excellent";
        } else if (score >= 70) {
          performance = "Good";
        } else if (score >= 50) {
          performance = "Average";
        }
        
        // Generate feedback message
        let feedbackMessage = "You need more practice with this type of challenge.";
        if (score >= 90) {
          feedbackMessage = "Outstanding work! You've mastered this challenge.";
        } else if (score >= 70) {
          feedbackMessage = "Good job! You've shown solid understanding.";
        } else if (score >= 50) {
          feedbackMessage = "You're making progress! Keep practicing.";
        }
        
        // Update user's total XP
        const user = await storage.getUser(Number(userId));
        const newTotalXP = (user?.xp || 0) + earnedXP;
        await storage.updateUserXP(Number(userId), newTotalXP);
        
        res.json({
          success: true,
          earnedXP,
          maxPossibleXP,
          performance,
          feedbackMessage,
          xp: newTotalXP
        });
      } else {
        res.status(404).json({ message: "Challenge or user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to submit challenge result" });
    }
  });

  // Flashcards routes
  app.get("/api/flashcards/daily", async (req, res) => {
    try {
      const dailyFlashcards = await storage.getDailyFlashcards();
      res.json(dailyFlashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily flashcards" });
    }
  });
  
  app.get("/api/flashcards/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }
      
      const flashcards = await storage.getFlashcardsByCategory(category);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards by category" });
    }
  });
  
  app.post("/api/flashcards/:flashcardId/submit", async (req, res) => {
    try {
      const { flashcardId } = req.params;
      const { userId, isCorrect } = req.body;
      
      if (!flashcardId || !userId || isCorrect === undefined) {
        return res.status(400).json({ message: "Flashcard ID, user ID and isCorrect are required" });
      }
      
      const success = await storage.submitFlashcardResponse(Number(userId), flashcardId, isCorrect);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Flashcard or user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to submit flashcard response" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard/top", async (req, res) => {
    try {
      const topUsers = await storage.getTopLeaderboard();
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard/weekly", async (req, res) => {
    try {
      const weeklyLeaderboard = await storage.getWeeklyLeaderboard();
      res.json(weeklyLeaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly leaderboard" });
    }
  });

  // Profile routes
  app.get("/api/profile/stats", async (req, res) => {
    try {
      const profileStats = await storage.getProfileStats();
      res.json(profileStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile stats" });
    }
  });

  app.get("/api/profile/activity", async (req, res) => {
    try {
      const activityData = await storage.getProfileActivity();
      res.json(activityData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile activity" });
    }
  });

  // Lessons routes
  app.get("/api/lessons/categories", async (req, res) => {
    try {
      const lessonCategories = await storage.getLessonCategories();
      res.json(lessonCategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson categories" });
    }
  });

  app.get("/api/lessons/active", async (req, res) => {
    try {
      const activeLesson = await storage.getActiveLesson();
      res.json(activeLesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active lesson" });
    }
  });
  
  app.get("/api/lessons/:lessonId", async (req, res) => {
    try {
      const { lessonId } = req.params;
      
      if (!lessonId) {
        return res.status(400).json({ message: "Lesson ID is required" });
      }
      
      const lesson = await storage.getLessonById(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });
  
  app.get("/api/lessons/:lessonId/next", async (req, res) => {
    try {
      const { lessonId } = req.params;
      
      if (!lessonId) {
        return res.status(400).json({ message: "Lesson ID is required" });
      }
      
      const nextLesson = await storage.getNextLesson(lessonId);
      
      if (!nextLesson) {
        return res.status(404).json({ message: "Next lesson not found" });
      }
      
      res.json(nextLesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch next lesson" });
    }
  });
  
  app.post("/api/lessons/:lessonId/complete", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const { userId, score } = req.body;
      
      if (!lessonId || !userId || score === undefined) {
        return res.status(400).json({ message: "Lesson ID, user ID and score are required" });
      }
      
      const success = await storage.submitLessonCompletion(Number(userId), lessonId, score);
      
      if (success) {
        // Update user XP
        await storage.updateUserXP(Number(userId), 30);
        // Update user streak
        await storage.updateUserStreak(Number(userId));
        
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Lesson or user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to complete lesson" });
    }
  });

  // AI-powered assistance routes
  
  // Simplify concept for confused students
  app.post("/api/ai/simplify", async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const simplifiedExplanation = await getSimplifiedExplanation(topic);
      res.json({ explanation: simplifiedExplanation });
    } catch (error) {
      console.error("Error simplifying concept:", error);
      res.status(500).json({ message: "Failed to simplify concept" });
    }
  });
  
  // Generate fun fact for bored students
  app.get("/api/ai/fun-fact", async (req, res) => {
    try {
      const funFact = await generateFunFact();
      res.json({ funFact });
    } catch (error) {
      console.error("Error generating fun fact:", error);
      res.status(500).json({ message: "Failed to generate fun fact" });
    }
  });
  
  // Generate mock interview question
  app.post("/api/ai/interview-question", async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const interviewQuestion = await generateMockInterviewQuestion(topic);
      res.json(interviewQuestion);
    } catch (error) {
      console.error("Error generating interview question:", error);
      res.status(500).json({ message: "Failed to generate interview question" });
    }
  });
  
  // Analyze student's answer to an interview question
  app.post("/api/ai/analyze-answer", async (req, res) => {
    try {
      const { question, answer } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer are required" });
      }
      
      const analysis = await analyzeUserAnswer(question, answer);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing answer:", error);
      res.status(500).json({ message: "Failed to analyze answer" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
