import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Flame, Zap, Target, Award, BookOpen, Clock, BarChart as BarChartIcon } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function Profile() {
  const { user } = useUser();
  
  const { data: profileStats, isLoading } = useQuery({
    queryKey: ['/api/profile/stats'],
  });

  const { data: activityData } = useQuery({
    queryKey: ['/api/profile/activity'],
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

  // Colors for charts
  const COLORS = ['#58CC02', '#FFC800', '#FF4B4B', '#4B4B4B'];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
            
            <div className="flex-grow">
              <h1 className="text-2xl font-bold mb-1">Sarah Williams</h1>
              <p className="text-muted-foreground mb-3">CS Junior · Joined 4 months ago</p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
                  <Flame className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm font-bold">12 day streak</span>
                </div>
                
                <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
                  <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-bold">1,240 XP</span>
                </div>
                
                <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
                  <Target className="w-4 h-4 text-primary mr-1" />
                  <span className="text-sm font-bold">72% Ready</span>
                </div>
                
                <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
                  <Award className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-bold">9 Badges</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="stats">
        <TabsList className="mb-6">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-6">
          {/* Overall Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Readiness</CardTitle>
              <CardDescription>Your overall progress toward placement readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4 text-center">
                    <h3 className="text-3xl font-bold text-primary mb-1">72%</h3>
                    <p className="text-sm text-muted-foreground">Overall Placement Readiness</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Data Structures & Algorithms</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Operating Systems</span>
                        <span className="text-sm text-muted-foreground">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Database Management</span>
                        <span className="text-sm text-muted-foreground">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Computer Networks</span>
                        <span className="text-sm text-muted-foreground">50%</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">System Design</span>
                        <span className="text-sm text-muted-foreground">40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: 72 },
                          { name: 'Remaining', value: 28 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#58CC02" />
                        <Cell key="cell-1" fill="#E5E5E5" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Statistics</CardTitle>
              <CardDescription>Your performance across different challenge types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'MCQs', score: 85 },
                    { name: 'Flashcards', score: 78 },
                    { name: 'Coding', score: 62 },
                    { name: 'Mock Interview', score: 70 },
                  ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#58CC02" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning activity over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activityData?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'lesson' ? 'bg-primary/20 text-primary' :
                      activity.type === 'challenge' ? 'bg-red-100 text-red-500' :
                      activity.type === 'flashcard' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-500'
                    }`}>
                      {activity.type === 'lesson' && <BookOpen className="w-5 h-5" />}
                      {activity.type === 'challenge' && <Zap className="w-5 h-5" />}
                      {activity.type === 'flashcard' && <BookOpen className="w-5 h-5" />}
                      {activity.type === 'quiz' && <BarChartIcon className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <Badge>{activity.xp} XP</Badge>
                      </div>
                      
                      {activity.score !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Score: {activity.score}%</span>
                            <span className="text-xs text-muted-foreground">{activity.date}</span>
                          </div>
                          <Progress value={activity.score} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab contents would follow similar patterns */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center py-12">
                <div className="text-center text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Badges and achievements would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
