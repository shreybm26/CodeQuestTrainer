import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, Award, Code, User, Brain } from 'lucide-react';

export default function Challenges() {
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['/api/challenges'],
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
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-textDark mb-2">Challenges</h1>
          <p className="text-muted-foreground">Test your skills with timed challenges and earn XP</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
            <Zap className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm font-bold">1,240 XP</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-neutral rounded-full">
            <Award className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm font-bold">9 Badges</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="mb-6">
          <TabsTrigger value="daily">Daily Challenges</TabsTrigger>
          <TabsTrigger value="mock">Mock Interviews</TabsTrigger>
          <TabsTrigger value="code">Coding Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Timer Bomb Challenge */}
            <Card className="bg-gradient-to-r from-red-50 to-yellow-50 border border-red-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-red-500" />
                    <CardTitle>Timer Bomb Challenge</CardTitle>
                  </div>
                  <Badge className="bg-red-500">20 XP</Badge>
                </div>
                <CardDescription>Answer 10 quick MCQs before time runs out!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">5 min</span>
                  </div>
                  <Badge variant="outline">Medium</Badge>
                </div>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={() => window.location.href = '/challenges/1'}
                >
                  Start Challenge
                </Button>
              </CardContent>
            </Card>

            {/* Speed Code Sprint */}
            <Card className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Code className="w-5 h-5 mr-2 text-green-500" />
                    <CardTitle>Speed Code Sprint</CardTitle>
                  </div>
                  <Badge className="bg-green-500">30 XP</Badge>
                </div>
                <CardDescription>Solve 3 coding puzzles before the clock runs out</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">10 min</span>
                  </div>
                  <Badge variant="outline">Hard</Badge>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/challenges/2'}
                >
                  Start Challenge
                </Button>
              </CardContent>
            </Card>

            {/* AI Mock Interview */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    <CardTitle>AI Mock Interview</CardTitle>
                  </div>
                  <Badge className="bg-blue-500">50 XP</Badge>
                </div>
                <CardDescription>Practice interview questions with our AI interviewer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">15 min</span>
                  </div>
                  <Badge variant="outline">Advanced</Badge>
                </div>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => window.location.href = '/challenges/3'}
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mock" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mock Interviews</CardTitle>
              <CardDescription>Practice with AI-powered interviews that simulate real placement experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-500" />
                      <CardTitle className="text-lg">Technical Interview</CardTitle>
                    </div>
                    <CardDescription>DSA, Problem Solving & CS Fundamentals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => window.location.href = '/challenges/3'}
                    >
                      Start Technical Interview
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      <CardTitle className="text-lg">HR Interview</CardTitle>
                    </div>
                    <CardDescription>Behavioral Questions & Soft Skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => window.location.href = '/challenges/3'}
                    >
                      Start HR Interview
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would follow similar patterns */}
        <TabsContent value="code" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center py-12">
                <div className="text-center text-muted-foreground">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Coding challenges would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
