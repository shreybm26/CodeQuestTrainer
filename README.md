# CodeQuest: AI-Powered Gamified CS Placement Trainer

CodeQuest is an interactive web application designed to help computer science students prepare for job interviews and technical assessments in a gamified, engaging environment. Inspired by the learning approach of platforms like Duolingo, CodeQuest combines educational content with game-like elements to make learning more enjoyable and effective.

![CodeQuest Logo](https://example.com/logo.png)

## 🌟 Features

### User Experience
- **Personalized Dashboard**: Track your progress, goals, and recommendations
- **Emotion Detection**: AI-powered system that detects when you're confused or bored and offers tailored assistance
- **Interactive Challenges**: Various types of technical challenges including:
  - Timed quizzes
  - Coding challenges with real-time feedback
  - Mock technical interviews
- **Flashcards**: Spaced repetition learning for key computer science concepts
- **Leaderboards**: Compete with peers and track your performance

### Technical Challenges
- **Speed Code Sprint**: LeetCode-style coding environment with test cases and live feedback
- **Timer Bomb**: Time-pressured challenges to improve quick problem-solving
- **Mock Interviews**: AI-powered interview simulator that analyzes your answers

### Progress Tracking
- **XP System**: Earn points for completing challenges and maintaining streaks
- **Performance Analytics**: Track your strengths and weaknesses
- **Adaptive Learning**: Difficulty adjusts based on your performance

## 🛠️ Technology Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TailwindCSS for styling
- Framer Motion for animations
- TanStack Query for data fetching

### Backend
- Node.js
- Express
- In-memory storage (could be replaced with a real database in production)

### Key Components
- WebcamEmotionTracker: Monitors user engagement and emotional state
- CodeEditor: Custom IDE for coding challenges
- InactivityDetector: Monitors user activity to provide timely assistance

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/codequest.git
cd codequest
```

2. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file and add your OpenAI API key
# OPENAI_API_KEY=your_key_here
```

3. Install dependencies:
```bash
npm install
# or
yarn install
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## 🎮 How to Use

### Dashboard
The dashboard is your home base, showing:
- Daily goals and progress
- Personalized AI recommendations
- Current learning paths
- Daily challenges and flashcards

### Challenges
1. Navigate to the Challenges page
2. Select a challenge type (timed, coding, or interview)
3. Read the instructions and begin
4. Receive feedback and XP upon completion

### Flashcards
1. Access daily flashcards from the dashboard
2. Rate cards as "Easy" or "Difficult" to customize your learning
3. Complete flashcard sets to earn XP and badges

### Emotion Detection
- The application monitors your engagement using webcam-based emotion detection
- When it detects confusion or boredom, it offers:
  - Simplified explanations for confusing topics
  - Fun facts and challenges when bored
- This feature requires webcam access (optional)

## 🧩 Project Structure

```
codequest/
├── client/               # Frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── main.tsx      # Application entry point
│   └── index.html        # HTML template
├── server/               # Backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # In-memory data storage
├── theme.json           # Theme configuration
└── package.json         # Project dependencies
```

## 📝 Development Notes

### Emotion Detection
The emotion detection uses a combination of:
- Inactivity detection (30-second timeout by default)
- Webcam-based emotion detection (requires permission)
- The current implementation includes mock behavior for demonstration

### Adding New Challenges
To add new challenges, modify the `server/storage.ts` file to include new challenge objects with appropriate content.

## 🚀 Deployment to Vercel

### Setting Up
1. Push your repository to GitHub
2. Create a new project on Vercel and connect to your GitHub repository
3. Configure environment variables in Vercel:
   - Go to Settings > Environment Variables
   - Add your `OPENAI_API_KEY` 
   - Add any other required environment variables
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Deploy!

### Important Notes
- The OpenAI API key is required for AI features to work
- Make sure your `.env` file is in `.gitignore` to avoid exposing secrets
- For production deployments, consider using a real database instead of in-memory storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Inspired by learning platforms like Duolingo, LeetCode, and HackerRank
- Uses TailwindCSS components with shadcn/ui 