import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  // A simple function to ensure the API is working
  res.status(200).json({
    message: 'CodeQuest API is running!',
    routes: [
      '/api/user',
      '/api/learning-paths',
      '/api/goals',
      '/api/recommendations',
      '/api/challenges',
      '/api/challenges/daily',
      '/api/flashcards/daily'
    ]
  });
} 