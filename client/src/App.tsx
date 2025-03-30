import { Switch, Route } from "wouter";
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

function Router() {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 pb-16 md:pb-6">
        <Router />
      </main>
      {isMobile && <MobileNavbar />}
      <Toaster />
    </div>
  );
}

export default App;
