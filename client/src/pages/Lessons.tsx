import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, BookOpen, CheckCircle, Brain } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useLocation } from 'wouter';

type LessonTopic = {
  name: string;
  completed: boolean;
}

type LessonCategory = {
  name: string;
  level: string;
  progress: number;
  lessonCount: number;
  topics: LessonTopic[];
}

type ActiveLesson = {
  id: string;
  title: string;
  category: string;
  progress: number;
}

export default function Lessons() {
  const { user } = useUser();
  const [_, setLocation] = useLocation();
  
  const { data: lessonCategories, isLoading } = useQuery<LessonCategory[]>({
    queryKey: ['/api/lessons/categories'],
  });

  const { data: activeLesson } = useQuery<ActiveLesson>({
    queryKey: ['/api/lessons/active'],
  });
  
  const handleContinueLearning = (lessonId: string) => {
    setLocation(`/lessons/${lessonId}`);
  };

  const handleAdaptiveLearning = (lessonId: string) => {
    setLocation(`/lessons/${lessonId}/adaptive`);
  };

  const getLessonIdForCategory = (categoryName: string): string => {
    switch(categoryName) {
      case 'Data Structures':
        return '1';
      case 'Operating Systems':
        return '2';
      case 'DBMS':
        return '3';
      case 'Computer Networks':
        return '4';
      default:
        return '1';
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-extrabold text-textDark">Lessons</h1>
        <Badge variant="outline" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
          {user?.level || 'Beginner'} Level
        </Badge>
      </div>

      {activeLesson && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Continue Learning</h2>
                <p className="text-muted-foreground">{activeLesson.title}</p>
              </div>
              <Badge>{activeLesson.category}</Badge>
            </div>
            
            <Progress value={activeLesson.progress} className="h-2 mb-4" />
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-sm text-muted-foreground">{activeLesson.progress}% complete</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => handleContinueLearning(activeLesson.id)}
                  className="flex-1 sm:flex-auto"
                >
                  Standard Mode
                </Button>
                <Button 
                  onClick={() => handleAdaptiveLearning(activeLesson.id)} 
                  variant="secondary"
                  className="flex-1 sm:flex-auto"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Adaptive Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="os">Operating Systems</TabsTrigger>
          <TabsTrigger value="dsa">Data Structures</TabsTrigger>
          <TabsTrigger value="dbms">DBMS</TabsTrigger>
          <TabsTrigger value="cn">Computer Networks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonCategories?.map((category, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-3 bg-primary"></div>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <Badge variant="outline">{category.level}</Badge>
                  </div>
                  
                  <Progress value={category.progress} className="h-2.5 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">{category.lessonCount} lessons</p>
                  
                  <ul className="space-y-2 mb-4">
                    {category.topics.slice(0, 3).map((topic, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        {topic.completed ? 
                          <CheckCircle className="w-4 h-4 mr-2 text-primary" /> : 
                          <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                        }
                        {topic.name}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full mb-2" 
                    onClick={() => handleContinueLearning(getLessonIdForCategory(category.name))}
                  >
                    Standard Mode
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => handleAdaptiveLearning(getLessonIdForCategory(category.name))}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Adaptive Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="os" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="h-3 bg-yellow-500"></div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">Process Management</h3>
                  <Badge variant="outline">Beginner</Badge>
                </div>
                
                <Progress value={35} className="h-2.5 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">6 lessons</p>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    Process States
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    CPU Scheduling
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Process Synchronization
                  </li>
                </ul>
                
                <Button 
                  className="w-full mb-2" 
                  onClick={() => handleContinueLearning('2')}
                >
                  Continue Learning
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleAdaptiveLearning('2')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Adaptive Learning
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-3 bg-yellow-500"></div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">Memory Management</h3>
                  <Badge variant="outline">Intermediate</Badge>
                </div>
                
                <Progress value={10} className="h-2.5 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">5 lessons</p>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Paging & Segmentation
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Virtual Memory
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Page Replacement
                  </li>
                </ul>
                
                <Button 
                  className="w-full mb-2" 
                  onClick={() => handleContinueLearning('2')}
                >
                  Start Learning
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleAdaptiveLearning('2')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Adaptive Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dsa" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="h-3 bg-blue-500"></div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">Trees and Graph Traversal</h3>
                  <Badge variant="outline">Intermediate</Badge>
                </div>
                
                <Progress value={65} className="h-2.5 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">8 lessons</p>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    Binary Trees
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    Tree Traversal
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Graph Algorithms
                  </li>
                </ul>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleContinueLearning('1')}
                >
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dbms" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="h-3 bg-green-500"></div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">Relational Database Fundamentals</h3>
                  <Badge variant="outline">Beginner</Badge>
                </div>
                
                <Progress value={20} className="h-2.5 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">6 lessons</p>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    Database Concepts
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Normalization
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    SQL Basics
                  </li>
                </ul>
                
                <Button 
                  className="w-full mb-2" 
                  onClick={() => handleContinueLearning('3')}
                >
                  Continue Learning
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleAdaptiveLearning('3')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Adaptive Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cn" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="h-3 bg-purple-500"></div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">Network Protocols and Architecture</h3>
                  <Badge variant="outline">Intermediate</Badge>
                </div>
                
                <Progress value={15} className="h-2.5 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">6 lessons</p>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    OSI Model
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    TCP/IP
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                    Routing Protocols
                  </li>
                </ul>
                
                <Button 
                  className="w-full mb-2" 
                  onClick={() => handleContinueLearning('4')}
                >
                  Continue Learning
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleAdaptiveLearning('4')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Adaptive Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
