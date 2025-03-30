import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Code, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: string;
  type: 'timed' | 'code' | 'interview';
  gradientFrom: string;
  gradientTo: string;
  border: string;
  icon: string;
  iconColor: string;
  buttonColor: string;
}

export default function ChallengesList() {
  const [_, navigate] = useLocation();
  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges/daily'],
  });

  // Default challenges if none are fetched
  const defaultChallenges = [
    {
      id: '1',
      title: 'Timer Bomb Challenge',
      description: 'Answer 10 quick MCQs before time runs out!',
      xp: 20,
      difficulty: 'Medium',
      type: 'timed',
      gradientFrom: 'from-red-100',
      gradientTo: 'to-yellow-100',
      border: 'border-red-200',
      icon: 'zap',
      iconColor: 'text-red-500',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: '2',
      title: 'Speed Code Sprint',
      description: 'Solve 3 coding puzzles before the clock runs out.',
      xp: 30,
      difficulty: 'Hard',
      type: 'code',
      gradientFrom: 'from-green-100',
      gradientTo: 'to-yellow-100',
      border: 'border-green-200',
      icon: 'code',
      iconColor: 'text-primary',
      buttonColor: 'bg-primary hover:bg-green-600'
    },
    {
      id: '3',
      title: 'AI Mock Interview',
      description: 'Practice interview questions with our AI interviewer.',
      xp: 50,
      difficulty: 'Hard',
      type: 'interview',
      gradientFrom: 'from-blue-100',
      gradientTo: 'to-purple-100',
      border: 'border-blue-200',
      icon: 'user',
      iconColor: 'text-blue-500',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  const displayChallenges = challenges || defaultChallenges;

  return (
    <Card className="bg-white rounded-xl p-6 shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Daily Challenges</h2>
        <Badge className="bg-primary/10 text-primary py-1 px-3">
          New Challenge Available!
        </Badge>
      </div>
      
      <div className="space-y-4">
        {displayChallenges.map((challenge) => (
          <div 
            key={challenge.id}
            className={`bg-gradient-to-r ${challenge.gradientFrom} ${challenge.gradientTo} rounded-lg p-4 border ${challenge.border}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800 flex items-center">
                {challenge.icon === 'zap' && <Zap className={`w-4 h-4 mr-2 ${challenge.iconColor}`} />}
                {challenge.icon === 'code' && <Code className={`w-4 h-4 mr-2 ${challenge.iconColor}`} />}
                {challenge.icon === 'user' && <User className={`w-4 h-4 mr-2 ${challenge.iconColor}`} />}
                {challenge.title}
              </h3>
              <Badge className={`${challenge.icon === 'zap' ? 'bg-red-500' : 
                challenge.icon === 'code' ? 'bg-primary' : 'bg-blue-500'} text-white`}>
                {challenge.xp} XP
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Difficulty: {challenge.difficulty}</span>
              <Button 
                className={challenge.buttonColor}
                onClick={() => navigate(`/challenges/${challenge.id}`)}
              >
                Start Challenge
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
