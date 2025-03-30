import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, BookOpen, Award, Users, Flame, Zap } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/queryClient';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  readinessScore: string;
  badges: number;
  level: string;
  notifications: number;
};

export default function Navbar() {
  const [location] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiGet<User>('/api/user');
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isMobile) return null;

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo area */}
          <div className="flex items-center space-x-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-primary">
              <path 
                d="M12 2L2 7L12 12L22 7L12 2Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M2 17L12 22L22 17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M2 12L12 17L22 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-extrabold text-primary">CodeQuest</span>
          </div>
          
          {/* Main Nav Items - Desktop */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className={`flex flex-col items-center py-2 px-3 rounded-md font-bold ${
                location === '/' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-primary'
              }`}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </a>
            </Link>
            <Link href="/lessons">
              <a className={`flex flex-col items-center py-2 px-3 rounded-md font-medium ${
                location === '/lessons' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-primary'
              }`}>
                <BookOpen className="w-5 h-5" />
                <span>Lessons</span>
              </a>
            </Link>
            <Link href="/challenges">
              <a className={`flex flex-col items-center py-2 px-3 rounded-md font-medium ${
                location === '/challenges' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-primary'
              }`}>
                <Award className="w-5 h-5" />
                <span>Challenges</span>
              </a>
            </Link>
            <Link href="/leaderboard">
              <a className={`flex flex-col items-center py-2 px-3 rounded-md font-medium ${
                location === '/leaderboard' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:text-primary'
              }`}>
                <Users className="w-5 h-5" />
                <span>Leaderboard</span>
              </a>
            </Link>
          </div>
          
          {/* User area */}
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="w-24 h-10 animate-pulse bg-gray-200 rounded-full"></div>
            ) : (
              <>
                {/* Streak */}
                <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
                  <Flame className="w-5 h-5 text-red-500 mr-1" />
                  <span className="text-sm font-bold text-gray-800">{user?.streak || 0}</span>
                </div>
                
                {/* XP */}
                <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
                  <Zap className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="text-sm font-bold text-gray-800">{user?.xp || 0} XP</span>
                </div>
                
                {/* Avatar */}
                <Link href="/profile">
                  <a className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer">
                      <AvatarImage src={user?.avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"} alt="User Avatar" />
                      <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    {user?.notifications && user?.notifications > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user?.notifications}
                      </div>
                    )}
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
