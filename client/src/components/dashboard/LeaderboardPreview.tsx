import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Flame, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

export default function LeaderboardPreview() {
  const { data: leaderboardUsers, isLoading } = useQuery({
    queryKey: ['/api/leaderboard/top'],
  });

  // Default users if none are fetched
  const defaultUsers = [
    {
      id: '1',
      name: 'Alex Johnson',
      title: 'CS Senior',
      xp: '3,240',
      streak: 24,
      badges: 12,
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      rank: 1
    },
    {
      id: '2',
      name: 'Sarah Williams',
      title: 'CS Junior',
      xp: '2,850',
      streak: 12,
      badges: 9,
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      rank: 2
    },
    {
      id: '3',
      name: 'Mike Chen',
      title: 'CS Senior',
      xp: '2,640',
      streak: 8,
      badges: 7,
      avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
      rank: 3
    },
    {
      id: '4',
      name: 'Priya Sharma',
      title: 'CS Sophomore',
      xp: '2,210',
      streak: 5,
      badges: 5,
      avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      rank: 4
    }
  ];

  const users = leaderboardUsers || defaultUsers;

  return (
    <section className="mb-8">
      <Card className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
          <div className="flex items-center">
            <Select defaultValue="week">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="alltime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP Earned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={user.rank === 1 ? "bg-yellow-50" : ""}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs ${
                      user.rank === 1 ? "bg-yellow-400" : 
                      user.rank === 2 ? "bg-gray-400" : 
                      user.rank === 3 ? "bg-amber-700" : 
                      "bg-gray-300 text-gray-700"
                    }`}>
                      {user.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-primary">{user.xp} XP</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Flame className="w-4 h-4 text-red-500 mr-1" />
                      <span>{user.streak} days</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white">{user.badges}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Link href="/leaderboard">
            <Button variant="link" className="text-primary font-bold text-sm flex items-center">
              View Complete Leaderboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
