import { Link, useLocation } from 'wouter';
import { Home, BookOpen, Award, Users, User } from 'lucide-react';

export default function MobileNavbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-md fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-2 ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/lessons">
          <a className={`flex flex-col items-center py-2 ${location === '/lessons' ? 'text-primary' : 'text-gray-500'}`}>
            <BookOpen className="w-5 h-5" />
            <span className="text-xs mt-1">Lessons</span>
          </a>
        </Link>
        <Link href="/challenges">
          <a className={`flex flex-col items-center py-2 ${location === '/challenges' ? 'text-primary' : 'text-gray-500'}`}>
            <Award className="w-5 h-5" />
            <span className="text-xs mt-1">Challenges</span>
          </a>
        </Link>
        <Link href="/leaderboard">
          <a className={`flex flex-col items-center py-2 ${location === '/leaderboard' ? 'text-primary' : 'text-gray-500'}`}>
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1">Leaderboard</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 ${location === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
