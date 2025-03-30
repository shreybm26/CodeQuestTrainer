import express from 'express';
import { storage } from '../server/storage.js';

const app = express();
app.use(express.json());

// Define API routes
app.get('/api/user', async (req, res) => {
  try {
    const userId = 1;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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

app.get('/api/challenges', async (req, res) => {
  try {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
});

// Export the handler
export default app; 