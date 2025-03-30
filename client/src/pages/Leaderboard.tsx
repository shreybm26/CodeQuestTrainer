import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flame, Zap, Award } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function Leaderboard() {
  const { user } = useUser();
  
  const { data: leaderboardUsers, isLoading } = useQuery({
    queryKey: ['/api/leaderboard/weekly'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-textDark">Leaderboard</h1>
        <div className="flex items-center space-x-3">
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

      {/* Top 3 Users Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Second Place */}
        <Card className="text-center relative pt-8 md:pt-12 bg-gradient-to-b from-gray-100 to-white">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">2</div>
          <CardContent>
            <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-gray-400">
              <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg">Sarah Williams</h3>
            <p className="text-muted-foreground mb-2">CS Junior</p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-bold">2,850 XP</span>
              </div>
              <div className="flex items-center">
                <Flame className="w-4 h-4 text-red-500 mr-1" />
                <span>12 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* First Place */}
        <Card className="text-center relative pt-8 md:pt-12 bg-gradient-to-b from-yellow-100 to-white border-2 border-yellow-400">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold">1</div>
          <CardContent>
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-yellow-400">
              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-xl">Alex Johnson</h3>
            <p className="text-muted-foreground mb-2">CS Senior</p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="font-bold text-lg text-primary">3,240 XP</span>
              </div>
              <div className="flex items-center">
                <Flame className="w-5 h-5 text-red-500 mr-1" />
                <span className="text-lg">24 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Place */}
        <Card className="text-center relative pt-8 md:pt-12 bg-gradient-to-b from-amber-100 to-white">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">3</div>
          <CardContent>
            <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-amber-700">
              <AvatarImage src="https://randomuser.me/api/portraits/men/45.jpg" alt="User" />
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg">Mike Chen</h3>
            <p className="text-muted-foreground mb-2">CS Senior</p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-bold">2,640 XP</span>
              </div>
              <div className="flex items-center">
                <Flame className="w-4 h-4 text-red-500 mr-1" />
                <span>8 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">XP Earned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {leaderboardUsers?.map((user, index) => (
                  <tr key={index} className={index === 0 ? "bg-yellow-50" : ""}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs ${
                        index === 0 ? "bg-yellow-400" : 
                        index === 1 ? "bg-gray-400" : 
                        index === 2 ? "bg-amber-700" : "bg-gray-200 text-gray-700"
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.title}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
