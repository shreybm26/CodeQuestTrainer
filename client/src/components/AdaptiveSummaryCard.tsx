import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { PerformanceMetrics } from '@/utils/AdaptiveQuizEngine';

interface AdaptiveSummaryCardProps {
  metrics: Record<string, PerformanceMetrics>;
  overallMastery: number;
  answeredQuestions: number;
  totalQuestions: number;
  showDetails?: boolean;
}

export function AdaptiveSummaryCard({
  metrics,
  overallMastery,
  answeredQuestions,
  totalQuestions,
  showDetails = false
}: AdaptiveSummaryCardProps) {
  // Group metrics by mastery level
  const masteredSubcategories = Object.values(metrics).filter(m => m.masteryLevel >= 80);
  const progressingSubcategories = Object.values(metrics).filter(m => m.masteryLevel >= 50 && m.masteryLevel < 80);
  const needsWorkSubcategories = Object.values(metrics).filter(m => m.masteryLevel < 50 && m.totalAttempts > 0);
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-lg">Learning Progress</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Mastery</span>
            <span className="text-sm font-medium">{overallMastery}%</span>
          </div>
          <Progress value={overallMastery} className="h-2" />
        </div>
        
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-muted-foreground">Questions Completed</span>
          <span className="font-medium">{answeredQuestions} of {totalQuestions}</span>
        </div>
        
        {showDetails && (
          <div className="mt-6 space-y-4">
            {masteredSubcategories.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 mr-2" /> Mastered Topics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {masteredSubcategories.map(item => (
                    <div key={item.subcategory} className="flex justify-between items-center p-2 bg-green-50 rounded-md text-sm">
                      <span>{item.subcategory}</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {item.masteryLevel}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {progressingSubcategories.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 flex items-center mb-2">
                  <Info className="w-4 h-4 mr-2" /> Progressing Topics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {progressingSubcategories.map(item => (
                    <div key={item.subcategory} className="flex justify-between items-center p-2 bg-yellow-50 rounded-md text-sm">
                      <span>{item.subcategory}</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {item.masteryLevel}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {needsWorkSubcategories.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 mr-2" /> Needs More Practice
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {needsWorkSubcategories.map(item => (
                    <div key={item.subcategory} className="flex justify-between items-center p-2 bg-red-50 rounded-md text-sm">
                      <span>{item.subcategory}</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {item.masteryLevel}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 