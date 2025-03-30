import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  readinessScore: integer("readiness_score").default(0),
  level: text("level").default("Beginner"),
  badges: integer("badges").default(0),
  notifications: integer("notifications").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning paths table
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  progress: integer("progress").default(0),
  currentLesson: text("current_lesson"),
  color: text("color").default("primary"),
  buttonColor: text("button_color").default("primary"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(),
});

// Lessons table
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().default("Beginner"),
  order: integer("order").notNull(),
  pathId: integer("path_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // timed, code, interview
  difficulty: text("difficulty").notNull(),
  xp: integer("xp").notNull(),
  timeLimit: integer("time_limit").notNull(), // in seconds
  content: json("content").notNull(), // questions, tests, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Flashcards table
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id"),
  challengeId: integer("challenge_id"),
  flashcardId: integer("flashcard_id"),
  completed: boolean("completed").default(false),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily goals table
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  completed: integer("completed").default(0),
  total: integer("total").notNull(),
  isCompleted: boolean("is_completed").default(false),
  date: timestamp("date").defaultNow(),
});

// AI Recommendations table
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // weak_area, needs_practice, almost_mastered
  cta: text("cta").notNull(), // call to action
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboard entries
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  xp: integer("xp").notNull(),
  streak: integer("streak").notNull(),
  badges: integer("badges").notNull(),
  rank: integer("rank").notNull(),
  period: text("period").notNull(), // weekly, monthly, alltime
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true, createdAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true, createdAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, createdAt: true });
export const insertDailyGoalSchema = createInsertSchema(dailyGoals).omit({ id: true, date: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ id: true, createdAt: true });

// Select types
export type User = typeof users.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type DailyGoal = typeof dailyGoals.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;
