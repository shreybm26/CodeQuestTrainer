import { Card, CardContent } from '@/components/ui/card';
import { Target, Flame } from 'lucide-react';
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

export default function WelcomeSection() {
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

  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">
            Welcome back, <span className="text-primary">
              {isLoading ? 
                <span className="inline-block w-24 h-8 bg-gray-200 animate-pulse rounded"></span> : 
                user?.firstName || 'User'}
            </span>!
          </h1>
          <p className="text-gray-500">Continue your learning journey today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-6">
          {/* Readiness Score */}
          <Card className="bg-white rounded-lg p-4 shadow-md flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Placement Readiness</p>
              {isLoading ? (
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-xl font-bold text-gray-800">{user?.readinessScore || '0%'}</p>
              )}
            </div>
          </Card>
          
          {/* Current Streak */}
          <Card className="bg-white rounded-lg p-4 shadow-md flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Streak</p>
              {isLoading ? (
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-xl font-bold text-gray-800">{user?.streak || 0} days</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
