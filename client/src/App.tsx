import { Switch, Route, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Lessons from "@/pages/Lessons";
import LessonFlashcard from "@/pages/LessonFlashcard";
import AdaptiveLessonQuiz from "@/pages/AdaptiveLessonQuiz";
import Challenges from "@/pages/Challenges";
import ChallengeDetail from "@/pages/ChallengeDetail";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Navbar from "@/components/layout/Navbar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useVercelFriendlyLocation } from "@/lib/router";
import { queryClient } from "@/lib/queryClient";

// Error boundary for API data handling
function setupGlobalErrorHandling() {
  // Add global error handler for potential "o.map is not a function" errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    if (error && error.message && error.message.includes('.map is not a function')) {
      console.error('Array map error detected. This usually happens when API response is not an array as expected.');
      // Optionally reset the query client cache to force refetches
      queryClient.clear();
    }
  });
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/lessons" component={Lessons} />
      <Route path="/lessons/:lessonId" component={LessonFlashcard} />
      <Route path="/lessons/:lessonId/adaptive" component={AdaptiveLessonQuiz} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/challenges/:id" component={ChallengeDetail} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Setup global error handling for API response type issues
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <WouterRouter hook={useVercelFriendlyLocation}>
        <Navbar />
        <main className="flex-grow pt-20 pb-16 md:pb-6">
          <AppRouter />
        </main>
        {isMobile && <MobileNavbar />}
        <Toaster />
      </WouterRouter>
    </div>
  );
}

export default App;
