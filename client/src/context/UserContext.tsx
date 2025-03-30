import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await apiGet<User>('/api/user');
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data", error);
        // Provide default user for development
        setUser({
          id: '1',
          firstName: 'Sarah',
          lastName: 'Williams',
          avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
          xp: 1240,
          streak: 12,
          readinessScore: '72%',
          badges: 9,
          level: 'Intermediate',
          notifications: 3
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
