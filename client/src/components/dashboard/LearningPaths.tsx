import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function LearningPaths() {
  const { data: learningPaths, isLoading } = useQuery({
    queryKey: ['/api/learning-paths'],
  });

  // Default learning paths if none are fetched
  const defaultPaths = [
    {
      id: '1',
      title: 'Data Structures',
      level: 'Intermediate',
      progress: 65,
      currentLesson: 'Trees & Graph Traversal',
      color: 'primary',
      buttonColor: 'primary'
    },
    {
      id: '2',
      title: 'Operating Systems',
      level: 'Beginner',
      progress: 35,
      currentLesson: 'Process Management',
      color: 'secondary',
      buttonColor: 'yellow-500'
    },
    {
      id: '3',
      title: 'System Design',
      level: 'Advanced',
      progress: 20,
      currentLesson: 'Database Scaling',
      color: 'purple-500',
      buttonColor: 'purple-500'
    }
  ];

  const paths = learningPaths || defaultPaths;

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Learning Paths</h2>
        <a href="#" className="text-primary font-bold text-sm flex items-center">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="bg-white rounded-xl overflow-hidden shadow-md">
            <div className={`h-3 ${
              path.color === 'primary' ? 'bg-primary' : 
              path.color === 'secondary' ? 'bg-yellow-400' : 
              `bg-${path.color}`
            }`}></div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800">{path.title}</h3>
                <Badge variant="outline" className="text-gray-500 bg-gray-100">
                  {path.level}
                </Badge>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className={`${
                      path.color === 'primary' ? 'bg-primary' : 
                      path.color === 'secondary' ? 'bg-yellow-400' : 
                      `bg-${path.color}`
                    } h-2.5 rounded-full`} 
                    style={{ width: `${path.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-500">{path.progress}%</span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Current lesson:</p>
                <p className="font-medium text-gray-800">{path.currentLesson}</p>
              </div>
              
              <Button 
                className={`w-full ${
                  path.buttonColor === 'primary' ? '' : 
                  path.buttonColor === 'yellow-500' ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 
                  `bg-${path.buttonColor} hover:bg-${path.buttonColor}`
                }`}
              >
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
