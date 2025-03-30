import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, ArrowRight } from 'lucide-react';

type Recommendation = {
  id: string;
  title: string;
  description: string;
  type: 'weak_area' | 'needs_practice' | 'almost_mastered';
  cta: string;
};

type AIRecommendationsProps = {
  recommendations: Recommendation[];
};

export default function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  // Default recommendations if none are provided
  const defaultRecommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Memory Management in OS',
      description: 'You\'ve scored below 60% in this topic consistently.',
      type: 'weak_area',
      cta: 'Study Now'
    },
    {
      id: '2',
      title: 'Graph Algorithms',
      description: 'Try more graph-based DSA problems to improve.',
      type: 'needs_practice',
      cta: 'Practice Now'
    },
    {
      id: '3',
      title: 'Time Complexity Analysis',
      description: 'You\'re getting better! Just a few more practices.',
      type: 'almost_mastered',
      cta: 'Continue Learning'
    }
  ];

  const displayRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations;

  // Helper to get badge styling based on recommendation type
  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'weak_area':
        return 'bg-red-100 text-red-500';
      case 'needs_practice':
        return 'bg-red-100 text-red-500';
      case 'almost_mastered':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  // Helper to get badge text based on recommendation type
  const getBadgeText = (type: string) => {
    switch (type) {
      case 'weak_area':
        return 'Weak Area';
      case 'needs_practice':
        return 'Needs Practice';
      case 'almost_mastered':
        return 'Almost Mastered';
      default:
        return 'Recommendation';
    }
  };

  return (
    <section className="mb-8">
      <Card className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-primary" />
          AI Recommendations
        </h2>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
          <p className="text-blue-800">Based on your performance, we recommend focusing on these areas:</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRecommendations.map((rec) => (
            <div 
              key={rec.id}
              className="bg-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{rec.title}</h3>
                <Badge className={getBadgeStyles(rec.type)}>
                  {getBadgeText(rec.type)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3">{rec.description}</p>
              <Button variant="link" className="text-primary font-bold text-sm flex items-center p-0">
                {rec.cta}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
