import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

type Goal = {
  id: string;
  title: string;
  completed: number;
  total: number;
  isCompleted: boolean;
};

type DailyGoalsProps = {
  goals: Goal[];
};

export default function DailyGoals({ goals }: DailyGoalsProps) {
  // Default goals if none are provided
  const defaultGoals: Goal[] = [
    {
      id: '1',
      title: 'Complete 3 Flashcard Sets',
      completed: 3,
      total: 3,
      isCompleted: true
    },
    {
      id: '2',
      title: 'Solve 5 MCQs',
      completed: 5,
      total: 5,
      isCompleted: true
    },
    {
      id: '3',
      title: 'Complete 1 Challenge',
      completed: 0,
      total: 1,
      isCompleted: false
    }
  ];

  const displayGoals = goals.length > 0 ? goals : defaultGoals;
  
  // Calculate progress percentage
  const completedGoals = displayGoals.filter(goal => goal.isCompleted).length;
  const totalGoals = displayGoals.length;
  const progressPercentage = (completedGoals / totalGoals) * 100;

  return (
    <section className="mb-8">
      <Card className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Daily Goals</h2>
            <p className="text-gray-500">You've completed {completedGoals} of {totalGoals} daily goals</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center">
              <div className="w-48 h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="ml-3 font-bold text-gray-800">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayGoals.map((goal) => (
            <div 
              key={goal.id}
              className={`bg-gray-100 rounded-lg p-4 border-l-4 ${
                goal.isCompleted ? 'border-primary' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className={`h-6 w-6 rounded-full ${
                  goal.isCompleted ? 'bg-primary' : 'bg-gray-300'
                } flex items-center justify-center mr-3 mt-1`}>
                  {goal.isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-gray-800 font-bold">{goal.completed}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{goal.title}</h3>
                  <p className="text-sm text-gray-500">{goal.completed}/{goal.total} completed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
